import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
async function addToGoogleCalendar(booking: any, refreshToken: string) {
  
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = await tokenRes.json();
  
  if (!tokenData.access_token) throw new Error("Failed to get access token");

  const start = new Date(booking.booking_datetime);
  const end = new Date(start.getTime() + booking.duration_minutes * 60000);

  const event = {
    summary: `${booking.service_name} — ${booking.customer_name}`,
    description: `Phone: ${booking.customer_phone}\nEmail: ${booking.customer_email}`,
    start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
  };

  
  const calRes = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const calData = await calRes.json();
  

  if (!calRes.ok) {
    throw new Error(`Google Calendar error: ${JSON.stringify(calData)}`);
  }

  return calData;
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

    if (booking.staff_refresh_token) {
      await addToGoogleCalendar(booking, booking.staff_refresh_token);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});