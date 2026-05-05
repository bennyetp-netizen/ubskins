// Buff163-аас CS2 скинүүдийг татаж, MNT үнэ тооцож skins хүснэгт рүү upsert хийнэ.
// Cron-оор 6 цаг тутамд автомат дуудна. Гараар бас дуудаж болно (админ).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Buff163: category=weapon → зэвсгийн скин (sticker/case/key/agent/patch/music kit орохгүй)
//          sort_by=sell_num.desc → хамгийн их зарагдсанаас эхэлж эрэмбэлнэ
//          min/max price → 1-3000 CNY (хямдаас дундаж хүртэл)
const BUFF_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category=weapon&sort_by=sell_num.desc&min_price=1&max_price=3000";
const PAGES_TO_FETCH = 20; // 20 × 80 = 1600 скин хүртэл
const RATE_URL = "https://open.er-api.com/v6/latest/CNY"; // free, түлхүүр шаардахгүй
const MARGIN = 1.10;

// Хутга бүх төрлөөр (Karambit, Bayonet, Butterfly, Flip, Huntsman гэх мэт)
const KNIFE_KEYWORDS = ["knife", "karambit", "bayonet", "daggers", "★"];
// Бээлий
const GLOVES_KEYWORDS = ["gloves", "hand wraps"];


// Зэвсгийн нэрнээс ангилал тогтоох
function detectWeaponType(name: string): string {
  const n = name.toLowerCase();
  if (GLOVES_KEYWORDS.some((k) => n.includes(k))) return "Gloves";
  if (KNIFE_KEYWORDS.some((k) => n.includes(k))) return "Knife";
  if (n.includes("awp") || n.includes("ssg") || n.includes("scar") || n.includes("g3sg1")) return "Sniper";
  if (n.includes("glock") || n.includes("usp") || n.includes("p250") || n.includes("five-seven") || n.includes("tec-9") || n.includes("cz75") || n.includes("r8") ||
      n.includes("deagle") || n.includes("desert eagle") || n.includes("dual berettas") || n.includes("p2000")) return "Pistol";
  if (n.includes("mp9") || n.includes("mp5") || n.includes("mp7") || n.includes("ump") || n.includes("p90") || n.includes("pp-bizon") || n.includes("mac-10")) return "SMG";
  if (n.includes("mag-7") || n.includes("nova") || n.includes("xm1014") || n.includes("sawed-off")) return "Shotgun";
  if (n.includes("m249") || n.includes("negev")) return "Heavy";
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

    // 2) Buff163-аас олон хуудас татах (popularity-аар эрэмбэлсэн, weapon-only, 10-2000¥)
    const allItems: any[] = [];
    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const url = `${BUFF_BASE}&page_num=${page}`;
      const buffRes = await fetch(url, {
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
        throw new Error(`Buff163 алдаа [${buffRes.status}] page=${page}: ${txt.slice(0, 200)}`);
      }

      const buffJson = await buffRes.json();
      if (buffJson.code !== "OK") {
        throw new Error(`Buff163 хариу буруу page=${page}: ${JSON.stringify(buffJson).slice(0, 300)}`);
      }
      const pageItems = buffJson?.data?.items ?? [];
      allItems.push(...pageItems);
      if (pageItems.length < 80) break; // дуусаад байна
      // зөөлөн хүлээлт — rate limit-ээс зайлсхийх
      await new Promise((r) => setTimeout(r, 200));
    }

    let upserted = 0;
    let skippedFilter = 0;

    for (const it of allItems) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;

      const { weapon, skin } = cleanName(fullName);

      // Үнийн давхар шалгалт
      if (cnyPrice < 1 || cnyPrice > 3000) {
        skippedFilter++;
        continue;
      }

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
          is_available: true,
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
        items_received: allItems.length,
        skipped_filter: skippedFilter,
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
