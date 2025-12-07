import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import SplashScreen from "@/pages/SplashScreen";
import AuthPage from "@/pages/AuthPage";
import WelcomePage from "@/pages/WelcomePage";
import HomePage from "@/pages/HomePage";
import RideSharingPage from "@/pages/RideSharingPage";
import BookRidePage from "@/pages/BookRidePage";
import AvailableRidesPage from "@/pages/AvailableRidesPage";
import BookingPage from "@/pages/BookingPage";
import PostRidePage from "@/pages/PostRidePage";
import MyRidesPage from "@/pages/MyRidesPage";
import ChatPage from "@/pages/ChatPage";
import NavigationPage from "@/pages/NavigationPage";
import CarRentalsPage from "@/pages/CarRentalsPage";
import PreOwnedPage from "@/pages/PreOwnedPage";
import DriverPoolPage from "@/pages/DriverPoolPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/ride-sharing" element={<RideSharingPage />} />
            <Route path="/book-ride" element={<BookRidePage />} />
            <Route path="/available-rides" element={<AvailableRidesPage />} />
            <Route path="/booking/:rideId" element={<BookingPage />} />
            <Route path="/post-ride" element={<PostRidePage />} />
            <Route path="/my-rides" element={<MyRidesPage />} />
            <Route path="/chat/:bookingId" element={<ChatPage />} />
            <Route path="/navigation/:bookingId" element={<NavigationPage />} />
            <Route path="/car-rentals" element={<CarRentalsPage />} />
            <Route path="/pre-owned" element={<PreOwnedPage />} />
            <Route path="/driver-pool" element={<DriverPoolPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
