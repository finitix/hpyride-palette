import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PhoneEmailButton from "@/components/auth/PhoneEmailButton";

type AuthMode = "signin" | "signup";
type AuthMethod = "email" | "phone";
type PhoneStep = "phone" | "verifying" | "register";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [optionalPhone, setOptionalPhone] = useState("");

  // Phone.email fields
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [userJsonUrl, setUserJsonUrl] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  // Email/Password Sign In
  const handleEmailSubmit = async (e: React.FormEvent) => {
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
        
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, { 
          full_name: fullName, 
          phone: optionalPhone ? `+91${optionalPhone.replace(/\D/g, '')}` : undefined, 
          gender 
        });
        
        if (error) {
          if (error.message.includes("already registered") || error.message.includes("already been registered")) {
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

  // Phone.email verification handler
  const handlePhoneVerified = async (jsonUrl: string) => {
    setLoading(true);
    setUserJsonUrl(jsonUrl);
    setPhoneStep("verifying");
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-phone-email', {
        body: { userJsonUrl: jsonUrl }
      });

      if (error) {
        console.error('Verify phone error:', error);
        toast.error("Failed to verify phone. Please try again.");
        setPhoneStep("phone");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setPhoneStep("phone");
        return;
      }

      if (data.verified) {
        setVerifiedPhone(data.phoneNumber);
        
        if (data.isNewUser || data.needsRegistration) {
          setPhoneStep("register");
          toast.success("Phone verified! Please complete your profile.");
        } else if (data.email) {
          // Existing user - prompt to sign in with email
          toast.success(`Welcome back! Please sign in with ${data.email}`);
          setEmail(data.email);
          setAuthMethod("email");
          setMode("signin");
        }
      }
    } catch (err) {
      console.error('Verify error:', err);
      toast.error("Verification failed. Please try again.");
      setPhoneStep("phone");
    } finally {
      setLoading(false);
    }
  };

  // Phone registration after verification
  const handlePhoneRegister = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.functions.invoke('verify-phone-email', {
        body: { 
          userJsonUrl,
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

      // Sign in with the new credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.error("Account created! Please sign in with your email and password.");
        setAuthMethod("email");
        setMode("signin");
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

  const resetPhoneFlow = () => {
    setPhoneStep("phone");
    setVerifiedPhone("");
    setUserJsonUrl("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button 
          onClick={() => {
            if (authMethod === "phone" && phoneStep !== "phone") {
              if (phoneStep === "register") setPhoneStep("phone");
              else setPhoneStep("phone");
            } else {
              navigate("/");
            }
          }} 
          className="p-2 -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="ml-2 text-lg font-bold text-foreground">HpyRide.com</span>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 animate-fade-in">
        {/* Email Auth Method */}
        {authMethod === "email" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {mode === "signin"
                ? "Sign in to continue to HpyRide"
                : "Simple, fast — get started with HpyRide"}
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
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
                    <Label htmlFor="phoneOptional">Mobile (Optional)</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center px-3 bg-muted rounded-xl border border-border text-sm text-muted-foreground">
                        +91
                      </div>
                      <Input
                        id="phoneOptional"
                        type="tel"
                        placeholder="9876543210"
                        value={optionalPhone}
                        onChange={(e) => setOptionalPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1"
                        maxLength={10}
                      />
                    </div>
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
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">At least 6 characters</p>
                )}
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-2">
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
              )}

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Please wait...
                  </>
                ) : mode === "signin" ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Sign in
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Phone OTP Option */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12"
              onClick={() => {
                setAuthMethod("phone");
                resetPhoneFlow();
              }}
            >
              <Phone className="w-4 h-4" />
              {mode === "signin" ? "Sign in with Phone" : "Sign up with Phone"}
            </Button>

            {/* Toggle mode */}
            <p className="text-center text-sm text-muted-foreground mt-6">
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
          </>
        )}

        {/* Phone Auth Method - Verification Step */}
        {authMethod === "phone" && phoneStep === "phone" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Login with Phone
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Verify your phone number to continue
            </p>

            <div className="space-y-6">
              {/* Phone.email Button */}
              <PhoneEmailButton 
                onVerified={handlePhoneVerified}
                loading={loading}
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Email Option */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={() => setAuthMethod("email")}
              >
                <Mail className="w-4 h-4" />
                Continue with Email
              </Button>

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
            </div>
          </>
        )}

        {/* Phone Auth - Verifying */}
        {authMethod === "phone" && phoneStep === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Verifying...</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we verify your phone number
            </p>
          </div>
        )}

        {/* Phone Auth - Registration Form */}
        {authMethod === "phone" && phoneStep === "register" && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              Create your account to continue
            </p>
            {verifiedPhone && (
              <p className="text-sm text-primary mb-6">
                ✓ Phone verified: {verifiedPhone}
              </p>
            )}

            <form onSubmit={handlePhoneRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regFullName">Full Name</Label>
                <Input
                  id="regFullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regGender">Gender</Label>
                <select
                  id="regGender"
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
                <Label htmlFor="regEmail">Email</Label>
                <Input
                  id="regEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regPassword">Create Password</Label>
                <div className="relative">
                  <Input
                    id="regPassword"
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
                  id="regTerms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border accent-primary"
                />
                <label htmlFor="regTerms" className="text-sm text-muted-foreground">
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
