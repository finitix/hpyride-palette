import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Search, Plus, Navigation } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { useGeolocation } from "@/hooks/useGeolocation";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T7inUnOXYF9A";

const RideSharingPage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { latitude, longitude, requestLocation } = useGeolocation();

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center: [number, number] = longitude && latitude ? [longitude, latitude] : [77.2090, 28.6139];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 14,
    });

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

        {/* Offer Ride FAB */}
        <button
          onClick={() => navigate("/post-ride")}
          className="absolute bottom-4 right-4 z-20 bg-foreground text-background rounded-full px-5 py-3 shadow-xl flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Offer Ride
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default RideSharingPage;
