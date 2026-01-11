import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Phone, Mail } from "lucide-react";
import { ConfirmationResult } from "firebase/auth";
import { auth, setupRecaptcha, sendOTP, signInWithGoogle } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import PhoneInput from "@/components/auth/PhoneInput";
import OTPInput from "@/components/auth/OTPInput";
import ProfileForm, { ProfileData } from "@/components/auth/ProfileForm";

type AuthMode = "signin" | "signup";
type OTPStep = "phone" | "otp" | "profile";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email/Password form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP flow state
  const [showOTPFlow, setShowOTPFlow] = useState(false);
  const [otpStep, setOtpStep] = useState<OTPStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/home", { replace: true });
        }
      } else {
        if (!agreedToTerms) {
          toast.error("Please agree to the Terms & Conditions");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, { full_name: fullName, phone, gender });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully!");
          navigate("/welcome", { replace: true });
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha("recaptcha-container");
      const fullPhoneNumber = `+91${phoneNumber}`;
      const result = await sendOTP(fullPhoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setOtpStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("OTP send error:", error);
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else if (error.code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number format");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      toast.error("Session expired. Please request a new OTP.");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      setFirebaseUser(result.user);

      // Check if user exists in Supabase
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", `+91${phoneNumber}`)
        .maybeSingle();

      if (existingProfile) {
        // Existing user - auto login
        const { data: userData } = await supabase
          .from("profiles")
          .select("email")
          .eq("phone", `+91${phoneNumber}`)
          .single();

        if (userData?.email) {
          // Sign in with stored credentials (we'll use a special token flow)
          toast.success("Welcome back!");
          navigate("/home", { replace: true });
        }
      } else {
        // New user - collect profile info
        setOtpStep("profile");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP. Please try again.");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Complete profile for new OTP users
  const handleProfileComplete = async (profileData: ProfileData) => {
    setLoading(true);
    try {
      // Create Supabase account
      const { error } = await signUp(profileData.email, profileData.password, {
        full_name: profileData.fullName,
        phone: `+91${phoneNumber}`,
        gender: profileData.gender,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please use a different email.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created successfully!");
        navigate("/welcome", { replace: true });
      }
    } catch (err) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const googleUser = result.user;

      // Check if user exists in Supabase
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", googleUser.email)
        .maybeSingle();

      if (existingProfile) {
        // Existing user - try to sign in
        toast.success("Welcome back!");
        navigate("/home", { replace: true });
      } else {
        // New user - show profile completion
        setFirebaseUser(googleUser);
        setShowOTPFlow(true);
        setOtpStep("profile");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled");
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset OTP flow
  const resetOTPFlow = () => {
    setShowOTPFlow(false);
    setOtpStep("phone");
    setPhoneNumber("");
    setOtp("");
    setConfirmationResult(null);
    setFirebaseUser(null);
  };

  // Render OTP flow
  if (showOTPFlow) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center">
          <button onClick={resetOTPFlow} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <span className="ml-2 text-lg font-bold text-foreground">HpyRide.com</span>
        </header>

        <div className="flex-1 px-6 py-8 animate-fade-in">
          {otpStep === "phone" && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Login with OTP
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your mobile number to receive a verification code
              </p>

              <div className="space-y-6">
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  disabled={loading}
                />

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>

              <div id="recaptcha-container" className="mt-4" />
            </>
          )}

          {otpStep === "otp" && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verify OTP
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Enter the 6-digit code sent to +91 {phoneNumber}
              </p>

              <div className="space-y-6">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                  phoneNumber={phoneNumber}
                />

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <button
                  onClick={() => {
                    setOtp("");
                    setOtpStep("phone");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {otpStep === "profile" && (
            <ProfileForm
              onSubmit={handleProfileComplete}
              loading={loading}
              email={firebaseUser?.email || ""}
              phone={phoneNumber}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button onClick={() => navigate("/")} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="ml-2 text-lg font-bold text-foreground">HpyRide.com</span>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {mode === "signin"
            ? "Sign in to continue to HpyRide"
            : "Simple, fast — get started with HpyRide"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
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
                <Label htmlFor="phone">Mobile</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Used for OTP verification</p>
              </div>
            </>
          )}

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
            <Label htmlFor="password">Password</Label>
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
            {mode === "signin" && (
              <button type="button" className="text-xs text-foreground underline mt-1">
                Forgot password?
              </button>
            )}
          </div>

          {mode === "signup" && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <span className="text-foreground underline">Terms & Conditions</span>
              </label>
            </div>
          )}

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        {/* Alternate actions */}
        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setShowOTPFlow(true)}
          >
            <Phone className="w-4 h-4" />
            Login with OTP
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {mode === "signin" ? (
            <>
              New user?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-foreground font-semibold underline"
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-foreground font-semibold underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {/* Hidden recaptcha container */}
      <div id="recaptcha-container" style={{ display: 'none' }} />
    </div>
  );
};

export default AuthPage;
