import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "tripgenius@login.tripgenius.app";
const DEFAULT_PASSWORD = "tripgenius@2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // Find existing admin account
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let adminUser = list?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);

    if (!adminUser) {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "TripGenius Admin", username: "tripgenius@login" },
      });
      if (error) throw error;
      adminUser = created.user!;
    }

    // Ensure the admin role exists (never resets an existing password)
    await admin.from("user_roles").upsert(
      { user_id: adminUser.id, role: "admin" },
      { onConflict: "user_id,role" },
    );
    await admin.from("profiles").upsert({ id: adminUser.id }, { onConflict: "id" });

    return new Response(JSON.stringify({ ok: true, email: ADMIN_EMAIL }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
