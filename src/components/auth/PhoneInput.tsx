import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PhoneInput = ({ value, onChange, disabled }: PhoneInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(numericValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Mobile Number</Label>
      <div className="flex gap-2">
        <div className="flex items-center justify-center px-4 bg-secondary rounded-xl border border-border text-foreground font-medium min-w-[70px]">
          +91
        </div>
        <Input
          id="phone"
          type="tel"
          placeholder="9876543210"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={10}
          className="flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        We'll send you a verification code via SMS
      </p>
    </div>
  );
};

export default PhoneInput;
