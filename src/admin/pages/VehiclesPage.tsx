import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Car, User, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminAuth } from "@/admin/contexts/AdminAuthContext";
import { useAdminApi } from "@/admin/hooks/useAdminApi";
import AdminSidebar from "@/admin/components/AdminSidebar";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  model: string;
  number: string;
  category: string;
  vehicle_type: string;
  seats: number;
  has_ac: boolean;
  verification_status: string;
  is_verified: boolean;
  front_image_url: string;
  side_image_url: string;
  rear_image_url: string;
  rc_book_url: string;
  insurance_url: string;
  pollution_url: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const VehiclesPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { callAdminApi } = useAdminApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchVehicles();
  }, [admin, navigate, activeTab]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await callAdminApi('get_vehicles', { 
        status: activeTab === 'pending' ? 'pending' : null 
      });
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    }
    setLoading(false);
  };

  const handleApprove = async (vehicle: Vehicle) => {
    setProcessing(true);
    try {
      await callAdminApi('approve_vehicle', { id: vehicle.id });
      toast.success("Vehicle verified successfully");
      fetchVehicles();
      setSelectedVehicle(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVehicle || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      await callAdminApi('reject_vehicle', { id: selectedVehicle.id });
      toast.success("Vehicle rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchVehicles();
      setSelectedVehicle(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
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
            All Vehicles
          </button>
        </div>

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
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicles found</p>
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
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          vehicle.verification_status === 'verified' ? 'bg-green-500/20 text-green-500' :
                          vehicle.verification_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {vehicle.verification_status}
                        </span>
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

                  <div className="flex border-t border-border">
                    <button
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm border-r border-border"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {vehicle.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(vehicle)}
                          disabled={processing}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-green-500 border-r border-border"
                        >
                          <Check className="w-4 h-4" />
                          Verify
                        </button>
                        <button
                          onClick={() => { setSelectedVehicle(vehicle); setRejectDialogOpen(true); }}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-red-500"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedVehicle && !rejectDialogOpen} onOpenChange={() => setSelectedVehicle(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {selectedVehicle.front_image_url && (
                  <img src={selectedVehicle.front_image_url} alt="Front" className="w-full h-24 object-cover rounded-lg" />
                )}
                {selectedVehicle.side_image_url && (
                  <img src={selectedVehicle.side_image_url} alt="Side" className="w-full h-24 object-cover rounded-lg" />
                )}
                {selectedVehicle.rear_image_url && (
                  <img src={selectedVehicle.rear_image_url} alt="Rear" className="w-full h-24 object-cover rounded-lg" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedVehicle.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{selectedVehicle.model || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number</p>
                  <p className="font-medium">{selectedVehicle.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{selectedVehicle.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedVehicle.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-medium">{selectedVehicle.seats}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AC</p>
                  <p className="font-medium">{selectedVehicle.has_ac ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Documents</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedVehicle.rc_book_url && (
                    <a href={selectedVehicle.rc_book_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded text-center text-sm">RC Book</a>
                  )}
                  {selectedVehicle.insurance_url && (
                    <a href={selectedVehicle.insurance_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded text-center text-sm">Insurance</a>
                  )}
                  {selectedVehicle.pollution_url && (
                    <a href={selectedVehicle.pollution_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded text-center text-sm">Pollution</a>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Owner Details</p>
                <p className="font-medium">{selectedVehicle.profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedVehicle.profile?.email}</p>
                <p className="text-sm text-muted-foreground">{selectedVehicle.profile?.phone}</p>
              </div>

              {selectedVehicle.verification_status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setRejectDialogOpen(true); }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedVehicle)}
                    disabled={processing}
                  >
                    Verify Vehicle
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
            <DialogTitle>Reject Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection.
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

export default VehiclesPage;
