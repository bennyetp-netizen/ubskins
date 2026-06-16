import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mapSkinRow, type Skin, type SkinRow } from "@/data/skins";

// Public reads go through the `skins_public` view, which exposes only the
// 20 customer-facing columns. BUFF sourcing fields (`buff_id`,
// `buff_price_cny`) are not selectable via this path at the database level.
const PUBLIC_VIEW = "skins_public" as const;
const PUBLIC_COLS =
  "id,name,weapon,weapon_type,game,wear,float_value,price_mnt,image_url,rarity,description,stattrak,is_active,is_featured,stock,stock_quantity,product_type,is_available,created_at,last_synced_at";

interface Options {
  featuredOnly?: boolean;
  includeInactive?: boolean; // admin only — uses base table via admin RLS
}

export function useSkins(options: Options = {}) {
  const { featuredOnly = false, includeInactive = false } = options;
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const PAGE = 1000;
    let from = 0;
    const all: SkinRow[] = [];
    const source = includeInactive ? "skins" : PUBLIC_VIEW;
    while (true) {
      let query = (supabase as any)
        .from(source)
        .select(PUBLIC_COLS)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (featuredOnly) query = query.eq("is_featured", true);
      const { data, error } = await query;
      if (error) {
        setError(error.message);
        break;
      }
      const rows = (data ?? []) as SkinRow[];
      all.push(...rows);
      if (rows.length < PAGE) break;
      from += PAGE;
    }
    setSkins(all.map(mapSkinRow));
    setLoading(false);
  }, [featuredOnly, includeInactive]);

  useEffect(() => {
    load();
  }, [load]);

  return { skins, loading, error, reload: load };
}

export function useSkin(id: string | undefined) {
  const [skin, setSkin] = useState<Skin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from(PUBLIC_VIEW)
        .select(PUBLIC_COLS)
        .eq("id", id)
        .maybeSingle();
      if (data) setSkin(mapSkinRow(data as SkinRow));
      setLoading(false);
    })();
  }, [id]);

  return { skin, loading };
}
