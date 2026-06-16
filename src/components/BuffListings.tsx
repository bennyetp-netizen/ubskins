import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMNT } from "@/data/skins";
import { formatCNY } from "@/data/payment";

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

interface Props {
  skinId: string;
  limit?: number;
}

export default function BuffListings({ skinId, limit = 5 }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buffUrl, setBuffUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke("buff-listings", {
        body: { skinId, limit },
      });
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if (!data?.success) {
        setError(data?.error ?? "Алдаа");
      } else {
        setListings((data.listings ?? []) as Listing[]);
        setBuffUrl(data.buff_url ?? null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [skinId, limit]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card/40 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Buff163 хямд саналууд
        </p>
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Татаж байна...
        </div>
      </div>
    );
  }

  if (error || listings.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card/40 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Buff163 хямд саналууд
        </p>
        <p className="text-sm text-muted-foreground">
          {error ? `Татаж чадсангүй: ${error}` : "Одоогоор listing олдсонгүй."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Buff163 хямд {listings.length} санал
        </p>
        {buffUrl && (
          <a
            href={buffUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Buff163 дээр үзэх <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="space-y-2">
        {listings.map((l, i) => (
          <div
            key={l.id || i}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">
                #{i + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold">
                    Float: {l.float != null ? l.float.toFixed(6) : "—"}
                  </span>
                  {l.stattrak && (
                    <Badge className="h-5 border-warning/30 bg-warning/10 px-1.5 text-[10px] text-warning">
                      StatTrak™
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {l.wear_name ?? "—"}
                  {l.paint_seed != null ? ` · Seed ${l.paint_seed}` : ""}
                  {l.stickers.length > 0 ? ` · ${l.stickers.length} стикер` : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-sm font-bold text-foreground">
                {l.price_mnt > 0 ? formatMNT(l.price_mnt) : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">{formatCNY(l.price_cny)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
