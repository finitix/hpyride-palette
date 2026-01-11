import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, Shield, CreditCard, Car, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { toast } from "sonner";

const SupportPage = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      icon: Car,
      question: "How do I book a ride?",
      answer: "Search for available rides from your location, select a ride that matches your schedule, and confirm booking with the driver."
    },
    {
      icon: CreditCard,
      question: "How do payments work?",
      answer: "Payments are made directly to the driver. You can pay via cash or online payment methods as agreed with the driver."
    },
    {
      icon: Shield,
      question: "How do I verify my profile?",
      answer: "Go to Profile > Verify Now, upload your ID proof and a selfie video. Our team will verify within 24-48 hours."
    },
    {
      icon: AlertTriangle,
      question: "What if I need to cancel a ride?",
      answer: "You can cancel a booking from My Rides section. Please cancel at least 2 hours before the scheduled time."
    },
    {
      icon: FileText,
      question: "How do I post a ride as a driver?",
      answer: "Go to Ride Sharing > Offer Ride, fill in your route details, set your price, and publish the ride."
    },
  ];

  const handleContact = (type: string) => {
    if (type === 'phone') {
      window.open('tel:+919876543210', '_self');
    } else if (type === 'email') {
      window.open('mailto:support@hpyride.com', '_self');
    } else if (type === 'whatsapp') {
      window.open('https://wa.me/919876543210?text=Hi, I need help with HpyRide', '_blank');
    }
    toast.success(`Opening ${type}...`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Help & Support</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Contact Options */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Contact Us</h2>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleContact('phone')}
            >
              <Phone className="w-6 h-6 text-primary" />
              <span className="text-xs">Call Us</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleContact('whatsapp')}
            >
              <MessageCircle className="w-6 h-6 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleContact('email')}
            >
              <Mail className="w-6 h-6 text-blue-500" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/terms')}
            >
              <FileText className="w-5 h-5 mr-3" />
              Terms & Conditions
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/privacy')}
            >
              <Shield className="w-5 h-5 mr-3" />
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/about')}
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              About Us
            </Button>
          </div>
        </section>

        {/* Support Hours */}
        <section className="bg-secondary rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Support Hours: 9 AM - 9 PM (Mon - Sat)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Average response time: 2-4 hours
          </p>
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SupportPage;
