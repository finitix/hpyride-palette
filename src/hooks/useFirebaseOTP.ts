// Firebase OTP Verification Hook for HpyRide
import { useState, useCallback } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { setupRecaptcha, sendOTP, auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface OTPState {
  step: 'phone' | 'otp' | 'profile';
  phoneNumber: string;
  otp: string;
  loading: boolean;
  error: string | null;
  confirmationResult: ConfirmationResult | null;
}

export const useFirebaseOTP = () => {
  const [state, setState] = useState<OTPState>({
    step: 'phone',
    phoneNumber: '',
    otp: '',
    loading: false,
    error: null,
    confirmationResult: null,
  });

  const setPhoneNumber = useCallback((phone: string) => {
    setState(prev => ({ ...prev, phoneNumber: phone }));
  }, []);

  const setOtp = useCallback((otp: string) => {
    setState(prev => ({ ...prev, otp }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 'phone',
      phoneNumber: '',
      otp: '',
      loading: false,
      error: null,
      confirmationResult: null,
    });
  }, []);

  const sendOTPCode = useCallback(async (containerId: string = 'recaptcha-container') => {
    if (state.phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const recaptchaVerifier = setupRecaptcha(containerId);
      const fullPhoneNumber = `+91${state.phoneNumber}`;
      
      console.log('Sending OTP to:', fullPhoneNumber);
      const result = await sendOTP(fullPhoneNumber, recaptchaVerifier);
      
      setState(prev => ({
        ...prev,
        confirmationResult: result,
        step: 'otp',
        loading: false,
      }));
      
      toast.success('OTP sent successfully!');
      return true;
    } catch (error: any) {
      console.error('OTP send error:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      toast.error(errorMessage);
      return false;
    }
  }, [state.phoneNumber]);

  const verifyOTPCode = useCallback(async (): Promise<{ success: boolean; user?: any }> => {
    if (state.otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return { success: false };
    }

    if (!state.confirmationResult) {
      toast.error('Session expired. Please request a new OTP.');
      setState(prev => ({ ...prev, step: 'phone' }));
      return { success: false };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await state.confirmationResult.confirm(state.otp);
      console.log('OTP verified successfully:', result.user.uid);
      
      setState(prev => ({
        ...prev,
        loading: false,
        step: 'profile',
      }));
      
      toast.success('Phone verified successfully!');
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP. Please try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP expired. Please request a new one.';
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      toast.error(errorMessage);
      return { success: false };
    }
  }, [state.otp, state.confirmationResult]);

  const resendOTP = useCallback(async (containerId: string = 'recaptcha-container') => {
    setState(prev => ({ ...prev, otp: '', step: 'phone' }));
    
    // Small delay to allow reCAPTCHA to reset
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return sendOTPCode(containerId);
  }, [sendOTPCode]);

  return {
    ...state,
    setPhoneNumber,
    setOtp,
    reset,
    sendOTPCode,
    verifyOTPCode,
    resendOTP,
  };
};
