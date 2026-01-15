import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TopHeader from "@/components/TopHeader";
import ServiceCarousel from "@/components/ServiceCarousel";
import OurServices from "@/components/OurServices";
import MainLayout from "@/components/layout/MainLayout";
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
    <MainLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        {/* Mobile Header - hidden on desktop */}
        <div className="lg:hidden">
          <TopHeader />
        </div>
        
        {/* Desktop Header */}
        <div className="hidden lg:block sticky top-0 z-30 bg-background border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome to HpyRide</h1>
              <p className="text-sm text-muted-foreground">Find your perfect ride today</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/notifications')}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <span className="sr-only">Notifications</span>
                🔔
              </button>
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="lg:max-w-5xl lg:mx-auto">
          {/* Service Carousel with floating card */}
          <ServiceCarousel />
          
          {/* Spacer for the floating card */}
          <div className="h-[150px] lg:h-[180px]" />
          
          {/* Our Services Grid */}
          <OurServices />
          
          {/* Banner Ad after services */}
          <div className="px-4 lg:px-6">
            <InlineBannerAd />
          </div>
          
          {/* Footer */}
          <footer className="text-center py-8 px-4 lg:py-12">
            <p className="text-lg font-bold text-foreground">#HpyRide.Com</p>
            <p className="text-sm text-muted-foreground mt-1">Made for INDIA</p>
            <p className="text-xs text-muted-foreground mt-1">Built for every journey</p>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
