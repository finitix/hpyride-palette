// Hook for real-time ride tracking
import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeLocationService, DriverLocation, LocationSubscription } from '@/services/RealtimeLocationService';
import { notificationService } from '@/services/NotificationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseRideTrackingOptions {
  bookingId?: string;
  isDriver?: boolean;
}

interface RideTrackingState {
  driverLocation: DriverLocation | null;
  isTracking: boolean;
  error: string | null;
}

export const useRideTracking = (options: UseRideTrackingOptions = {}) => {
  const { bookingId, isDriver = false } = options;
  const { user } = useAuth();
  const [state, setState] = useState<RideTrackingState>({
    driverLocation: null,
    isTracking: false,
    error: null,
  });

  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const statusSubscriptionRef = useRef<LocationSubscription | null>(null);

  // Start driver location broadcasting
  const startTracking = useCallback(async () => {
    if (!user || !bookingId) {
      setState(prev => ({ ...prev, error: 'Missing user or booking ID' }));
      return;
    }

    try {
      await realtimeLocationService.startBroadcasting(user.id, bookingId);
      setState(prev => ({ ...prev, isTracking: true, error: null }));
      toast.success('Location sharing started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start tracking';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [user, bookingId]);

  // Stop driver location broadcasting
  const stopTracking = useCallback(() => {
    realtimeLocationService.stopBroadcasting();
    setState(prev => ({ ...prev, isTracking: false }));
    toast.info('Location sharing stopped');
  }, []);

  // Subscribe to driver location updates (for riders)
  useEffect(() => {
    if (isDriver || !bookingId) return;

    const subscription = realtimeLocationService.subscribeToDriverLocation(
      bookingId,
      (location) => {
        setState(prev => ({ ...prev, driverLocation: location }));
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [bookingId, isDriver]);

  // Subscribe to ride status updates
  useEffect(() => {
    if (!bookingId) return;

    const subscription = realtimeLocationService.subscribeToRideStatus(
      bookingId,
      (status, data) => {
        // Show toast notifications for status changes
        switch (status) {
          case 'confirmed':
            toast.success('Ride confirmed!');
            break;
          case 'completed':
            toast.success('Ride completed! Rate your experience.');
            break;
          case 'cancelled':
            toast.error('Ride has been cancelled');
            break;
        }
      }
    );

    statusSubscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      statusSubscriptionRef.current = null;
    };
  }, [bookingId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isDriver && state.isTracking) {
        realtimeLocationService.stopBroadcasting();
      }
    };
  }, [isDriver, state.isTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
};

// Hook for subscribing to user's booking updates
export const useBookingUpdates = () => {
  const { user } = useAuth();
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const subscriptionRef = useRef<LocationSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    const subscription = realtimeLocationService.subscribeToBookingUpdates(
      user.id,
      (booking) => {
        setLatestUpdate(booking);
        
        // Show appropriate notification based on status
        if (booking.status === 'confirmed') {
          notificationService.showToast('Booking Confirmed!', 'Your ride has been confirmed', 'success');
        } else if (booking.status === 'rejected') {
          notificationService.showToast('Booking Rejected', booking.rejection_reason || 'Driver declined the ride', 'error');
        } else if (booking.status === 'completed') {
          notificationService.showToast('Trip Complete!', 'Don\'t forget to rate your driver', 'success');
        }
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { latestUpdate };
};

// Hook for drivers to receive ride requests
export const useDriverRideRequests = () => {
  const { user } = useAuth();
  const [newRequest, setNewRequest] = useState<any>(null);
  const subscriptionRef = useRef<LocationSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    const subscription = realtimeLocationService.subscribeToRideRequests(
      user.id,
      (booking) => {
        setNewRequest(booking);
        notificationService.showToast(
          'New Ride Request!',
          `${booking.pickup_location} → ${booking.drop_location}`,
          'info'
        );
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const clearRequest = useCallback(() => {
    setNewRequest(null);
  }, []);

  return { newRequest, clearRequest };
};
