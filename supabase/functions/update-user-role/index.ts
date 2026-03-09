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

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserId = claimsData.claims.sub as string;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
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

    const { target_user_id, new_role } = await req.json();

    if (!target_user_id || !["admin", "user"].includes(new_role)) {
      return new Response(JSON.stringify({ error: "Invalid parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent self-demotion
    if (target_user_id === adminUserId && new_role !== "admin") {
      return new Response(JSON.stringify({ error: "Cannot remove your own admin role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current role
    const { data: currentRole } = await serviceClient
      .from("user_roles")
      .select("id, role")
      .eq("user_id", target_user_id)
      .eq("role", "admin")
      .maybeSingle();

    const wasAdmin = !!currentRole;

    if (new_role === "admin" && !wasAdmin) {
      // Promote: insert admin role
      const { error: insertErr } = await serviceClient
        .from("user_roles")
        .insert({ user_id: target_user_id, role: "admin" });
      if (insertErr) throw insertErr;
    } else if (new_role === "user" && wasAdmin) {
      // Demote: delete admin role
      const { error: deleteErr } = await serviceClient
        .from("user_roles")
        .delete()
        .eq("user_id", target_user_id)
        .eq("role", "admin");
      if (deleteErr) throw deleteErr;
    }

    // Log action in admin_actions
    await serviceClient.from("admin_actions").insert({
      admin_user_id: adminUserId,
      action: new_role === "admin" ? "promote_to_admin" : "demote_to_user",
      target_user_id,
      details: { previous_role: wasAdmin ? "admin" : "user", new_role },
    });

    return new Response(
      JSON.stringify({ success: true, new_role }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
