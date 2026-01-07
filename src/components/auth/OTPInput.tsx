import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  phoneNumber?: string;
}

const OTPInput = ({ value, onChange, disabled, phoneNumber }: OTPInputProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Label className="text-base">Enter verification code</Label>
        {phoneNumber && (
          <p className="text-sm text-muted-foreground mt-1">
            Sent to +91 {phoneNumber}
          </p>
        )}
      </div>
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
};

export default OTPInput;
