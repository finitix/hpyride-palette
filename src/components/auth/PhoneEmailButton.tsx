import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PhoneEmailButtonProps {
  onVerified: (userJsonUrl: string) => void;
  loading?: boolean;
}

declare global {
  interface Window {
    phoneEmailListener: (userObj: { user_json_url: string }) => void;
  }
}

const PhoneEmailButton = ({ 
  onVerified, 
  loading = false, 
}: PhoneEmailButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the listener function
    window.phoneEmailListener = function(userObj) {
      const user_json_url = userObj.user_json_url;
      console.log('Phone.email verification callback received:', user_json_url);
      
      if (user_json_url) {
        onVerified(user_json_url);
      }
    };

    // Load the external script
    if (buttonRef.current) {
      const existingScript = buttonRef.current.querySelector('script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;
        buttonRef.current.appendChild(script);
      }
    }

    return () => {
      // Cleanup the listener function when the component unmounts
      window.phoneEmailListener = () => {};
    };
  }, [onVerified]);

  return (
    <div className="w-full">
      {/* Phone.email button container */}
      <div 
        ref={buttonRef}
        className="pe_signin_button" 
        data-client-id="15695407177920574360"
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
