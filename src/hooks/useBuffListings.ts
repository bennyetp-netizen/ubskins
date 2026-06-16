import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BuffListing {
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

interface State {
  listings: BuffListing[];
  loading: boolean;
  error: string | null;
  buffUrl: string | null;
}

export function useBuffListings(skinId: string | undefined, limit = 5): State {
  const [state, setState] = useState<State>({
    listings: [],
    loading: true,
    error: null,
    buffUrl: null,
  });

  useEffect(() => {
    if (!skinId) {
      setState({ listings: [], loading: false, error: null, buffUrl: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      const { data, error } = await supabase.functions.invoke("buff-listings", {
        body: { skinId, limit },
      });
      if (cancelled) return;
      if (error) {
        setState({ listings: [], loading: false, error: error.message, buffUrl: null });
      } else if (!data?.success) {
        setState({
          listings: [],
          loading: false,
          error: data?.error ?? "Алдаа",
          buffUrl: null,
        });
      } else {
        setState({
          listings: (data.listings ?? []) as BuffListing[],
          loading: false,
          error: null,
          buffUrl: data.buff_url ?? null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skinId, limit]);

  return state;
}
