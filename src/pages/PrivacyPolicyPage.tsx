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
          <h2 className="text-xl font-bold text-foreground mb-3">1.1 Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide.Com ("HpyRide", "we", "our", "us") is a global mobility and automobile services platform operating across India and internationally. We are committed to protecting user privacy and ensuring safety for all categories of users.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            By using the HpyRide.Com app or website, you agree to this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.2 Services Covered</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            This policy applies to all HpyRide.Com services:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>HpyCabs</strong> — Cab aggregation services for 2-wheelers, 3-wheelers, and 4-wheelers and above (4W+)</li>
            <li><strong>Car Pooling / Ride Sharing</strong> — Shared rides using 2-wheelers and 4W+ vehicles, including in-city pooling and outstation pooling, and including white-plate and taxi-plate vehicles where permitted by law. This service is designed to reduce traffic congestion, fuel consumption, and environmental impact through shared mobility.</li>
            <li><strong>Driver Pooling</strong> — Temporary drivers for city and outstation travel</li>
            <li><strong>Car Rentals</strong> — Vehicles from verified owners and local rental partners</li>
            <li><strong>Pre-Owned Cars</strong> — Buying and selling of used vehicles through verified sellers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.3 Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Personal Information</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Name</li>
            <li>Mobile number</li>
            <li>Email address</li>
            <li>Profile photo (optional)</li>
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
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.4 Purpose of Data Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Data is used only to:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Provide and manage services</li>
            <li>Ensure safety and fraud prevention</li>
            <li>Enable SOS and emergency response</li>
            <li>Provide customer support</li>
            <li>Improve platform performance</li>
            <li>Meet legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.5 Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            We do not sell personal data. Data may be shared only with:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Drivers, riders, owners, buyers, or sellers involved in a service</li>
            <li>Payment processors and cloud service providers</li>
            <li>Government authorities when legally required</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.6 Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use encrypted transmission, secure servers, and access controls. While no system is 100% secure, safety remains our highest priority.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.7 Data Retention & Deletion</h2>
          <p className="text-muted-foreground leading-relaxed">
            Data is retained only as long as necessary for service delivery and legal compliance. Users may request account deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.8 User Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Users may:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
            <li>Access and update personal data</li>
            <li>Control permissions via device settings</li>
            <li>Withdraw consent</li>
            <li>Request data deletion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.9 Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide is not intended for users under 18 years of age.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1.10 Contact & Grievance</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Company:</strong> HpyRide.Com<br />
            <strong>Support Email:</strong> hpyrideindia@gmail.com<br />
            <strong>Grievance Email:</strong> hpyrideindia@gmail.com<br />
            <strong>Address:</strong> Hyderabad
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
