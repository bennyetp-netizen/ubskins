// Edge Function: buff-listings
// Returns the cheapest Buff163 sell-order listings for a given skin.
// The buff_id is looked up server-side from public.skins using the service role,
// so it is never exposed to the client.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface ReqBody {
  skinId?: string;
  limit?: number;
}

interface Listing {
  id: string;
  price_cny: number;
  price_mnt: number;
  float: number | null;
  stattrak: boolean;
  paint_seed: number | null;
  wear_name: string | null;
  stickers: Array<{ name: string; img: string | null }>;
  buff_url: string;
}

const BUFF_COOKIE = Deno.env.get("BUFF_COOKIE") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body: ReqBody = await req.json().catch(() => ({}));
    const skinId = typeof body.skinId === "string" ? body.skinId : "";
    const limit = Math.min(Math.max(Number(body.limit ?? 5), 1), 10);

    if (!skinId || !/^[0-9a-f-]{36}$/i.test(skinId)) {
      return json({ success: false, error: "Invalid skinId" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: skin, error: skinErr } = await admin
      .from("skins")
      .select("buff_id, stattrak, name, weapon")
      .eq("id", skinId)
      .maybeSingle();

    if (skinErr) return json({ success: false, error: skinErr.message }, 500);
    if (!skin?.buff_id) {
      return json({ success: true, listings: [], rate_cny_mnt: null, message: "no_buff_id" });
    }

    // Exchange rate CNY → MNT
    const { data: rateRow } = await admin
      .from("exchange_rates")
      .select("rate")
      .eq("base", "CNY")
      .eq("quote", "MNT")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const rate = Number(rateRow?.rate ?? 0);

    // Fetch Buff sell orders
    const url =
      `https://buff.163.com/api/market/goods/sell_order?game=csgo` +
      `&goods_id=${encodeURIComponent(String(skin.buff_id))}` +
      `&page_num=1&page_size=20&sort_by=price.asc&allow_tradable_cooldown=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": `https://buff.163.com/goods/${skin.buff_id}`,
        ...(BUFF_COOKIE ? { Cookie: BUFF_COOKIE } : {}),
      },
    });

    if (!res.ok) {
      return json({ success: false, error: `Buff HTTP ${res.status}` }, 502);
    }
    const data = await res.json();
    if (data?.code !== "OK") {
      return json({ success: false, error: data?.error ?? "Buff API error" }, 502);
    }

    const items: any[] = data?.data?.items ?? [];
    const listings: Listing[] = items.slice(0, limit).map((it) => {
      const ai = it?.asset_info ?? {};
      const info = ai?.info ?? {};
      const paint = ai?.paintwear != null ? Number(ai.paintwear) : null;
      const stickers: Listing["stickers"] = Array.isArray(info?.stickers)
        ? info.stickers
            .filter((s: any) => s?.name)
            .map((s: any) => ({ name: String(s.name), img: s?.img_url ?? null }))
        : [];
      const priceCny = Number(it?.price ?? 0);
      return {
        id: String(it?.id ?? ""),
        price_cny: priceCny,
        price_mnt: rate > 0 ? Math.round(priceCny * rate) : 0,
        float: Number.isFinite(paint) ? paint : null,
        stattrak: Boolean(skin.stattrak),
        paint_seed: info?.paintseed != null ? Number(info.paintseed) : null,
        wear_name: ai?.info?.tags?.exterior?.localized_name ?? null,
        stickers,
        buff_url: `https://buff.163.com/goods/${skin.buff_id}`,
      };
    });

    return json({
      success: true,
      listings,
      rate_cny_mnt: rate,
      buff_url: `https://buff.163.com/goods/${skin.buff_id}`,
    });
  } catch (e) {
    return json({ success: false, error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
