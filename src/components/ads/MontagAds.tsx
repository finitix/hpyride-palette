import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Monetag Zone ID from URL
const MONETAG_ZONE_ID = "10447754";

// Banner Ad Component - Uses Monetag's native ad script
export const BannerAd = ({ className = "" }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || !containerRef.current) return;
    scriptLoaded.current = true;

    // Create the Monetag banner script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = `//pl26040810.effectiveperformanceformat.com/adScript.js?zoneid=${MONETAG_ZONE_ID}`;
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full min-h-[50px] bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Fallback text shown while ad loads */}
      <div className="text-xs text-muted-foreground animate-pulse">Loading ad...</div>
    </div>
  );
};

// Fullscreen Ad Component with 30-second timer
interface FullscreenAdProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  type: "earn" | "donate";
}

export const FullscreenAd = ({ isOpen, onClose, onComplete, type }: FullscreenAdProps) => {
  const [progress, setProgress] = useState(0);
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCanClose(false);
      setTimeLeft(30);
      scriptLoaded.current = false;
      return;
    }

    // Load Monetag interstitial ad
    if (adContainerRef.current && !scriptLoaded.current) {
      scriptLoaded.current = true;
      
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = `//pl26040810.effectiveperformanceformat.com/adScript.js?zoneid=${MONETAG_ZONE_ID}`;
      adContainerRef.current.appendChild(script);
    }

    // 30-second timer
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / 30);
        if (newProgress >= 100) {
          clearInterval(interval);
          setCanClose(true);
          return 100;
        }
        return newProgress;
      });
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (canClose) {
      onComplete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium">
            {type === "earn" ? "Watch & Earn ₹0.50" : "Free Donation ₹1"}
          </span>
          <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white">
            {timeLeft}s
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          disabled={!canClose}
          className={`text-white ${!canClose ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none bg-white/20" />

      {/* Ad content */}
      <div 
        ref={adContainerRef}
        className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 overflow-hidden"
      >
        <div className="text-center text-white mb-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl animate-pulse">
            <span className="text-5xl">{type === "earn" ? "💰" : "❤️"}</span>
          </div>
          <p className="text-xl font-bold mb-2">
            {type === "earn" ? "Earning ₹0.50" : "Donating ₹1"}
          </p>
          <p className="text-sm text-white/60 mb-4">
            {canClose ? "Ad complete! Tap below to continue" : `Please wait ${timeLeft} seconds`}
          </p>
          
          {/* Loading animation */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Close button when available */}
      {canClose && (
        <div className="p-4 bg-black">
          <Button
            onClick={handleClose}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-2xl"
          >
            {type === "earn" ? "🎉 Collect ₹0.50" : "💚 Complete Donation"}
          </Button>
        </div>
      )}
    </div>
  );
};

// Small inline banner for between sections
export const InlineBannerAd = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`w-full py-2 ${className}`}>
      <BannerAd />
    </div>
  );
};

// Ride list ad component (shown between rides)
export const RideListAd = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || !containerRef.current) return;
    scriptLoaded.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = `//pl26040810.effectiveperformanceformat.com/adScript.js?zoneid=${MONETAG_ZONE_ID}`;
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 min-h-[80px] flex items-center justify-center"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="animate-pulse">📢</span>
        <span>Sponsored</span>
      </div>
    </div>
  );
};

export default { BannerAd, FullscreenAd, InlineBannerAd, RideListAd };
