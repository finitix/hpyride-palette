import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, title, body, data, imageUrl } = await req.json() as PushNotificationRequest;

    console.log(`Sending push notification to user: ${userId}`);
    console.log(`Title: ${title}, Body: ${body}`);

    // Get user's FCM token from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("fcm_token")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "User profile not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const fcmToken = profile?.fcm_token;

    if (!fcmToken) {
      console.log("No FCM token found for user, notification saved to database only");
      return new Response(
        JSON.stringify({ success: true, message: "No FCM token, notification saved to database" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If FCM server key is available, send push notification
    if (fcmServerKey) {
      const fcmPayload = {
        to: fcmToken,
        notification: {
          title,
          body,
          image: imageUrl,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
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
          notification: {
            channel_id: "hpyride_notifications",
            sound: "default",
            default_vibrate_timings: true,
            default_light_settings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      console.log("Sending FCM request with payload:", JSON.stringify(fcmPayload));

      const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify(fcmPayload),
      });

      const fcmResult = await fcmResponse.json();
      console.log("FCM Response:", JSON.stringify(fcmResult));

      if (!fcmResponse.ok) {
        console.error("FCM send failed:", fcmResult);
        return new Response(
          JSON.stringify({ success: false, error: "FCM send failed", details: fcmResult }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Check if token is invalid and remove it
      if (fcmResult.failure > 0 && fcmResult.results?.[0]?.error === "InvalidRegistration") {
        console.log("Invalid FCM token, removing from profile");
        await supabase
          .from("profiles")
          .update({ fcm_token: null })
          .eq("user_id", userId);
      }

      return new Response(
        JSON.stringify({ success: true, fcmResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No FCM server key, return success (notification saved to database)
    console.log("FCM_SERVER_KEY not configured, notification saved to database only");
    return new Response(
      JSON.stringify({ success: true, message: "Notification saved, FCM not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error sending push notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
