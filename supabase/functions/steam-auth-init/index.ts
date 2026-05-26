// Steam OpenID 2.0 - Initiates the login flow by redirecting to Steam
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Only these origins may be used as OpenID realm / return_to. Prevents
// attackers from hijacking the OpenID flow to a malicious site.
const ALLOWED_ORIGINS = new Set<string>([
  "https://ubskins.mn",
  "https://www.ubskins.mn",
  "https://ubskins.lovable.app",
  "https://id-preview--f53caecd-5b6b-4434-8b43-33813322b467.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function isAllowedReturnTo(returnTo: string, realm: string): boolean {
  try {
    const r = new URL(returnTo);
    const realmUrl = new URL(realm);
    if (!ALLOWED_ORIGINS.has(realmUrl.origin)) return false;
    if (r.origin !== realmUrl.origin) return false;
    return true;
  } catch {
    return false;
  }
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const returnTo = url.searchParams.get("return_to");
    const realm = url.searchParams.get("realm");

    if (!returnTo || !realm) {
      return new Response(
        JSON.stringify({ error: "return_to and realm are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isAllowedReturnTo(returnTo, realm)) {
      return new Response(
        JSON.stringify({ error: "Invalid redirect target" }),
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
