import { ReactNode } from "react";
import DesktopSidebar from "./DesktopSidebar";
import BottomNavigation from "@/components/BottomNavigation";

interface MainLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}

/**
 * Main layout wrapper that provides:
 * - Desktop sidebar navigation (hidden on mobile)
 * - Mobile bottom navigation (hidden on desktop)
 * - Proper content offset for sidebar
 */
const MainLayout = ({ 
  children, 
  showNav = true,
  className = ""
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {showNav && <DesktopSidebar />}
      
      {/* Main Content */}
      <main className={`
        ${showNav ? "lg:ml-64" : ""}
        min-h-screen
        ${className}
      `}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showNav && (
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
