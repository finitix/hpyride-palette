import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";

const PreOwnedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/home")} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Pre-Owned Cars</h1>
      </header>

      {/* Hero Section */}
      <div className="bg-splash-bg text-splash-fg px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Buy or sell verified cars</h2>
        <p className="text-splash-fg/70">Find the best deals near you</p>
      </div>

      {/* Search Card */}
      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl shadow-xl p-6">
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Your city / area" className="pl-12" />
            </div>

            <div className="relative">
              <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Car type / brand (optional)" className="pl-12" />
            </div>
          </div>

          <Button variant="hero" className="w-full mt-6">
            <Search className="w-4 h-4 mr-2" />
            Search Cars
          </Button>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="px-6 py-8">
        <h3 className="text-lg font-bold mb-4">Popular Brands</h3>
        <div className="grid grid-cols-4 gap-4">
          {["Maruti", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "MG"].map((brand) => (
            <button
              key={brand}
              className="bg-secondary rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10" />
              <span className="text-xs font-medium text-foreground">{brand}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PreOwnedPage;
