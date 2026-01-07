import { Menu, Bell, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const TopHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);

  const menuItems = [
    { label: "Home", path: "/home" },
    { label: "Ride Sharing", path: "/ride-sharing" },
    { label: "Car Rentals", path: "/car-rentals" },
    { label: "Pre-Owned Cars", path: "/pre-owned" },
    { label: "Driver Pool", path: "/driver-pool" },
    { label: "My Profile", path: "/profile" },
  ];

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/auth");
  };

  const handleWatchAd = () => {
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
          setDonationOpen(false);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-splash-bg text-splash-fg">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="p-1">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">HpyRide.com</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="text-left px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-border my-4" />
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="text-left px-4 py-3 rounded-xl text-destructive hover:bg-secondary transition-colors"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigation("/auth")}
                      className="text-left px-4 py-3 rounded-xl text-foreground hover:bg-secondary transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-2xl font-bold tracking-tight">HpyRide.com</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-splash-fg/10 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDonationOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Heart className="w-3 h-3 fill-white" />
              <span>Donate</span>
              <Sparkles className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Donation Modal */}
      <Dialog open={donationOpen} onOpenChange={setDonationOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-3xl">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mb-3">
              <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-bold">Free Donation</DialogTitle>
            <p className="text-sm text-muted-foreground">Watch a 30s ad, we donate ₹1</p>
          </DialogHeader>
          
          <div className="py-4">
            {isWatching ? (
              <div className="space-y-3">
                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all"
                    style={{ width: `${watchProgress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">Watching... {Math.round(watchProgress)}%</p>
              </div>
            ) : (
              <Button
                onClick={handleWatchAd}
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              >
                <Heart className="w-4 h-4 mr-2 fill-white" />
                Watch & Donate Free
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopHeader;
