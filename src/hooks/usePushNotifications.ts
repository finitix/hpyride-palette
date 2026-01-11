import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  triggerNotificationFeedback, 
  getNotificationFeedbackType,
  NotificationType as FeedbackType
} from '@/utils/notificationSoundVibration';

interface PushNotificationState {
  token: string | null;
  isSupported: boolean;
  permissionGranted: boolean;
  error: string | null;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    isSupported: false,
    permissionGranted: false,
    error: null,
  });

  const isNative = Capacitor.isNativePlatform();

  const saveFCMToken = useCallback(async (token: string) => {
    if (!user) return;

    try {
      // Update the profile with FCM token
      const { error } = await supabase
        .from('profiles')
        .update({ fcm_token: token })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving FCM token:', error);
        // Try to insert if update fails (in case profile doesn't exist)
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            fcm_token: token,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (insertError) {
          console.error('Error upserting FCM token:', insertError);
        } else {
          console.log('FCM token saved via upsert');
        }
      } else {
        console.log('FCM token saved successfully');
      }
    } catch (err) {
      console.error('Failed to save FCM token:', err);
    }
  }, [user]);

  const registerPushNotifications = useCallback(async () => {
    if (!isNative) {
      // For web, we'll use Firebase messaging directly
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        setState(prev => ({
          ...prev,
          isSupported: true,
          permissionGranted: false,
          error: 'Push notification permission denied',
        }));
        return;
      }

      // Register with APNS/FCM
      await PushNotifications.register();

      setState(prev => ({
        ...prev,
        isSupported: true,
        permissionGranted: true,
      }));
    } catch (error) {
      console.error('Error registering push notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to register push notifications',
      }));
    }
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;

    // Registration success - receive the token
    const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({ ...prev, token: token.value }));
      saveFCMToken(token.value);
    });

    // Registration error
    const errorListener = PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
      setState(prev => ({ ...prev, error: error.error || 'Registration failed' }));
    });

    // Notification received while app is in foreground
    const foregroundListener = PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        
        // Determine notification type from data
        const notificationType = notification.data?.type || 'general';
        const feedbackType = getNotificationFeedbackType(notificationType);
        
        // Trigger sound and vibration
        await triggerNotificationFeedback({
          type: feedbackType,
          playSound: true,
          vibrate: true,
        });
        
        // Show a toast for foreground notifications
        toast.info(notification.title || 'New Notification', {
          description: notification.body,
        });
      }
    );

    // Notification action performed (user tapped on notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        
        // Handle navigation based on notification data
        const data = action.notification.data;
        if (data?.route) {
          window.location.href = data.route;
        }
      }
    );

    // Register for push notifications
    registerPushNotifications();

    // Cleanup listeners
    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      foregroundListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isNative, registerPushNotifications, saveFCMToken]);

  const requestPermission = useCallback(async () => {
    if (!isNative) {
      // Web notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setState(prev => ({ ...prev, permissionGranted: permission === 'granted' }));
        return permission === 'granted';
      }
      return false;
    }

    await registerPushNotifications();
    return state.permissionGranted;
  }, [isNative, registerPushNotifications, state.permissionGranted]);

  return {
    ...state,
    requestPermission,
    isNative,
  };
};
