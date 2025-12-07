import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Navigation, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

interface Step {
  instruction: string;
  distance: number;
  duration: number;
}

const NavigationPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { latitude, longitude, requestLocation } = useGeolocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [eta, setEta] = useState("");
  const [distance, setDistance] = useState("");

  useEffect(() => {
    requestLocation();
    fetchBooking();
  }, []);

  useEffect(() => {
    if (latitude && longitude && booking) {
      updateRoute();
    }
  }, [latitude, longitude, booking]);

  const fetchBooking = async () => {
    if (!bookingId) return;

    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          rides (*)
        `)
        .eq('id', bookingId)
        .single();

      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current || !booking?.rides) return;

    const ride = booking.rides;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: latitude && longitude ? [longitude, latitude] : [ride.pickup_lng, ride.pickup_lat],
      zoom: 15,
      pitch: 45,
    });

    // Add destination marker
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([ride.drop_lng, ride.drop_lat])
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [booking]);

  const updateRoute = async () => {
    if (!map.current || !booking?.rides || !latitude || !longitude) return;

    const ride = booking.rides;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${ride.drop_lng},${ride.drop_lat}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        
        setEta(`${Math.round(route.duration / 60)} min`);
        setDistance(`${(route.distance / 1000).toFixed(1)} km`);

        const stepsData = route.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
        }));
        setSteps(stepsData);

        // Update route on map
        if (map.current.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(route.geometry);
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: route.geometry
          });
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#4285F4', 'line-width': 6 }
          });
        }

        // Update user marker
        if (userMarker.current) {
          userMarker.current.setLngLat([longitude, latitude]);
        } else {
          const el = document.createElement('div');
          el.className = 'w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg';
          userMarker.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        }

        map.current.easeTo({
          center: [longitude, latitude],
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map */}
      <div ref={mapContainer} className="flex-1 relative">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-card rounded-full shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={() => setMuted(!muted)}
            className="p-3 bg-card rounded-full shadow-lg"
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* ETA Card */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="bg-card rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{eta}</p>
                <p className="text-sm text-muted-foreground">{distance} remaining</p>
              </div>
              <Navigation className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Instructions */}
      <div className="bg-card border-t border-border p-4">
        {steps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {steps[currentStep]?.instruction}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(steps[currentStep]?.distance / 1000).toFixed(1)} km
                </p>
              </div>
            </div>

            {steps[currentStep + 1] && (
              <div className="pl-12 text-sm text-muted-foreground">
                Then: {steps[currentStep + 1]?.instruction}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationPage;
