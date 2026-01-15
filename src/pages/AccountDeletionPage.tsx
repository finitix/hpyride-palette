import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";

const AccountDeletionPage = () => {
  const navigate = useNavigate();

  const handleEmailRequest = () => {
    window.location.href = "mailto:hpyrideindia@gmail.com?subject=Account Deletion Request&body=Hi HpyRide Team,%0D%0A%0D%0AI would like to request permanent deletion of my HpyRide.Com account.%0D%0A%0D%0ARegistered Phone/Email: [Please enter your registered phone or email]%0D%0A%0D%0AThank you.";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Account Deletion Policy</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> 01/01/2026<br />
          <strong>Play Store Compliance</strong>
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3.1 User Right to Delete Account</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users may request permanent deletion of their HpyRide.Com account at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3.2 How to Delete Your Account</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Send an email to: <strong>hpyrideindia@gmail.com</strong>
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Subject: Account Deletion Request
          </p>
          <Button 
            onClick={handleEmailRequest}
            className="w-full flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Send Deletion Request Email
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3.3 What Happens After Deletion</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Personal profile data will be permanently deleted</li>
            <li>Ride history may be anonymized</li>
            <li>Some data may be retained if legally required</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3.4 Processing Time</h2>
          <p className="text-muted-foreground leading-relaxed">
            Deletion requests are processed within 7–30 working days after verification.
          </p>
        </section>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive font-medium">
            ⚠️ Warning: Account deletion is permanent and cannot be undone. All your data, ride history, and wallet balance will be lost.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          Effective Date: 01/01/2026 | Version 1.0
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AccountDeletionPage;
