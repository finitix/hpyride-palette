import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Plus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";

interface CarListing {
  id: string;
  brand: string;
  model: string;
  year_of_purchase: number;
  fuel_type: string;
  km_driven: number;
  expected_price: number;
  location: string;
  body_type: string;
  images: { image_url: string }[];
}

const categories = ["Hatchback", "Sedan", "SUV", "Luxury", "Electric"];

const PreOwnedHomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cars, setCars] = useState<CarListing[]>([]);
  const [featuredCars, setFeaturedCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, [selectedCategory]);

  const fetchCars = async () => {
    setLoading(true);
    let query = supabase
      .from('pre_owned_cars')
      .select('*, images:car_images(image_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('body_type', selectedCategory.toLowerCase());
    }

    const { data, error } = await query;
    if (!error && data) {
      setCars(data as CarListing[]);
      setFeaturedCars((data as CarListing[]).slice(0, 5));
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Search is already handled by filteredCars
  };

  const filteredCars = cars.filter(car => 
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Pre-Owned Cars</h1>
            <p className="text-xs text-muted-foreground">Buy & Sell Verified Used Cars</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/pre-owned/my-listings")} 
          className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-full"
        >
          <Car className="w-4 h-4" />
          <span className="text-sm font-medium">My Cars</span>
        </button>
      </header>

      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search cars by model or city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12"
            />
          </div>
          <button 
            onClick={() => navigate("/pre-owned/filters")} 
            className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shrink-0"
          >
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Cars */}
      {featuredCars.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold mb-3">Featured Cars</h2>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4">
              {featuredCars.map((car) => (
                <button
                  key={car.id}
                  onClick={() => navigate(`/pre-owned/car/${car.id}`)}
                  className="flex-shrink-0 w-48 bg-card rounded-xl overflow-hidden shadow-md"
                >
                  <div className="h-28 bg-muted">
                    {car.images?.[0] && (
                      <img src={car.images[0].image_url} alt={car.model} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{car.brand} {car.model}</p>
                    <p className="text-lg font-bold">₹{(car.expected_price / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-muted-foreground">{car.year_of_purchase} • {(car.km_driven / 1000).toFixed(0)}K km</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Cars */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold mb-3">All Cars</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No cars available</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/pre-owned/list")}>
              List Your Car
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCars.map((car) => (
              <button
                key={car.id}
                onClick={() => navigate(`/pre-owned/car/${car.id}`)}
                className="w-full bg-card rounded-xl overflow-hidden shadow-md flex"
              >
                <div className="w-32 h-24 bg-muted flex-shrink-0">
                  {car.images?.[0] && (
                    <img src={car.images[0].image_url} alt={car.model} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3 flex-1 text-left">
                  <p className="font-semibold truncate">{car.brand} {car.model}</p>
                  <p className="text-lg font-bold">₹{(car.expected_price / 100000).toFixed(1)} Lakh</p>
                  <p className="text-xs text-muted-foreground">{car.year_of_purchase} • {(car.km_driven / 1000).toFixed(0)}K km • {car.fuel_type}</p>
                  <p className="text-xs text-muted-foreground mt-1">{car.location}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sell My Car FAB */}
      <button
        onClick={() => navigate("/pre-owned/list")}
        className="fixed bottom-24 right-4 z-30 bg-foreground text-background rounded-full px-5 py-3 shadow-xl flex items-center gap-2 font-semibold"
      >
        <Plus className="w-5 h-5" />
        Sell My Car
      </button>

      <BottomNavigation />
    </div>
  );
};

export default PreOwnedHomePage;
