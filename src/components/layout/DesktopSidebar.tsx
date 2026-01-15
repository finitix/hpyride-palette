import { Home, Car, Heart, User, MapPin, Key, ShoppingBag, Users, HelpCircle, Info } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Ride Sharing", path: "/ride-sharing", icon: Car },
  { label: "Car Rentals", path: "/car-rentals", icon: Key },
  { label: "Pre-Owned Cars", path: "/pre-owned", icon: ShoppingBag },
  { label: "Driver Pool", path: "/driver-pool", icon: Users },
];

const bottomMenuItems = [
  { label: "Donate", path: "/donate", icon: Heart },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Support", path: "/support", icon: HelpCircle },
  { label: "About", path: "/about", icon: Info },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">HpyRide.com</h1>
        <p className="text-xs text-muted-foreground mt-1">Ride. Share. Save.</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                active 
                  ? "bg-foreground text-background font-semibold" 
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isDonate = item.path === "/donate";
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 ${
                isDonate 
                  ? "text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950"
                  : active 
                    ? "bg-secondary text-foreground font-medium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isDonate ? "fill-pink-500" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">Verified User</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DesktopSidebar;
