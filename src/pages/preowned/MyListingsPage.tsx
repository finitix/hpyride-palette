import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import BottomNavigation from "@/components/BottomNavigation";

interface CarListing {
  id: string;
  brand: string;
  model: string;
  expected_price: number;
  status: string;
  images: { image_url: string }[];
}

const MyListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, activeTab]);

  const fetchListings = async () => {
    setLoading(true);
    const status = activeTab === 'active' ? 'active' : 'sold';
    
    const { data, error } = await supabase
      .from('pre_owned_cars')
      .select('*, images:car_images(image_url)')
      .eq('user_id', user?.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (!error) {
      setListings(data as CarListing[] || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    const { error } = await supabase
      .from('pre_owned_cars')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete listing");
    } else {
      toast.success("Listing deleted");
      fetchListings();
    }
  };

  const handleMarkSold = async (id: string) => {
    const { error } = await supabase
      .from('pre_owned_cars')
      .update({ status: 'sold' })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update listing");
    } else {
      toast.success("Marked as sold");
      fetchListings();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">My Listings</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
          }`}
        >
          Active Listings
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sold' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
          }`}
        >
          Sold Cars
        </button>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No listings found</p>
            {activeTab === 'active' && (
              <Button variant="outline" className="mt-4" onClick={() => navigate("/pre-owned/list")}>
                List Your Car
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((car) => (
              <div key={car.id} className="bg-card rounded-xl overflow-hidden shadow-md">
                <div className="flex">
                  <div className="w-28 h-24 bg-muted flex-shrink-0">
                    {car.images?.[0] && (
                      <img src={car.images[0].image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <p className="font-semibold">{car.brand} {car.model}</p>
                    <p className="text-lg font-bold">₹{(car.expected_price / 100000).toFixed(1)} Lakh</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                      car.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      {car.status === 'active' ? 'Active' : 'Sold'}
                    </span>
                  </div>
                </div>
                {activeTab === 'active' && (
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => navigate(`/pre-owned/edit/${car.id}`)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm border-r border-border"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleMarkSold(car.id)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm border-r border-border"
                    >
                      Mark Sold
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyListingsPage;
