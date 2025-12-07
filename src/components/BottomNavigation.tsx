import { Home, Car, Key, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
  { id: "rides", label: "Rides", icon: Car, path: "/ride-sharing" },
  { id: "rentals", label: "Rentals", icon: Key, path: "/car-rentals" },
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                active ? "nav-active" : "nav-inactive"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-foreground" : "text-muted-foreground"}`} />
              <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
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
