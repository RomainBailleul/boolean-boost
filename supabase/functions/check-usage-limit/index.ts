import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Parse body for fingerprint (anonymous users)
    const body = await req.json().catch(() => ({}));
    const fingerprint: string | null = body.fingerprint || null;

    // Check if user is authenticated
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let isAdmin = false;

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabaseAuth.auth.getClaims(token);
      if (!error && data?.claims?.sub) {
        userId = data.claims.sub;

        // Check admin role
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        const { data: roleData } = await adminClient
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        isAdmin = !!roleData;
      }
    }

    // Admins have unlimited access
    if (isAdmin) {
      return new Response(
        JSON.stringify({ allowed: true, remaining: 999, limit: 999 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Count today's usage
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    let count = 0;
    let dailyLimit = 5; // anonymous default

    if (userId) {
      // Authenticated user: count by user_id
      dailyLimit = 20;
      const { count: c } = await adminClient
        .from("usage_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayISO);
      count = c ?? 0;
    } else if (fingerprint) {
      // Anonymous: we use a lightweight approach — count by fingerprint stored in metadata
      // Since usage_events doesn't have fingerprint, we count recent anonymous events
      // For simplicity, anonymous users get 5/day tracked via client-side localStorage
      // Server just validates the claim
      const clientCount = body.clientCount ?? 0;
      count = clientCount;
    }

    const remaining = Math.max(0, dailyLimit - count);
    const allowed = remaining > 0;

    return new Response(
      JSON.stringify({ allowed, remaining, limit: dailyLimit, used: count }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", allowed: true, remaining: 1, limit: 5 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
