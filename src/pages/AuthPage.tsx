import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthStep = "phone" | "otp" | "register";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<AuthStep>("phone");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Phone form fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // Registration form fields (for new users)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      if (error) {
        console.error('Send OTP error:', error);
        toast.error("Failed to send OTP. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("OTP sent successfully!");
      setStep("otp");
    } catch (err) {
      console.error('OTP error:', err);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: formattedPhone, code: otp }
      });

      if (error) {
        console.error('Verify OTP error:', error);
        toast.error("Invalid OTP. Please try again.");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.needsRegistration) {
        // New user, show registration form
        setStep("register");
        toast.success("OTP verified! Please complete your profile.");
        return;
      }

      // Existing user, sign them in
      if (data.email) {
        // Sign in with magic link for existing users
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            shouldCreateUser: false,
          }
        });

        if (signInError) {
          // Try password-less sign in
          toast.success("Welcome back! Check your email for the login link.");
        } else {
          toast.success("Welcome back! Check your email for the login link.");
        }
      }
    } catch (err) {
      console.error('Verify error:', err);
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      
      // Verify OTP again with user data to create account
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          phone: formattedPhone, 
          code: otp,
          userData: {
            email,
            password,
            fullName,
            gender,
          }
        }
      });

      if (error || data.error) {
        toast.error(data?.error || "Registration failed. Please try again.");
        return;
      }

      // Sign in the new user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.error("Account created! Please sign in with your email and password.");
        // Reset to show simple login
        setStep("phone");
        return;
      }

      toast.success("Account created successfully!");
      navigate("/welcome", { replace: true });
    } catch (err) {
      console.error('Register error:', err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      if (error || data.error) {
        toast.error(data?.error || "Failed to resend OTP");
        return;
      }

      toast.success("OTP resent successfully!");
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button 
          onClick={() => {
            if (step === "otp") setStep("phone");
            else if (step === "register") setStep("otp");
            else navigate("/");
          }} 
          className="p-2 -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="ml-2 text-lg font-bold text-foreground">HpyRide.com</span>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 animate-fade-in">
        {step === "phone" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Login with OTP
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Enter your mobile number to receive a verification code
            </p>

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-4 bg-muted rounded-xl border border-border text-sm font-medium text-foreground min-w-[60px]">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading || phone.length !== 10}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-foreground underline">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-foreground underline">
                Privacy Policy
              </Link>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verify OTP
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Enter the 6-digit code sent to +91 {phone}
            </p>

            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
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

              <Button 
                onClick={handleVerifyOTP} 
                variant="hero" 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-primary underline"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
                className="w-full text-sm text-muted-foreground underline"
              >
                Change mobile number
              </button>
            </div>
          </>
        )}

        {step === "register" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Create your account to continue
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border accent-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link to="/terms" className="text-foreground underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-foreground underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
