import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Navigation, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Mic,
  X,
  ChevronUp,
  ChevronDown,
  Fuel,
  Construction,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SOSButton from "@/components/SOSButton";
import AIChatBubble from "@/components/AIChatBubble";
import { toast } from "@/hooks/use-toast";

interface DrivingModeProps {
  bookingId: string;
  pickupLocation: string;
  dropLocation: string;
  driverName?: string;
  vehicleNumber?: string;
  estimatedTime?: number;
  distance?: number;
}

interface Hazard {
  id: string;
  type: "pothole" | "speedbreaker" | "dark_spot" | "construction";
  message: string;
  distance: number;
}

const DrivingMode = ({
  bookingId,
  pickupLocation,
  dropLocation,
  driverName = "Rahul K.",
  vehicleNumber = "MH 12 AB 1234",
  estimatedTime = 25,
  distance = 12.5,
}: DrivingModeProps) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState("Continue straight for 2 km");
  const [nextTurn, setNextTurn] = useState({ direction: "left", distance: "500m" });
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentHazard, setCurrentHazard] = useState<Hazard | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate navigation progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate turn instructions
  useEffect(() => {
    const instructions = [
      { text: "Continue straight for 2 km", turn: { direction: "left", distance: "500m" } },
      { text: "Turn left in 500 meters", turn: { direction: "left", distance: "500m" } },
      { text: "Turn left now", turn: { direction: "right", distance: "1.2km" } },
      { text: "Continue on NH-48 for 1.2 km", turn: { direction: "right", distance: "1.2km" } },
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % instructions.length;
      setCurrentInstruction(instructions[index].text);
      setNextTurn(instructions[index].turn);
      
      if (!isMuted && index === 1) {
        // Simulate voice alert
        toast({
          title: "🔊 Navigation",
          description: instructions[index].text,
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isMuted]);

  // Simulate hazard alerts
  useEffect(() => {
    const hazards: Hazard[] = [
      { id: "1", type: "pothole", message: "Pothole ahead in 200m", distance: 200 },
      { id: "2", type: "speedbreaker", message: "Speed breaker in 150m", distance: 150 },
      { id: "3", type: "dark_spot", message: "Low visibility area ahead", distance: 300 },
      { id: "4", type: "construction", message: "Road construction in 500m", distance: 500 },
    ];

    const showRandomHazard = () => {
      const hazard = hazards[Math.floor(Math.random() * hazards.length)];
      setCurrentHazard(hazard);
      
      if (!isMuted) {
        toast({
          title: "⚠️ Hazard Alert",
          description: hazard.message,
        });
      }

      setTimeout(() => setCurrentHazard(null), 5000);
    };

    const interval = setInterval(showRandomHazard, 15000);
    return () => clearInterval(interval);
  }, [isMuted]);

  const getHazardIcon = (type: string) => {
    switch (type) {
      case "pothole": return <AlertTriangle className="w-5 h-5" />;
      case "speedbreaker": return <Construction className="w-5 h-5" />;
      case "dark_spot": return <Moon className="w-5 h-5" />;
      case "construction": return <Construction className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const handleVoiceCommand = () => {
    setIsListening(true);
    toast({
      title: "🎤 Listening...",
      description: "Say 'Hey Hpy' followed by your command",
    });

    setTimeout(() => {
      setIsListening(false);
      toast({
        title: "✓ Command received",
        description: "Finding nearest coffee shop...",
      });
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-splash-bg z-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceCommand}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isListening 
                  ? "bg-primary text-primary-foreground animate-pulse" 
                  : "bg-background/90 backdrop-blur"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-lg"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Direction Banner */}
      <div className="absolute top-20 left-4 right-4 z-10">
        <Card className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Navigation className="w-6 h-6 rotate-[-45deg]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{currentInstruction}</p>
              <p className="text-sm opacity-80">Turn {nextTurn.direction} in {nextTurn.distance}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Hazard Alert Banner */}
      {currentHazard && (
        <div className="absolute top-40 left-4 right-4 z-10 animate-in slide-in-from-top">
          <Card className="p-3 bg-yellow-500 text-yellow-950 rounded-xl shadow-xl flex items-center gap-3">
            {getHazardIcon(currentHazard.type)}
            <div className="flex-1">
              <p className="font-bold text-sm">{currentHazard.message}</p>
            </div>
            <button onClick={() => setCurrentHazard(null)}>
              <X className="w-4 h-4" />
            </button>
          </Card>
        </div>
      )}

      {/* Map Placeholder */}
      <div className="flex-1 bg-gradient-to-b from-splash-bg to-secondary/20 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Navigation className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-sm">Live navigation map</p>
          <p className="text-xs opacity-60">Mapbox integration required</p>
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Card className={`rounded-t-3xl bg-background border-t transition-all ${isExpanded ? "h-72" : "h-auto"}`}>
          {/* Expand Handle */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 flex justify-center"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronUp className="w-5 h-5 text-muted-foreground" />}
          </button>

          <div className="px-4 pb-4 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{pickupLocation}</span>
                <span className="text-muted-foreground">{dropLocation}</span>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* ETA and Distance */}
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center text-primary">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold text-lg">{Math.round(estimatedTime * (1 - progress/100))} min</span>
                </div>
                <p className="text-xs text-muted-foreground">ETA</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="font-bold text-lg">{(distance * (1 - progress/100)).toFixed(1)} km</span>
                </div>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{driverName}</p>
                    <p className="text-xs text-muted-foreground">{vehicleNumber}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Call
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xl"
                  onClick={() => navigate(`/my-rides`)}
                >
                  End Ride
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* SOS Button */}
      <SOSButton 
        isRideActive={true} 
        bookingId={bookingId}
        driverName={driverName}
        vehicleNumber={vehicleNumber}
      />

      {/* AI Chat Bubble */}
      <AIChatBubble context={{ destination: dropLocation, eta: `${estimatedTime} min`, distance: `${distance} km` }} />
    </div>
  );
};

export default DrivingMode;
