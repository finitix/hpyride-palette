import { Home, Car, Heart, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
  { id: "rides", label: "Rides", icon: Car, path: "/ride-sharing" },
  { id: "donate", label: "Donate", icon: Heart, path: "/wallet" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  return (
    // Hidden on desktop (lg and above)
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          const isDonate = tab.id === "donate";
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                active ? "nav-active" : "nav-inactive"
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isDonate ? "text-pink-500" : 
                active ? "text-foreground" : "text-muted-foreground"
              } ${isDonate && active ? "fill-pink-500" : ""}`} />
              <span className={`text-xs ${
                isDonate ? "text-pink-500 font-medium" :
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
