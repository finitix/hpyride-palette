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
            By downloading, installing, or using the HpyRide application, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you must not use our services. These terms apply to all users including riders, drivers, car sellers, and buyers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Eligibility</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>You must be at least 18 years old to use HpyRide</li>
            <li>Drivers must possess a valid driving license</li>
            <li>Drivers must have a registered and insured vehicle</li>
            <li>You must complete identity verification to access certain features</li>
            <li>You must provide accurate and truthful information during registration</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Services Offered</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            HpyRide provides the following services:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>Ride Sharing:</strong> Platform to offer or find shared rides between locations</li>
            <li><strong>Pre-Owned Cars:</strong> Marketplace to list and buy second-hand vehicles</li>
            <li><strong>Car Rentals:</strong> Vehicle rental services (coming soon)</li>
            <li><strong>Driver Pool:</strong> Hire verified drivers for your vehicles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. User Verification</h2>
          <p className="text-muted-foreground leading-relaxed">
            To ensure safety, HpyRide requires identity verification for users who wish to post rides or list vehicles. Verification requires:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
            <li>Valid government-issued ID (Aadhaar, PAN, Voter ID, or Passport)</li>
            <li>Selfie video for identity confirmation</li>
            <li>Driving license for drivers offering rides</li>
            <li>Vehicle RC, insurance, and pollution certificate for vehicle verification</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Verification is subject to admin approval within 24-48 hours. Falsification of documents will result in permanent account suspension.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Ride Sharing Rules</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Drivers set their own price per kilometer and available seats</li>
            <li>Rides are subject to admin verification before being published</li>
            <li>Riders can book seats and must provide accurate pickup/drop locations</li>
            <li>Drivers have the right to accept or reject booking requests</li>
            <li>Female-only rides are available for enhanced safety</li>
            <li>Both parties must communicate through the in-app chat</li>
            <li>Real-time location sharing is enabled during active rides</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Pre-Owned Car Marketplace</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Sellers must provide accurate vehicle details, images, and pricing</li>
            <li>Listings are subject to verification before being published</li>
            <li>HpyRide does not guarantee the condition or authenticity of listed vehicles</li>
            <li>Buyers and sellers transact directly; HpyRide is not a party to the sale</li>
            <li>Users can report suspicious or fraudulent listings</li>
            <li>Contact between buyers and sellers is facilitated through in-app chat</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Payments & Pricing</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Ride fares are calculated based on distance and driver-set rates</li>
            <li>Payments are made directly between riders and drivers (cash or UPI)</li>
            <li>HpyRide may introduce service fees in the future with prior notice</li>
            <li>Car sale transactions are handled directly between buyer and seller</li>
            <li>HpyRide is not responsible for payment disputes between users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. Booking & Cancellation</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Bookings can be cancelled before the ride starts</li>
            <li>Excessive cancellations may result in account restrictions</li>
            <li>Drivers can reject bookings with a valid reason</li>
            <li>No-shows without cancellation may affect user ratings</li>
            <li>Completed rides can be reviewed and rated by both parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">9. Safety & Security</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>SOS emergency button available during active rides</li>
            <li>Share ride details with trusted contacts</li>
            <li>Real-time GPS tracking for ongoing rides</li>
            <li>All users are verified through government ID</li>
            <li>Report suspicious behavior through the app</li>
            <li>Female riders can filter for women-only rides</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">10. Prohibited Activities</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Providing false information or fake documents</li>
            <li>Harassment, discrimination, or inappropriate behavior</li>
            <li>Using the platform for illegal activities</li>
            <li>Spam, fraud, or deceptive practices</li>
            <li>Circumventing platform safety features</li>
            <li>Creating multiple accounts</li>
            <li>Sharing account credentials with others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">11. Advertisements</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide displays third-party advertisements to support free services. By using the app, you consent to viewing these ads. You may also earn rewards by watching voluntary video advertisements through our Watch & Earn feature.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">12. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide is a technology platform connecting users and is not responsible for:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
            <li>Actions, behavior, or conduct of any user</li>
            <li>Quality, safety, or legality of vehicles or rides</li>
            <li>Accuracy of user-provided information</li>
            <li>Payment disputes between users</li>
            <li>Any damages arising from use of the service</li>
            <li>Third-party content or advertisements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">13. Account Suspension & Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a safety risk to other users. Users may also delete their account at any time through the app settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">14. Modifications to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. Users will be notified of significant changes through the app. Continued use of HpyRide after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">15. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">16. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms & Conditions, contact us at:
          </p>
          <p className="text-muted-foreground mt-2">
            Email: legal@hpyride.com<br />
            Phone: +91 98765 43210<br />
            Address: Hyderabad, Telangana, India
          </p>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          Last updated: January 2026 | Version 1.0
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TermsPage;
