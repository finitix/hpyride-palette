import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Heart, Clock, TrendingUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import { FullscreenAd } from "@/components/ads/MontagAds";

interface AdHistory {
  id: string;
  type: "earn" | "donate";
  amount: number;
  created_at: string;
}

const DonatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAd, setShowAd] = useState(false);
  const [adType, setAdType] = useState<"earn" | "donate">("earn");
  const [adHistory, setAdHistory] = useState<AdHistory[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);

  useEffect(() => {
    fetchAdHistory();
  }, [user]);

  const fetchAdHistory = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .in("type", ["ad_earn", "ad_donate"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      const history = data.map((n) => ({
        id: n.id,
        type: n.type === "ad_earn" ? "earn" as const : "donate" as const,
        amount: n.type === "ad_earn" ? 0.5 : 1,
        created_at: n.created_at,
      }));
      setAdHistory(history);
      
      // Calculate totals
      const earned = history.filter(h => h.type === "earn").length * 0.5;
      const donated = history.filter(h => h.type === "donate").length * 1;
      setTotalEarned(earned);
      setTotalDonated(donated);
    }
  };

  const handleWatchAd = (type: "earn" | "donate") => {
    setAdType(type);
    setShowAd(true);
  };

  const handleAdComplete = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "Sign in to track your rewards",
        variant: "destructive",
      });
      return;
    }

    // Save to database
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: adType === "earn" ? "₹0.50 Earned!" : "₹1 Donated!",
      body: adType === "earn" 
        ? "You earned ₹0.50 by watching an ad" 
        : "₹1 has been donated to charity on your behalf",
      type: adType === "earn" ? "ad_earn" : "ad_donate",
      data: { amount: adType === "earn" ? 0.5 : 1 },
    });

    toast({
      title: adType === "earn" ? "🎉 ₹0.50 Earned!" : "💚 Thank you!",
      description: adType === "earn" 
        ? "Added to your wallet" 
        : "₹1 donated to charity on your behalf",
    });

    // Refresh history
    fetchAdHistory();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-splash-bg text-splash-fg px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Watch & Earn</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-green-500/20 border-green-500/30 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-400">₹{totalEarned.toFixed(2)}</p>
          </Card>
          <Card className="bg-pink-500/20 border-pink-500/30 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-pink-300">Total Donated</span>
            </div>
            <p className="text-2xl font-bold text-pink-400">₹{totalDonated.toFixed(2)}</p>
          </Card>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Watch & Earn Card */}
        <Card className="p-6 rounded-3xl border-2 border-dashed border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Watch & Earn</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Watch a short 30-second ad to earn rewards
              </p>
              <Button
                onClick={() => handleWatchAd("earn")}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl"
              >
                <Play className="w-4 h-4 mr-2 fill-white" />
                Watch Ad & Earn ₹0.50
              </Button>
            </div>
          </div>
        </Card>

        {/* Free Donation Card */}
        <Card className="p-6 rounded-3xl border-2 border-dashed border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-red-500/5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg animate-pulse">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Free Donation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Watch ad & donate ₹1 to charity for FREE
              </p>
              <Button
                onClick={() => handleWatchAd("donate")}
                className="mt-4 w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-xl"
              >
                <Heart className="w-4 h-4 mr-2 fill-white" />
                Watch Ad & Donate
              </Button>
            </div>
          </div>
        </Card>

        {/* Community Impact */}
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">HpyRiders donated</p>
              <p className="text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                ₹2,45,890
              </p>
            </div>
          </div>
        </Card>

        {/* Ad History */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            History
          </h3>
          {adHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity yet</p>
              <p className="text-sm">Watch an ad to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adHistory.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.type === "earn" ? "bg-green-500/20" : "bg-pink-500/20"
                  }`}>
                    {item.type === "earn" ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <Heart className="w-5 h-5 text-pink-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.type === "earn" ? "Earned from ad" : "Donated via ad"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(item.created_at)}
                    </p>
                  </div>
                  <span className={`font-bold ${
                    item.type === "earn" ? "text-green-500" : "text-pink-500"
                  }`}>
                    {item.type === "earn" ? "+" : ""}₹{item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Ad */}
      <FullscreenAd
        isOpen={showAd}
        onClose={() => setShowAd(false)}
        onComplete={handleAdComplete}
        type={adType}
      />

      <BottomNavigation />
    </div>
  );
};

export default DonatePage;
