import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, MessageCircle, Flag, Share2, Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CarDetails {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year_of_purchase: number;
  variant: string;
  fuel_type: string;
  transmission: string;
  ownership: string;
  km_driven: number;
  color: string;
  insurance_valid_till: string;
  service_history_available: boolean;
  expected_price: number;
  description: string;
  location: string;
  body_type: string;
  created_at: string;
}

interface SellerProfile {
  full_name: string;
  phone: string;
  avatar_url: string;
}

const CarDetailsPage = () => {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { user } = useAuth();
  const [car, setCar] = useState<CarDetails | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (carId) {
      fetchCarDetails();
    }
  }, [carId]);

  const fetchCarDetails = async () => {
    const { data: carData, error: carError } = await supabase
      .from('pre_owned_cars')
      .select('*')
      .eq('id', carId)
      .single();

    if (carError || !carData) {
      toast.error("Car not found");
      navigate("/pre-owned");
      return;
    }

    setCar(carData);

    // Fetch images
    const { data: imagesData } = await supabase
      .from('car_images')
      .select('image_url')
      .eq('car_id', carId);

    setImages(imagesData?.map(i => i.image_url) || []);

    // Fetch seller profile
    const { data: sellerData } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('user_id', carData.user_id)
      .single();

    setSeller(sellerData);
    setLoading(false);
  };

  const handleShowInterest = () => {
    navigate(`/pre-owned/interest/${carId}`);
  };

  const handleContact = () => {
    if (seller?.phone) {
      window.location.href = `tel:${seller.phone}`;
    }
  };

  const handleChat = () => {
    navigate(`/pre-owned/chat/${carId}`);
  };

  const handleReport = () => {
    navigate(`/pre-owned/report/${carId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-background/80 backdrop-blur rounded-full">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-background/80 backdrop-blur rounded-full">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 bg-background/80 backdrop-blur rounded-full">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Image Carousel */}
      <div className="relative h-72 bg-muted">
        {images.length > 0 ? (
          <>
            <img src={images[currentImageIndex]} alt="" className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 rounded-full px-3 py-1 text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No images</span>
          </div>
        )}
      </div>

      {/* Car Info */}
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold">{car.brand} {car.model} {car.variant}</h1>
        <p className="text-3xl font-bold mt-2">₹{(car.expected_price / 100000).toFixed(2)} Lakh</p>

        {/* Key Highlights */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-3 py-1 bg-secondary rounded-full text-sm">{car.year_of_purchase}</span>
          <span className="px-3 py-1 bg-secondary rounded-full text-sm">{(car.km_driven / 1000).toFixed(0)}K km</span>
          <span className="px-3 py-1 bg-secondary rounded-full text-sm">{car.fuel_type}</span>
          <span className="px-3 py-1 bg-secondary rounded-full text-sm">{car.transmission}</span>
          <span className="px-3 py-1 bg-secondary rounded-full text-sm">{car.ownership}</span>
        </div>

        {/* Full Specifications */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">Specifications</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Color</p>
              <p className="font-medium">{car.color || 'N/A'}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Body Type</p>
              <p className="font-medium capitalize">{car.body_type || 'N/A'}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Insurance Till</p>
              <p className="font-medium">{car.insurance_valid_till || 'N/A'}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Service History</p>
              <p className="font-medium">{car.service_history_available ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Description</h2>
            <p className="text-muted-foreground">{car.description}</p>
          </div>
        )}

        {/* Location */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">Location</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{car.location}</span>
          </div>
          <div className="h-32 bg-muted rounded-xl mt-3 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        {/* Seller Details */}
        {seller && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Seller Details</h2>
            <div className="bg-secondary rounded-xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted overflow-hidden">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                    {seller.full_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{seller.full_name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>Verified Seller</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report */}
        <button onClick={handleReport} className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
          <Flag className="w-4 h-4" />
          Report this listing
        </button>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleChat}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleContact}>
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button variant="hero" className="flex-1" onClick={handleShowInterest}>
          Show Interest
        </Button>
      </div>
    </div>
  );
};

export default CarDetailsPage;
