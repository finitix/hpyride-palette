import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Terms & Conditions</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> 01/01/2026<br />
          <strong>Applicable Regions:</strong> India & Worldwide
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.1 Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users must be at least 18 years old. Drivers must possess valid licenses and documents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.2 Account Responsibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users are responsible for maintaining account security and all activities under their account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.3 Platform Role</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide.Com is a technology platform connecting users. Drivers, car owners, and sellers are independent service providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.4 Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            Payments are processed via third-party gateways. HpyRide.Com is not responsible for gateway failures.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.5 User Conduct</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Users must not:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Harass or threaten others</li>
            <li>Carry illegal items</li>
            <li>Damage property</li>
            <li>Violate traffic or local laws</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.6 Car Pooling Disclaimer & City Traffic Reduction</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            HpyRide.Com promotes responsible ride sharing to reduce city traffic and pollution. Car pooling and 2-wheeler pooling are intended for cost sharing and convenience, not commercial transport, and are subject to local transport regulations.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-2">Users must ensure compliance with:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Local motor vehicle laws</li>
            <li>Helmet and safety requirements</li>
            <li>Passenger capacity limits</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            HpyRide.Com may restrict or suspend pooling services in locations where regulations do not permit such activity.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Private vehicle ride sharing is permitted only for cost sharing and not as commercial transport, subject to local transport laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.7 Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide.Com is not liable for accidents, personal injuries, vehicle issues, or acts of independent service providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.8 Account Suspension</h2>
          <p className="text-muted-foreground leading-relaxed">
            Accounts may be suspended or terminated for safety violations, fraud, or misuse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2.9 Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            For India, these terms are governed by Indian law. Courts at Hyderabad shall have jurisdiction.
          </p>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          Effective Date: 01/01/2026 | Version 1.0
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TermsPage;
