import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Edit, LogOut, Shield, ShieldCheck, ShieldX, Clock, Car, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";
import VerificationPopup from "@/components/VerificationPopup";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVerification();
    }
  }, [user]);

  const fetchVerification = async () => {
    const { data } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    setVerification(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth", { replace: true });
  };

  const getVerificationStatus = () => {
    if (!verification) return { icon: Shield, text: "Not Verified", color: "text-muted-foreground", bg: "bg-muted" };
    if (verification.status === 'verified') return { icon: ShieldCheck, text: "Verified", color: "text-green-500", bg: "bg-green-500/20" };
    if (verification.status === 'pending') return { icon: Clock, text: "Pending", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    if (verification.status === 'rejected') return { icon: ShieldX, text: "Rejected", color: "text-red-500", bg: "bg-red-500/20" };
    return { icon: Shield, text: "Not Verified", color: "text-muted-foreground", bg: "bg-muted" };
  };

  const status = getVerificationStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background pb-20">
      <VerificationPopup />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/home")} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">My Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {user?.user_metadata?.full_name || "HpyRide User"}
              </h2>
              <p className="text-sm text-muted-foreground">Member since 2024</p>
            </div>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Edit className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Verification Status */}
          <button 
            onClick={() => navigate('/verify')}
            className={`w-full flex items-center justify-between p-3 rounded-xl mb-4 ${status.bg}`}
          >
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
              <span className={`font-medium ${status.color}`}>{status.text}</span>
            </div>
            {verification?.status !== 'verified' && (
              <span className="text-sm text-foreground">Verify Now →</span>
            )}
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">
                  {user?.user_metadata?.phone || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {[
            { label: "My Rides", path: "/my-rides", icon: Car },
            { label: "My Listed Cars", path: "/pre-owned/my-listings", icon: Car },
            { label: "My Interested Cars", path: "/pre-owned/my-interests", icon: Heart },
            { label: "Help & Support", path: "/support", icon: null },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors flex items-center gap-3"
            >
              {item.icon && <item.icon className="w-5 h-5 text-muted-foreground" />}
              <span className="font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-4 py-8">
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;