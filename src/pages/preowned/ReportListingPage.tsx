import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const reasons = [
  "Fake listing",
  "Wrong information",
  "Already sold",
  "Scam/Fraud",
  "Inappropriate content",
  "Other",
];

const ReportListingPage = () => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !carId || !reason) {
      toast.error("Please select a reason");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('car_reports').insert({
        car_id: carId,
        reporter_id: user.id,
        reason,
        details,
      });

      if (error) throw error;

      toast.success("Report submitted. We'll review it soon.");
      navigate(-1);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to submit report");
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
        <h1 className="text-lg font-semibold text-foreground">Report Listing</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        <p className="text-muted-foreground">Help us keep the platform safe by reporting suspicious listings.</p>

        <div>
          <Label>Reason for Report *</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
            <SelectContent>
              {reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Additional Details (Optional)</Label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide any additional details..."
            rows={4}
          />
        </div>

        <Button variant="hero" className="w-full mt-6" onClick={handleSubmit} disabled={loading || !reason}>
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </div>
  );
};

export default ReportListingPage;
