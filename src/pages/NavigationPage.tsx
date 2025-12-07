import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Navigation, Volume2, VolumeX, Crosshair, X, CornerUpRight, CornerUpLeft, ArrowUp, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import AIChatBubble from "@/components/AIChatBubble";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

interface Step {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
  };
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
  const [arrivalTime, setArrivalTime] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    requestLocation();
    fetchBooking();
    
    // Keep updating location
    const interval = setInterval(() => {
      requestLocation();
    }, 5000);

    return () => clearInterval(interval);
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
      if (data?.rides?.drop_location) {
        setDestination(data.rides.drop_location);
      }
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
      zoom: 16,
      pitch: 60,
      bearing: 0,
      attributionControl: false,
    });

    // Add destination marker
    const destEl = document.createElement('div');
    destEl.innerHTML = `<div class="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`;
    new mapboxgl.Marker(destEl)
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
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${longitude},${latitude};${ride.drop_lng},${ride.drop_lat}?geometries=geojson&steps=true&annotations=congestion&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        
        // Calculate ETA
        const etaMinutes = Math.round(route.duration / 60);
        setEta(`${etaMinutes} min`);
        setDistance(`${(route.distance / 1000).toFixed(1)} km`);
        
        // Calculate arrival time
        const arrival = new Date(Date.now() + route.duration * 1000);
        setArrivalTime(arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        const stepsData = route.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
        }));
        setSteps(stepsData);

        // Get congestion data for traffic colors
        const congestion = data.routes[0].legs[0].annotation?.congestion || [];
        
        // Update route on map with traffic colors
        if (map.current.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(route.geometry);
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: route.geometry
          });
          
          // Add route with gradient based on traffic
          map.current.addLayer({
            id: 'route-bg',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 
              'line-color': '#1a1a2e',
              'line-width': 12 
            }
          });
          
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 
              'line-color': '#4285F4',
              'line-width': 8 
            }
          });
        }

        // Update user marker with pulsing effect
        if (userMarker.current) {
          userMarker.current.setLngLat([longitude, latitude]);
        } else {
          const el = document.createElement('div');
          el.innerHTML = `
            <div class="relative">
              <div class="w-6 h-6 bg-blue-500 border-3 border-white rounded-full shadow-lg z-10 relative"></div>
              <div class="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-50"></div>
            </div>
          `;
          userMarker.current = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        }

        // Center and rotate map based on direction
        const bearing = getBearing(
          latitude, longitude,
          route.geometry.coordinates[1]?.[1] || latitude,
          route.geometry.coordinates[1]?.[0] || longitude
        );

        map.current.easeTo({
          center: [longitude, latitude],
          bearing,
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const getBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  const getManeuverIcon = (maneuver: { type: string; modifier?: string }) => {
    if (maneuver.type === 'turn') {
      if (maneuver.modifier?.includes('right')) {
        return <CornerUpRight className="w-6 h-6 text-white" />;
      } else if (maneuver.modifier?.includes('left')) {
        return <CornerUpLeft className="w-6 h-6 text-white" />;
      }
    }
    return <ArrowUp className="w-6 h-6 text-white" />;
  };

  const recenterMap = () => {
    if (map.current && latitude && longitude) {
      map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
    }
  };

  const endNavigation = () => {
    navigate(-1);
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
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          {/* Turn Instruction Card */}
          {steps.length > 0 && steps[currentStep] && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
                  {getManeuverIcon(steps[currentStep].maneuver)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">
                    {steps[currentStep]?.instruction}
                  </p>
                  <p className="text-blue-200 text-sm">
                    in {(steps[currentStep]?.distance / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>
              
              {steps[currentStep + 1] && (
                <div className="mt-3 pt-3 border-t border-blue-500 flex items-center gap-2 text-blue-200 text-sm">
                  <span>Then:</span>
                  <span>{steps[currentStep + 1]?.instruction}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="absolute top-32 right-4 z-10 flex flex-col gap-2">
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
          
          <button
            onClick={recenterMap}
            className="p-3 bg-card rounded-full shadow-lg"
          >
            <Crosshair className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* AI Chat Bubble */}
        <AIChatBubble 
          context={{
            destination,
            eta,
            distance
          }}
        />
      </div>

      {/* Bottom Navigation Panel */}
      <div className="bg-card border-t border-border p-4 safe-area-bottom">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{eta}</p>
              <p className="text-xs text-muted-foreground">ETA</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{distance}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{arrivalTime}</p>
              <p className="text-xs text-muted-foreground">Arrival</p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={endNavigation}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            End
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-green-500" />
          <span className="line-clamp-1">{destination}</span>
        </div>
      </div>
    </div>
  );
};

export default NavigationPage;
