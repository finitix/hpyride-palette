import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Car, MapPin, CheckCircle, Clock, 
  TrendingUp, BarChart3, Menu,
  Shield, CarFront, Calendar
} from "lucide-react";
import { useAdminAuth } from "@/admin/contexts/AdminAuthContext";
import { useAdminApi } from "@/admin/hooks/useAdminApi";
import AdminSidebar from "@/admin/components/AdminSidebar";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig 
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

interface ChartDataPoint {
  date: string;
  day: string;
  count: number;
}

interface DashboardStats {
  totalRides: number;
  completedRides: number;
  pendingRides: number;
  totalUsers: number;
  pendingVerifications: number;
  totalVehicles: number;
  pendingCarListings: number;
  chartData?: {
    dailyRides: ChartDataPoint[];
    dailyUsers: ChartDataPoint[];
  };
}

const ridesChartConfig: ChartConfig = {
  count: {
    label: "Rides",
    color: "hsl(var(--primary))",
  },
};

const usersChartConfig: ChartConfig = {
  count: {
    label: "Users",
    color: "hsl(142.1 76.2% 36.3%)",
  },
};

const DashboardPage = () => {
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
        completedRides: data.completedRides || 0,
        pendingRides: data.pendingRides || 0,
        totalUsers: data.totalUsers || 0,
        pendingVerifications: data.pendingVerifications || 0,
        totalVehicles: data.totalVehicles || 0,
        pendingCarListings: data.pendingCars || 0,
        chartData: data.chartData,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo(() => [
    { label: "Total Rides", value: stats.totalRides, icon: MapPin, color: "bg-blue-500" },
    { label: "Completed Rides", value: stats.completedRides, icon: CheckCircle, color: "bg-green-500" },
    { label: "Pending Rides", value: stats.pendingRides, icon: Clock, color: "bg-yellow-500" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-purple-500" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Shield, color: "bg-orange-500" },
    { label: "Total Vehicles", value: stats.totalVehicles, icon: Car, color: "bg-cyan-500" },
    { label: "Pending Car Listings", value: stats.pendingCarListings, icon: CarFront, color: "bg-pink-500" },
  ], [stats]);

  const quickActions = useMemo(() => [
    { label: "Pending Verifications", path: "/admin/verify-users", count: stats.pendingVerifications },
    { label: "Pending Rides", path: "/admin/verify-rides", count: stats.pendingRides },
    { label: "Pending Car Listings", path: "/admin/verify-cars", count: stats.pendingCarListings },
  ], [stats]);

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
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                  <div key={stat.label} className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow">
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

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Ride Count (Last 7 Days)
                  </h3>
                  <div className="h-48">
                    {stats.chartData?.dailyRides && stats.chartData.dailyRides.length > 0 ? (
                      <ChartContainer config={ridesChartConfig} className="h-full w-full">
                        <BarChart data={stats.chartData.dailyRides}>
                          <XAxis 
                            dataKey="day" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            allowDecimals={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar 
                            dataKey="count" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No ride data yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Weekly New Users (Last 7 Days)
                  </h3>
                  <div className="h-48">
                    {stats.chartData?.dailyUsers && stats.chartData.dailyUsers.length > 0 ? (
                      <ChartContainer config={usersChartConfig} className="h-full w-full">
                        <LineChart data={stats.chartData.dailyUsers}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="day" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            allowDecimals={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="hsl(142.1 76.2% 36.3%)" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(142.1 76.2% 36.3%)", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No user data yet</p>
                        </div>
                      </div>
                    )}
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

export default DashboardPage;
