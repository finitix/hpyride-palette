// Notification sound and vibration utilities for mobile devices

import { Capacitor } from '@capacitor/core';

// Audio context for notification sounds
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Generate a notification beep sound
const generateBeep = async (
  frequency: number = 880,
  duration: number = 200,
  volume: number = 0.5
): Promise<void> => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (required for mobile)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Different notification sound patterns
export const NotificationSounds = {
  // Default notification sound - single beep
  default: async () => {
    await generateBeep(880, 150, 0.4);
  },

  // Success notification - ascending tones
  success: async () => {
    await generateBeep(523.25, 100, 0.3); // C5
    await new Promise((r) => setTimeout(r, 100));
    await generateBeep(659.25, 100, 0.3); // E5
    await new Promise((r) => setTimeout(r, 100));
    await generateBeep(783.99, 150, 0.4); // G5
  },

  // Alert/Warning notification - attention grabbing
  alert: async () => {
    await generateBeep(880, 150, 0.5); // A5
    await new Promise((r) => setTimeout(r, 100));
    await generateBeep(880, 150, 0.5); // A5
  },

  // Urgent notification - rapid beeps
  urgent: async () => {
    for (let i = 0; i < 3; i++) {
      await generateBeep(1000, 100, 0.5);
      await new Promise((r) => setTimeout(r, 80));
    }
  },

  // Message received - subtle chime
  message: async () => {
    await generateBeep(1046.50, 80, 0.3); // C6
    await new Promise((r) => setTimeout(r, 50));
    await generateBeep(1318.51, 120, 0.4); // E6
  },

  // Ride update - distinctive pattern
  rideUpdate: async () => {
    await generateBeep(659.25, 100, 0.4); // E5
    await new Promise((r) => setTimeout(r, 80));
    await generateBeep(783.99, 100, 0.4); // G5
    await new Promise((r) => setTimeout(r, 80));
    await generateBeep(987.77, 150, 0.5); // B5
  },
};

// Vibration patterns (in milliseconds)
export const VibrationPatterns = {
  // Default - single short vibration
  default: [200],

  // Success - two short vibrations
  success: [100, 50, 100],

  // Alert - longer vibration
  alert: [300, 100, 300],

  // Urgent - rapid vibrations
  urgent: [100, 50, 100, 50, 100, 50, 100],

  // Message - subtle double tap
  message: [50, 50, 50],

  // Ride update - distinctive pattern
  rideUpdate: [200, 100, 200, 100, 400],

  // SOS - continuous urgent pattern
  sos: [500, 200, 500, 200, 500],
};

// Trigger vibration if supported
export const vibrate = (pattern: number[] = VibrationPatterns.default): boolean => {
  if (!navigator.vibrate) {
    console.log('Vibration API not supported');
    return false;
  }

  try {
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    console.error('Error triggering vibration:', error);
    return false;
  }
};

// Stop any ongoing vibration
export const stopVibration = (): void => {
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
};

// Combined notification with sound and vibration
export type NotificationType = 'default' | 'success' | 'alert' | 'urgent' | 'message' | 'rideUpdate';

export interface NotificationFeedbackOptions {
  type?: NotificationType;
  playSound?: boolean;
  vibrate?: boolean;
}

export const triggerNotificationFeedback = async (
  options: NotificationFeedbackOptions = {}
): Promise<void> => {
  const { type = 'default', playSound = true, vibrate: shouldVibrate = true } = options;

  const isNative = Capacitor.isNativePlatform();

  // Run sound and vibration in parallel
  const tasks: Promise<void>[] = [];

  if (playSound) {
    const soundFn = NotificationSounds[type] || NotificationSounds.default;
    tasks.push(soundFn());
  }

  if (shouldVibrate && isNative) {
    const pattern = VibrationPatterns[type] || VibrationPatterns.default;
    vibrate(pattern);
  }

  await Promise.all(tasks);
};

// Map notification types from backend to feedback types
export const getNotificationFeedbackType = (notificationType: string): NotificationType => {
  const typeMap: Record<string, NotificationType> = {
    // Ride related
    ride_posted: 'success',
    ride_approved: 'success',
    ride_rejected: 'alert',
    ride_cancelled: 'alert',
    
    // Booking related
    booking_request: 'rideUpdate',
    booking_confirmed: 'success',
    booking_rejected: 'alert',
    booking_completed: 'success',
    
    // Driver related
    driver_on_way: 'rideUpdate',
    driver_arrived: 'urgent',
    trip_started: 'rideUpdate',
    trip_completed: 'success',
    
    // Verification
    verification_submitted: 'success',
    verification_approved: 'success',
    verification_rejected: 'alert',
    
    // Messages
    chat_message: 'message',
    new_message: 'message',
    
    // Promotional
    promotional: 'default',
    admin_notification: 'default',
    
    // Default
    general: 'default',
  };

  return typeMap[notificationType] || 'default';
};
