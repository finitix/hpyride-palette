import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Trash2, Car, MapPin, User, Shield, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride_published':
      case 'ride_rejected':
        return <Car className="w-5 h-5" />;
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_rejected':
        return <MapPin className="w-5 h-5" />;
      case 'user_verified':
      case 'user_rejected':
        return <Shield className="w-5 h-5" />;
      case 'admin_notification':
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('rejected')) return 'bg-red-500/20 text-red-500';
    if (type.includes('confirmed') || type.includes('verified') || type.includes('published')) return 'bg-green-500/20 text-green-500';
    if (type.includes('request')) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-blue-500/20 text-blue-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </header>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">You'll see updates about your rides and bookings here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-card border border-border rounded-xl p-4 transition-all ${
                  !notification.is_read ? 'ring-2 ring-primary/20' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default NotificationsPage;
