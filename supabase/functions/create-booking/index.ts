import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    
    

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const booking = await req.json();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") ||
               "unknown";

    const today = new Date().toISOString().split("T")[0]
    const startOfDay = `${today}T00:00:00+05:30`
    const endOfDay = `${today}T23:59:59+05:30`

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_ip", ip)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)

    if (count && count >= 2) {
      return new Response(
        JSON.stringify({ error: "Too many bookings from this device today. Please call us to book." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { service_ids, ...bookingData } = booking
    const { data, error } = await supabase
      .from("bookings")
      .insert({ ...bookingData, customer_ip: ip })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error.message)
      throw error;
    }

    if (booking.service_ids && booking.service_ids.length > 0) {
      await supabase.from("booking_services").insert(
        booking.service_ids.map((sid: string) => ({
          booking_id: data.id,
          service_id: sid,
        }))
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-booking error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});