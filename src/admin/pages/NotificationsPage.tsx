import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Send, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminAuth } from "@/admin/contexts/AdminAuthContext";
import { useAdminApi } from "@/admin/hooks/useAdminApi";
import AdminSidebar from "@/admin/components/AdminSidebar";
import { toast } from "sonner";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  is_active: boolean;
  created_at: string;
}

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { callAdminApi } = useAdminApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchNotifications();
  }, [admin, navigate]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await callAdminApi('get_admin_notifications');
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await callAdminApi('send_notification_to_all', {
        title: newNotification.title,
        message: newNotification.message,
      });
      toast.success('Notification sent to all users');
      setCreateDialogOpen(false);
      setNewNotification({ title: '', message: '' });
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await callAdminApi('delete_admin_notification', { id });
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification');
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
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Send to All
          </Button>
        </header>

        <main className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No notifications sent yet</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-1" />
                Send First Notification
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent: {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Notification Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification to All Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={sending}>
              <Send className="w-4 h-4 mr-1" />
              {sending ? 'Sending...' : 'Send to All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotificationsPage;
