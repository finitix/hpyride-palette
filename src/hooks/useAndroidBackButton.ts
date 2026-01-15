import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle Android hardware back button in Capacitor apps
 * - Navigates back within React Router
 * - Only exits app when on home page
 */
export const useAndroidBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run on native Android
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    let listenerHandle: { remove: () => Promise<void> } | null = null;

    const setupListener = async () => {
      listenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
        const currentPath = location.pathname;
        
        // Pages where back button should exit the app
        const exitPages = ['/home', '/', '/splash'];
        
        if (exitPages.includes(currentPath)) {
          // Exit the app on home/splash page
          App.exitApp();
        } else if (canGoBack || window.history.length > 1) {
          // Navigate back within the app
          navigate(-1);
        } else {
          // Fallback: go to home
          navigate('/home', { replace: true });
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [location.pathname, navigate]);
};

export default useAndroidBackButton;
