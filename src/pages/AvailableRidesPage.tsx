import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Filter, Calendar, Car, Bike, Clock, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";

interface Ride {
  id: string;
  pickup_location: string;
  drop_location: string;
  ride_date: string;
  ride_time: string;
  seats_available: number;
  price_per_km: number;
  total_price: number;
  distance_km: number;
  has_ac: boolean;
  vehicles: {
    category: string;
    name: string;
    number: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

const AvailableRidesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = location.state as { pickup?: any; drop?: any } | null;
  
  const [rides, setRides] = useState<Ride[]>([]);
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
  }, [dateFilter]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          vehicles (category, name, number)
        `)
        .eq('status', 'published')
        .gte('ride_date', new Date().toISOString().split('T')[0])
        .order('ride_date', { ascending: true });

      if (dateFilter) {
        query = query.eq('ride_date', dateFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setRides((data || []) as any);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
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
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No rides available</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride.id}
                onClick={() => navigate(`/booking/${ride.id}`)}
                className="bg-card border border-border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {ride.vehicles && getVehicleIcon(ride.vehicles.category)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{ride.profiles?.full_name || 'Driver'}</p>
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
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AvailableRidesPage;
