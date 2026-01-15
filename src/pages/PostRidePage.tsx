import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Check, Car, Bike, ChevronRight, Upload, X, CheckCircle, Clock, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LocationInput from "@/components/LocationInput";
import { useGeolocation } from "@/hooks/useGeolocation";
import { InlineBannerAd } from "@/components/ads/MontagAds";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

type VehicleCategory = 'car' | 'bike' | 'auto' | 'taxi' | 'suv' | 'van' | 'mini_bus' | 'luxury' | 'ev' | 'other';
type VehicleType = 'private' | 'commercial' | 'other';

interface RouteOption {
  id: string;
  label: string;
  color: string;
  distance: number;
  duration: number;
  geometry: any;
  cities: string[];
}

const VEHICLE_CATEGORIES: { value: VehicleCategory; label: string; icon: any }[] = [
  { value: 'car', label: 'Car', icon: Car },
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'auto', label: 'Auto', icon: Car },
  { value: 'taxi', label: 'Taxi', icon: Car },
  { value: 'suv', label: 'SUV', icon: Car },
  { value: 'van', label: 'Van', icon: Car },
  { value: 'mini_bus', label: 'Mini Bus', icon: Car },
  { value: 'luxury', label: 'Luxury', icon: Car },
  { value: 'ev', label: 'EV', icon: Car },
  { value: 'other', label: 'Other', icon: Car },
];

const ROUTE_COLORS = ['#000000', '#3B82F6', '#22C55E', '#F97316'];

const PostRidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latitude, longitude, requestLocation } = useGeolocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1: Route
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropLocation, setDropLocation] = useState("");
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
  const [rideDate, setRideDate] = useState("");
  const [rideTime, setRideTime] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [routePolyline, setRoutePolyline] = useState("");

  // Step 2: Vehicle
  const [vehicleType, setVehicleType] = useState<VehicleType>("private");
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>("car");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Vehicle Documents
  const [rcBookFile, setRcBookFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [pollutionFile, setPollutionFile] = useState<File | null>(null);
  
  // Vehicle Images - Only one with numberplate
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);

  // Step 3: Pricing
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [manualSeats, setManualSeats] = useState(false);
  const [pricePerKm, setPricePerKm] = useState(3);
  const [hasAc, setHasAc] = useState(true);
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [luggageAllowed, setLuggageAllowed] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [pickupFlexibility, setPickupFlexibility] = useState("exact");
  const [confirmTerms, setConfirmTerms] = useState(false);

  useEffect(() => {
    requestLocation();
    fetchExistingVehicles();
  }, []);

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

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      fetchMultipleRoutes();
    }
  }, [pickupCoords, dropCoords]);

  const fetchExistingVehicles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('is_verified', { ascending: false });
    setExistingVehicles(data || []);
  };

  const getCitiesOnRoute = async (geometry: any): Promise<string[]> => {
    const cities: string[] = [];
    const coords = geometry.coordinates;
    
    // Sample 5 points along the route
    const sampleIndices = [
      0,
      Math.floor(coords.length * 0.25),
      Math.floor(coords.length * 0.5),
      Math.floor(coords.length * 0.75),
      coords.length - 1
    ];

    for (const idx of sampleIndices) {
      const [lng, lat] = coords[idx];
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        if (data.features?.[0]?.text) {
          const cityName = data.features[0].text;
          if (!cities.includes(cityName)) {
            cities.push(cityName);
          }
        }
      } catch (error) {
        console.error('Error getting city:', error);
      }
    }
    
    return cities;
  };

  const fetchMultipleRoutes = async () => {
    if (!pickupCoords || !dropCoords || !map.current) return;

    // Clear existing route layers
    routes.forEach((_, index) => {
      if (map.current?.getLayer(`route-${index}`)) {
        map.current.removeLayer(`route-${index}`);
      }
      if (map.current?.getSource(`route-${index}`)) {
        map.current.removeSource(`route-${index}`);
      }
    });

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropCoords[0]},${dropCoords[1]}?geometries=geojson&alternatives=true&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeLabels = ['Fastest', 'Alternative 1', 'Alternative 2', 'Alternative 3'];
        
        const newRoutes: RouteOption[] = await Promise.all(
          data.routes.map(async (route: any, index: number) => {
            const cities = await getCitiesOnRoute(route.geometry);
            return {
              id: `route-${index}`,
              label: routeLabels[index] || `Route ${index + 1}`,
              color: ROUTE_COLORS[index] || '#888888',
              distance: route.distance / 1000,
              duration: Math.round(route.duration / 60),
              geometry: route.geometry,
              cities,
            };
          })
        );

        setRoutes(newRoutes);
        
        if (newRoutes.length > 0) {
          setSelectedRouteId(newRoutes[0].id);
          setDistance(newRoutes[0].distance);
          setDuration(newRoutes[0].duration);
          setRoutePolyline(JSON.stringify(newRoutes[0].geometry));
        }

        // Draw all routes on map
        newRoutes.forEach((route) => {
          if (map.current) {
            map.current.addSource(route.id, {
              type: 'geojson',
              data: route.geometry
            });
            map.current.addLayer({
              id: route.id,
              type: 'line',
              source: route.id,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 
                'line-color': route.color, 
                'line-width': selectedRouteId === route.id ? 6 : 3,
                'line-opacity': selectedRouteId === route.id ? 1 : 0.5
              }
            });
          }
        });

        // Add markers
        new mapboxgl.Marker({ color: '#22C55E' })
          .setLngLat(pickupCoords)
          .addTo(map.current);
        new mapboxgl.Marker({ color: '#F97316' })
          .setLngLat(dropCoords)
          .addTo(map.current);

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(pickupCoords);
        bounds.extend(dropCoords);
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const selectRoute = (route: RouteOption) => {
    setSelectedRouteId(route.id);
    setDistance(route.distance);
    setDuration(route.duration);
    setRoutePolyline(JSON.stringify(route.geometry));

    routes.forEach((r) => {
      if (map.current?.getLayer(r.id)) {
        map.current.setPaintProperty(r.id, 'line-width', r.id === route.id ? 6 : 3);
        map.current.setPaintProperty(r.id, 'line-opacity', r.id === route.id ? 1 : 0.5);
      }
    });
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${folder}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to post a ride");
      return;
    }

    setSubmitting(true);
    try {
      let vehicleId = selectedVehicleId;

      if (!vehicleId && vehicleName && vehicleNumber) {
        // Upload documents
        let rcBookUrl = null, insuranceUrl = null, pollutionUrl = null;
        let vehicleImageUrl = null;

        if (rcBookFile) rcBookUrl = await uploadFile(rcBookFile, 'vehicle-documents', 'rc');
        if (insuranceFile) insuranceUrl = await uploadFile(insuranceFile, 'vehicle-documents', 'insurance');
        if (pollutionFile) pollutionUrl = await uploadFile(pollutionFile, 'vehicle-documents', 'pollution');
        if (vehicleImage) vehicleImageUrl = await uploadFile(vehicleImage, 'vehicle-images', 'vehicle');

        const { data: newVehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            user_id: user.id,
            vehicle_type: vehicleType,
            category: vehicleCategory,
            name: vehicleName,
            number: vehicleNumber.toUpperCase(),
            has_ac: hasAc,
            rc_book_url: rcBookUrl,
            insurance_url: insuranceUrl,
            pollution_url: pollutionUrl,
            front_image_url: vehicleImageUrl,
          })
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      const totalPrice = distance * pricePerKm;

      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          pickup_location: pickupLocation,
          pickup_lat: pickupCoords![1],
          pickup_lng: pickupCoords![0],
          drop_location: dropLocation,
          drop_lat: dropCoords![1],
          drop_lng: dropCoords![0],
          ride_date: rideDate,
          ride_time: rideTime,
          route_type: selectedRouteId,
          route_polyline: routePolyline,
          distance_km: distance,
          duration_minutes: duration,
          seats_available: seatsAvailable,
          price_per_km: pricePerKm,
          total_price: totalPrice,
          has_ac: hasAc,
          music_allowed: musicAllowed,
          female_only: femaleOnly,
          luggage_allowed: luggageAllowed,
          pickup_flexibility: pickupFlexibility,
          status: 'pending',
          verification_status: 'pending',
        })
        .select()
        .single();

      if (rideError) throw rideError;

      // Send notification to user about ride submission
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: '🎉 Ride Posted Successfully!',
        body: `Your ride from ${pickupLocation} to ${dropLocation} has been submitted for verification. You'll be notified once it's published.`,
        type: 'ride_posted',
        data: { ride_id: rideData?.id }
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/my-rides');
      }, 3000);
    } catch (error: any) {
      console.error('Error posting ride:', error);
      toast.error(error.message || "Failed to post ride");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickupChange = (value: string, coords?: [number, number]) => {
    setPickupLocation(value);
    if (coords) setPickupCoords(coords);
  };

  const handleDropChange = (value: string, coords?: [number, number]) => {
    setDropLocation(value);
    if (coords) setDropCoords(coords);
  };

  const FileUploadButton = ({ 
    label, 
    file, 
    setFile, 
    optional = false 
  }: { 
    label: string; 
    file: File | null; 
    setFile: (f: File | null) => void;
    optional?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {optional && <p className="text-xs text-muted-foreground">Optional</p>}
        {file && <p className="text-xs text-green-600 mt-1">✓ {file.name}</p>}
      </div>
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="px-3 py-1.5 bg-foreground text-background text-sm rounded-lg">
          {file ? 'Change' : 'Upload'}
        </div>
      </label>
    </div>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">🎉 Congratulations!</h2>
          <p className="text-muted-foreground mb-2">Your ride has been posted successfully!</p>
          <p className="text-sm text-muted-foreground mt-4">Wait for admin to verify and publish your ride. You'll be notified once it's live.</p>
        </div>
      </div>
    );
  }

  const verifiedVehicles = existingVehicles.filter(v => v.is_verified);
  const unverifiedVehicles = existingVehicles.filter(v => !v.is_verified);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Post a Ride</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 4</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && (
          <div className="space-y-4">
            {/* Banner Ad at top of step 1 */}
            <InlineBannerAd />
            
            <div ref={mapContainer} className="h-48 rounded-xl overflow-hidden" />
            
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div className="relative">
                <LocationInput
                  placeholder="Pickup Location"
                  value={pickupLocation}
                  onChange={handlePickupChange}
                  iconColor="green"
                  onUseMyLocation={async () => {
                    await requestLocation();
                    if (latitude && longitude) {
                      try {
                        const response = await fetch(
                          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
                        );
                        const data = await response.json();
                        if (data.features?.[0]) {
                          handlePickupChange(data.features[0].place_name, [longitude, latitude]);
                        }
                      } catch (error) {
                        console.error("Error geocoding:", error);
                      }
                    }
                  }}
                />
              </div>
              <LocationInput
                placeholder="Drop Location"
                value={dropLocation}
                onChange={handleDropChange}
                iconColor="orange"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Starting Date</label>
                  <Input
                    type="date"
                    value={rideDate}
                    onChange={(e) => setRideDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Starting Time</label>
                  <Input
                    type="time"
                    value={rideTime}
                    onChange={(e) => setRideTime(e.target.value)}
                  />
                </div>
              </div>

              {routes.length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Select Route</label>
                  <div className="space-y-2">
                    {routes.map((route) => (
                      <button
                        key={route.id}
                        onClick={() => selectRoute(route)}
                        className={`w-full p-3 rounded-lg border text-left ${
                          selectedRouteId === route.id
                            ? 'border-foreground bg-muted'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: route.color }}
                            />
                            <span className="font-medium text-foreground">{route.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{route.distance.toFixed(1)} km</p>
                            <p className="text-xs text-muted-foreground">{route.duration} mins</p>
                          </div>
                        </div>
                        {route.cities.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Via: {route.cities.slice(0, 4).join(' → ')}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Banner Ad below route selection */}
            <InlineBannerAd />

            <Button
              variant="hero"
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!pickupLocation || !dropLocation || !rideDate || !rideTime || !selectedRouteId}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Verified Vehicles First */}
            {verifiedVehicles.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Verified Vehicles
                </h3>
                <div className="space-y-2">
                  {verifiedVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        setVehicleCategory(vehicle.category);
                        setVehicleName(vehicle.name);
                        setVehicleNumber(vehicle.number);
                      }}
                      className={`w-full p-3 rounded-lg border flex items-center justify-between ${
                        selectedVehicleId === vehicle.id
                          ? 'border-foreground bg-muted'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">{vehicle.name}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.number}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Verified</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Unverified Vehicles */}
            {unverifiedVehicles.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3">Other Vehicles</h3>
                <div className="space-y-2">
                  {unverifiedVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        setVehicleCategory(vehicle.category);
                        setVehicleName(vehicle.name);
                        setVehicleNumber(vehicle.number);
                      }}
                      className={`w-full p-3 rounded-lg border flex items-center justify-between ${
                        selectedVehicleId === vehicle.id
                          ? 'border-foreground bg-muted'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">{vehicle.name}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.number}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">Pending</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Add New Vehicle</h3>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Vehicle Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['private', 'commercial', 'other'] as VehicleType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setVehicleType(type)}
                      className={`px-3 py-2 text-sm rounded-lg border capitalize ${
                        vehicleType === type
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Vehicle Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setVehicleCategory(cat.value)}
                      className={`px-2 py-2 text-xs rounded-lg border ${
                        vehicleCategory === cat.value
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Vehicle Name/Model</label>
                <Input
                  placeholder="e.g. Swift Dzire, Pulsar"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Vehicle Number</label>
                <Input
                  placeholder="AA 00 AA 0000"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                />
              </div>

              {/* Documents Section */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Documents</label>
                <div className="space-y-2">
                  <FileUploadButton label="RC Book" file={rcBookFile} setFile={setRcBookFile} />
                  <FileUploadButton label="Insurance" file={insuranceFile} setFile={setInsuranceFile} />
                  <FileUploadButton label="Pollution Certificate" file={pollutionFile} setFile={setPollutionFile} optional />
                </div>
              </div>

              {/* Vehicle Image Section - Single image with numberplate */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Vehicle Image (with Number Plate visible)</label>
                <FileUploadButton label="Vehicle Photo" file={vehicleImage} setFile={setVehicleImage} />
                <p className="text-xs text-muted-foreground mt-1">Upload a clear photo showing your vehicle with number plate visible</p>
              </div>
            </div>

            {/* Validation message for vehicle selection */}
            {existingVehicles.length === 0 && !vehicleName && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Please add a new vehicle to continue</span>
              </div>
            )}
            
            {existingVehicles.length > 0 && !selectedVehicleId && !vehicleName && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Select a verified vehicle or add a new one</span>
              </div>
            )}

            <Button
              variant="hero"
              className="w-full"
              onClick={() => setStep(3)}
              disabled={!selectedVehicleId && (!vehicleName || !vehicleNumber || !rcBookFile || !insuranceFile || !vehicleImage)}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Seats Available {vehicleCategory === 'bike' ? '(Max 1 for bike)' : vehicleCategory === 'car' ? '(Max 6 for car)' : ''}
                </label>
                {!manualSeats ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSeatsAvailable(Math.max(1, seatsAvailable - 1))}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-foreground w-8 text-center">{seatsAvailable}</span>
                    <button
                      onClick={() => {
                        const maxSeats = vehicleCategory === 'bike' ? 1 : vehicleCategory === 'car' ? 6 : 20;
                        setSeatsAvailable(Math.min(maxSeats, seatsAvailable + 1));
                      }}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg"
                      disabled={vehicleCategory === 'bike' && seatsAvailable >= 1}
                    >
                      +
                    </button>
                    {vehicleCategory !== 'bike' && (
                      <button
                        onClick={() => setManualSeats(true)}
                        className="text-sm text-muted-foreground underline ml-4"
                      >
                        Enter manually
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={vehicleCategory === 'bike' ? 1 : vehicleCategory === 'car' ? 6 : 50}
                      value={seatsAvailable}
                      onChange={(e) => {
                        const maxSeats = vehicleCategory === 'bike' ? 1 : vehicleCategory === 'car' ? 6 : 50;
                        setSeatsAvailable(Math.min(maxSeats, Number(e.target.value)));
                      }}
                      className="w-24"
                    />
                    <button
                      onClick={() => setManualSeats(false)}
                      className="text-sm text-muted-foreground underline"
                    >
                      Use buttons
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Set Total Price: ₹{pricePerKm * distance > 0 ? (pricePerKm * distance).toFixed(0) : pricePerKm}
                </label>
                <input
                  type="range"
                  min={vehicleType === 'private' ? 2 : 3}
                  max={vehicleType === 'private' ? 5 : 15}
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₹{vehicleType === 'private' ? 2 : 3}/km</span>
                  <span>₹{vehicleType === 'private' ? 5 : 15}/km</span>
                </div>
                {vehicleType === 'private' && (
                  <p className="text-xs text-muted-foreground mt-1">Private vehicles: Max ₹5/km</p>
                )}
              </div>

              {distance > 0 && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Estimated Total</p>
                  <p className="text-2xl font-bold text-foreground">₹{(distance * pricePerKm).toFixed(0)}</p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground mb-2">Preferences</h3>
              
              {[
                { label: 'AC', value: hasAc, setter: setHasAc },
                { label: 'Music Allowed', value: musicAllowed, setter: setMusicAllowed },
                { label: 'Female Only', value: femaleOnly, setter: setFemaleOnly },
                { label: 'Luggage Allowed', value: luggageAllowed, setter: setLuggageAllowed },
                { label: 'Pets Allowed', value: petsAllowed, setter: setPetsAllowed },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{pref.label}</span>
                  <button
                    onClick={() => pref.setter(!pref.value)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      pref.value ? 'bg-foreground' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-background transition-transform ${
                      pref.value ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Pickup Flexibility</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'exact', label: 'Exact' },
                    { value: 'flexible_2km', label: '~2km' },
                    { value: 'flexible_10km', label: '5-10km' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPickupFlexibility(opt.value)}
                      className={`px-2 py-2 text-xs rounded-lg border ${
                        pickupFlexibility === opt.value
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={() => setStep(4)}
            >
              Review Ride
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-4">Ride Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Date & Time</span>
                  <span className="text-foreground font-medium">
                    {new Date(rideDate).toLocaleDateString()} • {rideTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="text-foreground font-medium">{distance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground font-medium">
                    {Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)} hrs` : ''} {duration % 60 > 0 ? `${duration % 60} min` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="text-foreground font-medium">{vehicleName} • {vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-foreground font-medium">{seatsAvailable}</span>
                </div>
                
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total Price</span>
                    <span className="text-xl font-bold text-foreground">₹{(distance * pricePerKm).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-2">Pickup</h4>
              <p className="text-sm text-muted-foreground">{pickupLocation}</p>
              
              <h4 className="font-semibold text-foreground mt-4 mb-2">Drop</h4>
              <p className="text-sm text-muted-foreground">{dropLocation}</p>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
              <input
                type="checkbox"
                checked={confirmTerms}
                onChange={(e) => setConfirmTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-muted-foreground">
                I confirm that all ride details are accurate and I agree to the HpyRide terms and conditions.
              </span>
            </label>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting || !confirmTerms}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                'Publish Ride'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostRidePage;