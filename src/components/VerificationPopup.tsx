import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldAlert, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VerificationPopupProps {
  onClose?: () => void;
}

const VerificationPopup = ({ onClose }: VerificationPopupProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      checkVerification();
    }
  }, [user]);

  const checkVerification = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching verification:', error);
    }

    setVerification(data);
    setLoading(false);
    
    // Show popup if not verified or rejected
    if (!data || data.status === 'rejected') {
      setShow(true);
    }
  };

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  if (loading || !show) return null;

  // Rejected status
  if (verification?.status === 'rejected') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="p-6">
            <button onClick={handleClose} className="absolute top-4 right-4 p-1">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Rejected</h2>
              <p className="text-muted-foreground mb-4">{verification.rejection_reason}</p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={() => { handleClose(); navigate('/verify'); }} className="flex-1">
                  Resubmit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not verified yet
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative">
        <button onClick={handleClose} className="absolute top-4 right-4 p-1 z-10">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Verify Your Account</h2>
            <p className="text-muted-foreground mb-6">
              Complete your verification to book rides, publish trips, and access all features.
            </p>
            <Button onClick={() => { handleClose(); navigate('/verify'); }} className="w-full">
              Verify Now
            </Button>
            <button onClick={handleClose} className="mt-3 text-sm text-muted-foreground">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPopup;