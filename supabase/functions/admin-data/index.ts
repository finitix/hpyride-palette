import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security code for admin registration - stored server-side only
const ADMIN_SECURITY_CODE = "HpyRide.Com@2026";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, adminEmail, adminPassword, data, securityCode, name } = await req.json();
    
    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Handle admin signup separately (doesn't require existing credentials)
    if (action === 'admin_signup') {
      if (!adminEmail || !adminPassword || !securityCode || !name) {
        return new Response(
          JSON.stringify({ error: 'All fields are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify security code server-side
      if (securityCode !== ADMIN_SECURITY_CODE) {
        return new Response(
          JSON.stringify({ error: 'Invalid security code' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if admin already exists
      const { data: existingAdmin } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('email', adminEmail)
        .single();

      if (existingAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin with this email already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create new admin with hashed password
      const { data: newAdmin, error: createError } = await supabaseAdmin
        .rpc('create_admin_user', {
          _email: adminEmail,
          _password: adminPassword,
          _name: name,
          _role: 'admin'
        });

      if (createError) {
        console.error('Create admin error:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create admin account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Admin account created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For other actions, require authentication
    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    let result;

    switch (action) {
      case 'verify_login': {
        // Just return the authenticated admin info
        result = { admin: adminUser };
        break;
      }

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

        // Send notification to user
        await supabaseAdmin.from('notifications').insert({
          user_id: data.user_id,
          title: '✅ Identity Verified!',
          body: 'Congratulations! Your identity has been verified. You can now access all HpyRide features.',
          type: 'verification_approved',
          data: { verification_id: data.id }
        });
        
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

        // Send notification to user
        await supabaseAdmin.from('notifications').insert({
          user_id: data.user_id,
          title: '❌ Verification Rejected',
          body: `Your identity verification was rejected. Reason: ${data.reason || 'No reason provided'}. Please resubmit with valid documents.`,
          type: 'verification_rejected',
          data: { verification_id: data.id, reason: data.reason }
        });

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
        // Get ride details first
        const { data: rideData } = await supabaseAdmin
          .from('rides')
          .select('user_id, pickup_location, drop_location')
          .eq('id', data.id)
          .single();

        const { error } = await supabaseAdmin
          .from('rides')
          .update({ 
            verification_status: 'verified',
            status: 'published'
          })
          .eq('id', data.id);
        
        if (error) throw error;

        // Send notification to ride owner
        if (rideData?.user_id) {
          await supabaseAdmin.from('notifications').insert({
            user_id: rideData.user_id,
            title: '🎉 Ride Published!',
            body: `Your ride from ${rideData.pickup_location} to ${rideData.drop_location} has been verified and published.`,
            type: 'ride_approved',
            data: { ride_id: data.id }
          });
        }

        result = { success: true };
        break;
      }

      case 'reject_ride': {
        // Get ride details first
        const { data: rideData } = await supabaseAdmin
          .from('rides')
          .select('user_id, pickup_location, drop_location')
          .eq('id', data.id)
          .single();

        const { error } = await supabaseAdmin
          .from('rides')
          .update({ 
            verification_status: 'rejected',
            rejection_reason: data.reason
          })
          .eq('id', data.id);
        
        if (error) throw error;

        // Send notification to ride owner
        if (rideData?.user_id) {
          await supabaseAdmin.from('notifications').insert({
            user_id: rideData.user_id,
            title: '❌ Ride Rejected',
            body: `Your ride from ${rideData.pickup_location} to ${rideData.drop_location} was rejected. Reason: ${data.reason || 'No reason provided'}`,
            type: 'ride_rejected',
            data: { ride_id: data.id, reason: data.reason }
          });
        }

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
        const [rides, users, pendingVerifications, vehicles, cars, bookings] = await Promise.all([
          supabaseAdmin.from('rides').select('id, status, created_at', { count: 'exact' }),
          supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
          supabaseAdmin.from('user_verifications').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabaseAdmin.from('vehicles').select('id', { count: 'exact' }),
          supabaseAdmin.from('pre_owned_cars').select('id', { count: 'exact' }),
          supabaseAdmin.from('bookings').select('id, status, created_at', { count: 'exact' }),
        ]);

        const pendingRides = await supabaseAdmin
          .from('rides')
          .select('id', { count: 'exact' })
          .eq('verification_status', 'pending');

        const pendingCars = await supabaseAdmin
          .from('pre_owned_cars')
          .select('id', { count: 'exact' })
          .eq('verification_status', 'pending');

        const completedRides = await supabaseAdmin
          .from('rides')
          .select('id', { count: 'exact' })
          .eq('status', 'completed');

        // Get daily stats for charts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentRides } = await supabaseAdmin
          .from('rides')
          .select('id, created_at')
          .gte('created_at', sevenDaysAgo.toISOString());

        const { data: recentUsers } = await supabaseAdmin
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', sevenDaysAgo.toISOString());

        // Group by day
        const dailyRides: { [key: string]: number } = {};
        const dailyUsers: { [key: string]: number } = {};
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayKey = date.toISOString().split('T')[0];
          dailyRides[dayKey] = 0;
          dailyUsers[dayKey] = 0;
        }

        (recentRides || []).forEach((r: any) => {
          const dayKey = r.created_at.split('T')[0];
          if (dailyRides[dayKey] !== undefined) dailyRides[dayKey]++;
        });

        (recentUsers || []).forEach((u: any) => {
          const dayKey = u.created_at.split('T')[0];
          if (dailyUsers[dayKey] !== undefined) dailyUsers[dayKey]++;
        });

        const chartData = {
          dailyRides: Object.entries(dailyRides).map(([date, count]) => ({
            date,
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            count
          })),
          dailyUsers: Object.entries(dailyUsers).map(([date, count]) => ({
            date,
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            count
          })),
        };

        result = {
          totalRides: rides.count || 0,
          completedRides: completedRides.count || 0,
          totalUsers: users.count || 0,
          pendingVerifications: pendingVerifications.count || 0,
          totalVehicles: vehicles.count || 0,
          totalCars: cars.count || 0,
          totalBookings: bookings.count || 0,
          pendingRides: pendingRides.count || 0,
          pendingCars: pendingCars.count || 0,
          chartData,
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

      case 'get_admin_notifications': {
        const { data: notifications, error } = await supabaseAdmin
          .from('admin_notifications')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        result = notifications;
        break;
      }

      case 'send_notification_to_all': {
        // Get all user profiles
        const { data: profiles, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id');
        
        if (profileError) throw profileError;

        // Create admin notification record
        const { data: adminNotif, error: adminError } = await supabaseAdmin
          .from('admin_notifications')
          .insert({
            title: data.title,
            message: data.message,
            created_by: adminUser.id,
            target_audience: 'all',
          })
          .select()
          .single();

        if (adminError) throw adminError;

        // Create notification for each user
        const notifications = (profiles || []).map((p: any) => ({
          user_id: p.user_id,
          title: data.title,
          body: data.message,
          type: 'admin_notification',
          is_read: false,
          data: { admin_notification_id: adminNotif.id },
        }));

        if (notifications.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('notifications')
            .insert(notifications);
          
          if (insertError) throw insertError;
        }

        result = { success: true, sent_to: notifications.length };
        break;
      }

      case 'delete_admin_notification': {
        const { error } = await supabaseAdmin
          .from('admin_notifications')
          .delete()
          .eq('id', data.id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'get_bookings': {
        const { data: bookingsData, error } = await supabaseAdmin
          .from('bookings')
          .select(`
            *,
            rides (pickup_location, drop_location, ride_date, ride_time)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        const bookingsWithProfiles = await Promise.all(
          (bookingsData || []).map(async (b: any) => {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('full_name, email, phone')
              .eq('user_id', b.user_id)
              .single();
            return { ...b, profile };
          })
        );
        
        result = bookingsWithProfiles;
        break;
      }

      case 'confirm_booking': {
        const { data: bookingData } = await supabaseAdmin
          .from('bookings')
          .select('user_id, ride_id, rides(pickup_location, drop_location)')
          .eq('id', data.id)
          .single();

        const { error } = await supabaseAdmin
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', data.id);
        
        if (error) throw error;

        // Notify passenger
        if (bookingData?.user_id) {
          const ride = bookingData.rides as any;
          await supabaseAdmin.from('notifications').insert({
            user_id: bookingData.user_id,
            title: '🎉 Booking Confirmed!',
            body: `Your booking from ${ride?.pickup_location || 'pickup'} to ${ride?.drop_location || 'destination'} has been confirmed.`,
            type: 'booking_confirmed',
            data: { booking_id: data.id, ride_id: bookingData.ride_id }
          });
        }

        result = { success: true };
        break;
      }

      case 'reject_booking': {
        const { data: bookingData } = await supabaseAdmin
          .from('bookings')
          .select('user_id, ride_id, rides(pickup_location, drop_location)')
          .eq('id', data.id)
          .single();

        const { error } = await supabaseAdmin
          .from('bookings')
          .update({ status: 'rejected', rejection_reason: data.reason })
          .eq('id', data.id);
        
        if (error) throw error;

        // Notify passenger
        if (bookingData?.user_id) {
          const ride = bookingData.rides as any;
          await supabaseAdmin.from('notifications').insert({
            user_id: bookingData.user_id,
            title: '❌ Booking Rejected',
            body: `Your booking from ${ride?.pickup_location || 'pickup'} to ${ride?.drop_location || 'destination'} was rejected. ${data.reason ? `Reason: ${data.reason}` : ''}`,
            type: 'booking_rejected',
            data: { booking_id: data.id, ride_id: bookingData.ride_id, reason: data.reason }
          });
        }

        result = { success: true };
        break;
      }

      case 'notify_booking_request': {
        // Send notification to driver about new booking request
        const { data: bookingData } = await supabaseAdmin
          .from('bookings')
          .select('driver_id, passenger_name, seats_booked, rides(pickup_location, drop_location)')
          .eq('id', data.id)
          .single();

        if (bookingData?.driver_id) {
          const ride = bookingData.rides as any;
          await supabaseAdmin.from('notifications').insert({
            user_id: bookingData.driver_id,
            title: '🚗 New Booking Request!',
            body: `${bookingData.passenger_name} wants to book ${bookingData.seats_booked} seat(s) for your ride from ${ride?.pickup_location || 'pickup'} to ${ride?.drop_location || 'destination'}.`,
            type: 'booking_request',
            data: { booking_id: data.id }
          });
        }

        result = { success: true };
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
