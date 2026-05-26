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
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&sort_by=sell_num.desc";
const PAGES_WEAPONS = 5; // weapons: 5 × 80 = 400
const PAGES_KNIVES = 10;  // knives: 10 × 80 = 800
const PAGES_PER_WEAPON = 8; // priority weapons: 8 × 80 = 640 тус бүр
const PAGES_GLOVES = 10; // gloves: 10 × 80 = 800
const BUFF_KNIFE_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category_group=knife&sort_by=sell_num.desc&min_price=1&max_price=10000";
const BUFF_GLOVES_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category_group=hand&sort_by=sell_num.desc&min_price=1&max_price=20000";
// Тэргүүлэх зэвсгүүд: AWP, Deagle, USP-S, Glock, M4A4, M4A1-S, AK-47
// Buff163 category кодууд
const PRIORITY_WEAPONS = [
  "weapon_awp",
  "weapon_deagle",
  "weapon_usp_silencer",
  "weapon_glock",
  "weapon_m4a4",
  "weapon_m4a1_silencer",
  "weapon_ak47",
];
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
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const BUFF_COOKIE = Deno.env.get("BUFF_COOKIE") ?? "";
    if (!BUFF_COOKIE) throw new Error("BUFF_COOKIE secret тохируулагдаагүй байна");

    // Require an authenticated admin user. Prevents anyone from triggering
    // expensive Buff API calls and overwriting curated skin data.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // 1) CNY → MNT ханш татах
    const rateRes = await fetch(RATE_URL);
    const rateJson = await rateRes.json();
    const cnyToMnt = rateJson?.rates?.MNT;
    if (!cnyToMnt) throw new Error("Ханшийн API алдаа: " + JSON.stringify(rateJson));

    await sb.from("exchange_rates").upsert(
      { base: "CNY", quote: "MNT", rate: cnyToMnt, source: "open.er-api.com", updated_at: new Date().toISOString() },
      { onConflict: "base,quote" },
    );

    // 2) Buff163-аас олон хуудас татах — зэвсэг + хутга тусдаа
    const buffHeaders = {
      "Cookie": BUFF_COOKIE,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Referer": "https://buff.163.com/market/csgo",
      "Accept": "application/json",
    };

    async function fetchPages(baseUrl: string, maxPages: number): Promise<any[]> {
      const items: any[] = [];
      for (let page = 1; page <= maxPages; page++) {
        let success = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          const url = `${baseUrl}&page_num=${page}`;
          const res = await fetch(url, { headers: buffHeaders });
          if (res.status === 429) {
            const wait = (attempt + 1) * 3000;
            console.warn(`429 rate limit page=${page}, ${wait/1000}s хүлээж байна...`);
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
          if (!res.ok) {
            const txt = await res.text();
            console.error(`Buff163 алдаа [${res.status}] page=${page}: ${txt.slice(0, 200)}`);
            return items;
          }
          const json = await res.json();
          if (json.code !== "OK") {
            console.error(`Buff163 хариу буруу page=${page}: ${JSON.stringify(json).slice(0, 300)}`);
            return items;
          }
          const pageItems = json?.data?.items ?? [];
          items.push(...pageItems);
          success = true;
          if (pageItems.length < 80) return items;
          break;
        }
        if (!success) {
          console.error(`3 удаа оролдсон ч амжилтгүй page=${page}`);
          break;
        }
        // Rate limit-ээс зайлсхийхийн тулд 2 секунд хүлээх
        await new Promise((r) => setTimeout(r, 1500));
      }
      return items;
    }

    // mode=knife → зөвхөн хутга, mode=weapon → зөвхөн зэвсэг, default → хоёулаа
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") ?? "all";

    let knifeItems: any[] = [];
    let weaponItems: any[] = [];

    if (mode === "all" || mode === "knife") {
      knifeItems = await fetchPages(BUFF_KNIFE_BASE, PAGES_KNIVES);
      console.log(`Хутга: ${knifeItems.length} item татсан`);
    }

    if (mode === "all" || mode === "weapon") {
      if (knifeItems.length > 0) await new Promise((r) => setTimeout(r, 3000));
      weaponItems = await fetchPages(`${BUFF_BASE}&category=weapon&min_price=1&max_price=3000`, PAGES_WEAPONS);
      console.log(`Зэвсэг: ${weaponItems.length} item татсан`);
    }

    // Давхардлыг buff_id-аар арилгах
    const seenIds = new Set<string>();
    const allItems: any[] = [];
    for (const it of [...knifeItems, ...weaponItems]) {
      const id = String(it?.id ?? "");
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        allItems.push(it);
      }
    }
    console.log(`Нийт давхардалгүй: ${allItems.length} item`);

    let upserted = 0;
    let skippedFilter = 0;
    const batch: any[] = [];

    for (const it of allItems) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;

      const { weapon, skin } = cleanName(fullName);

      const isKnife = KNIFE_KEYWORDS.some((k) => fullName.toLowerCase().includes(k));
      const maxCny = isKnife ? 10000 : 3000;
      if (cnyPrice < 1 || cnyPrice > maxCny) {
        skippedFilter++;
        continue;
      }

      const weaponType = detectWeaponType(fullName);
      const wear = detectWear(fullName);
      const rarity = detectRarity(it?.goods_info?.info?.tags);
      const image = it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;
      const rawMnt = cnyPrice * cnyToMnt * MARGIN;
      const priceMnt = Math.round(rawMnt / 100) * 100;

      batch.push({
        buff_id: buffId,
        name: skin,
        weapon,
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
      });
    }

    // Batch upsert 50 бүрээр
    const BATCH_SIZE = 50;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const chunk = batch.slice(i, i + BATCH_SIZE);
      const { error, count } = await sb.from("skins").upsert(chunk, { onConflict: "buff_id" });
      if (error) console.error(`Batch upsert алдаа [${i}-${i+chunk.length}]:`, error.message);
      else upserted += chunk.length;
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
