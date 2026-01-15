import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, Shield, CreditCard, Car, AlertTriangle, MapPin, Users, Clock, Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SupportPage = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      title: "Getting Started",
      items: [
        {
          question: "How do I create an account?",
          answer: "Download the HpyRide app, enter your phone number, verify with OTP, and complete your profile with name, email, and gender. You can then explore the app and book rides."
        },
        {
          question: "Why do I need to verify my profile?",
          answer: "Verification ensures safety for all users. Verified users can post rides, list cars, and access all features. Upload your government ID and a selfie video for verification."
        },
        {
          question: "How long does verification take?",
          answer: "Verification is typically completed within 24-48 hours. You'll receive a notification once your profile is verified or if additional information is needed."
        },
      ]
    },
    {
      title: "Booking Rides",
      items: [
        {
          question: "How do I book a ride?",
          answer: "Go to Ride Sharing → Find Ride, enter your pickup and drop locations, select your travel date, and browse available rides. Tap on a ride to see details and book your seat."
        },
        {
          question: "Can I cancel a booking?",
          answer: "Yes, you can cancel from 'My Rides' section. We recommend canceling at least 2 hours before the ride for courtesy. Frequent cancellations may affect your account."
        },
        {
          question: "How do I pay for rides?",
          answer: "Payments are made directly to the driver via cash or UPI as agreed. The fare is calculated based on distance and the driver's per-km rate shown before booking."
        },
        {
          question: "What if the driver doesn't show up?",
          answer: "Contact the driver through in-app chat. If unresponsive, cancel the booking and report the issue through Help & Support. We'll investigate and take appropriate action."
        },
      ]
    },
    {
      title: "Offering Rides",
      items: [
        {
          question: "How do I post a ride as a driver?",
          answer: "Go to Ride Sharing → Offer Ride, enter route details, set your price per km and available seats. Your ride will be verified by admin before publishing."
        },
        {
          question: "Why is my ride pending verification?",
          answer: "All rides are verified to ensure safety and authenticity. Your ride will be published once verified. This usually takes a few hours."
        },
        {
          question: "Can I reject a booking request?",
          answer: "Yes, you can accept or reject booking requests from riders. Provide a reason when rejecting to help the rider understand."
        },
        {
          question: "How do I add my vehicle?",
          answer: "Go to Profile → Verification → Add Vehicle. Enter vehicle details, upload RC book, insurance, pollution certificate, and vehicle photos for verification."
        },
      ]
    },
    {
      title: "Pre-Owned Cars",
      items: [
        {
          question: "How do I list my car for sale?",
          answer: "Go to Pre-Owned → Sell Your Car, fill in car details (brand, model, year, km driven, price), upload photos, and submit for verification."
        },
        {
          question: "How do I contact a car seller?",
          answer: "On the car details page, tap 'Show Interest' to submit your details. You can also use the in-app chat to communicate with the seller."
        },
        {
          question: "Is HpyRide responsible for car quality?",
          answer: "HpyRide is a marketplace connecting buyers and sellers. We verify listings but don't guarantee vehicle condition. Always inspect the car before purchase."
        },
        {
          question: "How do I report a suspicious listing?",
          answer: "Tap the 'Report' button on any car listing page. Provide the reason and details. Our team will investigate and remove fraudulent listings."
        },
      ]
    },
    {
      title: "Safety & Security",
      items: [
        {
          question: "What safety features does HpyRide offer?",
          answer: "SOS emergency button, real-time location sharing, verified profiles, women-only rides option, in-app chat, and the ability to share ride details with contacts."
        },
        {
          question: "How do I use the SOS feature?",
          answer: "During an active ride, tap the SOS button to alert emergency contacts with your real-time location. This feature is available on the navigation screen."
        },
        {
          question: "What are women-only rides?",
          answer: "Female drivers can mark their rides as 'Women Only' so only female riders can book. This provides an additional safety option for women travelers."
        },
        {
          question: "How do I report inappropriate behavior?",
          answer: "Go to Help & Support, describe the incident with relevant details. You can also rate and review the user after the ride. Serious violations lead to account suspension."
        },
      ]
    },
    {
      title: "Account & Technical",
      items: [
        {
          question: "How do I update my profile?",
          answer: "Go to Profile and tap the edit icon to update your name, email, or photo. Phone number changes require re-verification."
        },
        {
          question: "Why am I not receiving notifications?",
          answer: "Check that notifications are enabled in your device settings for HpyRide. Also ensure you have a stable internet connection."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact support at support@hpyride.com with your registered phone number. Account deletion is permanent and cannot be undone."
        },
        {
          question: "The app is not working properly. What should I do?",
          answer: "Try force-closing and reopening the app. If issues persist, clear app cache, update to the latest version, or reinstall the app."
        },
      ]
    },
  ];

  const handleContact = (type: string) => {
    if (type === 'support') {
      window.open('mailto:hpyrideindia@gmail.com', '_self');
    } else if (type === 'grievance') {
      window.open('mailto:hpyride.dcgroup@gmail.com', '_self');
    } else if (type === 'whatsapp') {
      window.open('https://wa.me/918897611021?text=Hi, I need help with HpyRide', '_blank');
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
          <h2 className="text-lg font-bold text-foreground mb-4">Chat with Us</h2>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-14 mb-4"
            onClick={() => handleContact('whatsapp')}
          >
            <MessageCircle className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <span className="font-medium">Chat on WhatsApp</span>
              <p className="text-xs text-muted-foreground">+91 88976 11021</p>
            </div>
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleContact('support')}
            >
              <Mail className="w-6 h-6 text-blue-500" />
              <span className="text-xs">Support Mail</span>
              <span className="text-[10px] text-muted-foreground">hpyrideindia@gmail.com</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleContact('grievance')}
            >
              <Mail className="w-6 h-6 text-orange-500" />
              <span className="text-xs">Grievance</span>
              <span className="text-[10px] text-muted-foreground">hpyride.dcgroup@gmail.com</span>
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-card border border-border rounded-xl overflow-hidden">
                <h3 className="font-semibold text-foreground bg-secondary px-4 py-3">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="px-4">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`}>
                      <AccordionTrigger className="text-left text-sm">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
          <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="font-semibold text-foreground">Support Hours</p>
          <p className="text-sm text-muted-foreground">9:00 AM - 9:00 PM (Mon - Sat)</p>
          <p className="text-xs text-muted-foreground mt-2">
            Average response time: 2-4 hours
          </p>
        </section>

        {/* Emergency */}
        <section className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Emergency?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            If you're in immediate danger, please contact local emergency services (100/112) first, then use the SOS feature in the app.
          </p>
          <p className="text-xs text-muted-foreground">
            For safety concerns: emergency@hpyride.com
          </p>
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SupportPage;
