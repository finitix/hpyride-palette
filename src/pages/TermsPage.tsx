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
          <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By downloading, installing, or using the HpyRide.Com application, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, you must not use our services. These terms apply to all users including riders, drivers, car sellers, and buyers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users must be at least 18 years old. Drivers must possess valid licenses and documents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Account Responsibility</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users are responsible for maintaining account security and all activities under their account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Platform Role</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide.Com is a technology platform connecting users. Drivers, car owners, and sellers are independent service providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Services Offered</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>HpyCabs</strong> — Cab aggregation services for 2-wheelers, 3-wheelers, and 4-wheelers and above (4W+)</li>
            <li><strong>Car Pooling / Ride Sharing</strong> — Shared rides using 2-wheelers and 4W+ vehicles, including in-city and outstation pooling</li>
            <li><strong>Driver Pooling</strong> — Temporary drivers for city and outstation travel</li>
            <li><strong>Car Rentals</strong> — Vehicles from verified owners and local rental partners</li>
            <li><strong>Pre-Owned Cars</strong> — Buying and selling of used vehicles through verified sellers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. User Verification</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            To ensure safety, HpyRide requires identity verification for users who wish to post rides or list vehicles:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
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
          <h2 className="text-xl font-bold text-foreground mb-3">7. Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            Payments are processed via third-party gateways. HpyRide.Com is not responsible for gateway failures. Ride fares are calculated based on distance and driver-set rates. Payments are made directly between riders and drivers (cash or UPI).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. User Conduct</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Users must not:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Harass or threaten others</li>
            <li>Carry illegal items</li>
            <li>Damage property</li>
            <li>Violate traffic or local laws</li>
            <li>Provide false information or fake documents</li>
            <li>Use the platform for illegal activities</li>
            <li>Create multiple accounts</li>
            <li>Share account credentials with others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">9. Car Pooling Disclaimer</h2>
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
            HpyRide.Com may restrict or suspend pooling services in locations where regulations do not permit such activity. Private vehicle ride sharing is permitted only for cost sharing and not as commercial transport.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">10. Pre-Owned Car Marketplace</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Sellers must provide accurate vehicle details, images, and pricing</li>
            <li>Listings are subject to verification before being published</li>
            <li>HpyRide does not guarantee the condition or authenticity of listed vehicles</li>
            <li>Buyers and sellers transact directly; HpyRide is not a party to the sale</li>
            <li>Users can report suspicious or fraudulent listings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">11. Safety & Security</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>SOS emergency button available during active rides</li>
            <li>Share ride details with trusted contacts</li>
            <li>Real-time GPS tracking for ongoing rides</li>
            <li>All users are verified through government ID</li>
            <li>Female riders can filter for women-only rides</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">12. Booking & Cancellation</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Bookings can be cancelled before the ride starts</li>
            <li>Excessive cancellations may result in account restrictions</li>
            <li>Drivers can reject bookings with a valid reason</li>
            <li>No-shows without cancellation may affect user ratings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">13. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide.Com is not liable for accidents, personal injuries, vehicle issues, or acts of independent service providers. HpyRide is a technology platform and is not responsible for actions or conduct of any user, quality or safety of vehicles, or payment disputes between users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">14. Account Suspension</h2>
          <p className="text-muted-foreground leading-relaxed">
            Accounts may be suspended or terminated for safety violations, fraud, or misuse. Users may also delete their account at any time by contacting support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">15. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content, trademarks, logos, and intellectual property on HpyRide.Com are owned by HpyRide. Users may not copy, modify, distribute, or use any content without prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">16. Modifications to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. Users will be notified of significant changes through the app. Continued use of HpyRide after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">17. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            For India, these terms are governed by Indian law. Courts at Hyderabad shall have exclusive jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">18. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Company:</strong> HpyRide.Com<br />
            <strong>Support Email:</strong> hpyrideindia@gmail.com<br />
            <strong>Grievance Email:</strong> hpyrideindia@gmail.com<br />
            <strong>Address:</strong> Hyderabad, India
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
