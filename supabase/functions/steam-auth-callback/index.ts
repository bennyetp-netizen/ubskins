// Steam OpenID 2.0 - Validates the response from Steam, fetches profile,
// creates/updates the Supabase user, and returns a session.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";

interface SteamPlayer {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

async function verifyOpenId(params: Record<string, string>): Promise<boolean> {
  // Per OpenID 2.0 spec: replay all params back to Steam with mode=check_authentication
  const verifyParams = new URLSearchParams({ ...params, "openid.mode": "check_authentication" });
  const res = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
  });
  const text = await res.text();
  return text.includes("is_valid:true");
}

function extractSteamId(claimedId: string): string | null {
  // claimed_id format: https://steamcommunity.com/openid/id/76561198XXXXXXXXX
  const match = claimedId.match(/\/openid\/id\/(\d+)$/);
  return match ? match[1] : null;
}

async function fetchSteamProfile(steamId: string, apiKey: string): Promise<SteamPlayer | null> {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.response?.players?.[0] ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STEAM_API_KEY = Deno.env.get("STEAM_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STEAM_API_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Accept the OpenID query string from the frontend
    const body = await req.json();
    const queryString: string = body.query ?? "";
    if (!queryString) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params: Record<string, string> = {};
    new URLSearchParams(queryString).forEach((v, k) => (params[k] = v));

    // 1) Verify the OpenID response is genuinely from Steam
    const isValid = await verifyOpenId(params);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid OpenID response" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Extract Steam ID
    const claimedId = params["openid.claimed_id"] ?? "";
    const steamId = extractSteamId(claimedId);
    if (!steamId) {
      return new Response(JSON.stringify({ error: "Steam ID not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Fetch the player's public Steam profile
    const player = await fetchSteamProfile(steamId, STEAM_API_KEY);
    if (!player) {
      return new Response(JSON.stringify({ error: "Cannot fetch Steam profile" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4) Create / find the Supabase auth user (we use a synthetic email derived from Steam ID)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const syntheticEmail = `steam_${steamId}@steam.skinhub.local`;
    // Derive an UNPREDICTABLE password via HMAC-SHA256 over the full service-role
    // secret. The signature half of the JWT is high-entropy and never exposed to
    // clients, so attackers cannot reconstruct this from public information.
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SERVICE_ROLE_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`steam:${steamId}`));
    const syntheticPassword = `s2-${Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    const userMetadata = {
      steam_id: steamId,
      display_name: player.personaname,
      avatar_url: player.avatarfull,
      profile_url: player.profileurl,
    };

    // Try to find existing user
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u) => u.email === syntheticEmail);

    if (existing) {
      userId = existing.id;
      // Refresh their metadata so display name / avatar stays current
      // Refresh metadata AND rotate password to the new HMAC-derived value so
      // legacy accounts created with the old predictable scheme cannot be
      // logged into using the leaked formula.
      await admin.auth.admin.updateUserById(existing.id, {
        user_metadata: userMetadata,
        password: syntheticPassword,
      });
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        password: syntheticPassword,
        email_confirm: true,
        user_metadata: userMetadata,
      });
      if (createErr || !created.user) {
        return new Response(
          JSON.stringify({ error: createErr?.message ?? "Cannot create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = created.user.id;
    }

    // 5) Make sure profile row reflects latest Steam info
    await admin.from("profiles").upsert(
      {
        user_id: userId,
        steam_id: steamId,
        display_name: player.personaname,
        avatar_url: player.avatarfull,
        profile_url: player.profileurl,
      },
      { onConflict: "user_id" }
    );

    // 6) Sign the user in to get an access/refresh token pair we can ship to the browser
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? SERVICE_ROLE_KEY);
    const { data: signIn, error: signInErr } = await userClient.auth.signInWithPassword({
      email: syntheticEmail,
      password: syntheticPassword,
    });

    if (signInErr || !signIn.session) {
      return new Response(
        JSON.stringify({ error: signInErr?.message ?? "Cannot create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
        steam_id: steamId,
        display_name: player.personaname,
        avatar_url: player.avatarfull,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("steam-auth-callback error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
