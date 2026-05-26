import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mapSkinRow, type Skin, type SkinRow } from "@/data/skins";

interface Options {
  featuredOnly?: boolean;
  includeInactive?: boolean; // admin only
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
    while (true) {
      let query = supabase
        .from("skins")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (!includeInactive) query = query.eq("is_active", true);
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
      const { data } = await supabase.from("skins").select("*").eq("id", id).maybeSingle();
      if (data) setSkin(mapSkinRow(data as SkinRow));
      setLoading(false);
    })();
  }, [id]);

  return { skin, loading };
}
