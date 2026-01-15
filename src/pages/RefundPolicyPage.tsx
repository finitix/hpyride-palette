import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const RefundPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Refund & Cancellation Policy</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> 01/01/2026<br />
          <strong>Applicable Regions:</strong> India & Worldwide
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.1 General Principles</h2>
          <p className="text-muted-foreground leading-relaxed">
            Refund and cancellation rules vary by service type and booking stage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.2 HpyCabs & Car Pooling</h2>
          <p className="text-muted-foreground leading-relaxed mb-2 text-sm italic">
            (Including In-City & 2-Wheeler Pooling)
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Free cancellation may be allowed before driver or pool match confirmation (where applicable)</li>
            <li>Late cancellations may incur charges</li>
            <li>No-show may result in full or partial fare being charged</li>
            <li>Pooling rides are subject to availability of nearby riders and vehicles</li>
            <li>Free cancellation allowed before driver assignment (where applicable)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.3 Driver Pooling</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Cancellations before driver dispatch may be refunded</li>
            <li>Once service starts, refunds are not guaranteed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.4 Car Rentals</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Cancellation charges depend on rental partner policies</li>
            <li>Advance payments may be partially refundable</li>
            <li>Damage or late returns may incur penalties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.5 Pre-Owned Cars</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>HpyRide.Com acts as a listing platform</li>
            <li>Refunds are subject to seller terms and legal agreements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.6 Refund Processing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Approved refunds are processed through the original payment method within 5–10 working days, subject to bank timelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4.7 Dispute Resolution</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users may raise disputes via in-app support or email. All complaints are reviewed fairly and transparently.
          </p>
        </section>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-foreground font-medium">
            💡 By using HpyRide.Com, you agree to these policies. We encourage all users to ride responsibly, respect others, and use safety features whenever needed.
          </p>
          <p className="text-sm text-primary font-semibold mt-2">
            Ride safely. Ride responsibly. Ride with HpyRide.
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

export default RefundPolicyPage;
