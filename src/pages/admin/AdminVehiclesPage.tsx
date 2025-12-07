import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Car, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  number: string;
  category: string;
  vehicle_type: string;
  seats: number;
  verification_status: string;
  front_image_url: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

const AdminVehiclesPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchVehicles();
  }, [admin, navigate]);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const vehiclesWithProfiles = await Promise.all(
        data.map(async (v) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', v.user_id)
            .single();
          return { ...v, profile };
        })
      );
      setVehicles(vehiclesWithProfiles as Vehicle[]);
    }
    setLoading(false);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.number?.toLowerCase().includes(search.toLowerCase()) ||
    v.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">All Vehicles</h1>
        </header>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mb-4"
          />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="flex">
                    <div className="w-24 h-20 bg-muted flex-shrink-0">
                      {vehicle.front_image_url ? (
                        <img src={vehicle.front_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{vehicle.name}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.number}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {vehicle.verification_status === 'verified' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : vehicle.verification_status === 'rejected' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-xs">{vehicle.verification_status}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{vehicle.category}</span> • {vehicle.seats} seats
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {vehicle.profile?.full_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVehiclesPage;