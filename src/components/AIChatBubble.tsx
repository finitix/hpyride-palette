import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatBubbleProps {
  context: {
    destination?: string;
    eta?: string;
    distance?: string;
  };
}

const AIChatBubble = ({ context }: AIChatBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm your travel buddy! 🚗 How can I make this ride fun?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('navigation-ai-chat', {
        body: { 
          messages: [...messages, { role: 'user', content: userMessage }],
          context 
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oops! Got a bit distracted. What were you saying? 😅" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickMessages = [
    "Tell me a fun fact!",
    "How much longer?",
    "Make me laugh!"
  ];

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-28 left-4 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-muted scale-90' : 'bg-gradient-to-br from-blue-500 to-purple-600 scale-100 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-44 left-4 right-4 z-40 bg-card rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[50vh]">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">AI Travel Buddy</span>
            </div>
          </div>

          <div className="h-48 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-foreground text-background rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Messages */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(msg);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="px-3 py-1.5 bg-muted rounded-full text-xs whitespace-nowrap text-foreground hover:bg-muted/80"
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say something..."
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBubble;
