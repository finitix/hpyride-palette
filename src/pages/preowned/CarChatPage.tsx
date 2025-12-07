import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface CarInfo {
  brand: string;
  model: string;
  user_id: string;
  images: { image_url: string }[];
}

const CarChatPage = () => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [car, setCar] = useState<CarInfo | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carId && user) {
      fetchCarAndMessages();
      setupRealtime();
    }
  }, [carId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCarAndMessages = async () => {
    // Fetch car details
    const { data: carData } = await supabase
      .from('pre_owned_cars')
      .select('brand, model, user_id, images:car_images(image_url)')
      .eq('id', carId)
      .single();

    if (carData) {
      setCar(carData as CarInfo);
      const otherId = carData.user_id === user?.id ? null : carData.user_id;
      setReceiverId(otherId);
    }

    // Fetch messages
    const { data: messagesData } = await supabase
      .from('car_chats')
      .select('*')
      .eq('car_id', carId)
      .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .order('created_at', { ascending: true });

    setMessages(messagesData || []);
    setLoading(false);
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('car-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'car_chats',
        filter: `car_id=eq.${carId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !receiverId) return;

    const { error } = await supabase.from('car_chats').insert({
      car_id: carId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: newMessage.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        {car && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
              {car.images?.[0] && (
                <img src={car.images[0].image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{car.brand} {car.model}</p>
              <p className="text-xs text-muted-foreground">Chat with seller</p>
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.sender_id === user?.id
                    ? 'bg-foreground text-background rounded-br-none'
                    : 'bg-secondary text-foreground rounded-bl-none'
                }`}
              >
                <p>{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-background/60' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button variant="hero" size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CarChatPage;
