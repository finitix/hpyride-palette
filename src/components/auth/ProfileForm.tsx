import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ProfileFormProps {
  onSubmit: (data: ProfileData) => void;
  loading?: boolean;
  email?: string;
  phone?: string;
}

export interface ProfileData {
  fullName: string;
  gender: string;
  email: string;
  password: string;
}

const ProfileForm = ({ onSubmit, loading, email = "", phone }: ProfileFormProps) => {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [emailValue, setEmailValue] = useState(email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ fullName, gender, email: emailValue, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Just a few more details to get you started
        </p>
        {phone && (
          <p className="text-sm text-muted-foreground mt-2">
            Phone: +91 {phone}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          required
          disabled={loading}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Create Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          This password will be used for future logins
        </p>
      </div>

      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Complete Registration"}
      </Button>
    </form>
  );
};

export default ProfileForm;
