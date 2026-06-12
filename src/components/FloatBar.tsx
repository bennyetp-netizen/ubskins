import { Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface FloatBarProps {
  float: number;
  /** If provided, the bar becomes draggable and calls this with the new float value */
  onChange?: (value: number) => void;
  interactive?: boolean;
}

const baseTiers = [
  { key: "FN", short: "FN", start: 0, end: 0.07, color: "from-emerald-400 to-emerald-500" },
  { key: "MW", short: "MW", start: 0.07, end: 0.15, color: "from-lime-400 to-lime-500" },
  { key: "FT", short: "FT", start: 0.15, end: 0.38, color: "from-yellow-400 to-yellow-500" },
  { key: "WW", short: "WW", start: 0.38, end: 0.45, color: "from-orange-400 to-orange-500" },
  { key: "BS", short: "BS", start: 0.45, end: 1, color: "from-red-500 to-red-600" },
];

const FloatBar = ({ float, onChange, interactive }: FloatBarProps) => {
  const { t } = useTranslation();
  const tiers = baseTiers.map((b) => ({ ...b, label: t(`wearTier.${b.key}`) }));
  const isInteractive = interactive ?? Boolean(onChange);
  const clamped = Math.max(0, Math.min(1, float));
  const pct = clamped * 100;
  const currentTier = tiers.find((t) => clamped >= t.start && clamped < t.end) ?? tiers[tiers.length - 1];

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || !onChange) return;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const next = Math.max(0, Math.min(1, ratio));
      onChange(Math.round(next * 10000) / 10000);
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updateFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, updateFromClientX]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (!isInteractive || !onChange) return;
    const step = e.shiftKey ? 0.01 : 0.001;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, Math.round((clamped - step) * 10000) / 10000));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(1, Math.round((clamped + step) * 10000) / 10000));
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="glass-card group rounded-2xl p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_30px_-5px_hsl(186_100%_50%/0.35)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("floatBar.label")} {isInteractive && <span className="ml-1 text-primary/80">· {t("floatBar.dragHint")}</span>}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground/70 hover:text-primary">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                {t("floatBar.tooltip")} {isInteractive && t("floatBar.tooltipInteractive")}
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
        <div
          className={`relative ${isInteractive ? "cursor-pointer touch-none select-none py-3 -my-3" : ""}`}
          onPointerDown={handlePointerDown}
          role={isInteractive ? "slider" : undefined}
          aria-valuemin={isInteractive ? 0 : undefined}
          aria-valuemax={isInteractive ? 1 : undefined}
          aria-valuenow={isInteractive ? clamped : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={handleKey}
        >
          <div
            ref={trackRef}
            className="relative flex h-3 w-full overflow-hidden rounded-full bg-secondary/60 ring-1 ring-border/60"
          >
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
            className={`absolute -top-1.5 z-10 -translate-x-1/2 ${
              isInteractive ? "" : "pointer-events-none"
            }`}
            style={{ left: `${pct}%` }}
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`h-6 w-[3px] rounded-full bg-foreground shadow-[0_0_12px_hsl(0_0%_100%/0.8)] ${
                  dragging ? "scale-110" : ""
                }`}
              />
              <div
                className={`absolute -top-1 -translate-y-full rounded-full bg-foreground shadow-[0_0_16px_hsl(186_100%_70%/0.9)] ${
                  isInteractive
                    ? `h-3.5 w-3.5 ring-2 ring-primary/40 ${dragging ? "scale-125" : "hover:scale-110"} transition-transform cursor-grab active:cursor-grabbing`
                    : "h-2.5 w-2.5 animate-pulse"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="mt-3 grid grid-cols-5 gap-1 text-[10px]">
          {tiers.map((t) => {
            const active = currentTier.key === t.key;
            return (
              <button
                key={t.key}
                type="button"
                disabled={!isInteractive}
                onClick={() => onChange?.(Math.round(((t.start + t.end) / 2) * 10000) / 10000)}
                className={`flex flex-col items-center rounded-md px-1 py-1 text-center transition-all ${
                  active
                    ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground"
                } ${isInteractive ? "hover:bg-primary/5 hover:text-foreground cursor-pointer" : "cursor-default"}`}
              >
                <span className="font-semibold">{t.short}</span>
                <span className="hidden sm:block opacity-70">{t.label}</span>
                <span className="opacity-60 tabular-nums">
                  {t.start.toFixed(2)}–{t.end.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloatBar;
