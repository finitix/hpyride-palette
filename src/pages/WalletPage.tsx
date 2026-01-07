import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Heart, Wallet, Send, Car, Gift, Sparkles, Check, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";

const WalletPage = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(12.50);
  const [isWatching, setIsWatching] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [dailyAdsWatched, setDailyAdsWatched] = useState(2);
  const maxDailyAds = 5;

  const handleWatchAd = () => {
    if (dailyAdsWatched >= maxDailyAds) {
      toast({
        title: "Daily limit reached",
        description: "Come back tomorrow to earn more!",
        variant: "destructive",
      });
      return;
    }

    setIsWatching(true);
    setWatchProgress(0);
    
    const interval = setInterval(() => {
      setWatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsWatching(false);
          const earned = 0.50;
          setWalletBalance(prev => prev + earned);
          setDailyAdsWatched(prev => prev + 1);
          toast({
            title: "🎉 ₹0.50 earned!",
            description: "Amount added to your wallet.",
          });
          return 100;
        }
        return prev + 4;
      });
    }, 120);
  };

  const handleDonateToCharity = () => {
    if (walletBalance < 1) {
      toast({
        title: "Insufficient balance",
        description: "You need at least ₹1 to donate.",
        variant: "destructive",
      });
      return;
    }
    setWalletBalance(prev => prev - 1);
    toast({
      title: "💚 Thank you!",
      description: "₹1 has been donated to charity.",
    });
  };

  const transactions = [
    { id: 1, type: "earn", amount: 0.50, description: "Watched ad", time: "2 min ago" },
    { id: 2, type: "earn", amount: 0.50, description: "Watched ad", time: "15 min ago" },
    { id: 3, type: "donate", amount: -1.00, description: "Donated to Education", time: "1 hour ago" },
    { id: 4, type: "ride", amount: -5.00, description: "Ride payment", time: "Yesterday" },
    { id: 5, type: "earn", amount: 0.50, description: "Watched ad", time: "Yesterday" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-splash-bg text-splash-fg px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Watch & Earn</h1>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">HpyRide Wallet</p>
                <p className="text-3xl font-bold text-foreground">₹{walletBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Today's earnings</p>
              <p className="text-lg font-semibold text-green-500">+₹{(dailyAdsWatched * 0.5).toFixed(2)}</p>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Daily ads watched</span>
              <span className="font-medium">{dailyAdsWatched}/{maxDailyAds}</span>
            </div>
            <Progress value={(dailyAdsWatched / maxDailyAds) * 100} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Watch Ad Section */}
      <div className="px-4 py-6 space-y-6">
        {/* Watch Ad Card */}
        <Card className="p-6 rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-pulse-gentle">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Watch & Earn ₹0.50</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Watch a short 30-second ad to earn rewards
              </p>
            </div>

            {isWatching ? (
              <div className="space-y-3">
                <Progress value={watchProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Watching ad... {Math.round(watchProgress)}%
                </p>
              </div>
            ) : (
              <Button
                onClick={handleWatchAd}
                disabled={dailyAdsWatched >= maxDailyAds}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base shadow-lg"
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                {dailyAdsWatched >= maxDailyAds ? "Come back tomorrow!" : "Watch Ad & Earn ₹0.50"}
              </Button>
            )}
          </div>
        </Card>

        {/* Free Donation Card */}
        <Card className="p-5 rounded-3xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-red-500/5 to-orange-500/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center animate-pulse">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">Free Donation</h4>
              <p className="text-xs text-muted-foreground">Watch ad & donate ₹1 to charity for FREE</p>
            </div>
            <Button 
              size="sm" 
              className="rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              onClick={() => {
                setIsWatching(true);
                setWatchProgress(0);
                const interval = setInterval(() => {
                  setWatchProgress(prev => {
                    if (prev >= 100) {
                      clearInterval(interval);
                      setIsWatching(false);
                      toast({
                        title: "🎉 Thank you!",
                        description: "₹1 donated to charity on your behalf!",
                      });
                      return 100;
                    }
                    return prev + 5;
                  });
                }, 150);
              }}
            >
              <Play className="w-4 h-4 mr-1 fill-white" />
              Donate
            </Button>
          </div>
          {isWatching && watchProgress < 100 && (
            <div className="mt-3">
              <Progress value={watchProgress} className="h-1.5" />
            </div>
          )}
        </Card>

        <div>
          <h3 className="text-lg font-bold mb-4">Use Your Balance</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleDonateToCharity}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-xs font-medium text-center">Donate to Charity</span>
            </button>

            <button
              onClick={() => toast({ title: "Coming soon!", description: "Ride payments will be available soon." })}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-center">Use for Rides</span>
            </button>

            <button
              onClick={() => toast({ title: "Coming soon!", description: "Transfer feature will be available soon." })}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-center">Transfer to User</span>
            </button>
          </div>
        </div>

        {/* Charity Impact */}
        <Card className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 via-red-500/5 to-orange-500/10 border-pink-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">Community Impact</h4>
              <p className="text-sm text-muted-foreground">HpyRiders have donated</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                ₹2,45,890
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
        </Card>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === "earn" ? "bg-green-500/20" : 
                  tx.type === "donate" ? "bg-pink-500/20" : "bg-blue-500/20"
                }`}>
                  {tx.type === "earn" ? <TrendingUp className="w-5 h-5 text-green-500" /> :
                   tx.type === "donate" ? <Heart className="w-5 h-5 text-pink-500" /> :
                   <Car className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? "text-green-500" : "text-muted-foreground"}`}>
                  {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default WalletPage;
