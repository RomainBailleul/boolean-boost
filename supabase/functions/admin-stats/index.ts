import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller identity
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserId = userData.user.id;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const { data: roleCheck } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get total user count
    const { data: allUsers, error: listErr } = await serviceClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    const totalUsers = listErr ? 0 : (allUsers as any)?.total ?? 0;

    // Get users created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get all users to compute signups per week and active today
    // We paginate to get created_at and last_sign_in_at
    let allUsersList: Array<{ created_at: string; last_sign_in_at: string | null }> = [];
    let page = 1;
    const perPage = 1000;
    let hasMore = true;

    while (hasMore && page <= 20) {
      const { data: batch } = await serviceClient.auth.admin.listUsers({
        page,
        perPage,
      });
      const users = batch?.users || [];
      allUsersList.push(
        ...users.map((u: any) => ({
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        }))
      );
      hasMore = users.length === perPage;
      page++;
    }

    // Active today (last_sign_in_at >= todayStart)
    const activeToday = allUsersList.filter((u) => {
      if (!u.last_sign_in_at) return false;
      return new Date(u.last_sign_in_at) >= todayStart;
    }).length;

    // Weekly signups for last 12 weeks
    const weeklySignups: Array<{ week: string; count: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      // Set to Monday
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = allUsersList.filter((u) => {
        const d = new Date(u.created_at);
        return d >= weekStart && d < weekEnd;
      }).length;

      const label = `${String(weekStart.getDate()).padStart(2, "0")}/${String(weekStart.getMonth() + 1).padStart(2, "0")}`;
      weeklySignups.push({ week: label, count });
    }

    return new Response(
      JSON.stringify({ totalUsers, activeToday, weeklySignups }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
