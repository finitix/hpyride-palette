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
          <h2 className="text-xl font-bold text-foreground mb-3">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly, including your name, email, phone number, and vehicle details. We also collect location data to facilitate ride matching and navigation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">How We Use Your Information</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>To provide and improve our ride-sharing services</li>
            <li>To match riders with nearby drivers</li>
            <li>To process payments and transactions</li>
            <li>To send notifications about your rides</li>
            <li>To ensure safety and security of all users</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Location Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect precise location data when you use the app for ride matching, navigation, and safety features. You can control location permissions in your device settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We share limited information with other users to facilitate rides (e.g., driver name and vehicle details with riders). We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your data. All sensitive information is encrypted during transmission and storage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Your Rights</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Cookies & Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to improve user experience and analyze app usage. You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy-related questions or concerns, please contact us at privacy@hpyride.com
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

export default PrivacyPolicyPage;
