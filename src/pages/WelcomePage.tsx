import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-8">
          <Car className="w-12 h-12 text-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to HpyRide
        </h1>
        
        <p className="text-muted-foreground text-lg mb-12">
          Enjoy our services — ride, rent, drive together
        </p>

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={() => navigate("/home", { replace: true })}
        >
          Get started
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
