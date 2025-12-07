import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ShowInterestPage = () => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    preferredTime: "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setFormData(prev => ({
        ...prev,
        name: data.full_name || "",
        phone: data.phone || "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user || !carId) {
      toast.error("Please login to show interest");
      return;
    }

    if (!formData.name || !formData.phone) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('car_interests').insert({
        car_id: carId,
        buyer_id: user.id,
        buyer_name: formData.name,
        buyer_phone: formData.phone,
        preferred_call_time: formData.preferredTime,
        message: formData.message,
      });

      if (error) throw error;

      toast.success("Interest sent to seller!");
      navigate(-1);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to send interest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Show Interest</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        <p className="text-muted-foreground">Fill in your details and the seller will contact you.</p>

        <div>
          <Label>Your Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />
        </div>

        <div>
          <Label>Phone Number *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter your phone"
          />
        </div>

        <div>
          <Label>Preferred Time to Call</Label>
          <Select value={formData.preferredTime} onValueChange={(v) => setFormData(prev => ({ ...prev, preferredTime: v }))}>
            <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
              <SelectItem value="evening">Evening (5 PM - 9 PM)</SelectItem>
              <SelectItem value="anytime">Anytime</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Message to Seller (Optional)</Label>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Any questions or message for the seller..."
            rows={4}
          />
        </div>

        <Button variant="hero" className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending..." : "Send Interest"}
        </Button>
      </div>
    </div>
  );
};

export default ShowInterestPage;
