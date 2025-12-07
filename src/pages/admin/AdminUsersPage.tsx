import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, Mail, Phone, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  created_at: string;
  verification?: {
    status: string;
  };
}

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchUsers();
  }, [admin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const usersWithVerification = await Promise.all(
        data.map(async (user) => {
          const { data: verification } = await supabase
            .from('user_verifications')
            .select('status')
            .eq('user_id', user.user_id)
            .single();
          return { ...user, verification };
        })
      );
      setUsers(usersWithVerification as UserProfile[]);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">All Users</h1>
        </header>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
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
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{user.full_name || "No name"}</p>
                        {user.verification?.status === 'verified' ? (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        ) : user.verification?.status === 'pending' ? (
                          <Shield className="w-4 h-4 text-yellow-500" />
                        ) : user.verification?.status === 'rejected' ? (
                          <ShieldX className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email || "No email"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone || "No phone"}
                        </span>
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

export default AdminUsersPage;