import { Sparkles, Info, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FloatPreferenceTier, CartPreferences } from "@/hooks/useCart";

export const FLOAT_TIERS: {
  id: FloatPreferenceTier;
  title: string;
  description: string;
  adjustment: number;
  badge?: string;
}[] = [
  {
    id: "cheapest",
    title: "Cheapest Available",
    description: "Any float, lowest possible price",
    adjustment: 0,
  },
  {
    id: "clean",
    title: "Clean Float",
    description: "Better looking float with cleaner wear",
    adjustment: 5,
    badge: "+5%",
  },
  {
    id: "very_clean",
    title: "Very Clean Float",
    description: "Low float version with cleaner finish",
    adjustment: 10,
    badge: "+10%",
  },
];

interface Props {
  value: CartPreferences;
  onChange: (next: CartPreferences) => void;
}

const FloatPreference = ({ value, onChange }: Props) => {
  const setTier = (tier: typeof FLOAT_TIERS[number]) => {
    onChange({
      ...value,
      floatPreference: tier.id,
      priceAdjustmentPct: tier.adjustment,
    });
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary/30 to-background/40 p-5 backdrop-blur-md shadow-[0_0_30px_-12px_hsl(var(--primary)/0.35)]">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold">Float Preference</h3>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {FLOAT_TIERS.map((tier) => {
          const active = value.floatPreference === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setTier(tier)}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 ${
                active
                  ? "border-primary bg-primary/10 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]"
                  : "border-border bg-card/40 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-semibold">{tier.title}</p>
                {tier.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {tier.description}
              </p>
              <span
                className={`absolute right-2 top-2 h-2 w-2 rounded-full transition-all ${
                  active ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-muted-foreground/20"
                }`}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary/70" />
        Lower float = cleaner and better looking skin appearance.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="exact-float" className="text-xs font-medium text-muted-foreground">
            Exact Float Request <span className="opacity-60">(Optional)</span>
          </Label>
          <Input
            id="exact-float"
            placeholder="Example: 0.15 - 0.18"
            value={value.exactFloatRequest ?? ""}
            onChange={(e) => onChange({ ...value, exactFloatRequest: e.target.value })}
            className="mt-1.5 h-9 bg-card/40 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="sticker-req" className="text-xs font-medium text-muted-foreground">
            Sticker / Pattern Request <span className="opacity-60">(Optional)</span>
          </Label>
          <Input
            id="sticker-req"
            placeholder="Example: Blue gem pattern, crown foil sticker"
            value={value.stickerRequest ?? ""}
            onChange={(e) => onChange({ ...value, stickerRequest: e.target.value })}
            className="mt-1.5 h-9 bg-card/40 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Final price may slightly change depending on float, pattern, and market availability.
          We will confirm the exact skin before delivery.
        </p>
      </div>
    </div>
  );
};

export default FloatPreference;
