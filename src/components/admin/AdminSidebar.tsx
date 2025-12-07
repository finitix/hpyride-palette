import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Car, MapPin, Shield, 
  Settings, LogOut, X, CarFront, FileCheck
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, signOut } = useAdminAuth();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Verify Users", path: "/admin/verify-users", icon: Shield },
    { label: "Verify Rides", path: "/admin/verify-rides", icon: MapPin },
    { label: "Verify Cars", path: "/admin/verify-cars", icon: CarFront },
    { label: "All Users", path: "/admin/users", icon: Users },
    { label: "All Vehicles", path: "/admin/vehicles", icon: Car },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out successfully");
    navigate("/admin");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">HpyRide</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
            <button onClick={onClose} className="lg:hidden p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-foreground text-background' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="mb-4 px-3">
              <p className="font-medium text-foreground text-sm">{admin?.name}</p>
              <p className="text-xs text-muted-foreground">{admin?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;