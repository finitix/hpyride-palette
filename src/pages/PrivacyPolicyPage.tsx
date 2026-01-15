import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> 01/01/2026<br />
          <strong>Applicable Regions:</strong> India & Worldwide
        </p>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide.Com ("HpyRide", "we", "our", "us") is a global mobility and automobile services platform operating across India and internationally. We are committed to protecting user privacy and ensuring safety for all categories of users.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            By using the HpyRide.Com app or website, you agree to this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Services Covered</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            This policy applies to all HpyRide.Com services:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>HpyCabs</strong> — Cab aggregation services for 2-wheelers, 3-wheelers, and 4-wheelers and above (4W+)</li>
            <li><strong>Car Pooling / Ride Sharing</strong> — Shared rides using 2-wheelers and 4W+ vehicles, including in-city pooling and outstation pooling</li>
            <li><strong>Driver Pooling</strong> — Temporary drivers for city and outstation travel</li>
            <li><strong>Car Rentals</strong> — Vehicles from verified owners and local rental partners</li>
            <li><strong>Pre-Owned Cars</strong> — Buying and selling of used vehicles through verified sellers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Personal Information</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Name</li>
            <li>Mobile number</li>
            <li>Email address</li>
            <li>Profile photo (optional)</li>
            <li>Gender</li>
            <li>Date of birth</li>
            <li>Identity documents where legally or operationally required</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Location Information (Sensitive)</h3>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Collected only during booking and active rides for:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Pickup and drop accuracy</li>
            <li>Live trip tracking</li>
            <li>Navigation</li>
            <li>Safety monitoring, especially for women</li>
            <li>SOS and emergency response</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Background location is used only during active trips and stops automatically after trip completion.
          </p>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Contact Access (Emergency Only)</h3>
          <p className="text-muted-foreground leading-relaxed mb-2">Used only to:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Select trusted emergency contacts</li>
            <li>Send SOS alerts</li>
            <li>Share trip status with trusted contacts</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Full contact lists are not stored or used for marketing.
          </p>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Vehicle & Driver Information</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Vehicle registration</li>
            <li>Driving license</li>
            <li>Insurance and compliance documents</li>
            <li>Vehicle images</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Payment Information</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Processed via secure third-party gateways</li>
            <li>HpyRide does not store full card or banking details</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Technical & Usage Data</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>IP address</li>
            <li>Device type and OS</li>
            <li>App logs and crash reports</li>
            <li>Booking and transaction history</li>
            <li>Push notification tokens</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Purpose of Data Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Data is used only to:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Provide and manage services</li>
            <li>Ensure safety and fraud prevention</li>
            <li>Enable SOS and emergency response</li>
            <li>Provide customer support</li>
            <li>Improve platform performance</li>
            <li>Send service updates and notifications</li>
            <li>Meet legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            We do not sell personal data. Data may be shared only with:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Drivers, riders, owners, buyers, or sellers involved in a service</li>
            <li>Payment processors and cloud service providers</li>
            <li>Government authorities when legally required</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2 font-medium">
            We do NOT sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">6. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use encrypted transmission, secure servers, and access controls. We implement industry-standard security measures including SSL/TLS encryption, encrypted storage, and restricted access to personal data. While no system is 100% secure, safety remains our highest priority.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">7. Data Retention & Deletion</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Data is retained only as long as necessary for service delivery and legal compliance:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Account data: Retained while account is active + 2 years after deletion</li>
            <li>Ride history: Retained for 3 years for dispute resolution</li>
            <li>Chat messages: Retained for 1 year</li>
            <li>Verification documents: Retained for 5 years as per regulatory requirements</li>
            <li>Location data: Retained for 90 days</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Users may request account deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">8. User Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Users may:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Access and update personal data</li>
            <li>Control permissions via device settings</li>
            <li>Withdraw consent</li>
            <li>Request data deletion</li>
            <li>Receive data in a portable format</li>
            <li>Restrict how we use your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">9. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Our app integrates with third-party services:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li><strong>Firebase:</strong> For authentication and push notifications</li>
            <li><strong>Mapbox:</strong> For maps and navigation</li>
            <li><strong>Monetag:</strong> For displaying advertisements</li>
            <li><strong>Payment Gateways:</strong> For payment processing</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            These services have their own privacy policies governing their use of your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">10. Advertisements</h2>
          <p className="text-muted-foreground leading-relaxed">
            We display third-party advertisements through Monetag. These ads may use cookies and similar technologies to serve relevant content. Ad networks may collect device identifiers and usage data. You can opt out of personalized ads through your device settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">11. Location Permissions</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Location access is essential for our core services:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li><strong>While Using App:</strong> Location is accessed only when the app is open</li>
            <li><strong>Always:</strong> Required for active ride tracking (drivers)</li>
            <li><strong>Never:</strong> Disabling location will limit app functionality</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Manage location permissions in your device Settings → Apps → HpyRide.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">12. Push Notifications</h2>
          <p className="text-muted-foreground leading-relaxed">
            We send push notifications for ride updates, booking confirmations, chat messages, and promotional offers. You can disable notifications in your device settings, but this may affect your ability to receive important ride updates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">13. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal data, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">14. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy periodically. We will notify you of significant changes through the app or email. Your continued use of HpyRide after changes indicates acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">15. Contact & Grievance</h2>
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

export default PrivacyPolicyPage;
