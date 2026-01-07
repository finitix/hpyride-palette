import { BadgeCheck, Shield, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedPoolerBadgeProps {
  isVerified: boolean;
  rating?: number;
  totalRides?: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const VerifiedPoolerBadge = ({ 
  isVerified, 
  rating = 0, 
  totalRides = 0,
  size = "md",
  showTooltip = true 
}: VerifiedPoolerBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const badgeContent = (
    <div className="inline-flex items-center gap-1">
      <div className="relative">
        <BadgeCheck className={`${sizeClasses[size]} text-blue-500 fill-blue-500/20`} />
      </div>
      {size !== "sm" && (
        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
          VERIFIED
        </span>
      )}
    </div>
  );

  if (!showTooltip) return badgeContent;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent className="p-3 max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-sm">Verified Pooler</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This driver has been verified by HpyRide with valid documents and background check.
          </p>
          {rating > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">• {totalRides} rides</span>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default VerifiedPoolerBadge;
