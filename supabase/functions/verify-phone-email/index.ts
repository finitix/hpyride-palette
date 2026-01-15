import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userJsonUrl, userData } = await req.json();

    if (!userJsonUrl) {
      return new Response(
        JSON.stringify({ error: 'User JSON URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user data from phone.email
    console.log('Fetching user data from phone.email:', userJsonUrl);
    
    const phoneEmailResponse = await fetch(userJsonUrl);
    
    if (!phoneEmailResponse.ok) {
      console.error('Failed to fetch phone.email data:', phoneEmailResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to verify phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const phoneEmailData = await phoneEmailResponse.json();
    console.log('Phone.email response:', JSON.stringify(phoneEmailData));

    // Extract phone number from the response
    const phoneNumber = phoneEmailData.user_phone_number || phoneEmailData.phone_number;
    const countryCode = phoneEmailData.user_country_code || phoneEmailData.country_code || '+91';
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number not found in verification response' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber}`;
    console.log('Verified phone number:', formattedPhone);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists with this phone number
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    // If user exists, return their info for sign-in
    if (existingProfile && existingProfile.email) {
      console.log('Existing user found:', existingProfile.email);
      
      return new Response(
        JSON.stringify({ 
          verified: true, 
          phoneNumber: formattedPhone,
          isNewUser: false,
          email: existingProfile.email,
          message: 'Please sign in with your email and password'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If userData is provided, create a new user
    if (userData && userData.email && userData.password && userData.fullName) {
      console.log('Creating new user with email:', userData.email);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
          phone: formattedPhone,
          gender: userData.gender || null,
        }
      });

      if (authError) {
        console.error('Error creating user:', authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create profile entry
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: userData.email,
          phone: formattedPhone,
          full_name: userData.fullName,
          gender: userData.gender || null,
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      }

      return new Response(
        JSON.stringify({ 
          verified: true, 
          phoneNumber: formattedPhone,
          isNewUser: false,
          userCreated: true,
          email: userData.email,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Phone verified but user needs to register
    return new Response(
      JSON.stringify({ 
        verified: true, 
        phoneNumber: formattedPhone,
        isNewUser: true,
        needsRegistration: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-phone-email:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
