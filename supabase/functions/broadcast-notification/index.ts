import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  title: string;
  body: string;
  targetAudience?: 'all' | 'drivers' | 'riders';
  data?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { title, body, targetAudience = 'all', data } = await req.json() as BroadcastRequest;

    console.log(`Broadcasting notification: ${title} to ${targetAudience}`);

    // Get all users with FCM tokens
    let query = supabase
      .from("profiles")
      .select("user_id, fcm_token")
      .not("fcm_token", "is", null);

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch profiles" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Found ${profiles?.length || 0} users with FCM tokens`);

    // Save notification for all users
    const notificationInserts = profiles?.map((profile) => ({
      user_id: profile.user_id,
      type: 'promotional',
      title,
      body,
      data: data || {},
      is_read: false,
    })) || [];

    if (notificationInserts.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationInserts);

      if (insertError) {
        console.error("Error saving notifications:", insertError);
      }
    }

    // Send FCM notifications if server key is available
    if (fcmServerKey && profiles && profiles.length > 0) {
      const fcmTokens = profiles
        .filter((p) => p.fcm_token)
        .map((p) => p.fcm_token);

      if (fcmTokens.length > 0) {
        // Send to multiple devices
        const fcmPayload = {
          registration_ids: fcmTokens.slice(0, 1000), // FCM limit
          notification: {
            title,
            body,
            sound: "default",
            android_channel_id: "hpyride_notifications",
          },
          data: {
            ...data,
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
          },
          android: {
            priority: "high",
          },
        };

        const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${fcmServerKey}`,
          },
          body: JSON.stringify(fcmPayload),
        });

        const fcmResult = await fcmResponse.json();
        console.log("FCM Broadcast Result:", JSON.stringify(fcmResult));

        return new Response(
          JSON.stringify({
            success: true,
            totalUsers: profiles.length,
            fcmSent: fcmTokens.length,
            fcmResult,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalUsers: profiles?.length || 0,
        message: "Notifications saved to database",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error broadcasting notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
