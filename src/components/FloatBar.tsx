import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FloatBarProps {
  float: number;
}

const tiers = [
  { key: "FN", label: "Factory New", short: "FN", start: 0, end: 0.07, color: "from-emerald-400 to-emerald-500" },
  { key: "MW", label: "Minimal Wear", short: "MW", start: 0.07, end: 0.15, color: "from-lime-400 to-lime-500" },
  { key: "FT", label: "Field-Tested", short: "FT", start: 0.15, end: 0.38, color: "from-yellow-400 to-yellow-500" },
  { key: "WW", label: "Well-Worn", short: "WW", start: 0.38, end: 0.45, color: "from-orange-400 to-orange-500" },
  { key: "BS", label: "Battle-Scarred", short: "BS", start: 0.45, end: 1, color: "from-red-500 to-red-600" },
];

const FloatBar = ({ float }: FloatBarProps) => {
  const clamped = Math.max(0, Math.min(1, float));
  const pct = clamped * 100;
  const currentTier = tiers.find((t) => clamped >= t.start && clamped < t.end) ?? tiers[tiers.length - 1];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="glass-card group rounded-2xl p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_30px_-5px_hsl(186_100%_50%/0.35)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Float Value
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground/70 hover:text-primary">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                Float бага байх тусам скин илүү цэвэрхэн харагдана.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-gradient-primary tabular-nums">
              {clamped.toFixed(4)}
            </span>
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {currentTier.short}
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="relative">
          <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-secondary/60 ring-1 ring-border/60">
            {tiers.map((t) => (
              <div
                key={t.key}
                className={`h-full bg-gradient-to-r ${t.color} ${
                  currentTier.key === t.key ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                } transition-opacity`}
                style={{ width: `${(t.end - t.start) * 100}%` }}
              />
            ))}
          </div>

          {/* Marker */}
          <div
            className="pointer-events-none absolute -top-1.5 z-10 -translate-x-1/2"
            style={{ left: `${pct}%` }}
          >
            <div className="relative flex flex-col items-center">
              <div className="h-6 w-[3px] rounded-full bg-foreground shadow-[0_0_12px_hsl(0_0%_100%/0.8)]" />
              <div className="absolute -top-1 h-2.5 w-2.5 -translate-y-full rounded-full bg-foreground shadow-[0_0_16px_hsl(186_100%_70%/0.9)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="mt-3 grid grid-cols-5 gap-1 text-[10px]">
          {tiers.map((t) => {
            const active = currentTier.key === t.key;
            return (
              <div
                key={t.key}
                className={`flex flex-col items-center rounded-md px-1 py-1 text-center transition-all ${
                  active
                    ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground"
                }`}
              >
                <span className="font-semibold">{t.short}</span>
                <span className="hidden sm:block opacity-70">{t.label}</span>
                <span className="opacity-60 tabular-nums">
                  {t.start.toFixed(2)}–{t.end.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloatBar;
