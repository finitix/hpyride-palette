import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";

const CarRentalsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/home")} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Car Rentals</h1>
      </header>

      {/* Hero Section */}
      <div className="bg-splash-bg text-splash-fg px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Rent self-drive cars</h2>
        <p className="text-splash-fg/70">Find the perfect car for your journey</p>
      </div>

      {/* Search Card */}
      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl shadow-xl p-6">
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="City or location" className="pl-12" />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="datetime-local" placeholder="Start date & time" className="pl-12" />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="datetime-local" placeholder="End date & time" className="pl-12" />
            </div>
          </div>

          <Button variant="hero" className="w-full mt-6">
            <Search className="w-4 h-4 mr-2" />
            Search Cars
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-8">
        <h3 className="text-lg font-bold mb-4">Why rent with us?</h3>
        <div className="space-y-4">
          {[
            { title: "Wide Selection", desc: "Choose from sedans, SUVs, luxury cars" },
            { title: "Flexible Pickup", desc: "Pick-up & drop-off anywhere" },
            { title: "24/7 Support", desc: "Round the clock customer service" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-secondary rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-foreground font-bold">{i + 1}</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CarRentalsPage;
