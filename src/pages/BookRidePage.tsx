import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Search, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationInput from "@/components/LocationInput";
import MainLayout from "@/components/layout/MainLayout";
import { useGeolocation } from "@/hooks/useGeolocation";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

const BookRidePage = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { latitude, longitude, requestLocation } = useGeolocation();
  
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropLocation, setDropLocation] = useState("");
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);

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
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude]);

  const handlePickupChange = (value: string, coords?: [number, number]) => {
    setPickupLocation(value);
    if (coords) setPickupCoords(coords);
  };

  const handleDropChange = (value: string, coords?: [number, number]) => {
    setDropLocation(value);
    if (coords) setDropCoords(coords);
  };

  const handleUseMyLocation = async () => {
    if (latitude && longitude) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        if (data.features?.[0]) {
          setPickupLocation(data.features[0].place_name);
          setPickupCoords([longitude, latitude]);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    }
  };

  const handleSearchRides = () => {
    if (pickupLocation && dropLocation) {
      navigate('/available-rides', {
        state: {
          pickup: { location: pickupLocation, coords: pickupCoords },
          drop: { location: dropLocation, coords: dropCoords }
        }
      });
    }
  };

  const handleShowAllRides = () => {
    navigate('/available-rides');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3 lg:px-6">
          <button onClick={() => navigate(-1)} className="p-1 lg:hidden">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground lg:text-xl">Book a Ride</h1>
        </header>

        {/* Desktop: Two column layout */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Search form - sidebar on desktop */}
          <div className="order-1 lg:order-none lg:w-[400px] lg:border-r lg:border-border lg:p-6 lg:flex-shrink-0">
            <div className="absolute top-[70px] left-4 right-4 z-10 lg:relative lg:top-0 lg:left-0 lg:right-0">
              <div className="bg-card rounded-2xl shadow-xl p-5 lg:shadow-none lg:p-0">
                <div className="mb-3">
                  <LocationInput
                    placeholder="Leaving from"
                    value={pickupLocation}
                    onChange={handlePickupChange}
                    iconColor="green"
                    onUseMyLocation={handleUseMyLocation}
                  />
                </div>

                <div className="flex items-center gap-2 pl-5 my-1">
                  <div className="w-0.5 h-4 bg-border flex flex-col justify-between">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground -ml-[1px]" />
                    <div className="w-1 h-1 rounded-full bg-muted-foreground -ml-[1px]" />
                  </div>
                </div>

                <div className="mb-4">
                  <LocationInput
                    placeholder="Where to?"
                    value={dropLocation}
                    onChange={handleDropChange}
                    iconColor="orange"
                  />
                </div>

                <Button 
                  variant="hero" 
                  className="w-full mb-3"
                  onClick={handleSearchRides}
                  disabled={!pickupLocation || !dropLocation}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Rides
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShowAllRides}
                >
                  <List className="w-4 h-4 mr-2" />
                  Show All Available Rides
                </Button>
              </div>
            </div>
          </div>

          {/* Map section */}
          <div className="relative flex-1 min-h-[400px] lg:min-h-0">
            <div ref={mapContainer} className="absolute inset-0" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookRidePage;
