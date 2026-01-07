import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

const PushNotificationProvider = ({ children }: PushNotificationProviderProps) => {
  const { isNative, isSupported, permissionGranted, token, requestPermission } = usePushNotifications();

  useEffect(() => {
    // Auto-request permission when component mounts (for native apps)
    if (isNative && isSupported && !permissionGranted) {
      requestPermission();
    }
  }, [isNative, isSupported, permissionGranted, requestPermission]);

  useEffect(() => {
    if (token) {
      console.log('Push notification token registered:', token.substring(0, 20) + '...');
    }
  }, [token]);

  return <>{children}</>;
};

export default PushNotificationProvider;
