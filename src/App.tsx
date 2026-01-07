import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/admin/contexts/AdminAuthContext";
import PushNotificationProvider from "@/components/PushNotificationProvider";
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
import DriverPoolPage from "@/pages/DriverPoolPage";
import ProfilePage from "@/pages/ProfilePage";
import VerificationPage from "@/pages/VerificationPage";
import WalletPage from "@/pages/WalletPage";
import NotFound from "@/pages/NotFound";
import NotificationsPage from "@/pages/NotificationsPage";

// Pre-owned car pages
import PreOwnedHomePage from "@/pages/preowned/PreOwnedHomePage";
import ListCarPage from "@/pages/preowned/ListCarPage";
import ListingSuccessPage from "@/pages/preowned/ListingSuccessPage";
import CarDetailsPage from "@/pages/preowned/CarDetailsPage";
import ShowInterestPage from "@/pages/preowned/ShowInterestPage";
import MyListingsPage from "@/pages/preowned/MyListingsPage";
import MyInterestsPage from "@/pages/preowned/MyInterestsPage";
import CarChatPage from "@/pages/preowned/CarChatPage";
import FiltersPage from "@/pages/preowned/FiltersPage";
import ReportListingPage from "@/pages/preowned/ReportListingPage";

// Admin pages (separate admin website)
import AdminLoginPage from "@/admin/pages/LoginPage";
import AdminDashboardPage from "@/admin/pages/DashboardPage";
import AdminVerifyUsersPage from "@/admin/pages/VerifyUsersPage";
import AdminVerifyRidesPage from "@/admin/pages/VerifyRidesPage";
import AdminVerifyCarsPage from "@/admin/pages/VerifyCarsPage";
import AdminUsersPage from "@/admin/pages/UsersPage";
import AdminVehiclesPage from "@/admin/pages/VehiclesPage";
import AdminSettingsPage from "@/admin/pages/SettingsPage";
import AdminNotificationsPage from "@/admin/pages/NotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
        <PushNotificationProvider>
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
                <Route path="/driver-pool" element={<DriverPoolPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                
                {/* Pre-owned car routes */}
                <Route path="/pre-owned" element={<PreOwnedHomePage />} />
                <Route path="/pre-owned/list" element={<ListCarPage />} />
                <Route path="/pre-owned/success" element={<ListingSuccessPage />} />
                <Route path="/pre-owned/car/:carId" element={<CarDetailsPage />} />
                <Route path="/pre-owned/interest/:carId" element={<ShowInterestPage />} />
                <Route path="/pre-owned/my-listings" element={<MyListingsPage />} />
                <Route path="/pre-owned/my-interests" element={<MyInterestsPage />} />
                <Route path="/pre-owned/chat/:carId" element={<CarChatPage />} />
                <Route path="/pre-owned/filters" element={<FiltersPage />} />
                <Route path="/pre-owned/report/:carId" element={<ReportListingPage />} />

                {/* Admin routes (separate admin website) */}
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/verify-users" element={<AdminVerifyUsersPage />} />
                <Route path="/admin/verify-rides" element={<AdminVerifyRidesPage />} />
                <Route path="/admin/verify-cars" element={<AdminVerifyCarsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PushNotificationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
