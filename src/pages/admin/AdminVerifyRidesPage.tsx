import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Check, X, Eye, MapPin, Calendar, Clock, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Ride {
  id: string;
  user_id: string;
  pickup_location: string;
  drop_location: string;
  ride_date: string;
  ride_time: string;
  seats_available: number;
  price_per_km: number;
  total_price: number;
  status: string;
  verification_status: string;
  rejection_reason: string | null;
  created_at: string;
  vehicle?: {
    name: string;
    number: string;
    category: string;
    front_image_url: string;
  };
  profile?: {
    full_name: string;
    email: string;
  };
}

const AdminVerifyRidesPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchRides();
  }, [admin, navigate, activeTab]);

  const fetchRides = async () => {
    setLoading(true);
    let query = supabase
      .from('rides')
      .select('*, vehicle:vehicles(name, number, category, front_image_url)')
      .order('created_at', { ascending: false });

    if (activeTab === 'pending') {
      query = query.eq('verification_status', 'pending');
    }

    const { data, error } = await query;

    if (!error && data) {
      const ridesWithProfiles = await Promise.all(
        data.map(async (r) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', r.user_id)
            .single();
          return { ...r, profile };
        })
      );
      setRides(ridesWithProfiles as Ride[]);
    }
    setLoading(false);
  };

  const handleApprove = async (ride: Ride) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('rides')
        .update({ 
          verification_status: 'verified',
          status: 'published'
        })
        .eq('id', ride.id);

      if (error) throw error;

      toast.success("Ride published successfully");
      fetchRides();
      setSelectedRide(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRide || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('rides')
        .update({ 
          verification_status: 'rejected',
          rejection_reason: rejectReason,
        })
        .eq('id', selectedRide.id);

      if (error) throw error;

      toast.success("Ride rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchRides();
      setSelectedRide(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Verify Rides</h1>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            All Rides
          </button>
        </div>

        <main className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No rides found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div key={ride.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{ride.profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{ride.profile?.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ride.verification_status === 'verified' ? 'bg-green-500/20 text-green-500' :
                      ride.verification_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {ride.verification_status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{ride.pickup_location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">{ride.drop_location}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(ride.ride_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {ride.ride_time}
                      </div>
                    </div>
                    {ride.vehicle && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Car className="w-4 h-4" />
                        {ride.vehicle.name} ({ride.vehicle.number})
                      </div>
                    )}
                  </div>

                  {ride.rejection_reason && (
                    <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      Rejected: {ride.rejection_reason}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedRide(ride)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    {ride.verification_status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(ride)}
                          disabled={processing}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm" 
                          onClick={() => { setSelectedRide(ride); setRejectDialogOpen(true); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedRide && !rejectDialogOpen} onOpenChange={() => setSelectedRide(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
          </DialogHeader>
          
          {selectedRide && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-medium">{selectedRide.profile?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedRide.ride_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium">{selectedRide.pickup_location}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{selectedRide.drop_location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-medium">{selectedRide.seats_available}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">₹{selectedRide.total_price}</p>
                </div>
              </div>

              {selectedRide.vehicle && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Vehicle</p>
                    <p className="font-medium">{selectedRide.vehicle.name} - {selectedRide.vehicle.number}</p>
                    <p className="text-sm text-muted-foreground">{selectedRide.vehicle.category}</p>
                  </div>
                  {selectedRide.vehicle.front_image_url && (
                    <img 
                      src={selectedRide.vehicle.front_image_url} 
                      alt="Vehicle" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </>
              )}

              {selectedRide.verification_status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setRejectDialogOpen(true); }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedRide)}
                    disabled={processing}
                  >
                    Publish Ride
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Ride</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection. This will be shown to the driver.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerifyRidesPage;