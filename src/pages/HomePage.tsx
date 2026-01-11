import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TopHeader from "@/components/TopHeader";
import ServiceCarousel from "@/components/ServiceCarousel";
import OurServices from "@/components/OurServices";
import BottomNavigation from "@/components/BottomNavigation";
import { InlineBannerAd } from "@/components/ads/MontagAds";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-gentle text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />
      
      {/* Service Carousel with floating card */}
      <ServiceCarousel />
      
      {/* Spacer for the floating card - 150px */}
      <div className="h-[150px]" />
      
      {/* Our Services 2x2 Grid */}
      <OurServices />
      
      {/* Banner Ad after services */}
      <div className="px-4">
        <InlineBannerAd />
      </div>
      
      {/* Footer */}
      <footer className="text-center py-8 px-4">
        <p className="text-lg font-bold text-foreground">#HpyRide.Com</p>
        <p className="text-sm text-muted-foreground mt-1">Made for INDIA</p>
        <p className="text-xs text-muted-foreground mt-1">Built for every journey</p>
      </footer>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
