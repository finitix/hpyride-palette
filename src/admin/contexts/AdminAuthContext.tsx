import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored admin session
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Verify admin credentials using secure edge function
      const { data: result, error } = await supabase.functions.invoke('admin-data', {
        body: {
          action: 'verify_login',
          adminEmail: email,
          adminPassword: password
        }
      });

      if (error) {
        console.error('Admin auth error:', error);
        return { error: "Authentication failed" };
      }

      if (result?.error) {
        return { error: result.error };
      }

      if (!result?.admin) {
        return { error: "Invalid credentials" };
      }

      const adminUser: AdminUser = {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role,
      };

      setAdmin(adminUser);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      localStorage.setItem('adminPassword', password); // Store for API calls
      
      return { error: null };
    } catch (err: any) {
      console.error('Admin sign in error:', err);
      return { error: "Something went wrong" };
    }
  };

  const signOut = () => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminPassword');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
