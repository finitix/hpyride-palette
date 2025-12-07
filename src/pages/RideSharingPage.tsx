import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, MapPin, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T7inUnOXYF9A";

const RideSharingPage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [77.2090, 28.6139], // Delhi
      zoom: 12,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    // Add center marker
    const markerEl = document.createElement("div");
    markerEl.className = "w-8 h-8 bg-splash-fg rounded-full border-4 border-splash-bg shadow-lg flex items-center justify-center";
    markerEl.innerHTML = '<div class="w-2 h-2 bg-splash-bg rounded-full"></div>';

    new mapboxgl.Marker(markerEl)
      .setLngLat([77.2090, 28.6139])
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Ride Sharing</h1>
        </div>
        <button 
          onClick={() => navigate("/my-rides")}
          className="text-sm font-medium text-foreground"
        >
          My Rides
        </button>
      </header>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Floating Card */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-card rounded-2xl shadow-xl p-5">
            {/* Pickup */}
            <div className="relative mb-3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
              <Input
                placeholder="Leaving from"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Divider with dots */}
            <div className="flex items-center gap-2 pl-5 my-1">
              <div className="w-0.5 h-4 bg-border flex flex-col justify-between">
                <div className="w-1 h-1 rounded-full bg-muted-foreground -ml-[1px]" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground -ml-[1px]" />
              </div>
            </div>

            {/* Drop */}
            <div className="relative mb-4">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-500" />
              <Input
                placeholder="Where to?"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="hero" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search Rides
            </Button>
          </div>
        </div>

        {/* Offer Ride FAB */}
        <button className="absolute bottom-40 right-4 z-20 bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-xl flex items-center gap-2 font-semibold hover:shadow-2xl transition-all">
          <Plus className="w-5 h-5" />
          Offer Ride
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default RideSharingPage;
