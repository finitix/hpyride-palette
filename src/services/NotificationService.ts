// Notification Service for HpyRide
// Handles all notification types: ride updates, driver location, promotional messages

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationType = 
  | 'ride_requested'
  | 'ride_accepted'
  | 'driver_arrived'
  | 'trip_started'
  | 'trip_completed'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'driver_location'
  | 'promotional'
  | 'system';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  userId: string;
}

export const NotificationTemplates = {
  rideAccepted: (driverName: string) => ({
    title: "🎉 Ride Accepted!",
    body: `${driverName} accepted your ride request!`,
  }),
  driverArrived: (driverName: string, vehicleNumber: string) => ({
    title: "🚗 Driver Arrived!",
    body: `${driverName} has arrived in ${vehicleNumber}. Look for them!`,
  }),
  tripStarted: () => ({
    title: "🚀 Trip Started",
    body: "Your trip has begun. Enjoy your ride!",
  }),
  tripCompleted: (fare: number) => ({
    title: "✅ Trip Complete!",
    body: `Your trip is complete. Total fare: ₹${fare}. Rate your driver now!`,
  }),
  bookingConfirmed: (pickup: string, date: string) => ({
    title: "📅 Booking Confirmed",
    body: `Your ride from ${pickup} on ${date} is confirmed!`,
  }),
  bookingCancelled: (reason?: string) => ({
    title: "❌ Booking Cancelled",
    body: reason ? `Your booking was cancelled: ${reason}` : "Your booking has been cancelled.",
  }),
  newRideRequest: (pickup: string, drop: string, fare: number) => ({
    title: "🆕 New Ride Request!",
    body: `${pickup} → ${drop} | ₹${fare}. Tap to accept!`,
  }),
  promotional: (message: string) => ({
    title: "🎁 Special Offer!",
    body: message,
  }),
};

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send notification to a specific user
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        is_read: false,
      });

      if (error) {
        console.error('Error saving notification:', error);
        return false;
      }

      // Also try to send push notification via edge function
      await this.sendPushNotification(payload);

      return true;
    } catch (err) {
      console.error('Notification service error:', err);
      return false;
    }
  }

  // Send push notification via edge function
  private async sendPushNotification(payload: NotificationPayload): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: payload.userId,
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
      });

      if (error) {
        console.log('Push notification skipped (edge function not available):', error);
      } else {
        console.log('Push notification sent:', data);
      }
    } catch (err) {
      console.log('Push notification failed:', err);
    }
  }

  // Notify ride acceptance
  async notifyRideAccepted(userId: string, driverName: string, rideId: string): Promise<void> {
    const template = NotificationTemplates.rideAccepted(driverName);
    await this.sendNotification({
      type: 'ride_accepted',
      userId,
      ...template,
      data: { rideId, route: `/my-rides` },
    });
  }

  // Notify driver arrived
  async notifyDriverArrived(userId: string, driverName: string, vehicleNumber: string, bookingId: string): Promise<void> {
    const template = NotificationTemplates.driverArrived(driverName, vehicleNumber);
    await this.sendNotification({
      type: 'driver_arrived',
      userId,
      ...template,
      data: { bookingId, route: `/navigation/${bookingId}` },
    });
  }

  // Notify trip completed
  async notifyTripCompleted(userId: string, fare: number, bookingId: string): Promise<void> {
    const template = NotificationTemplates.tripCompleted(fare);
    await this.sendNotification({
      type: 'trip_completed',
      userId,
      ...template,
      data: { bookingId, fare, route: `/my-rides` },
    });
  }

  // Notify booking confirmed
  async notifyBookingConfirmed(userId: string, pickup: string, date: string, bookingId: string): Promise<void> {
    const template = NotificationTemplates.bookingConfirmed(pickup, date);
    await this.sendNotification({
      type: 'booking_confirmed',
      userId,
      ...template,
      data: { bookingId, route: `/my-rides` },
    });
  }

  // Notify new ride request to driver
  async notifyNewRideRequest(
    driverId: string, 
    pickup: string, 
    drop: string, 
    fare: number, 
    bookingId: string
  ): Promise<void> {
    const template = NotificationTemplates.newRideRequest(pickup, drop, fare);
    await this.sendNotification({
      type: 'ride_requested',
      userId: driverId,
      ...template,
      data: { bookingId, fare, route: `/my-rides` },
    });
  }

  // Send promotional notification
  async sendPromotional(userId: string, message: string): Promise<void> {
    const template = NotificationTemplates.promotional(message);
    await this.sendNotification({
      type: 'promotional',
      userId,
      ...template,
    });
  }

  // Show in-app toast notification
  showToast(title: string, description?: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toastFn = type === 'success' ? toast.success : type === 'error' ? toast.error : toast.info;
    toastFn(title, { description });
  }
}

export const notificationService = NotificationService.getInstance();
