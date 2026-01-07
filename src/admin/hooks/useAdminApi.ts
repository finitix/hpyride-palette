import { supabase } from "@/integrations/supabase/client";

export const useAdminApi = () => {
  const getAdminCredentials = () => {
    const storedAdmin = localStorage.getItem('adminUser');
    if (!storedAdmin) return null;
    const admin = JSON.parse(storedAdmin);
    const storedPassword = localStorage.getItem('adminPassword');
    return { email: admin.email, password: storedPassword };
  };

  const callAdminApi = async (action: string, data?: any) => {
    const credentials = getAdminCredentials();
    if (!credentials) {
      throw new Error('Not authenticated as admin');
    }

    const { data: result, error } = await supabase.functions.invoke('admin-data', {
      body: {
        action,
        adminEmail: credentials.email,
        adminPassword: credentials.password,
        data
      }
    });

    if (error) {
      throw error;
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  };

  return { callAdminApi };
};
