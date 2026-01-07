import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Calendar, Clock, MapPin, Users, Check, X, MessageCircle, Play, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import ReviewModal from "@/components/ReviewModal";

type TabType = 'offered' | 'booked';

const MyRidesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('offered');
  const [offeredRides, setOfferedRides] = useState<any[]>([]);
  const [bookedRides, setBookedRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchRides();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('my-rides-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        fetchRides();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchRides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

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
            vehicles (category, name, number)
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

      toast({
        title: action === 'confirmed' ? 'Booking confirmed!' : 'Booking rejected',
      });

      fetchRides();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleStartRide = (rideId: string, bookingId: string) => {
    navigate(`/navigation/${bookingId}`);
  };

  const handleCompleteRide = async (booking: any) => {
    try {
      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id);

      // Update ride status if all bookings complete
      await supabase
        .from('rides')
        .update({ status: 'completed' })
        .eq('id', booking.ride_id);

      toast({
        title: 'Ride completed!',
      });

      // Show review modal for passengers
      if (booking.user_id === user?.id) {
        setSelectedBooking(booking);
        setShowReviewModal(true);
      }

      fetchRides();
    } catch (error) {
      console.error('Error completing ride:', error);
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
      case 'completed': return 'bg-blue-500/20 text-blue-600';
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
                          <div key={booking.id} className="py-3 border-b border-border last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{booking.passenger_name}</p>
                                <p className="text-xs text-muted-foreground">{booking.passenger_phone}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">{booking.seats_booked} seat(s)</span>
                                  {booking.pickup_location && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                      From: {booking.pickup_location}
                                    </span>
                                  )}
                                </div>
                                {booking.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">"{booking.notes}"</p>
                                )}
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
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              )}
                            </div>

                            {booking.status === 'confirmed' && ride.status === 'published' && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="hero"
                                  size="sm"
                                  className="flex-1 gap-1"
                                  onClick={() => handleStartRide(ride.id, booking.id)}
                                >
                                  <Play className="w-4 h-4" />
                                  Start Ride
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/chat/${booking.id}`)}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}

                            {booking.status === 'confirmed' && ride.status === 'published' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 gap-1"
                                onClick={() => handleCompleteRide(booking)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Complete Ride
                              </Button>
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
                        <p className="font-semibold text-foreground">Driver</p>
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
                            variant="hero"
                            size="sm"
                            onClick={() => navigate(`/navigation/${booking.id}`)}
                          >
                            Navigate
                          </Button>
                        </div>
                      )}
                      {booking.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReviewModal(true);
                          }}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Rate
                        </Button>
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

      {showReviewModal && selectedBooking && user && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          rideId={selectedBooking.ride_id}
          driverId={selectedBooking.driver_id}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default MyRidesPage;
