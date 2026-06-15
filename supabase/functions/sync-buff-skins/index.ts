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
const PAGES_WEAPONS = 12; // weapons: 12 × 80 = 960
const PAGES_KNIVES = 15;  // knives: 15 × 80 = 1200
const PAGES_PER_WEAPON = 15; // priority weapons: 15 × 80 = 1200 тус бүр
const PAGES_GLOVES = 20; // gloves: 20 × 80 = 1600
const BUFF_KNIFE_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category_group=knife&sort_by=sell_num.desc&min_price=1&max_price=20000";
const BUFF_GLOVES_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category_group=hand&sort_by=sell_num.desc&min_price=1&max_price=30000";
// Tournament team stickers (бүх багуудын popular стикерүүд)
const BUFF_STICKER_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category=sticker_tournament_team&sort_by=sell_num.desc&min_price=0.1&max_price=50000";
const PAGES_STICKERS = 30; // 30 × 80 = 2400
// Player autograph stickers (бүх тоглогчдын popular стикерүүд)
const BUFF_PLAYER_STICKER_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category=sticker_tournament_player&sort_by=sell_num.desc&min_price=0.1&max_price=50000";
const PAGES_PLAYER_STICKERS = 40; // 40 × 80 = 3200
// Charms (keychains)
const BUFF_CHARM_BASE =
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category_group=charm&sort_by=sell_num.desc&min_price=0.1&max_price=50000";
const PAGES_CHARMS = 20; // 20 × 80 = 1600
// Agents (BUFF дээр CT/T агент тусдаа category-тэй)
const BUFF_AGENT_BASES = [
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category=agent_team_ct&sort_by=sell_num.desc&min_price=0.1&max_price=50000",
  "https://buff.163.com/api/market/goods?game=csgo&page_size=80&category=agent_team_t&sort_by=sell_num.desc&min_price=0.1&max_price=50000",
];
const PAGES_AGENTS = 5; // CT/T тус бүрт хангалттай, хурдан дуусна
// Тэргүүлэх зэвсгүүд
const PRIORITY_WEAPONS = [
  "weapon_awp",
  "weapon_deagle",
  "weapon_usp_silencer",
  "weapon_glock",
  "weapon_m4a4",
  "weapon_m4a1_silencer",
  "weapon_ak47",
  "weapon_knife", // generic knife category fallback
  "weapon_p250",
  "weapon_famas",
  "weapon_galilar",
  "weapon_aug",
  "weapon_sg556",
  "weapon_ssg08",
  "weapon_mp9",
  "weapon_mp7",
  "weapon_p90",
  "weapon_ump45",
  "weapon_mac10",
  "weapon_nova",
  "weapon_xm1014",
  "weapon_five_seven",
  "weapon_tec9",
  "weapon_cz75a",
  "weapon_revolver",
  "weapon_hkp2000",
  "weapon_elite",
];
// Монгол банкны (Mongol Bank) албан ёсны CNY→MNT ханш
const RATE_URL = "https://api.mongolbank.mn/json/get/exchange_rate?currency=CNY";
const FALLBACK_RATE_URL = "https://open.er-api.com/v6/latest/CNY";
// Selling price tiers based on cost_price_mnt (single source of truth):
//   cost <= 20,000           → cost + 3,000 (flat)
//   20,001 - 200,000         → cost * 1.12, rounded to nearest 100 MNT
//   200,001 - 1,000,000      → cost * 1.10, rounded to nearest 100 MNT
//   > 1,000,000              → cost * 1.06, rounded to nearest 100 MNT
const calcSellingPrice = (costMnt: number): number => {
  if (costMnt <= 20000) return costMnt + 3000;
  const markup = costMnt <= 200000 ? 1.12 : costMnt <= 1000000 ? 1.10 : 1.06;
  return Math.round((costMnt * markup) / 100) * 100;
};

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
    console.log("BUFF_COOKIE debug:", {
      exists: !!BUFF_COOKIE,
      length: BUFF_COOKIE.length,
      hasSession: BUFF_COOKIE.includes("session="),
      hasCsrfToken: BUFF_COOKIE.includes("csrf_token="),
      hasDeviceId: BUFF_COOKIE.includes("Device-Id="),
      hasDeviceIdLower: BUFF_COOKIE.includes("device_id="),
    });
    if (!BUFF_COOKIE) throw new Error("BUFF_COOKIE secret тохируулагдаагүй байна");
    const sb = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: "public" } });

    // Parse mode early so health/fillwears can run without auth
    const url = new URL(req.url);
    const body = req.method === "GET" ? null : await req.clone().json().catch(() => null);
    const rawMode = String(body?.mode ?? url.searchParams.get("mode") ?? "all").trim().toLowerCase();
    const modeAliases: Record<string, string> = {
      agent: "agents",
      sticker: "stickers",
      charm: "charms",
      knives: "knife",
      weapons: "weapon",
    };
    const mode = modeAliases[rawMode] ?? rawMode;

    // Allow either: (a) cron call with SERVICE_ROLE_KEY bearer, or (b) authenticated admin user.
    // Skip auth entirely for health and fillwears modes.
    if (mode !== "health" && mode !== "fillwears") {
      const authHeader = req.headers.get("Authorization") ?? "";
      const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const isCron = bearer && bearer === SERVICE_KEY;

      if (!isCron) {
        if (!bearer) {
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
      }
    }

    // === health горим: BUFF cookie хүчинтэй эсэхийг хурдан шалгана ===
    if (mode === "health") {
      try {
        const res = await fetch(
          "https://buff.163.com/api/market/goods?game=csgo&page_num=1&page_size=1&sort_by=sell_num.desc",
          {
            headers: {
              "Cookie": BUFF_COOKIE,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
              "Referer": "https://buff.163.com/market/csgo",
              "Accept": "application/json",
            },
          },
        );
        const json = await res.json().catch(() => ({}));
        const ok = res.ok && json?.code === "OK";
        const expired = json?.code === "Login Required" ||
          String(json?.error ?? json?.msg ?? "").toLowerCase().includes("login");
        return new Response(
          JSON.stringify({
            ok,
            expired,
            status: res.status,
            code: json?.code ?? null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ ok: false, expired: false, error: String(e) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }





    // 1) CNY → MNT ханш татах — Монгол банкны ханш (monxansh нь Монголбанкны өдөр тутмын ханшийг JSON-оор өгдөг)
    let cnyToMnt: number | null = null;
    let rateSource = "mongolbank";
    try {
      const mbRes = await fetch("https://monxansh.appspot.com/xansh.json");
      const mbJson = await mbRes.json();
      // monxansh формат: { "CNY": { "rate": "...", ... }, ... }
      const r = Number(mbJson?.CNY?.rate ?? mbJson?.cny?.rate);
      if (r && r > 0) cnyToMnt = r;
    } catch (e) {
      console.warn("Mongolbank rate fetch failed:", e);
    }
    if (!cnyToMnt) {
      // Fallback
      const rateRes = await fetch(FALLBACK_RATE_URL);
      const rateJson = await rateRes.json();
      cnyToMnt = Number(rateJson?.rates?.MNT);
      rateSource = "open.er-api.com";
      if (!cnyToMnt) throw new Error("Ханшийн API алдаа: " + JSON.stringify(rateJson));
    }
    // Монгол банкны ханш дээр +2% нэмэлт (валют хөрвүүлэх зардал/буфер)
    const baseRate = cnyToMnt;
    cnyToMnt = Math.round(baseRate * 1.02 * 100) / 100;
    console.log(`Base ханш: ${baseRate}, +2% → ${cnyToMnt}`);
    console.log(`CNY→MNT ханш: ${cnyToMnt} (${rateSource})`);

    await sb.from("exchange_rates").upsert(
      { base: "CNY", quote: "MNT", rate: cnyToMnt, source: rateSource, updated_at: new Date().toISOString() },
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
            const message = String(json?.error ?? json?.msg ?? json?.code ?? "BUFF хариу буруу");
            if (json.code === "Login Required" || message.toLowerCase().includes("login")) {
              throw new Error("BUFF login cookie хугацаа дууссан байна. BUFF_COOKIE secret-ийг шинэ cookie-оор солино уу.");
            }
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

    // mode=knife → зөвхөн хутга, mode=weapon → зөвхөн зэвсэг,
    // mode=gloves → зөвхөн бээлий, mode=priority → зөвхөн тэргүүлэх зэвсгүүд,
    // default (all) → бүгд
    // mode, body already parsed above

    // === fillwears горим: байгаа скинүүдийн дутуу wear-уудыг BUFF search-аар нөхөх ===
    if (mode === "fillwears") {
      const limit = Math.max(1, Math.min(200, Number(body?.limit ?? url.searchParams.get("limit") ?? 30)));
      const auto = body?.auto === true || url.searchParams.get("auto") === "1";
      let offset = Math.max(0, Number(body?.offset ?? url.searchParams.get("offset") ?? 0));
      if (auto) {
        const { data: st } = await sb.from("sync_state").select("value").eq("key", "fillwears").maybeSingle();
        offset = Math.max(0, Number((st?.value as any)?.offset ?? 0));
      }

      // Distinct (weapon, name) групп — зөвхөн wear-тэй (зэвсэг/хутга/бээлий) скинүүд
      // Supabase Data API-ийн default limit 1000 учир pagination ашиглаж бүх мөрийг татна
      const groups: { weapon: string; name: string }[] = [];
      const pageSize = 1000;
      for (let from = 0; ; from += pageSize) {
        const { data: page, error: gErr } = await sb
          .from("skins")
          .select("weapon, name")
          .not("wear", "is", null)
          .in("weapon_type", [
            "Rifle", "Sniper", "Pistol", "SMG", "Shotgun", "Heavy", "Knife", "Gloves",
          ])
          .order("weapon", { ascending: true })
          .order("name", { ascending: true })
          .range(from, from + pageSize - 1);
        if (gErr) throw new Error("groups query: " + gErr.message);
        if (!page || page.length === 0) break;
        groups.push(...page);
        if (page.length < pageSize) break;
      }

      const uniq = new Map<string, { weapon: string; name: string }>();
      for (const r of groups ?? []) {
        const key = `${r.weapon}|${r.name}`;
        if (!uniq.has(key)) uniq.set(key, { weapon: r.weapon, name: r.name });
      }
      const allGroups = Array.from(uniq.values());
      const onlyWeapon = body?.weapon as string | undefined;
      const onlyName = body?.name as string | undefined;
      const slice = (onlyWeapon && onlyName)
        ? [{ weapon: onlyWeapon, name: onlyName }]
        : allGroups.slice(offset, offset + limit);

      let added = 0;
      let scanned = 0;
      for (const g of slice) {
        scanned++;
        // BUFF search — нэрээр хайна
        const searchQuery = `${g.weapon} | ${g.name}`;
        const searchUrl =
          `https://buff.163.com/api/market/goods?game=csgo&page_size=40&search=` +
          encodeURIComponent(searchQuery);
        let items: any[] = [];
        for (let attempt = 0; attempt < 2; attempt++) {
          const res = await fetch(searchUrl, { headers: buffHeaders });
          if (res.status === 429) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          if (!res.ok) break;
          const json = await res.json();
          if (json.code === "OK") items = json?.data?.items ?? [];
          else {
            const message = String(json?.error ?? json?.msg ?? json?.code ?? "BUFF хариу буруу");
            if (json.code === "Login Required" || message.toLowerCase().includes("login")) {
              throw new Error("BUFF login cookie хугацаа дууссан байна. BUFF_COOKIE secret-ийг шинэ cookie-оор солино уу.");
            }
          }
          break;
        }
        console.log(`[fillwears] query="${searchQuery}" items=${items.length}`);
        await new Promise((r) => setTimeout(r, 200));

        for (const it of items) {
          const fullName: string = it?.name ?? "";
          const buffId = String(it?.id ?? "");
          const cnyPrice = Number(it?.sell_min_price ?? 0);
          if (!buffId || !cnyPrice) continue;
          const { weapon, skin } = cleanName(fullName);
          // Зөвхөн яг таарсан weapon+name-ийг авна (StatTrak™ зэргийг ялгах)
          if (weapon !== g.weapon || skin !== g.name) continue;
          const wear = detectWear(fullName);
          const weaponType = detectWeaponType(fullName);
          const rarity = detectRarity(it?.goods_info?.info?.tags);
          const image = it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;
          const costMnt = Math.round(cnyPrice * cnyToMnt);
          const finalPriceMnt = calcSellingPrice(costMnt);

          const { data: up, error: uErr } = await sb
            .from("skins")
            .upsert(
              {
                buff_id: buffId,
                name: skin,
                weapon,
                weapon_type: weaponType,
                game: "CS2",
                wear,
                buff_price_cny: cnyPrice,
                price_mnt: finalPriceMnt,
                image_url: image,
                rarity,
                stock: 1,
                is_active: true,
                is_available: true,
                last_synced_at: new Date().toISOString(),
              },
              { onConflict: "buff_id" },
            )
            .select("id")
            .maybeSingle();
          if (uErr) {
            console.error("fillwears upsert:", uErr.message);
            continue;
          }
          if (up?.id) {
            await sb
              .from("skin_costs")
              .upsert({ skin_id: up.id, cost_price_mnt: costMnt }, { onConflict: "skin_id" });
            added++;
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: "fillwears",
          rate_cny_mnt: cnyToMnt,
          total_groups: allGroups.length,
          scanned,
          offset,
          limit,
          next_offset: offset + scanned,
          upserted: added,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    // Optional: chunk priority weapons to stay under edge function wall-time.
    // body.weapons = ["weapon_ak47", ...] → restrict PRIORITY_WEAPONS to that subset.
    const weaponsFilter: string[] | null = Array.isArray(body?.weapons) && body.weapons.length > 0
      ? body.weapons.map((w: any) => String(w))
      : null;

    let knifeItems: any[] = [];
    let weaponItems: any[] = [];
    let glovesItems: any[] = [];
    let priorityItems: any[] = [];
    let stickerItems: any[] = [];
    let charmItems: any[] = [];
    let agentItems: any[] = [];

    if (mode === "all" || mode === "knife") {
      knifeItems = await fetchPages(BUFF_KNIFE_BASE, PAGES_KNIVES);
      console.log(`Хутга: ${knifeItems.length} item татсан`);
    }

    if (mode === "all" || mode === "gloves") {
      if (knifeItems.length > 0) await new Promise((r) => setTimeout(r, 3000));
      glovesItems = await fetchPages(BUFF_GLOVES_BASE, PAGES_GLOVES);
      console.log(`Бээлий: ${glovesItems.length} item татсан`);
    }

    if (mode === "all" || mode === "priority") {
      const list = weaponsFilter ?? PRIORITY_WEAPONS;
      for (const cat of list) {
        await new Promise((r) => setTimeout(r, 2000));
        const items = await fetchPages(
          `${BUFF_BASE}&category=${cat}&min_price=1&max_price=10000`,
          PAGES_PER_WEAPON,
        );
        console.log(`${cat}: ${items.length} item татсан`);
        priorityItems.push(...items);
      }
    }

    if (mode === "all" || mode === "weapon") {
      await new Promise((r) => setTimeout(r, 3000));
      weaponItems = await fetchPages(`${BUFF_BASE}&category=weapon&min_price=1&max_price=5000`, PAGES_WEAPONS);
      console.log(`Зэвсэг: ${weaponItems.length} item татсан`);
    }

    if (mode === "all" || mode === "stickers") {
      await new Promise((r) => setTimeout(r, 3000));
      const rawStickers = await fetchPages(BUFF_STICKER_BASE, PAGES_STICKERS);
      console.log(`Стикер (team): ${rawStickers.length} item`);

      // Player autograph стикерүүд (бүх popular)
      await new Promise((r) => setTimeout(r, 3000));
      const rawPlayerStickers = await fetchPages(BUFF_PLAYER_STICKER_BASE, PAGES_PLAYER_STICKERS);
      console.log(`Стикер (player): ${rawPlayerStickers.length} item`);

      stickerItems = [...rawStickers, ...rawPlayerStickers];
    }

    if (mode === "all" || mode === "charms") {
      await new Promise((r) => setTimeout(r, 3000));
      charmItems = await fetchPages(BUFF_CHARM_BASE, PAGES_CHARMS);
      console.log(`Charm: ${charmItems.length} item`);
    }

    if (mode === "all" || mode === "agents") {
      await new Promise((r) => setTimeout(r, 3000));
      for (const agentBase of BUFF_AGENT_BASES) {
        const items = await fetchPages(agentBase, PAGES_AGENTS);
        agentItems.push(...items);
        if (items.length > 0) await new Promise((r) => setTimeout(r, 3000));
      }
      console.log(`Agent: ${agentItems.length} item`);
    }



    // Давхардлыг buff_id-аар арилгах
    const seenIds = new Set<string>();
    const allItems: any[] = [];
    for (const it of [...knifeItems, ...glovesItems, ...priorityItems, ...weaponItems, ...stickerItems, ...charmItems, ...agentItems]) {
      const id = String(it?.id ?? "");
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        allItems.push(it);
      }
    }
    console.log(`Нийт давхардалгүй: ${allItems.length} item`);

    const seenGenericIds = new Set<string>();
    const genericItems: any[] = [];
    for (const it of [...knifeItems, ...glovesItems, ...priorityItems, ...weaponItems]) {
      const id = String(it?.id ?? "");
      if (id && !seenGenericIds.has(id)) {
        seenGenericIds.add(id);
        genericItems.push(it);
      }
    }

    let upserted = 0;
    let skippedFilter = 0;
    const batch: any[] = [];
    // Costs are stored in admin-only skin_costs (not on the public skins row).
    const costByBuffId = new Map<string, number>();

    for (const it of genericItems) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;

      const { weapon, skin } = cleanName(fullName);

      const lowerName = fullName.toLowerCase();
      const isKnife = KNIFE_KEYWORDS.some((k) => lowerName.includes(k));
      const isGloves = GLOVES_KEYWORDS.some((k) => lowerName.includes(k));
      const maxCny = isKnife ? 20000 : isGloves ? 30000 : 10000;
      if (cnyPrice < 1 || cnyPrice > maxCny) {
        skippedFilter++;
        continue;
      }

      const weaponType = detectWeaponType(fullName);
      const wear = detectWear(fullName);
      const rarity = detectRarity(it?.goods_info?.info?.tags);
      const image = it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;
      const costMnt = Math.round(cnyPrice * cnyToMnt);
      const finalPriceMnt = calcSellingPrice(costMnt);
      costByBuffId.set(buffId, costMnt);

      batch.push({
        buff_id: buffId,
        name: skin,
        weapon,
        weapon_type: weaponType,
        game: "CS2",
        wear,
        buff_price_cny: cnyPrice,
        // cost stored separately in skin_costs
        price_mnt: finalPriceMnt,
        image_url: image,
        rarity,
        stock: 1,
        is_active: true,
        is_available: true,
        last_synced_at: new Date().toISOString(),
      });
    }

    // Mongolia стикерүүдийг тусад нь боловсруулах (wear, weapon_type өөр)
    for (const it of stickerItems) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;
      if (cnyPrice < 0.1 || cnyPrice > 50000) {
        skippedFilter++;
        continue;
      }

      // "Sticker | Mongolia (Foil) | Antwerp 2022"
      const parts = fullName.split("|").map((p) => p.trim());
      const skinName = parts.slice(1).join(" | ") || fullName;
      const image = it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;
      const rarity = detectRarity(it?.goods_info?.info?.tags);
      const costMnt = Math.round(cnyPrice * cnyToMnt);
      const finalPriceMnt = calcSellingPrice(costMnt);
      costByBuffId.set(buffId, costMnt);

      batch.push({
        buff_id: buffId,
        name: skinName,
        weapon: "Sticker",
        weapon_type: "Sticker",
        game: "CS2",
        wear: null,
        buff_price_cny: cnyPrice,
        // cost stored separately in skin_costs
        price_mnt: finalPriceMnt,
        image_url: image,
        rarity,
        stock: 1,
        is_active: true,
        is_available: true,
        last_synced_at: new Date().toISOString(),
      });
    }

    // Charm-уудыг боловсруулах
    for (const it of charmItems) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;
      if (cnyPrice < 0.1 || cnyPrice > 50000) {
        skippedFilter++;
        continue;
      }

      // "Charm | Lil' SAS" → name: "Lil' SAS"
      const parts = fullName.split("|").map((p) => p.trim());
      const skinName = parts.slice(1).join(" | ") || fullName;
      const image = it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;
      const rarity = detectRarity(it?.goods_info?.info?.tags);
      const costMnt = Math.round(cnyPrice * cnyToMnt);
      const finalPriceMnt = calcSellingPrice(costMnt);
      costByBuffId.set(buffId, costMnt);

      batch.push({
        buff_id: buffId,
        name: skinName,
        weapon: "Charm",
        weapon_type: "Charm",
        game: "CS2",
        wear: null,
        buff_price_cny: cnyPrice,
        // cost stored separately in skin_costs
        price_mnt: finalPriceMnt,
        image_url: image,
        rarity,
        stock: 1,
        is_active: true,
        is_available: true,
        last_synced_at: new Date().toISOString(),
      });
    }

    // Agent-уудыг боловсруулах
    for (const it of agentItems) {
      const fullName: string = it?.name ?? "";
      const buffId = String(it?.id ?? "");
      const cnyPrice = Number(it?.sell_min_price ?? 0);
      if (!buffId || !cnyPrice) continue;
      if (cnyPrice < 0.1 || cnyPrice > 50000) {
        skippedFilter++;
        continue;
      }

      // BUFF agent name format: "3rd Commando Company | KSK" — keep full name as-is
      const skinName = fullName;
      const image = it?.goods_info?.icon_url ?? it?.goods_info?.original_icon_url ?? null;
      const rarity = detectRarity(it?.goods_info?.info?.tags);
      const costMnt = Math.round(cnyPrice * cnyToMnt);
      const finalPriceMnt = calcSellingPrice(costMnt);
      costByBuffId.set(buffId, costMnt);

      batch.push({
        buff_id: buffId,
        name: skinName,
        weapon: "Agent",
        weapon_type: "Agent",
        game: "CS2",
        wear: null,
        buff_price_cny: cnyPrice,
        // cost stored separately in skin_costs
        price_mnt: finalPriceMnt,
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
      const { data: upRows, error } = await sb
        .from("skins")
        .upsert(chunk, { onConflict: "buff_id" })
        .select("id, buff_id");
      if (error) {
        console.error(`Batch upsert алдаа [${i}-${i+chunk.length}]:`, error.message);
        continue;
      }
      upserted += chunk.length;

      // Mirror cost prices into admin-only skin_costs.
      const costRows = (upRows ?? [])
        .map((r: any) => {
          const c = costByBuffId.get(String(r.buff_id));
          return c ? { skin_id: r.id, cost_price_mnt: c } : null;
        })
        .filter(Boolean);
      if (costRows.length) {
        const { error: cErr } = await sb
          .from("skin_costs")
          .upsert(costRows as any[], { onConflict: "skin_id" });
        if (cErr) console.error(`skin_costs upsert алдаа [${i}]:`, cErr.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        rate_cny_mnt: cnyToMnt,
        mode,
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
