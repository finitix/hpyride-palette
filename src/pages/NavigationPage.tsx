import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Volume2, VolumeX, Crosshair, X, CornerUpRight, CornerUpLeft, ArrowUp, MapPin, Navigation2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import AIChatBubble from "@/components/AIChatBubble";
import SOSButton from "@/components/SOSButton";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T7inUnOXYF9A";

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
  const watchIdRef = useRef<number | null>(null);
  const routeInitialized = useRef(false);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [eta, setEta] = useState("");
  const [distance, setDistance] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [destination, setDestination] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  // Fetch booking immediately
  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  // Start watching location
  useEffect(() => {
    if ('geolocation' in navigator) {
      // Get initial position immediately
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => requestLocation(),
        { enableHighAccuracy: true, timeout: 5000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fetchBooking = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`*, rides (*, vehicle:vehicles(name, number))`)
        .eq('id', bookingId)
        .single();

      setBooking(data);
      if (data?.rides?.drop_location) {
        setDestination(data.rides.drop_location);
      }
      if (data?.rides?.vehicle) {
        setVehicleNumber(data.rides.vehicle.number || '');
      }
      // Get driver profile
      if (data?.driver_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', data.driver_id)
          .single();
        if (profile?.full_name) setDriverName(profile.full_name);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map when booking is ready
  useEffect(() => {
    if (!mapContainer.current || map.current || !booking?.rides) return;

    const ride = booking.rides;
    const loc = userLocation || (latitude && longitude ? { lat: latitude, lng: longitude } : null);
    const center: [number, number] = loc ? [loc.lng, loc.lat] : [ride.pickup_lng, ride.pickup_lat];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center,
      zoom: 15,
      pitch: 60,
      bearing: 0,
      attributionControl: false,
    });

    map.current.on('load', () => {
      setIsMapReady(true);
      
      // Add destination marker
      const destEl = document.createElement('div');
      destEl.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-pulse">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `;
      new mapboxgl.Marker(destEl)
        .setLngLat([ride.drop_lng, ride.drop_lat])
        .addTo(map.current!);

      // Add pickup marker
      const pickupEl = document.createElement('div');
      pickupEl.innerHTML = `
        <div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4"/>
          </svg>
        </div>
      `;
      new mapboxgl.Marker(pickupEl)
        .setLngLat([ride.pickup_lng, ride.pickup_lat])
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [booking]);

  // Update route when location or map is ready
  useEffect(() => {
    const loc = userLocation || (latitude && longitude ? { lat: latitude, lng: longitude } : null);
    if (loc && booking && isMapReady) {
      updateRoute(loc.lat, loc.lng);
    }
  }, [userLocation, latitude, longitude, booking, isMapReady]);

  const updateRoute = useCallback(async (lat: number, lng: number) => {
    if (!map.current || !booking?.rides) return;

    const ride = booking.rides;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${lng},${lat};${ride.drop_lng},${ride.drop_lat}?geometries=geojson&steps=true&annotations=congestion&overview=full&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        const etaMinutes = Math.round(route.duration / 60);
        setEta(`${etaMinutes} min`);
        setDistance(`${(route.distance / 1000).toFixed(1)} km`);
        
        const arrival = new Date(Date.now() + route.duration * 1000);
        setArrivalTime(arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        const stepsData = route.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
        }));
        setSteps(stepsData);

        const coordinates = route.geometry.coordinates;
        const congestionData = route.legs[0].annotation?.congestion || [];

        // Remove existing layers and sources
        ['route-line', 'route-glow', 'route-traffic-heavy', 'route-traffic-moderate', 'route-traffic-low'].forEach(layerId => {
          if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
        });
        ['route', 'route-traffic-heavy', 'route-traffic-moderate', 'route-traffic-low'].forEach(sourceId => {
          if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
        });

        // Add main route source
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        // Add glow effect
        map.current.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#4285F4', 'line-width': 16, 'line-opacity': 0.3 }
        });

        // Add main route line
        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#4285F4', 'line-width': 6 }
        });

        // Add traffic segments
        const segments: { [key: string]: number[][][] } = { heavy: [], moderate: [], low: [] };

        for (let i = 0; i < congestionData.length && i < coordinates.length - 1; i++) {
          const congestion = congestionData[i];
          const segment = [coordinates[i], coordinates[i + 1]];
          if (congestion === 'heavy' || congestion === 'severe') {
            segments.heavy.push(segment);
          } else if (congestion === 'moderate') {
            segments.moderate.push(segment);
          }
        }

        const addTrafficLayer = (id: string, color: string, segmentCoords: number[][][]) => {
          if (segmentCoords.length === 0) return;
          const features = segmentCoords.map(coords => ({
            type: 'Feature' as const,
            properties: {},
            geometry: { type: 'LineString' as const, coordinates: coords }
          }));
          map.current?.addSource(id, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features }
          });
          map.current?.addLayer({
            id,
            type: 'line',
            source: id,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': color, 'line-width': 6 }
          });
        };

        addTrafficLayer('route-traffic-moderate', '#FFAA00', segments.moderate);
        addTrafficLayer('route-traffic-heavy', '#FF4444', segments.heavy);

        // Update or create user marker
        if (userMarker.current) {
          userMarker.current.setLngLat([lng, lat]);
        } else {
          const el = document.createElement('div');
          el.innerHTML = `
            <div class="relative">
              <div class="w-8 h-8 bg-blue-500 border-4 border-white rounded-full shadow-xl z-10 relative flex items-center justify-center">
                <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white -rotate-180"></div>
              </div>
              <div class="absolute inset-0 w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-40"></div>
            </div>
          `;
          userMarker.current = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current!);
        }

        // Fit bounds to show full route on first load
        if (!routeInitialized.current && coordinates.length > 1) {
          const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: number[]) => {
            return bounds.extend(coord as [number, number]);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

          map.current.fitBounds(bounds, { padding: 80, maxZoom: 15 });
          routeInitialized.current = true;
        } else if (coordinates.length > 1) {
          // Update bearing for navigation view
          const bearing = getBearing(lat, lng, coordinates[1][1], coordinates[1][0]);
          map.current.easeTo({ center: [lng, lat], bearing, pitch: 60, duration: 500 });
        }
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  }, [booking]);

  const getBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  const getManeuverIcon = (maneuver: { type: string; modifier?: string }) => {
    if (maneuver.type === 'turn' || maneuver.type === 'end of road' || maneuver.type === 'fork') {
      if (maneuver.modifier?.includes('right')) return <CornerUpRight className="w-6 h-6 text-white" />;
      if (maneuver.modifier?.includes('left')) return <CornerUpLeft className="w-6 h-6 text-white" />;
    }
    if (maneuver.type === 'arrive') return <MapPin className="w-6 h-6 text-white" />;
    return <ArrowUp className="w-6 h-6 text-white" />;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const recenterMap = () => {
    const loc = userLocation || (latitude && longitude ? { lat: latitude, lng: longitude } : null);
    if (map.current && loc) {
      map.current.flyTo({ center: [loc.lng, loc.lat], zoom: 17, pitch: 60 });
    }
  };

  const closeNavigation = () => navigate(-1);

  // Check if ride is active (confirmed booking status)
  const isRideActive = booking?.status === 'confirmed';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading navigation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Close Button */}
      <button
        onClick={closeNavigation}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-card/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center border border-border"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>

      {/* Map Container */}
      <div ref={mapContainer} className="flex-1 w-full" />

      {/* Top Instruction Box */}
      {steps.length > 0 && steps[currentStep] && (
        <div className="absolute top-4 left-4 right-16 z-40">
          <div className="bg-blue-600 rounded-xl shadow-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                {getManeuverIcon(steps[currentStep].maneuver)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base leading-tight line-clamp-2">
                  {steps[currentStep]?.instruction}
                </p>
                <p className="text-blue-200 text-sm mt-0.5">
                  {formatDistance(steps[currentStep]?.distance)}
                </p>
              </div>
            </div>
            {steps[currentStep + 1] && (
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2 text-blue-200 text-xs">
                <Navigation2 className="w-3 h-3" />
                <span className="truncate">Then: {steps[currentStep + 1]?.instruction}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Traffic Legend */}
      <div className="absolute top-28 left-4 z-40 bg-card/90 backdrop-blur rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Route</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Heavy</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-40 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => setMuted(!muted)}
          className="w-10 h-10 bg-card/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center border border-border"
        >
          {muted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-foreground" />}
        </button>
        <button
          onClick={recenterMap}
          className="w-10 h-10 bg-blue-500 rounded-full shadow-lg flex items-center justify-center"
        >
          <Crosshair className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* AI Chat Bubble */}
      <div className="absolute bottom-28 left-4 z-40">
        <AIChatBubble context={{ destination, eta, distance }} />
      </div>

      {/* SOS Button - Active during confirmed booking */}
      <SOSButton 
        isRideActive={isRideActive}
        bookingId={bookingId}
        driverName={driverName}
        vehicleNumber={vehicleNumber}
      />

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-4 pb-6 rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{eta || '--'}</p>
              <p className="text-[10px] text-muted-foreground uppercase">ETA</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{distance || '--'}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Distance</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{arrivalTime || '--'}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Arrival</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={closeNavigation} className="rounded-full px-4">
            <X className="w-4 h-4 mr-1" />
            End
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 truncate">To: {destination}</p>
      </div>
    </div>
  );
};

export default NavigationPage;