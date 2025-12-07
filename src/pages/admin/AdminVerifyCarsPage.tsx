import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Check, X, Eye, Car, MapPin, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface CarListing {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  variant: string;
  year_of_purchase: number;
  fuel_type: string;
  transmission: string;
  km_driven: number;
  expected_price: number;
  location: string;
  status: string;
  verification_status: string;
  rejection_reason: string | null;
  created_at: string;
  images?: { image_url: string; image_type: string }[];
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const AdminVerifyCarsPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchCars();
  }, [admin, navigate, activeTab]);

  const fetchCars = async () => {
    setLoading(true);
    let query = supabase
      .from('pre_owned_cars')
      .select('*, images:car_images(image_url, image_type)')
      .order('created_at', { ascending: false });

    if (activeTab === 'pending') {
      query = query.eq('verification_status', 'pending');
    }

    const { data, error } = await query;

    if (!error && data) {
      const carsWithProfiles = await Promise.all(
        data.map(async (car) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', car.user_id)
            .single();
          return { ...car, profile };
        })
      );
      setCars(carsWithProfiles as CarListing[]);
    }
    setLoading(false);
  };

  const handleApprove = async (car: CarListing) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('pre_owned_cars')
        .update({ verification_status: 'verified' })
        .eq('id', car.id);

      if (error) throw error;

      toast.success("Car listing approved");
      fetchCars();
      setSelectedCar(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCar || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('pre_owned_cars')
        .update({ 
          verification_status: 'rejected',
          rejection_reason: rejectReason,
        })
        .eq('id', selectedCar.id);

      if (error) throw error;

      toast.success("Car listing rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchCars();
      setSelectedCar(null);
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
          <h1 className="text-xl font-bold text-foreground">Verify Car Listings</h1>
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
            All Listings
          </button>
        </div>

        <main className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No car listings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cars.map((car) => (
                <div key={car.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="flex">
                    <div className="w-28 h-24 bg-muted flex-shrink-0">
                      {car.images?.[0] && (
                        <img src={car.images[0].image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{car.brand} {car.model}</p>
                          <p className="text-sm text-muted-foreground">{car.year_of_purchase} • {car.km_driven.toLocaleString()} km</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          car.verification_status === 'verified' ? 'bg-green-500/20 text-green-500' :
                          car.verification_status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {car.verification_status}
                        </span>
                      </div>
                      <p className="text-lg font-bold mt-1">₹{(car.expected_price / 100000).toFixed(1)} Lakh</p>
                    </div>
                  </div>

                  <div className="px-3 pb-2 text-sm text-muted-foreground">
                    <p>Seller: {car.profile?.full_name} • {car.profile?.phone}</p>
                  </div>

                  {car.rejection_reason && (
                    <div className="mx-3 mb-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      Rejected: {car.rejection_reason}
                    </div>
                  )}

                  <div className="flex border-t border-border">
                    <button
                      onClick={() => setSelectedCar(car)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm border-r border-border"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {car.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(car)}
                          disabled={processing}
                          className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-green-500 border-r border-border"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => { setSelectedCar(car); setRejectDialogOpen(true); }}
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
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedCar && !rejectDialogOpen} onOpenChange={() => setSelectedCar(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Car Listing Details</DialogTitle>
          </DialogHeader>
          
          {selectedCar && (
            <div className="space-y-4">
              {selectedCar.images && selectedCar.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedCar.images.map((img, i) => (
                    <img key={i} src={img.image_url} alt={img.image_type} className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              <div>
                <p className="text-2xl font-bold">{selectedCar.brand} {selectedCar.model}</p>
                <p className="text-muted-foreground">{selectedCar.variant}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Year</p>
                  <p className="font-medium">{selectedCar.year_of_purchase}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">KM Driven</p>
                  <p className="font-medium">{selectedCar.km_driven.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fuel Type</p>
                  <p className="font-medium">{selectedCar.fuel_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transmission</p>
                  <p className="font-medium">{selectedCar.transmission}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Expected Price</p>
                <p className="text-2xl font-bold">₹{(selectedCar.expected_price / 100000).toFixed(2)} Lakh</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Location</p>
                <p className="font-medium">{selectedCar.location}</p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-muted-foreground text-sm">Seller Details</p>
                <p className="font-medium">{selectedCar.profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedCar.profile?.email}</p>
                <p className="text-sm text-muted-foreground">{selectedCar.profile?.phone}</p>
              </div>

              {selectedCar.verification_status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setRejectDialogOpen(true); }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedCar)}
                    disabled={processing}
                  >
                    Approve Listing
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
            <DialogTitle>Reject Car Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection. This will be shown to the seller.
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

export default AdminVerifyCarsPage;