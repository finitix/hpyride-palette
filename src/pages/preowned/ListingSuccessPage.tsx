import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ListingSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Your Car is Listed!</h1>
      <p className="text-muted-foreground text-center mb-8">
        Buyers will contact you soon. Keep your phone available.
      </p>

      <div className="w-full space-y-3">
        <Button variant="hero" className="w-full" onClick={() => navigate("/pre-owned/my-listings")}>
          View My Listings <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/pre-owned")}>
          Back to Pre-Owned Cars
        </Button>
      </div>
    </div>
  );
};

export default ListingSuccessPage;
