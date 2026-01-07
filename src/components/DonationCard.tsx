import { useState } from "react";
import { Heart, Play, Gift, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const DonationCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [donated, setDonated] = useState(false);

  const handleWatchAd = () => {
    setIsWatching(true);
    setWatchProgress(0);
    
    // Simulate ad watching progress
    const interval = setInterval(() => {
      setWatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsWatching(false);
          setDonated(true);
          toast({
            title: "🎉 Thank you for your kindness!",
            description: "Your free donation of ₹1 has been sent to charity.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const resetDonation = () => {
    setDonated(false);
    setWatchProgress(0);
  };

  return (
    <>
      {/* Compact Donation Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-gentle"
      >
        <Heart className="w-3.5 h-3.5 fill-white" />
        <span>Free Donate</span>
        <Sparkles className="w-3 h-3" />
      </button>

      {/* Donation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl border-none bg-gradient-to-br from-background via-background to-secondary/30">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
              <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
              Free Donation
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Support a cause without spending a rupee
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* How it works */}
            <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
              <h4 className="font-semibold text-foreground text-sm">How it works:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-muted-foreground">Watch a short 30-second ad</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-muted-foreground">We donate ₹1 to charity on your behalf</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-muted-foreground">Feel good about making a difference!</span>
                </div>
              </div>
            </div>

            {/* Causes we support */}
            <div className="flex flex-wrap gap-2 justify-center">
              {["🏥 Healthcare", "📚 Education", "🌳 Environment", "🍲 Hunger Relief"].map((cause) => (
                <span key={cause} className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-foreground">
                  {cause}
                </span>
              ))}
            </div>

            {/* Watch Ad Button or Progress */}
            {isWatching ? (
              <div className="space-y-3">
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-full transition-all duration-150"
                    style={{ width: `${watchProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Watching ad... {Math.round(watchProgress)}%
                </p>
              </div>
            ) : donated ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-green-600 font-semibold">Thank you! ₹1 donated 💚</p>
                <Button 
                  variant="outline" 
                  onClick={resetDonation}
                  className="rounded-full"
                >
                  Donate Again Tomorrow
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleWatchAd}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white font-bold text-base shadow-lg"
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                Watch Ad & Donate Free
              </Button>
            )}

            {/* Impact counter */}
            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Together, HpyRiders have donated
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                ₹1,24,567
              </p>
              <p className="text-xs text-muted-foreground">to various causes 🙏</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonationCard;
