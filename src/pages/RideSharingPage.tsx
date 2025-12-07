import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Search, Plus, Navigation, Car, Bike, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

interface PublishedRide {
  id: string;
  pickup_location: string;
  drop_location: string;
  pickup_lat: number;
  pickup_lng: number;
  ride_date: string;
  ride_time: string;
  seats_available: number;
  total_price: number;
  distance_km: number;
  vehicles: { category: string; name: string; number: string } | null;
}

const RideSharingPage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { latitude, longitude, requestLocation } = useGeolocation();
  const [rides, setRides] = useState<PublishedRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<PublishedRide | null>(null);

  useEffect(() => {
    requestLocation();
    fetchPublishedRides();
  }, []);

  const fetchPublishedRides = async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('*, vehicles(category, name, number)')
      .eq('status', 'published')
      .gte('ride_date', new Date().toISOString().split('T')[0]);
    
    if (error) {
      console.error('Error fetching rides:', error);
    }
    setRides((data || []) as PublishedRide[]);

    // Set up realtime subscription
    const channel = supabase
      .channel('rides-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        fetchPublishedRides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center: [number, number] = longitude && latitude ? [longitude, latitude] : [77.2090, 28.6139];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 12,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    if (latitude && longitude) {
      const el = document.createElement("div");
      el.className = "w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg";
      new mapboxgl.Marker(el).setLngLat([longitude, latitude]).addTo(map.current);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude]);

  // Add ride markers when rides load
  useEffect(() => {
    if (!map.current || rides.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    rides.forEach(ride => {
      const el = document.createElement("div");
      const category = ride.vehicles?.category || 'car';
      
      el.innerHTML = getVehicleMarkerSVG(category);
      el.className = "cursor-pointer transform hover:scale-110 transition-transform";
      el.onclick = () => setSelectedRide(ride);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([ride.pickup_lng, ride.pickup_lat])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  }, [rides, map.current]);

  const getVehicleMarkerSVG = (category: string): string => {
    const colorMap: Record<string, string> = {
      'bike': '#3B82F6',      // Blue
      'auto': '#22C55E',      // Green
      'taxi': '#EAB308',      // Yellow
      'suv': '#8B5CF6',       // Purple
      'van': '#F97316',       // Orange
      'mini_bus': '#06B6D4',  // Cyan
      'luxury': '#EC4899',    // Pink
      'ev': '#10B981',        // Emerald
      'car': '#000000',       // Black
      'other': '#6B7280',     // Gray
    };
    const bgColor = colorMap[category] || '#000000';
    
    const isBike = category === 'bike';
    const isAuto = category === 'auto';
    
    return `<div style="background: ${bgColor}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid white;">
      <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
        ${isBike 
          ? '<path d="M5 20.5A3.5 3.5 0 0 1 1.5 17A3.5 3.5 0 0 1 5 13.5A3.5 3.5 0 0 1 8.5 17A3.5 3.5 0 0 1 5 20.5M5 12A5 5 0 0 0 0 17A5 5 0 0 0 5 22A5 5 0 0 0 10 17A5 5 0 0 0 5 12M14.8 10H19V8.2H15.8L13.9 4.1C13.6 3.4 13 3 12.2 3C11.6 3 11 3.4 10.6 3.9L7.2 8.3C6.8 8.8 6.8 9.5 7.1 10C7.5 10.5 8.1 10.7 8.6 10.7H11V16.5H13V8.3L14.8 10M19 20.5A3.5 3.5 0 0 1 15.5 17A3.5 3.5 0 0 1 19 13.5A3.5 3.5 0 0 1 22.5 17A3.5 3.5 0 0 1 19 20.5M19 12A5 5 0 0 0 14 17A5 5 0 0 0 19 22A5 5 0 0 0 24 17A5 5 0 0 0 19 12M16 4.8C17 4.8 17.8 4 17.8 3C17.8 2 17 1.2 16 1.2C15 1.2 14.2 2 14.2 3C14.2 4 15 4.8 16 4.8Z"/>'
          : isAuto
          ? '<path d="M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9"/>'
          : '<path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z"/>'
        }
      </svg>
    </div>`;
  };

  const centerOnUser = () => {
    if (map.current && latitude && longitude) {
      map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Ride Sharing</h1>
        </div>
        <button onClick={() => navigate("/my-rides")} className="text-sm font-medium text-foreground">
          My Rides
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-background border-b border-border">
        <button
          onClick={() => navigate("/book-ride")}
          className="w-full flex items-center gap-3 bg-muted rounded-xl px-4 py-3"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground">Where to?</span>
        </button>
      </div>

      <div className="relative flex-1">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* My Location Button */}
        <button
          onClick={centerOnUser}
          className="absolute top-4 right-4 z-10 p-3 bg-card rounded-full shadow-lg"
        >
          <Navigation className="w-5 h-5 text-foreground" />
        </button>

        {/* Ride Detail Popup */}
        {selectedRide && (
          <div className="absolute bottom-20 left-4 right-4 z-30 bg-card rounded-2xl shadow-xl p-4 animate-slide-up">
            <button 
              onClick={() => setSelectedRide(null)}
              className="absolute top-3 right-3 p-1"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                {selectedRide.vehicles?.category === 'bike' ? (
                  <Bike className="w-5 h-5" />
                ) : (
                  <Car className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{selectedRide.vehicles?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedRide.vehicles?.number}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">₹{selectedRide.total_price?.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">{selectedRide.seats_available} seats</p>
              </div>
            </div>
            
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-foreground line-clamp-1">{selectedRide.pickup_location}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <p className="text-sm text-foreground line-clamp-1">{selectedRide.drop_location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span>{new Date(selectedRide.ride_date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{selectedRide.ride_time}</span>
              <span>•</span>
              <span>{selectedRide.distance_km?.toFixed(1)} km</span>
            </div>
            
            <Button 
              variant="hero" 
              className="w-full"
              onClick={() => navigate(`/booking/${selectedRide.id}`)}
            >
              Book Now
            </Button>
          </div>
        )}

        {/* Offer Ride FAB - Centered */}
        <button
          onClick={() => navigate("/post-ride")}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-foreground text-background rounded-full px-6 py-3 shadow-xl flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Offer Ride
        </button>
      </div>

      <div className="relative z-50">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default RideSharingPage;
