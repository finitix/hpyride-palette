import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowLeft, Star, Clock, MapPin, User, Phone, Car, CreditCard, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LocationInput from "@/components/LocationInput";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFybHoiLCJhIjoiY21pbDVzN3VqMTVncjNlcjQ1MGxsYWhoZyJ9.GOk93pZDh2T5inUnOXYF9A";

const BookingPage = () => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [ride, setRide] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [seats, setSeats] = useState(1);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropLocation, setDropLocation] = useState("");
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchRideAndProfile();
  }, [rideId, user]);

  const fetchRideAndProfile = async () => {
    if (!rideId) {
      setLoading(false);
      return;
    }

    try {
      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .select(`
          *,
          vehicles (category, name, number)
        `)
        .eq('id', rideId)
        .maybeSingle();

      if (rideError) {
        console.error('Ride fetch error:', rideError);
        setLoading(false);
        return;
      }

      if (rideData) {
        // Fetch driver profile separately
        const { data: driverProfile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('user_id', rideData.user_id)
          .maybeSingle();

        setRide({ ...rideData, profiles: driverProfile });
        setPickupLocation(rideData.pickup_location);
        setPickupCoords([rideData.pickup_lng, rideData.pickup_lat]);
        setDropLocation(rideData.drop_location);
        setDropCoords([rideData.drop_lng, rideData.drop_lat]);
      }

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setPassengerName(profileData.full_name || "");
          setPassengerPhone(profileData.phone || "");
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current || !ride) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [ride.pickup_lng, ride.pickup_lat],
      zoom: 10,
    });

    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([ride.pickup_lng, ride.pickup_lat])
      .addTo(map.current);

    new mapboxgl.Marker({ color: '#f97316' })
      .setLngLat([ride.drop_lng, ride.drop_lat])
      .addTo(map.current);

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([ride.pickup_lng, ride.pickup_lat]);
    bounds.extend([ride.drop_lng, ride.drop_lat]);
    map.current.fitBounds(bounds, { padding: 50 });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [ride]);

  const totalFare = ride ? (ride.price_per_km * ride.distance_km * seats) : 0;

  const handleBookRide = async () => {
    if (!user || !ride) {
      toast.error("Please sign in to book a ride");
      return;
    }

    if (!passengerName || !passengerPhone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setSubmitting(true);
    try {
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .insert({
          ride_id: ride.id,
          user_id: user.id,
          driver_id: ride.user_id,
          seats_booked: seats,
          passenger_name: passengerName,
          passenger_phone: passengerPhone,
          alternate_phone: alternatePhone || null,
          notes: notes || null,
          pickup_location: pickupLocation,
          pickup_lat: pickupCoords?.[1],
          pickup_lng: pickupCoords?.[0],
          drop_location: dropLocation,
          drop_lat: dropCoords?.[1],
          drop_lng: dropCoords?.[0],
          total_fare: totalFare,
          payment_method: paymentMethod,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to driver about new booking request
      await supabase.from('notifications').insert({
        user_id: ride.user_id,
        title: '🚗 New Booking Request!',
        body: `${passengerName} wants to book ${seats} seat(s) for your ride from ${ride.pickup_location} to ${ride.drop_location}.`,
        type: 'booking_request',
        data: { booking_id: bookingData?.id, ride_id: ride.id }
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/my-rides');
      }, 2000);
    } catch (error: any) {
      console.error('Error booking ride:', error);
      toast.error(error.message || "Failed to book ride");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">You will receive confirmation shortly</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Car className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold text-foreground mb-2">Ride not found</p>
        <p className="text-muted-foreground text-center mb-6">This ride may have been cancelled or is no longer available</p>
        <Button onClick={() => navigate('/ride-sharing')} variant="outline">
          Browse Available Rides
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Book Ride</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Ride Summary Card */}
        <div className="p-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{ride.profiles?.full_name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span>4.8</span>
                    <span className="mx-1">•</span>
                    <span>{ride.vehicles?.name}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">₹{ride.price_per_km}/km</p>
                <p className="text-xs text-muted-foreground">{ride.seats_available} seats left</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{ride.ride_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{ride.distance_km?.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div ref={mapContainer} className="h-32 mx-4 rounded-xl overflow-hidden" />

        {/* Seat Selection */}
        <div className="p-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Select Seats</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSeats(Math.max(1, seats - 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg"
              >
                -
              </button>
              <span className="text-2xl font-bold text-foreground w-8 text-center">{seats}</span>
              <button
                onClick={() => setSeats(Math.min(ride.seats_available, seats + 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="p-4 pt-0">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Passenger Details</h3>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Full Name *</label>
              <Input
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mobile Number *</label>
              <Input
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Alternate Number</label>
              <Input
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Notes to Driver</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Landmark, luggage info, etc."
              />
            </div>
          </div>
        </div>

        {/* Pickup & Drop */}
        <div className="p-4 pt-0">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Pickup & Drop</h3>
            
            <LocationInput
              placeholder="Pickup Location"
              value={pickupLocation}
              onChange={(val, coords) => {
                setPickupLocation(val);
                if (coords) setPickupCoords(coords);
              }}
              iconColor="green"
            />

            <LocationInput
              placeholder="Drop Location"
              value={dropLocation}
              onChange={(val, coords) => {
                setDropLocation(val);
                if (coords) setDropCoords(coords);
              }}
              iconColor="orange"
            />
          </div>
        </div>

        {/* Fare Summary */}
        <div className="p-4 pt-0">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Fare Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per km</span>
                <span className="text-foreground">₹{ride.price_per_km}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span className="text-foreground">{ride.distance_km?.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground">× {seats}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">₹{totalFare.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-4 pt-0">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
            <div className="space-y-2">
              {[
                { value: 'cash', label: 'Cash', icon: Banknote },
                { value: 'upi', label: 'UPI', icon: Smartphone },
                { value: 'pay_later', label: 'Pay Later', icon: CreditCard },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`w-full p-3 rounded-lg border flex items-center gap-3 ${
                    paymentMethod === method.value
                      ? 'border-foreground bg-muted'
                      : 'border-border'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-foreground">{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="p-4 pt-0">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the ride safety guidelines and cancellation policy
            </span>
          </label>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          variant="hero"
          className="w-full"
          onClick={handleBookRide}
          disabled={submitting || !agreedToTerms}
        >
          {submitting ? 'Booking...' : `Confirm & Book Ride • ₹${totalFare.toFixed(0)}`}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          You will receive booking confirmation instantly
        </p>
      </div>
    </div>
  );
};

export default BookingPage;
