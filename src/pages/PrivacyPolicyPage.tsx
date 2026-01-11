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
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Personal Information</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Full name and date of birth</li>
            <li>Phone number (used for OTP authentication)</li>
            <li>Email address</li>
            <li>Gender</li>
            <li>Profile photo</li>
            <li>Government ID (Aadhaar, PAN, Voter ID, Passport) for verification</li>
            <li>Selfie video for identity verification</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Driver Information</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Driving license number and images</li>
            <li>Vehicle details (make, model, registration number)</li>
            <li>Vehicle images (front, rear, side)</li>
            <li>RC book, insurance, and pollution certificate</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Location Data</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Real-time GPS location during active rides</li>
            <li>Pickup and drop-off locations for ride bookings</li>
            <li>Location for nearby ride searches</li>
            <li>Vehicle location for pre-owned car listings</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Usage Data</h3>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Ride history and booking details</li>
            <li>Chat messages between users</li>
            <li>Reviews and ratings</li>
            <li>App usage patterns and preferences</li>
            <li>Device information (model, OS, app version)</li>
            <li>Push notification tokens</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How We Use Your Information</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>Service Delivery:</strong> To match riders with drivers and facilitate ride bookings</li>
            <li><strong>Verification:</strong> To verify user identity and ensure platform safety</li>
            <li><strong>Communication:</strong> To send ride updates, booking confirmations, and notifications</li>
            <li><strong>Safety:</strong> To enable SOS features, location sharing, and emergency contacts</li>
            <li><strong>Improvement:</strong> To analyze usage patterns and enhance our services</li>
            <li><strong>Support:</strong> To respond to inquiries and resolve disputes</li>
            <li><strong>Legal:</strong> To comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Information Sharing</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            We share your information only in the following circumstances:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>With Other Users:</strong> Riders see driver name, vehicle details, and ratings. Drivers see rider name and pickup location.</li>
            <li><strong>For Safety:</strong> Emergency contacts receive location data when SOS is triggered</li>
            <li><strong>Service Providers:</strong> With trusted partners who assist in operating our services (hosting, analytics)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3 font-medium">
            We do NOT sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Storage & Security</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Data is stored on secure cloud servers with encryption</li>
            <li>We use industry-standard security measures (SSL/TLS, encryption at rest)</li>
            <li>Access to personal data is restricted to authorized personnel only</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Data is retained as long as your account is active or as required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our app integrates with third-party services:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
            <li><strong>Firebase:</strong> For authentication and push notifications</li>
            <li><strong>Mapbox:</strong> For maps and navigation</li>
            <li><strong>Monetag:</strong> For displaying advertisements</li>
            <li><strong>Payment Gateways:</strong> For future payment processing</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            These services have their own privacy policies governing their use of your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Advertisements</h2>
          <p className="text-muted-foreground leading-relaxed">
            We display third-party advertisements through Monetag. These ads may use cookies and similar technologies to serve relevant content. Ad networks may collect device identifiers and usage data. You can opt out of personalized ads through your device settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            You have the right to:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Withdraw Consent:</strong> Opt out of optional data collection</li>
            <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            To exercise these rights, contact us at privacy@hpyride.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Location Permissions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Location access is essential for our core services. You can control location permissions:
          </p>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
            <li><strong>While Using App:</strong> Location is accessed only when the app is open</li>
            <li><strong>Always:</strong> Required for active ride tracking (drivers)</li>
            <li><strong>Never:</strong> Disabling location will limit app functionality</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Manage location permissions in your device Settings → Apps → HpyRide.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Push Notifications</h2>
          <p className="text-muted-foreground leading-relaxed">
            We send push notifications for ride updates, booking confirmations, chat messages, and promotional offers. You can disable notifications in your device settings, but this may affect your ability to receive important ride updates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            HpyRide is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal data, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Retention</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Account data: Retained while account is active + 2 years after deletion</li>
            <li>Ride history: Retained for 3 years for dispute resolution</li>
            <li>Chat messages: Retained for 1 year</li>
            <li>Verification documents: Retained for 5 years as per regulatory requirements</li>
            <li>Location data: Retained for 90 days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy periodically. We will notify you of significant changes through the app or email. Your continued use of HpyRide after changes indicates acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy-related questions, concerns, or to exercise your rights:
          </p>
          <p className="text-muted-foreground mt-2">
            <strong>Data Protection Officer</strong><br />
            Email: privacy@hpyride.com<br />
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

export default PrivacyPolicyPage;
