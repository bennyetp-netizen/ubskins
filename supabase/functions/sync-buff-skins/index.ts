// Buff163-аас CS2 скинүүдийг татаж, MNT үнэ тооцож skins хүснэгт рүү upsert хийнэ.
// Cron-оор 6 цаг тутамд автомат дуудна. Гараар бас дуудаж болно (админ).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUFF_URL =
  "https://buff.163.com/api/market/goods?game=csgo&page_num=1&page_size=80";
const RATE_URL = "https://open.er-api.com/v6/latest/CNY"; // free, түлхүүр шаардахгүй
const MARGIN = 1.10;

// Зэвсгийн нэрнээс ангилал тогтоох
function detectWeaponType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("knife") || n.includes("karambit") || n.includes("bayonet") ||
      n.includes("daggers") || n.includes("★")) return "Knife";
  if (n.includes("awp") || n.includes("ssg") || n.includes("scar-20") ||
      n.includes("g3sg1")) return "Sniper";
  if (n.includes("glock") || n.includes("usp") || n.includes("p250") ||
      n.includes("deagle") || n.includes("desert eagle") || n.includes("five-seven") ||
      n.includes("tec-9") || n.includes("cz75") || n.includes("p2000") ||
      n.includes("dual berettas") || n.includes("r8")) return "Pistol";
  if (n.includes("mp9") || n.includes("mp7") || n.includes("mp5") ||
      n.includes("ump") || n.includes("p90") || n.includes("mac-10") ||
      n.includes("pp-bizon")) return "SMG";
  return "Rifle";
}

function detectWear(name: string): string {
  if (name.includes("Factory New")) return "FN";
  if (name.includes("Minimal Wear")) return "MW";
  if (name.includes("Field-Tested")) return "FT";
  if (name.includes("Well-Worn")) return "WW";
  if (name.includes("Battle-Scarred")) return "BS";
  return "FT";
}

function detectRarity(tags: any): string {
  const rarity = tags?.rarity?.localized_name || tags?.rarity?.internal_name || "";
  if (rarity.toLowerCase().includes("covert")) return "Covert";
  if (rarity.toLowerCase().includes("classified")) return "Classified";
  if (rarity.toLowerCase().includes("restricted")) return "Restricted";
  return "Mil-Spec";
}

// Үндсэн нэр (wear хэсэггүй)
function cleanName(full: string): { weapon: string; skin: string } {
  // "AK-47 | Redline (Field-Tested)" → weapon: "AK-47", skin: "Redline"
  const withoutWear = full.replace(/\s*\([^)]+\)\s*$/, "").trim();
  const parts = withoutWear.split("|").map((p) => p.trim());
  if (parts.length >= 2) return { weapon: parts[0], skin: parts.slice(1).join(" | ") };
  return { weapon: withoutWear, skin: withoutWear };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BUFF_COOKIE = Deno.env.get("BUFF_COOKIE") ?? "";
    if (!BUFF_COOKIE) throw new Error("BUFF_COOKIE secret тохируулагдаагүй байна");

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) CNY → MNT ханш татах
    const rateRes = await fetch(RATE_URL);
    const rateJson = await rateRes.json();
    const cnyToMnt = rateJson?.rates?.MNT;
    if (!cnyToMnt) throw new Error("Ханшийн API алдаа: " + JSON.stringify(rateJson));

    await sb.from("exchange_rates").upsert(
      { base: "CNY", quote: "MNT", rate: cnyToMnt, source: "open.er-api.com", updated_at: new Date().toISOString() },
      { onConflict: "base,quote" },
    );

    // 2) Buff163-аас скин жагсаалт татах
    const buffRes = await fetch(BUFF_URL, {
      headers: {
        "Cookie": BUFF_COOKIE,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Referer": "https://buff.163.com/market/csgo",
        "Accept": "application/json",
      },
    });

    if (!buffRes.ok) {
      const txt = await buffRes.text();
      throw new Error(`Buff163 алдаа [${buffRes.status}]: ${txt.slice(0, 200)}`);
    }

    const buffJson = await buffRes.json();
    if (buffJson.code !== "OK") {
      throw new Error("Buff163 хариу буруу: " + JSON.stringify(buffJson).slice(0, 300));
    }

    const items = buffJson?.data?.items ?? [];
    let upserted = 0;

    for (const it of items) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;

      const { weapon, skin } = cleanName(fullName);
      const weaponType = detectWeaponType(fullName);
      const wear = detectWear(fullName);
      const rarity = detectRarity(it?.goods_info?.info?.tags);
      const image =
        it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;

      // Үнэ: cny * rate * 1.10 → ойролцоох 100₮
      const rawMnt = cnyPrice * cnyToMnt * MARGIN;
      const priceMnt = Math.round(rawMnt / 100) * 100;

      const { error } = await sb.from("skins").upsert(
        {
          buff_id: buffId,
          name: skin,
          weapon: weapon,
          weapon_type: weaponType,
          game: "CS2",
          wear,
          buff_price_cny: cnyPrice,
          price_mnt: priceMnt,
          image_url: image,
          rarity,
          stock: 1,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "buff_id" },
      );
      if (!error) upserted++;
      else console.error("Upsert алдаа:", error.message, fullName);
    }

    return new Response(
      JSON.stringify({
        success: true,
        rate_cny_mnt: cnyToMnt,
        items_received: items.length,
        upserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("sync-buff-skins error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
