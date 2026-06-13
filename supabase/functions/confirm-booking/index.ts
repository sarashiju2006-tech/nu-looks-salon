import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const ADMIN_REFRESH_TOKEN = Deno.env.get("ADMIN_GOOGLE_REFRESH_TOKEN");
const ADMIN_CALENDAR_ID = Deno.env.get("ADMIN_CALENDAR_ID");

async function getAdminAccessToken() {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: ADMIN_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("Failed to get admin access token");
  return tokenData.access_token;
}

async function createCalendarEvent(booking: any, accessToken: string) {
  const start = new Date(booking.booking_datetime);
  const end = new Date(start.getTime() + booking.duration_minutes * 60000);

  const attendees = [];
  if (booking.customer_email) attendees.push({ email: booking.customer_email });
  if (booking.stylist_email) attendees.push({ email: booking.stylist_email });

  const event = {
    summary: `${booking.service_name} — ${booking.customer_name}`,
    description: `Stylist: ${booking.staff_name}\nPhone: ${booking.customer_phone}\nEmail: ${booking.customer_email || 'N/A'}`,
    start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
    attendees,
    sendUpdates: "all",
  };

  const calRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ADMIN_CALENDAR_ID!)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const calData = await calRes.json();
  if (!calRes.ok) throw new Error(`Google Calendar error: ${JSON.stringify(calData)}`);
  return calData;
}

async function deleteCalendarEvent(eventId: string, accessToken: string) {
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ADMIN_CALENDAR_ID!)}/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const booking = await req.json();
    const accessToken = await getAdminAccessToken();

    // Delete old event if reassigning or rescheduling
    if (booking.old_google_event_id) {
      await deleteCalendarEvent(booking.old_google_event_id, accessToken);
    }

    const calEvent = await createCalendarEvent(booking, accessToken);
    const googleEventId = calEvent.id;

    // Save google_event_id back to booking
    if (googleEventId && booking.id) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("bookings").update({ google_event_id: googleEventId }).eq("id", booking.id);
    }

    return new Response(JSON.stringify({ success: true, googleEventId }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});