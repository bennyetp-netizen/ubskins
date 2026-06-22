import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CNY_TO_MNT = 450;
const PRICEMPIRE_BASE =
  "https://api.pricempire.com/v4/paid/items/prices?sources=buff163&currency=CNY";

const WEAR_MAP: Record<string, string> = {
  FN: "Factory New",
  MW: "Minimal Wear",
  FT: "Field-Tested",
  WW: "Well-Worn",
  BS: "Battle-Scarred",
};

interface SkinRow {
  id: string;
  weapon: string | null;
  name: string | null;
  wear: string | null;
  stattrak: boolean | null;
  weapon_type: string | null;
  price_mnt: number | null;
}

function buildMarketHashName(s: SkinRow): string {
  const weaponRaw = (s.weapon ?? "").trim();
  const name = (s.name ?? "").trim();
  const wear = s.wear ? WEAR_MAP[s.wear] : null;
  const isKnifeOrGloves =
    s.weapon_type === "Knife" || s.weapon_type === "Gloves";

  let weapon = weaponRaw;
  const alreadyStatTrak = /StatTrak™/i.test(weapon);
  if (s.stattrak && !alreadyStatTrak) {
    if (isKnifeOrGloves && weapon.startsWith("★ ")) {
      weapon = "★ StatTrak™ " + weapon.slice(2);
    } else {
      weapon = "StatTrak™ " + weapon;
    }
  }

  // Vanilla knife: no name, no wear
  if (isKnifeOrGloves && !name) return weapon;

  const base = name ? `${weapon} | ${name}` : weapon;
  return wear ? `${base} (${wear})` : base;
}

function calcSellingPriceMnt(costMnt: number): number {
  // Mirror src/data/skins.ts calcSellingPrice tiered markup
  if (costMnt < 50_000) return Math.round(costMnt * 1.25);
  if (costMnt < 200_000) return Math.round(costMnt * 1.2);
  if (costMnt < 1_000_000) return Math.round(costMnt * 1.15);
  return Math.round(costMnt * 1.12);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("PRICEMPIRE_API_KEY");
    if (!apiKey) throw new Error("PRICEMPIRE_API_KEY not configured");

    const url = new URL(req.url);
    let dryRun = url.searchParams.get("dryRun") === "1";
    let dryLimit = 10;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.dryRun) dryRun = true;
        if (typeof body?.limit === "number") dryLimit = body.limit;
      } catch {
        /* ignore */
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch Pricempire prices
    const pmRes = await fetch(`${PRICEMPIRE_BASE}&api_key=${encodeURIComponent(apiKey)}`);
    if (!pmRes.ok) {
      const txt = await pmRes.text();
      throw new Error(`Pricempire ${pmRes.status}: ${txt.slice(0, 200)}`);
    }
    const pmJson: Record<string, { buff163?: { price?: number } }> =
      await pmRes.json();

    function getCnyPrice(mhn: string): number | null {
      const entry = pmJson[mhn];
      const raw = entry?.buff163?.price;
      if (typeof raw !== "number" || raw <= 0) return null;
      // Pricempire returns prices in cents (subunit). Convert to CNY.
      return raw / 100;
    }

    // Load skins
    const query = supabase
      .from("skins")
      .select("id, weapon, name, wear, stattrak, weapon_type, price_mnt")
      .eq("is_active", true);

    if (dryRun) query.limit(dryLimit);

    const { data: skins, error } = await query;
    if (error) throw error;
    if (!skins) throw new Error("no skins");

    const samples: Array<Record<string, unknown>> = [];
    let updated = 0;
    let unmatched = 0;

    for (const s of skins as SkinRow[]) {
      const mhn = buildMarketHashName(s);
      const cny = getCnyPrice(mhn);
      if (cny === null) {
        unmatched++;
        if (dryRun) {
          samples.push({
            id: s.id,
            market_hash_name: mhn,
            matched: false,
            old_price_mnt: s.price_mnt,
          });
        }
        continue;
      }

      const costMnt = Math.round(cny * CNY_TO_MNT);
      const newPriceMnt = calcSellingPriceMnt(costMnt);

      if (dryRun) {
        samples.push({
          id: s.id,
          market_hash_name: mhn,
          matched: true,
          cny_price: cny,
          cost_mnt: costMnt,
          old_price_mnt: s.price_mnt,
          new_price_mnt: newPriceMnt,
        });
      } else {
        const { error: upErr } = await supabase
          .from("skins")
          .update({ price_mnt: newPriceMnt })
          .eq("id", s.id);
        if (!upErr) updated++;
      }
    }

    return new Response(
      JSON.stringify({
        dryRun,
        total: skins.length,
        updated,
        unmatched,
        samples: dryRun ? samples : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
