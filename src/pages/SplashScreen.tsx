import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (user) {
          navigate("/home", { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }
      }, 200);
    }, 600);

    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div
      className={`fixed inset-0 bg-splash-bg flex flex-col items-center justify-center transition-opacity duration-200 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-scale-in flex flex-col items-center gap-4">
        <h1 className="text-splash-fg text-4xl md:text-5xl font-bold tracking-tight">
          HpyRide.com
        </h1>
        <p className="text-splash-fg/80 text-sm md:text-base uppercase tracking-[0.3em] font-medium">
          ride · rent · drive together
        </p>
        <div className="mt-8 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-splash-fg animate-pulse-gentle" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-splash-fg animate-pulse-gentle" style={{ animationDelay: "200ms" }} />
          <div className="w-2 h-2 rounded-full bg-splash-fg animate-pulse-gentle" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
