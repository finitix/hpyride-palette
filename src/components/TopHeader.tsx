import { Menu, Bell, Heart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const TopHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const channel = supabase
        .channel('notifications-count')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchUnreadCount();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

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
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full hover:bg-splash-fg/10 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/donate')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Heart className="w-3 h-3 fill-white" />
              <span>Donate</span>
              <Sparkles className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </header>

    </>
  );
};

export default TopHeader;
