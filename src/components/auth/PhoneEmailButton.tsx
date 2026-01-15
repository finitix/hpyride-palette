import { useEffect, useCallback } from 'react';
import { Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhoneEmailButtonProps {
  onVerified: (userJsonUrl: string, phoneNumber: string) => void;
  loading?: boolean;
  disabled?: boolean;
  buttonText?: string;
}

declare global {
  interface Window {
    phoneEmailListener: (userObj: { user_json_url: string; user_phone_number?: string }) => void;
  }
}

const PhoneEmailButton = ({ 
  onVerified, 
  loading = false, 
  disabled = false,
  buttonText = "Verify with Phone"
}: PhoneEmailButtonProps) => {
  
  const handlePhoneEmailResponse = useCallback((userObj: { user_json_url: string; user_phone_number?: string }) => {
    console.log('Phone.email verification response:', userObj);
    if (userObj.user_json_url) {
      onVerified(userObj.user_json_url, userObj.user_phone_number || '');
    }
  }, [onVerified]);

  useEffect(() => {
    // Set up the global listener for phone.email
    window.phoneEmailListener = handlePhoneEmailResponse;

    // Load the phone.email script
    const existingScript = document.getElementById('phone-email-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'phone-email-script';
      script.src = 'https://www.phone.email/sign_in_button_v1.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup
      delete (window as any).phoneEmailListener;
    };
  }, [handlePhoneEmailResponse]);

  return (
    <div className="w-full">
      {/* Phone.email button container */}
      <div 
        className="pe_signin_button" 
        data-client-id="17aborcd2xey4ew99fv70xq6tnpvvt1h"
        data-country-code="+91"
        style={{ display: 'flex', justifyContent: 'center' }}
      />
      
      {loading && (
        <div className="flex items-center justify-center mt-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Verifying...
        </div>
      )}
    </div>
  );
};

export default PhoneEmailButton;
