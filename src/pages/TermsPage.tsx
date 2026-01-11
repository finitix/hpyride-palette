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
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using HpyRide, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide provides a platform for connecting riders with drivers for carpooling and ride-sharing services. Users must be at least 18 years old to use this service. You agree to provide accurate information during registration and to keep your account information updated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. User Responsibilities</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Provide accurate vehicle and personal information</li>
            <li>Follow all applicable traffic laws and regulations</li>
            <li>Treat other users with respect and courtesy</li>
            <li>Report any suspicious or inappropriate behavior</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Payments & Fees</h2>
          <p className="text-muted-foreground leading-relaxed">
            All payments are processed securely through our platform. Drivers set their own prices for rides. HpyRide may charge a service fee for facilitating connections between riders and drivers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Cancellation Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users may cancel bookings according to our cancellation policy. Repeated cancellations may result in account restrictions. Refunds are processed within 5-7 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Safety Guidelines</h2>
          <p className="text-muted-foreground leading-relaxed">
            We prioritize user safety. All drivers must complete verification. Users should share ride details with trusted contacts. Use the SOS feature in emergencies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide acts as a platform connecting users and is not responsible for the actions of individual drivers or riders. We do not guarantee the availability, quality, or safety of any ride.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Last updated: January 2026
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TermsPage;
