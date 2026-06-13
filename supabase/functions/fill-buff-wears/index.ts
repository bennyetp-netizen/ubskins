// Тусдаа wrapper edge function: sync-buff-skins-ийн `fillwears` горимыг
// admin auth шаардахгүйгээр дуудна. Дотроо SERVICE_ROLE_KEY ашиглаж
// sync-buff-skins-ийг cron нэрийн дор дуудна.
//
// Хэрэглээ (Supabase dashboard / curl):
//   POST /functions/v1/fill-buff-wears
//   body: { "limit": 30, "offset": 0 }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: any = {};
    if (req.method !== "GET") {
      body = await req.json().catch(() => ({}));
    }
    const url = new URL(req.url);
    const limit = Number(body?.limit ?? url.searchParams.get("limit") ?? 30);
    const offset = Number(body?.offset ?? url.searchParams.get("offset") ?? 0);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-buff-skins`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "fillwears", limit, offset }),
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
