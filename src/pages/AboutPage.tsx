import { ArrowLeft, Heart, Users, Car, Shield, Leaf, Target, Award, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: "10,000+", label: "Happy Users" },
    { icon: Car, value: "5,000+", label: "Rides Completed" },
    { icon: MapPin, value: "100+", label: "Cities Covered" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Verified drivers, real-time tracking, and SOS features for your peace of mind."
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Reduce carbon footprint by sharing rides and contributing to a greener planet."
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Building connections and trust within our growing community of riders."
    },
    {
      icon: Award,
      title: "Quality Service",
      description: "Committed to providing the best ride-sharing experience in India."
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">About Us</h1>
      </header>

      <div className="px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">HpyRide.com</h2>
          <p className="text-muted-foreground">Making Every Journey a Happy One</p>
        </section>

        {/* Mission */}
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Our Mission</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            To revolutionize urban transportation in India by creating a trusted platform that connects riders and drivers, making travel affordable, safe, and sustainable for everyone.
          </p>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-3">Our Story</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            HpyRide was born from a simple idea: making commuting easier and more affordable for everyday Indians. Started in 2024, we've grown from a small startup to a trusted platform serving thousands of users across multiple cities.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We believe that every ride is an opportunity to connect, save money, and reduce our environmental impact. Our platform brings together people heading in the same direction, creating a community of conscious commuters.
          </p>
        </section>

        {/* Values */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Our Values</h3>
          <div className="grid grid-cols-2 gap-3">
            {values.map((value, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4">
                <value.icon className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-foreground mb-1">{value.title}</h4>
                <p className="text-xs text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-secondary rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">Get in Touch</h3>
          <p className="text-sm text-muted-foreground mb-1">Email: contact@hpyride.com</p>
          <p className="text-sm text-muted-foreground mb-1">Phone: +91 98765 43210</p>
          <p className="text-sm text-muted-foreground">Location: Hyderabad, India</p>
        </section>

        <p className="text-xs text-muted-foreground text-center">
          © 2024-2026 HpyRide.com. All rights reserved.
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AboutPage;
