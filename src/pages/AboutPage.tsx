import { ArrowLeft, Heart, Users, Car, Shield, Leaf, Target, Award, MapPin, Smartphone, Clock, Star, CheckCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: "10,000+", label: "Happy Users" },
    { icon: Car, value: "5,000+", label: "Rides Completed" },
    { icon: MapPin, value: "100+", label: "Cities Covered" },
    { icon: Star, value: "4.8", label: "App Rating" },
  ];

  const services = [
    {
      icon: Car,
      title: "Ride Sharing",
      description: "Share rides with verified co-travelers heading your way. Save money and reduce carbon footprint."
    },
    {
      icon: Smartphone,
      title: "Pre-Owned Cars",
      description: "Buy and sell verified second-hand vehicles directly from owners. No middlemen, better deals."
    },
    {
      icon: Clock,
      title: "Car Rentals",
      description: "Rent vehicles for daily, weekly, or monthly use. Coming soon with a wide range of options."
    },
    {
      icon: Users,
      title: "Driver Pool",
      description: "Hire verified and trained drivers for your personal or commercial vehicles."
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Every user is verified through government ID. Real-time tracking, SOS features, and women-only rides ensure your safety."
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "By sharing rides, we reduce the number of vehicles on the road, cutting emissions and contributing to a greener India."
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "We're building more than an app – we're creating a community of conscious travelers who help each other."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging technology to solve everyday transportation challenges with simple, effective solutions."
    },
  ];

  const team = [
    { role: "Vision", description: "Making travel affordable and sustainable for every Indian" },
    { role: "Mission", description: "To become India's most trusted mobility platform by connecting people and journeys" },
    { role: "Goal", description: "1 million shared rides by 2027, reducing 10,000 tonnes of CO2 emissions" },
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
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">HR</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">HpyRide.com</h2>
          <p className="text-lg text-primary font-medium">Making Every Journey a Happy One</p>
          <p className="text-muted-foreground mt-2">India's Trusted Ride Sharing Platform</p>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Our Story</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            HpyRide was born from a simple observation: millions of cars travel with empty seats every day while countless people struggle to find affordable, reliable transport.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Founded in 2024 in Hyderabad, we set out to bridge this gap by creating a platform where everyday commuters can share rides, split costs, and make new connections – all while reducing traffic and pollution.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, HpyRide has grown into a comprehensive mobility platform offering ride sharing, a pre-owned car marketplace, car rentals, and driver services. We're proud to serve thousands of users across India who choose sustainable, community-driven travel.
          </p>
        </section>

        {/* Services */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Our Services</h3>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision, Mission, Goal */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">What Drives Us</h3>
          <div className="space-y-3">
            {team.map((item, index) => (
              <div key={index} className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">{item.role}</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-7">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Our Values</h3>
          <div className="grid grid-cols-1 gap-3">
            {values.map((value, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-primary/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Why Choose HpyRide?</h3>
          <ul className="space-y-3">
            {[
              "100% verified users with government ID",
              "Real-time GPS tracking for safety",
              "Women-only rides option",
              "Direct communication via in-app chat",
              "No hidden fees or commissions",
              "24/7 customer support",
              "SOS emergency feature",
              "Earn rewards by watching ads",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-foreground mb-4">Get in Touch</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Email:</strong> contact@hpyride.com</p>
            <p><strong>Support:</strong> support@hpyride.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Location:</strong> Hyderabad, Telangana, India</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-primary hover:underline text-sm">Facebook</a>
            <a href="#" className="text-primary hover:underline text-sm">Instagram</a>
            <a href="#" className="text-primary hover:underline text-sm">Twitter</a>
            <a href="#" className="text-primary hover:underline text-sm">LinkedIn</a>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          © 2024-2026 HpyRide.com. All rights reserved.<br />
          Made with ❤️ in India
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AboutPage;
