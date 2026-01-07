import { useState } from "react";
import { AlertTriangle, Phone, MapPin, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface SOSButtonProps {
  isRideActive: boolean;
  bookingId?: string;
  driverName?: string;
  vehicleNumber?: string;
}

const SOSButton = ({ isRideActive, bookingId, driverName, vehicleNumber }: SOSButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAlertSent, setIsAlertSent] = useState(false);

  const handleSOSPress = () => {
    if (!isRideActive) {
      toast({
        title: "SOS not available",
        description: "SOS is only available during an active ride.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirm(true);
  };

  const triggerSOS = () => {
    setIsAlertSent(true);
    setShowConfirm(false);
    
    // Simulate sending alert
    toast({
      title: "🚨 Emergency Alert Sent!",
      description: "HpyRide Safety Team has been notified. Help is on the way.",
    });

    // Reset after 5 seconds
    setTimeout(() => setIsAlertSent(false), 5000);
  };

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={handleSOSPress}
        disabled={!isRideActive}
        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
          isRideActive
            ? isAlertSent
              ? "bg-green-500 animate-pulse"
              : "bg-red-500 hover:bg-red-600 hover:scale-110"
            : "bg-gray-400 opacity-50 cursor-not-allowed"
        }`}
      >
        {isAlertSent ? (
          <Shield className="w-6 h-6 text-white" />
        ) : (
          <span className="text-white font-black text-sm">SOS</span>
        )}
      </button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-sm mx-auto rounded-3xl">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-3 animate-pulse">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-red-500">
              Emergency SOS
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This will immediately alert the HpyRide Safety Team with your live location.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            <div className="p-3 bg-secondary/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Your live location will be shared</span>
              </div>
              {driverName && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>Driver: {driverName}</span>
                </div>
              )}
              {vehicleNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Vehicle: {vehicleNumber}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              False alarms may result in account suspension
            </p>
          </div>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={triggerSOS}
              className="w-full bg-red-500 hover:bg-red-600 rounded-xl h-12 font-bold"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              CONFIRM EMERGENCY
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-xl h-12 m-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SOSButton;
