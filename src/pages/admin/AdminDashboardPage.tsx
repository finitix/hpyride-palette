import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Car, MapPin, CheckCircle, Clock, 
  TrendingUp, BarChart3, Menu,
  Shield, CarFront
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminApi } from "@/hooks/useAdminApi";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface DashboardStats {
  totalRides: number;
  completedRides: number;
  pendingRides: number;
  totalUsers: number;
  pendingVerifications: number;
  totalVehicles: number;
  pendingCarListings: number;
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { callAdminApi } = useAdminApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRides: 0,
    completedRides: 0,
    pendingRides: 0,
    totalUsers: 0,
    pendingVerifications: 0,
    totalVehicles: 0,
    pendingCarListings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchStats();
  }, [admin, navigate]);

  const fetchStats = async () => {
    try {
      const data = await callAdminApi('get_stats');
      setStats({
        totalRides: data.totalRides || 0,
        completedRides: 0,
        pendingRides: data.pendingRides || 0,
        totalUsers: data.totalUsers || 0,
        pendingVerifications: data.pendingVerifications || 0,
        totalVehicles: data.totalVehicles || 0,
        pendingCarListings: data.pendingCars || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Rides", value: stats.totalRides, icon: MapPin, color: "bg-blue-500" },
    { label: "Completed Rides", value: stats.completedRides, icon: CheckCircle, color: "bg-green-500" },
    { label: "Pending Rides", value: stats.pendingRides, icon: Clock, color: "bg-yellow-500" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-purple-500" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Shield, color: "bg-orange-500" },
    { label: "Total Vehicles", value: stats.totalVehicles, icon: Car, color: "bg-cyan-500" },
    { label: "Pending Car Listings", value: stats.pendingCarListings, icon: CarFront, color: "bg-pink-500" },
  ];

  const quickActions = [
    { label: "Pending Verifications", path: "/admin/verify-users", count: stats.pendingVerifications },
    { label: "Pending Rides", path: "/admin/verify-rides", count: stats.pendingRides },
    { label: "Pending Car Listings", path: "/admin/verify-cars", count: stats.pendingCarListings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {admin?.name}
            </span>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className="bg-card border border-border rounded-xl p-4 text-left hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{action.label}</span>
                        {action.count > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                            {action.count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Ride Count
                  </h3>
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <p>Chart visualization coming soon</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Weekly New Users
                  </h3>
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <p>Chart visualization coming soon</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;