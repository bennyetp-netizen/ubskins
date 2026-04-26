// Steam OpenID 2.0 - Initiates the login flow by redirecting to Steam
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // The frontend tells us where to send the user back to (e.g. https://ubskins.lovable.app/auth/callback)
    const returnTo = url.searchParams.get("return_to");
    const realm = url.searchParams.get("realm"); // e.g. https://ubskins.lovable.app

    if (!returnTo || !realm) {
      return new Response(
        JSON.stringify({ error: "return_to and realm are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnTo,
      "openid.realm": realm,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });

    const steamUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;

    return new Response(JSON.stringify({ url: steamUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
