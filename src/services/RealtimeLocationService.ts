// Real-time Location Service for HpyRide
// Handles driver location broadcasting and tracking

import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  bookingId?: string;
}

export interface LocationSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

class RealtimeLocationService {
  private static instance: RealtimeLocationService;
  private broadcastChannel: RealtimeChannel | null = null;
  private watchId: number | null = null;
  private isTracking = false;

  private constructor() {}

  static getInstance(): RealtimeLocationService {
    if (!RealtimeLocationService.instance) {
      RealtimeLocationService.instance = new RealtimeLocationService();
    }
    return RealtimeLocationService.instance;
  }

  // Start broadcasting driver location
  startBroadcasting(driverId: string, bookingId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isTracking) {
        console.log('Already tracking location');
        resolve();
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      // Create broadcast channel
      this.broadcastChannel = supabase.channel(`driver-location-${bookingId}`, {
        config: {
          broadcast: { self: false },
        },
      });

      this.broadcastChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Location broadcast channel connected');
          
          // Start watching location
          this.watchId = navigator.geolocation.watchPosition(
            (position) => {
              const locationData: DriverLocation = {
                driverId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ?? undefined,
                timestamp: new Date().toISOString(),
                bookingId,
              };

              // Broadcast location
              this.broadcastChannel?.send({
                type: 'broadcast',
                event: 'location_update',
                payload: locationData,
              });

              console.log('Broadcasting location:', locationData);
            },
            (error) => {
              console.error('Geolocation error:', error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000,
            }
          );

          this.isTracking = true;
          resolve();
        }
      });
    });
  }

  // Stop broadcasting location
  stopBroadcasting(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.broadcastChannel) {
      supabase.removeChannel(this.broadcastChannel);
      this.broadcastChannel = null;
    }

    this.isTracking = false;
    console.log('Stopped location broadcasting');
  }

  // Subscribe to driver location updates
  subscribeToDriverLocation(
    bookingId: string,
    onLocationUpdate: (location: DriverLocation) => void
  ): LocationSubscription {
    const channel = supabase.channel(`driver-location-${bookingId}`);

    channel
      .on('broadcast', { event: 'location_update' }, (payload) => {
        console.log('Received driver location:', payload);
        onLocationUpdate(payload.payload as DriverLocation);
      })
      .subscribe((status) => {
        console.log('Driver location subscription status:', status);
      });

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  // Subscribe to ride status updates
  subscribeToRideStatus(
    rideId: string,
    onStatusUpdate: (status: string, data: any) => void
  ): LocationSubscription {
    const channel = supabase
      .channel(`ride-status-${rideId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          console.log('Booking status updated:', payload);
          onStatusUpdate(payload.new.status, payload.new);
        }
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  // Subscribe to booking updates for a user
  subscribeToBookingUpdates(
    userId: string,
    onBookingUpdate: (booking: any) => void
  ): LocationSubscription {
    const channel = supabase
      .channel(`user-bookings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Booking update for user:', payload);
          onBookingUpdate(payload.new || payload.old);
        }
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  // Subscribe to driver's incoming ride requests
  subscribeToRideRequests(
    driverId: string,
    onNewRequest: (booking: any) => void
  ): LocationSubscription {
    const channel = supabase
      .channel(`driver-requests-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          console.log('New ride request for driver:', payload);
          onNewRequest(payload.new);
        }
      )
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  get tracking(): boolean {
    return this.isTracking;
  }
}

export const realtimeLocationService = RealtimeLocationService.getInstance();
