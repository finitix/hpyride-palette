import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";

interface Interest {
  id: string;
  car_id: string;
  seller_viewed: boolean;
  status: string;
  created_at: string;
  car: {
    brand: string;
    model: string;
    expected_price: number;
    images: { image_url: string }[];
  };
}

const MyInterestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInterests();
    }
  }, [user]);

  const fetchInterests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('car_interests')
      .select(`
        *,
        car:pre_owned_cars(brand, model, expected_price, images:car_images(image_url))
      `)
      .eq('buyer_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInterests(data as unknown as Interest[]);
    }
    setLoading(false);
  };

  const getStatusLabel = (interest: Interest) => {
    if (interest.status === 'contacted') return { label: 'Seller Contacted', color: 'bg-green-500/20 text-green-600' };
    if (interest.seller_viewed) return { label: 'Seller Viewed', color: 'bg-blue-500/20 text-blue-600' };
    return { label: 'Not Viewed Yet', color: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">My Interests</h1>
      </header>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No interests yet</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/pre-owned")}>
              Browse Cars
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {interests.map((interest) => {
              const status = getStatusLabel(interest);
              return (
                <div key={interest.id} className="bg-card rounded-xl overflow-hidden shadow-md">
                  <div className="flex">
                    <div className="w-28 h-24 bg-muted flex-shrink-0">
                      {interest.car?.images?.[0] && (
                        <img src={interest.car.images[0].image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3 flex-1">
                      <p className="font-semibold">{interest.car?.brand} {interest.car?.model}</p>
                      <p className="text-lg font-bold">₹{((interest.car?.expected_price || 0) / 100000).toFixed(1)} Lakh</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => navigate(`/pre-owned/car/${interest.car_id}`)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm border-r border-border"
                    >
                      <Eye className="w-4 h-4" />
                      View Car
                    </button>
                    <button
                      onClick={() => navigate(`/pre-owned/chat/${interest.car_id}`)}
                      className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyInterestsPage;
