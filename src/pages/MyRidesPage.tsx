import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, Clock, MapPin, Users, Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";

type TabType = 'offered' | 'booked';

const MyRidesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('offered');
  const [offeredRides, setOfferedRides] = useState<any[]>([]);
  const [bookedRides, setBookedRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRides();
    }
  }, [user]);

  const fetchRides = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch offered rides
      const { data: offered } = await supabase
        .from('rides')
        .select(`
          *,
          vehicles (category, name, number),
          bookings (
            id,
            seats_booked,
            passenger_name,
            passenger_phone,
            status,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch booked rides
      const { data: booked } = await supabase
        .from('bookings')
        .select(`
          *,
          rides (
            *,
            vehicles (category, name, number),
            profiles:user_id (full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOfferedRides(offered || []);
      setBookedRides(booked || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'rejected', reason?: string) => {
    try {
      const updateData: any = { status: action };
      if (reason) updateData.rejection_reason = reason;

      await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      fetchRides();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'verified':
      case 'published':
      case 'confirmed': return 'bg-green-500/20 text-green-600';
      case 'rejected':
      case 'cancelled': return 'bg-red-500/20 text-red-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">My Rides</h1>
      </header>

      <div className="flex border-b border-border">
        {(['offered', 'booked'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {tab} Rides
          </button>
        ))}
      </div>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'offered' ? (
              offeredRides.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No rides offered yet</h3>
                  <Button variant="hero" onClick={() => navigate('/post-ride')}>
                    Post a Ride
                  </Button>
                </div>
              ) : (
                offeredRides.map((ride) => (
                  <div key={ride.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(ride.ride_date).toLocaleDateString()}
                      </span>
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

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{ride.ride_time}</span>
                      <span>₹{ride.total_price?.toFixed(0)}</span>
                      <span>{ride.seats_available} seats</span>
                    </div>

                    {ride.bookings && ride.bookings.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Booking Requests</h4>
                        {ride.bookings.map((booking: any) => (
                          <div key={booking.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{booking.passenger_name}</p>
                              <p className="text-xs text-muted-foreground">{booking.seats_booked} seat(s)</p>
                            </div>
                            {booking.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                  className="p-2 bg-green-500/20 text-green-600 rounded-full"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleBookingAction(booking.id, 'rejected')}
                                  className="p-2 bg-red-500/20 text-red-600 rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                                {booking.status === 'confirmed' && (
                                  <button
                                    onClick={() => navigate(`/chat/${booking.id}`)}
                                    className="p-2 bg-muted rounded-full"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              bookedRides.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                  <Button variant="hero" onClick={() => navigate('/ride-sharing')}>
                    Find a Ride
                  </Button>
                </div>
              ) : (
                bookedRides.map((booking) => (
                  <div key={booking.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(booking.rides?.ride_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{booking.rides?.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.rides?.vehicles?.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                        <p className="text-sm text-foreground line-clamp-1">{booking.rides?.pickup_location}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                        <p className="text-sm text-foreground line-clamp-1">{booking.rides?.drop_location}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">₹{booking.total_fare}</span>
                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/chat/${booking.id}`)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/navigation/${booking.id}`)}
                          >
                            Navigate
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyRidesPage;
