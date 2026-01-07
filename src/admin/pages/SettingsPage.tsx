import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, UserPlus, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminAuth } from "@/admin/contexts/AdminAuthContext";
import { useAdminApi } from "@/admin/hooks/useAdminApi";
import AdminSidebar from "@/admin/components/AdminSidebar";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { callAdminApi } = useAdminApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", name: "", password: "", role: "admin" });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchAdmins();
  }, [admin, navigate]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await callAdminApi('get_admins');
      setAdmins(data || []);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admin users');
    }
    setLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
      toast.error("Please fill all fields");
      return;
    }

    setProcessing(true);
    try {
      await callAdminApi('add_admin', newAdmin);
      toast.success("Admin added successfully");
      setAddDialogOpen(false);
      setNewAdmin({ email: "", name: "", password: "", role: "admin" });
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleActive = async (adminUser: AdminUser) => {
    try {
      await callAdminApi('toggle_admin', { id: adminUser.id, is_active: !adminUser.is_active });
      toast.success(adminUser.is_active ? "Admin deactivated" : "Admin activated");
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      await callAdminApi('delete_admin', { id });
      toast.success("Admin deleted");
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
          {admin?.role === 'super_admin' && (
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1" />
              Add Admin
            </Button>
          )}
        </header>

        <main className="p-4">
          <h2 className="text-lg font-semibold mb-4">Admin Users</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((adminUser) => (
                <div key={adminUser.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{adminUser.name}</p>
                        <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        adminUser.role === 'super_admin' ? 'bg-purple-500/20 text-purple-500' :
                        adminUser.role === 'admin' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {adminUser.role.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        adminUser.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {adminUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {admin?.role === 'super_admin' && adminUser.id !== admin.id && (
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleActive(adminUser)}
                      >
                        {adminUser.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteAdmin(adminUser.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="Admin name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newAdmin.role} onValueChange={(v) => setNewAdmin({ ...newAdmin, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={processing}>
              {processing ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
