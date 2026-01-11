import { useEffect, useState } from 'react';
import { MapPin, Navigation, Check, Car, Phone, MessageCircle, AlertTriangle, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRideTracking } from '@/hooks/useRideTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LiveTrackingMap from './LiveTrackingMap';

interface RideStatusTrackerProps {
  bookingId: string;
  isDriver?: boolean;
  onCallDriver?: () => void;
  onChat?: () => void;
  onSOS?: () => void;
}

type RideStatus = 'pending' | 'confirmed' | 'driver_on_way' | 'driver_arrived' | 'trip_started' | 'completed' | 'cancelled';

const statusSteps = [
  { status: 'confirmed', label: 'Confirmed', icon: Check },
  { status: 'driver_on_way', label: 'Driver on way', icon: Car },
  { status: 'driver_arrived', label: 'Driver arrived', icon: MapPin },
  { status: 'trip_started', label: 'Trip started', icon: Navigation },
  { status: 'completed', label: 'Completed', icon: Check },
];

const RideStatusTracker = ({
  bookingId,
  isDriver = false,
  onCallDriver,
  onChat,
  onSOS,
}: RideStatusTrackerProps) => {
  const [currentStatus, setCurrentStatus] = useState<RideStatus>('pending');
  const [booking, setBooking] = useState<any>(null);
  const { driverLocation, startTracking, stopTracking, isTracking } = useRideTracking({
    bookingId,
    isDriver,
  });

  // Fetch initial booking status
  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, rides(*)')
        .eq('id', bookingId)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
        return;
      }

      setBooking(data);
      setCurrentStatus(data.status as RideStatus);
    };

    fetchBooking();

    // Subscribe to booking updates
    const channel = supabase
      .channel(`booking-status-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          console.log('Booking status updated:', payload.new);
          setCurrentStatus(payload.new.status as RideStatus);
          setBooking((prev: any) => ({ ...prev, ...payload.new }));

          // Show toast for status changes
          const status = payload.new.status;
          if (status === 'confirmed') {
            toast.success('🎉 Ride confirmed!');
          } else if (status === 'driver_arrived') {
            toast.success('🚗 Driver has arrived!');
          } else if (status === 'trip_started') {
            toast.info('🚀 Trip started!');
          } else if (status === 'completed') {
            toast.success('✅ Trip completed!');
          } else if (status === 'cancelled') {
            toast.error('❌ Ride cancelled');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  // Driver: Update status (maps internal status to DB status)
  const updateStatus = async (newStatus: RideStatus) => {
    // Map our UI status to database booking_status enum
    const dbStatusMap: Record<string, string> = {
      'confirmed': 'confirmed',
      'driver_on_way': 'confirmed',
      'driver_arrived': 'confirmed', 
      'trip_started': 'confirmed',
      'completed': 'completed',
      'cancelled': 'cancelled',
    };
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: dbStatusMap[newStatus] as any, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    // If driver started trip, start location broadcasting
    if (newStatus === 'trip_started' && !isTracking) {
      await startTracking();
    }

    // If trip completed, stop broadcasting
    if (newStatus === 'completed' && isTracking) {
      stopTracking();
    }
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.status === currentStatus);
  };

  const getNextStatus = (): RideStatus | null => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < statusSteps.length - 1) {
      return statusSteps[currentIndex + 1].status as RideStatus;
    }
    return null;
  };

  const getNextStatusLabel = (): string | null => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < statusSteps.length - 1) {
      return statusSteps[currentIndex + 1].label;
    }
    return null;
  };

  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Ride Cancelled</p>
            <p className="text-sm">{booking?.rejection_reason || 'This ride has been cancelled'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Status Timeline */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.status === currentStatus;
            const isCompleted = getCurrentStepIndex() > index;
            const isPending = getCurrentStepIndex() < index;

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div className="relative flex items-center justify-center">
                  {index > 0 && (
                    <div
                      className={`absolute right-full w-full h-0.5 mr-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-primary text-primary-foreground animate-pulse'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                </div>
                <span
                  className={`text-xs mt-1 text-center ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Map with Driver Location (for riders) */}
      {!isDriver && driverLocation && (currentStatus === 'driver_on_way' || currentStatus === 'trip_started') && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">Live Driver Location</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto" />
          </div>
          <LiveTrackingMap
            driverLocation={driverLocation}
            pickupLocation={booking?.pickup_lat && booking?.pickup_lng ? {
              lat: booking.pickup_lat,
              lng: booking.pickup_lng,
              label: booking.pickup_location,
            } : undefined}
            dropLocation={booking?.drop_lat && booking?.drop_lng ? {
              lat: booking.drop_lat,
              lng: booking.drop_lng,
              label: booking.drop_location,
            } : undefined}
            className="h-[250px]"
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Rider Actions */}
        {!isDriver && currentStatus !== 'completed' && (
          <div className="flex gap-2">
            {onCallDriver && (
              <Button variant="outline" size="sm" onClick={onCallDriver} className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
            {onChat && (
              <Button variant="outline" size="sm" onClick={onChat} className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            )}
            {onSOS && (
              <Button variant="destructive" size="sm" onClick={onSOS}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                SOS
              </Button>
            )}
          </div>
        )}

        {/* Driver Actions */}
        {isDriver && getNextStatus() && (
          <Button
            variant="hero"
            className="w-full"
            onClick={() => updateStatus(getNextStatus()!)}
          >
            {isTracking && <Navigation className="w-4 h-4 mr-2 animate-pulse" />}
            Mark as {getNextStatusLabel()}
          </Button>
        )}

        {/* Location Tracking Toggle for Driver */}
        {isDriver && currentStatus === 'trip_started' && (
          <Button
            variant={isTracking ? 'destructive' : 'outline'}
            className="w-full"
            onClick={() => (isTracking ? stopTracking() : startTracking())}
          >
            <Navigation className={`w-4 h-4 mr-2 ${isTracking ? 'animate-pulse' : ''}`} />
            {isTracking ? 'Stop Sharing Location' : 'Start Sharing Location'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RideStatusTracker;
