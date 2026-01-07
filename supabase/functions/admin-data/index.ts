import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, adminEmail, adminPassword, data } = await req.json();
    
    // Validate required fields
    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify admin credentials using secure database function
    const { data: adminResult, error: adminError } = await supabaseAdmin
      .rpc('verify_admin_password', {
        _email: adminEmail,
        _password: adminPassword
      });

    if (adminError) {
      console.error('Admin verification error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminResult || adminResult.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminUser = adminResult[0];
    console.log('Admin authenticated:', adminUser.email, 'Action:', action);

    let result;

    switch (action) {
      case 'get_verifications': {
        const query = supabaseAdmin
          .from('user_verifications')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data?.status === 'pending') {
          query.eq('status', 'pending');
        }
        
        const { data: verifications, error } = await query;
        if (error) throw error;

        // Get profiles for each verification
        const verificationsWithProfiles = await Promise.all(
          (verifications || []).map(async (v: any) => {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('email, phone, full_name')
              .eq('user_id', v.user_id)
              .single();
            return { ...v, profile };
          })
        );
        
        result = verificationsWithProfiles;
        break;
      }

      case 'approve_verification': {
        const { error } = await supabaseAdmin
          .from('user_verifications')
          .update({ 
            status: 'verified',
            reviewed_by: adminUser.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        if (error) throw error;

        // Update profile is_verified
        await supabaseAdmin
          .from('profiles')
          .update({ is_verified: true })
          .eq('user_id', data.user_id);
        
        result = { success: true };
        break;
      }

      case 'reject_verification': {
        const { error } = await supabaseAdmin
          .from('user_verifications')
          .update({ 
            status: 'rejected',
            rejection_reason: data.reason,
            reviewed_by: adminUser.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'get_rides': {
        let query = supabaseAdmin
          .from('rides')
          .select('*, vehicle:vehicles(name, number, category, front_image_url)')
          .order('created_at', { ascending: false });
        
        if (data?.status === 'pending') {
          query = query.eq('verification_status', 'pending');
        }
        
        const { data: rides, error } = await query;
        if (error) throw error;

        const ridesWithProfiles = await Promise.all(
          (rides || []).map(async (r: any) => {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('full_name, email, phone')
              .eq('user_id', r.user_id)
              .single();
            return { ...r, profile };
          })
        );
        
        result = ridesWithProfiles;
        break;
      }

      case 'approve_ride': {
        const { error } = await supabaseAdmin
          .from('rides')
          .update({ 
            verification_status: 'verified',
            status: 'published'
          })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'reject_ride': {
        const { error } = await supabaseAdmin
          .from('rides')
          .update({ 
            verification_status: 'rejected',
            rejection_reason: data.reason
          })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'get_vehicles': {
        let query = supabaseAdmin
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data?.status === 'pending') {
          query = query.eq('verification_status', 'pending');
        }
        
        const { data: vehicles, error } = await query;
        if (error) throw error;

        const vehiclesWithProfiles = await Promise.all(
          (vehicles || []).map(async (v: any) => {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('full_name, email, phone')
              .eq('user_id', v.user_id)
              .single();
            return { ...v, profile };
          })
        );
        
        result = vehiclesWithProfiles;
        break;
      }

      case 'approve_vehicle': {
        const { error } = await supabaseAdmin
          .from('vehicles')
          .update({ 
            verification_status: 'verified',
            is_verified: true
          })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'reject_vehicle': {
        const { error } = await supabaseAdmin
          .from('vehicles')
          .update({ 
            verification_status: 'rejected',
            is_verified: false
          })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'get_cars': {
        let query = supabaseAdmin
          .from('pre_owned_cars')
          .select('*, images:car_images(image_url, image_type)')
          .order('created_at', { ascending: false });
        
        if (data?.status === 'pending') {
          query = query.eq('verification_status', 'pending');
        }
        
        const { data: cars, error } = await query;
        if (error) throw error;

        const carsWithProfiles = await Promise.all(
          (cars || []).map(async (c: any) => {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('full_name, email, phone')
              .eq('user_id', c.user_id)
              .single();
            return { ...c, profile };
          })
        );
        
        result = carsWithProfiles;
        break;
      }

      case 'approve_car': {
        const { error } = await supabaseAdmin
          .from('pre_owned_cars')
          .update({ verification_status: 'verified' })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'reject_car': {
        const { error } = await supabaseAdmin
          .from('pre_owned_cars')
          .update({ 
            verification_status: 'rejected',
            rejection_reason: data.reason
          })
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'get_stats': {
        const [rides, users, pendingVerifications, vehicles, cars] = await Promise.all([
          supabaseAdmin.from('rides').select('id, status', { count: 'exact' }),
          supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
          supabaseAdmin.from('user_verifications').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabaseAdmin.from('vehicles').select('id', { count: 'exact' }),
          supabaseAdmin.from('pre_owned_cars').select('id', { count: 'exact' }),
        ]);

        const pendingRides = await supabaseAdmin
          .from('rides')
          .select('id', { count: 'exact' })
          .eq('verification_status', 'pending');

        const pendingCars = await supabaseAdmin
          .from('pre_owned_cars')
          .select('id', { count: 'exact' })
          .eq('verification_status', 'pending');

        result = {
          totalRides: rides.count || 0,
          totalUsers: users.count || 0,
          pendingVerifications: pendingVerifications.count || 0,
          totalVehicles: vehicles.count || 0,
          totalCars: cars.count || 0,
          pendingRides: pendingRides.count || 0,
          pendingCars: pendingCars.count || 0,
        };
        break;
      }

      case 'get_users': {
        const { data: profiles, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Get verification status for each user
        const usersWithVerification = await Promise.all(
          (profiles || []).map(async (p: any) => {
            const { data: verification } = await supabaseAdmin
              .from('user_verifications')
              .select('status')
              .eq('user_id', p.user_id)
              .single();
            return { ...p, verification_status: verification?.status || null };
          })
        );
        
        result = usersWithVerification;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Admin data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
