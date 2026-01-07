import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup, ConfirmationResult } from "firebase/auth";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBu93NM6ZFIH1jfzCTUnLHxloUCyW4pTN0",
  authDomain: "hpyride-f0a05.firebaseapp.com",
  projectId: "hpyride-f0a05",
  storageBucket: "hpyride-f0a05.firebasestorage.app",
  messagingSenderId: "153991353898",
  appId: "1:153991353898:web:ebaf3a3fa1377342639553",
  measurementId: "G-25X5X99SC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Messaging (only for web - Capacitor handles native)
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase messaging not supported in this environment');
  }
}

export { messaging };

// Phone Auth helpers
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
  return recaptchaVerifier;
};

export const sendOTP = async (
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

// FCM Token for web
export const getWebFCMToken = async (vapidKey?: string): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen to foreground messages (web)
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
