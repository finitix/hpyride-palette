import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";

const DriverPoolPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/home")} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Driver Pool</h1>
      </header>

      {/* Hero Section */}
      <div className="bg-splash-bg text-splash-fg px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Hire drivers or drive & earn</h2>
        <p className="text-splash-fg/70">Connect with verified drivers near you</p>
      </div>

      {/* Search Card */}
      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl shadow-xl p-6">
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="From" className="pl-12" />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="To" className="pl-12" />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="date" className="pl-12" />
            </div>
          </div>

          <Button variant="hero" className="w-full mt-6">
            <Search className="w-4 h-4 mr-2" />
            Search Drivers
          </Button>
        </div>
      </div>

      {/* Become a driver CTA */}
      <div className="px-6 py-8">
        <div className="bg-splash-bg text-splash-fg rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-splash-fg/20 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Become a Driver</h3>
              <p className="text-sm text-splash-fg/70">Earn money on your own schedule</p>
            </div>
          </div>
          <Button variant="splash" className="w-full mt-4">
            Register Now
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DriverPoolPage;
