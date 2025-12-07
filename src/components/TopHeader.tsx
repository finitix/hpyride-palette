import { Menu, Bell, User } from "lucide-react";
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

const TopHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-splash-bg text-splash-fg px-4 py-4 flex items-center justify-between">
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
      
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-splash-fg/10 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full bg-splash-fg/20 flex items-center justify-center"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
