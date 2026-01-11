import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Monetag script URL
const MONETAG_URL = "https://otieu.com/4/10447754";

// Banner Ad Component
export const BannerAd = ({ className = "" }: { className?: string }) => {
  useEffect(() => {
    // Load Monetag banner script
    const script = document.createElement("script");
    script.src = MONETAG_URL;
    script.async = true;
    script.dataset.cfasync = "false";
    
    const container = document.getElementById("monetag-banner");
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      id="monetag-banner" 
      className={`w-full min-h-[50px] bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden ${className}`}
    >
      <span className="text-xs text-muted-foreground">Ad</span>
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

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCanClose(false);
      setTimeLeft(30);
      return;
    }

    // Load Monetag script for fullscreen
    const script = document.createElement("script");
    script.src = MONETAG_URL;
    script.async = true;
    script.dataset.cfasync = "false";
    
    const container = document.getElementById("monetag-fullscreen");
    if (container) {
      container.appendChild(script);
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
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
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
            {type === "earn" ? "Watch & Earn" : "Free Donation"}
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
          className={`text-white ${!canClose ? "opacity-50" : ""}`}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none bg-white/20" />

      {/* Ad content */}
      <div 
        id="monetag-fullscreen" 
        className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black"
      >
        <div className="text-center text-white p-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
            <span className="text-3xl">📺</span>
          </div>
          <p className="text-lg font-medium mb-2">
            {type === "earn" ? "Earn ₹0.50" : "Donate ₹1 for FREE"}
          </p>
          <p className="text-sm text-white/60">
            Watch for {timeLeft} more seconds
          </p>
        </div>
      </div>

      {/* Close button when available */}
      {canClose && (
        <div className="p-4 bg-black">
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
          >
            {type === "earn" ? "Collect ₹0.50" : "Complete Donation"}
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
      <div className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-lg p-3 flex items-center justify-center min-h-[60px]">
        <BannerAd />
      </div>
    </div>
  );
};

export default { BannerAd, FullscreenAd, InlineBannerAd };
