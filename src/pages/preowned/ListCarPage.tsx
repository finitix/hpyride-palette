import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, ChevronRight, MapPin, Camera, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LocationInput from "@/components/LocationInput";
import { useGeolocation } from "@/hooks/useGeolocation";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

const carBrands = ["Maruti", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "MG", "Volkswagen", "Skoda", "Ford", "Renault", "Nissan", "BMW", "Mercedes", "Audi"];
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const transmissions = ["Manual", "Automatic"];
const ownerships = ["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"];
const bodyTypes = ["hatchback", "sedan", "suv", "luxury", "electric", "mpv", "crossover"];

const ListCarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latitude, longitude, requestLocation } = useGeolocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ file: File; type: string; preview: string }[]>([]);
  const [documents, setDocuments] = useState<{ file: File; type: string; preview: string }[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    yearOfPurchase: "",
    variant: "",
    fuelType: "",
    transmission: "",
    ownership: "",
    kmDriven: "",
    color: "",
    insuranceValidTill: "",
    serviceHistoryAvailable: false,
    expectedPrice: "",
    description: "",
    location: "",
    bodyType: "",
  });

  // Initialize map for step 4
  useEffect(() => {
    if (step !== 4 || !mapContainer.current || map.current) return;

    const centerLat = mapLat || latitude || 20.5937;
    const centerLng = mapLng || longitude || 78.9629;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [centerLng, centerLat],
      zoom: 14,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker
    marker.current = new mapboxgl.Marker({ color: '#FF0000', draggable: true })
      .setLngLat([centerLng, centerLat])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        setMapLat(lngLat.lat);
        setMapLng(lngLat.lng);
        reverseGeocode(lngLat.lat, lngLat.lng);
      }
    });

    map.current.on('click', (e) => {
      marker.current?.setLngLat(e.lngLat);
      setMapLat(e.lngLat.lat);
      setMapLng(e.lngLat.lng);
      reverseGeocode(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [step, latitude, longitude]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features?.[0]) {
        setFormData(prev => ({ ...prev, location: data.features[0].place_name }));
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const preview = URL.createObjectURL(file);
      setImages(prev => [...prev, { file, type, preview }]);
    });
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const preview = URL.createObjectURL(file);
      setDocuments(prev => [...prev, { file, type, preview }]);
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to list your car");
      return;
    }

    setLoading(true);
    try {
      const { data: carData, error: carError } = await supabase
        .from('pre_owned_cars')
        .insert({
          user_id: user.id,
          brand: formData.brand,
          model: formData.model,
          year_of_purchase: parseInt(formData.yearOfPurchase),
          variant: formData.variant,
          fuel_type: formData.fuelType,
          transmission: formData.transmission,
          ownership: formData.ownership,
          km_driven: parseInt(formData.kmDriven),
          color: formData.color,
          insurance_valid_till: formData.insuranceValidTill || null,
          service_history_available: formData.serviceHistoryAvailable,
          expected_price: parseFloat(formData.expectedPrice),
          description: formData.description,
          location: formData.location,
          location_lat: mapLat || latitude,
          location_lng: mapLng || longitude,
          body_type: formData.bodyType,
          status: 'active',
        })
        .select()
        .single();

      if (carError) throw carError;

      // Upload images
      for (const img of images) {
        const fileName = `${user.id}/${carData.id}/${Date.now()}-${img.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('car-listings')
          .upload(fileName, img.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('car-listings')
          .getPublicUrl(fileName);

        await supabase.from('car_images').insert({
          car_id: carData.id,
          image_url: publicUrl,
          image_type: img.type,
        });
      }

      // Upload documents
      for (const doc of documents) {
        const fileName = `${user.id}/${carData.id}/docs/${Date.now()}-${doc.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('car-listings')
          .upload(fileName, doc.file);

        if (uploadError) {
          console.error('Document upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('car-listings')
          .getPublicUrl(fileName);

        await supabase.from('car_images').insert({
          car_id: carData.id,
          image_url: publicUrl,
          image_type: doc.type,
        });
      }

      toast.success("Car listed successfully!");
      navigate("/pre-owned/success");
    } catch (error) {
      console.error('Error listing car:', error);
      toast.error("Failed to list car");
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    requestLocation();
    if (latitude && longitude) {
      setMapLat(latitude);
      setMapLng(longitude);
      if (map.current && marker.current) {
        map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
        marker.current.setLngLat([longitude, latitude]);
      }
      reverseGeocode(latitude, longitude);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">List Your Car</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 4</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-foreground' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Basic Details</h2>
            
            <div>
              <Label>Car Brand</Label>
              <Select value={formData.brand} onValueChange={(v) => setFormData(prev => ({ ...prev, brand: v }))}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {carBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Car Model</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., i20 Magna"
              />
            </div>

            <div>
              <Label>Year of Purchase</Label>
              <Select value={formData.yearOfPurchase} onValueChange={(v) => setFormData(prev => ({ ...prev, yearOfPurchase: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 25 }, (_, i) => 2024 - i).map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Variant</Label>
              <Input
                value={formData.variant}
                onChange={(e) => setFormData(prev => ({ ...prev, variant: e.target.value }))}
                placeholder="e.g., Magna, Sportz, VXI"
              />
            </div>

            <div>
              <Label>Fuel Type</Label>
              <Select value={formData.fuelType} onValueChange={(v) => setFormData(prev => ({ ...prev, fuelType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                <SelectContent>
                  {fuelTypes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Transmission</Label>
              <Select value={formData.transmission} onValueChange={(v) => setFormData(prev => ({ ...prev, transmission: v }))}>
                <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
                <SelectContent>
                  {transmissions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ownership</Label>
              <Select value={formData.ownership} onValueChange={(v) => setFormData(prev => ({ ...prev, ownership: v }))}>
                <SelectTrigger><SelectValue placeholder="Select ownership" /></SelectTrigger>
                <SelectContent>
                  {ownerships.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>KM Driven</Label>
              <Input
                type="number"
                value={formData.kmDriven}
                onChange={(e) => setFormData(prev => ({ ...prev, kmDriven: e.target.value }))}
                placeholder="e.g., 45000"
              />
            </div>

            <div>
              <Label>Body Type</Label>
              <Select value={formData.bodyType} onValueChange={(v) => setFormData(prev => ({ ...prev, bodyType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
                <SelectContent>
                  {bodyTypes.map(b => <SelectItem key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button variant="hero" className="w-full mt-6" onClick={() => setStep(2)}>
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Photos & Documents Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Upload Photos</h2>
              <p className="text-sm text-muted-foreground">Add 6-15 photos of your car</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors">
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, 'exterior')} />
              </label>
            </div>

            <div className="bg-secondary rounded-xl p-4">
              <h3 className="font-medium mb-2">Photo Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Take photos in good lighting</li>
                <li>• Include exterior from all angles</li>
                <li>• Include interior shots</li>
                <li>• Show any damages clearly</li>
              </ul>
            </div>

            {/* Document Upload Section */}
            <div className="pt-4 border-t border-border">
              <h2 className="text-xl font-bold mb-2">Upload Documents</h2>
              <p className="text-sm text-muted-foreground mb-4">Upload RC book and other documents (optional)</p>

              <div className="space-y-3">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{doc.file.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                    <button
                      onClick={() => setDocuments(prev => prev.filter((_, idx) => idx !== i))}
                      className="w-6 h-6 bg-background rounded-full flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-foreground/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upload RC Book</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG or PNG</p>
                  </div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleDocumentUpload(e, 'rc_book')} />
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-foreground/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upload Insurance</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG or PNG</p>
                  </div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleDocumentUpload(e, 'insurance')} />
                </label>
              </div>
            </div>

            <Button variant="hero" className="w-full mt-6" onClick={() => setStep(3)} disabled={images.length < 1}>
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Additional Details</h2>

            <div>
              <Label>Car Color</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="e.g., White, Silver, Black"
              />
            </div>

            <div>
              <Label>Insurance Valid Till</Label>
              <Input
                type="date"
                value={formData.insuranceValidTill}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceValidTill: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={formData.serviceHistoryAvailable}
                onCheckedChange={(c) => setFormData(prev => ({ ...prev, serviceHistoryAvailable: c === true }))}
              />
              <Label>Service history available</Label>
            </div>

            <div>
              <Label>Expected Price (₹)</Label>
              <Input
                type="number"
                value={formData.expectedPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedPrice: e.target.value }))}
                placeholder="e.g., 450000"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Write a few details about the car condition..."
                rows={4}
              />
            </div>

            <Button variant="hero" className="w-full mt-6" onClick={() => setStep(4)}>
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Set Car Location</h2>

            <LocationInput
              placeholder="Search location..."
              value={formData.location}
              onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
              onUseMyLocation={handleUseCurrentLocation}
            />

            <div 
              ref={mapContainer} 
              className="h-56 rounded-xl overflow-hidden border border-border"
            />

            <p className="text-xs text-muted-foreground text-center">
              Tap on map or drag marker to set exact location
            </p>

            <Button
              variant="hero"
              className="w-full mt-6"
              onClick={handleSubmit}
              disabled={loading || !formData.location}
            >
              {loading ? "Listing..." : "Submit Listing"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListCarPage;
