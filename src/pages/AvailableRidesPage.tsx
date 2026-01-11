import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Filter, Calendar, Car, Bike, Clock, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";
import { RideListAd } from "@/components/ads/MontagAds";

interface Ride {
  id: string;
  user_id: string;
  pickup_location: string;
  drop_location: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  ride_date: string;
  ride_time: string;
  seats_available: number;
  price_per_km: number;
  total_price: number;
  distance_km: number;
  has_ac: boolean;
  route_polyline?: string;
  vehicles: {
    category: string;
    name: string;
    number: string;
  } | null;
  driver_name?: string;
}

const AvailableRidesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = location.state as { pickup?: { location: string; coords: [number, number] }; drop?: { location: string; coords: [number, number] } } | null;
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchRides();
    
    const channel = supabase
      .channel('rides-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        fetchRides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterRides();
  }, [rides, searchParams, dateFilter]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      // First fetch rides
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          vehicles (category, name, number)
        `)
        .eq('status', 'published')
        .gte('ride_date', new Date().toISOString().split('T')[0])
        .order('ride_date', { ascending: true });

      if (ridesError) throw ridesError;

      if (!ridesData || ridesData.length === 0) {
        setRides([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(ridesData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Create a map of user_id -> full_name
      const profilesMap = new Map<string, string>();
      profilesData?.forEach(p => {
        profilesMap.set(p.user_id, p.full_name || 'Driver');
      });

      // Merge rides with driver names
      const ridesWithNames = ridesData.map(ride => ({
        ...ride,
        driver_name: profilesMap.get(ride.user_id) || 'Driver'
      }));

      setRides(ridesWithNames as Ride[]);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isPointOnRoute = (pickupCoords: [number, number], dropCoords: [number, number], ride: Ride): boolean => {
    const [pickupLng, pickupLat] = pickupCoords;
    const [dropLng, dropLat] = dropCoords;
    
    // Check if user's pickup is within 10km of ride's pickup or along the route
    const distToRidePickup = calculateDistance(pickupLat, pickupLng, ride.pickup_lat, ride.pickup_lng);
    const distToRideDrop = calculateDistance(dropLat, dropLng, ride.drop_lat, ride.drop_lng);
    
    // Also check if pickup is between ride's pickup and drop (for middle-point searches)
    const pickupNearRoute = distToRidePickup <= 10 || isNearRoutePath(pickupLat, pickupLng, ride);
    const dropNearDest = distToRideDrop <= 10;
    
    return pickupNearRoute && dropNearDest;
  };

  const isNearRoutePath = (lat: number, lng: number, ride: Ride): boolean => {
    // Check if point is within the bounding box of the ride with some buffer
    const minLat = Math.min(ride.pickup_lat, ride.drop_lat) - 0.15; // ~15km buffer
    const maxLat = Math.max(ride.pickup_lat, ride.drop_lat) + 0.15;
    const minLng = Math.min(ride.pickup_lng, ride.drop_lng) - 0.15;
    const maxLng = Math.max(ride.pickup_lng, ride.drop_lng) + 0.15;
    
    const inBounds = lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    
    if (!inBounds) return false;
    
    // Check if the point is close to the line between pickup and drop
    const distToLine = distanceToLine(
      lat, lng,
      ride.pickup_lat, ride.pickup_lng,
      ride.drop_lat, ride.drop_lng
    );
    
    return distToLine <= 15; // Within 15km of the route line
  };

  const distanceToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    // Calculate perpendicular distance from point to line in km
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return calculateDistance(px, py, xx, yy);
  };

  const filterRides = () => {
    let filtered = [...rides];

    // Filter by date if set
    if (dateFilter) {
      filtered = filtered.filter(ride => ride.ride_date === dateFilter);
    }

    // Filter by location if search params are provided
    if (searchParams?.pickup?.coords && searchParams?.drop?.coords) {
      filtered = filtered.filter(ride => 
        isPointOnRoute(searchParams.pickup!.coords, searchParams.drop!.coords, ride)
      );
    }

    setFilteredRides(filtered);
  };

  const getVehicleIcon = (category: string) => {
    switch (category) {
      case 'bike':
      case 'auto':
        return <Bike className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Available Rides</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {searchParams && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-foreground line-clamp-1">{searchParams.pickup?.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-foreground line-clamp-1">{searchParams.drop?.location}</span>
            </div>
          </div>
        )}
        
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-foreground"
          />
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
              Clear
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No rides available</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchParams ? 'No rides found matching your search criteria' : 'No published rides at the moment'}
            </p>
            <Button variant="outline" onClick={() => navigate('/book-ride')}>
              Search Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{filteredRides.length} rides found</p>
            {filteredRides.map((ride, index) => (
              <div key={ride.id}>
                {/* Show ad after every 3 rides */}
                {index > 0 && index % 3 === 0 && (
                  <div className="mb-4">
                    <RideListAd />
                  </div>
                )}
                <div
                  onClick={() => navigate(`/booking/${ride.id}`)}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        {ride.vehicles && getVehicleIcon(ride.vehicles.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{ride.driver_name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span>4.8</span>
                          <span className="mx-1">•</span>
                          <span>{ride.vehicles?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">₹{ride.total_price?.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{ride.seats_available} seats</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <p className="text-sm text-foreground line-clamp-1">{ride.pickup_location}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                      <p className="text-sm text-foreground line-clamp-1">{ride.drop_location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(ride.ride_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{ride.ride_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{ride.seats_available} left</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AvailableRidesPage;