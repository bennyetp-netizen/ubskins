import { TrendingUp, Info, ShieldCheck, BadgeCheck, Repeat, Wallet, Smartphone } from "lucide-react";
import { formatMNT } from "@/data/skins";
import { mntToCny, formatCNY } from "@/data/payment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface Props {
  finalPriceMnt: number;
}

const LOCAL_MARKUP = 0.15;

const MarketPriceReference = ({ finalPriceMnt }: Props) => {
  const { t } = useTranslation();
  const finalCny = mntToCny(finalPriceMnt);
  const buffCny = Math.max(1, Math.round(finalCny / (1 + LOCAL_MARKUP)));
  const diffPct = ((finalCny - buffCny) / buffCny) * 100;
  const competitive = diffPct <= 18;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mt-5 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/5 via-card/60 to-background p-5 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sky-400" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-sky-300">
              {t("mpr.title")}
            </h3>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-sky-300 transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px] border-sky-400/30 bg-card text-xs">
              {t("mpr.tooltip")}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="group rounded-xl border border-border/60 bg-background/40 p-4 transition-all hover:border-sky-400/40 hover:bg-sky-500/5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-sky-500/20 text-[9px] font-black text-sky-300">M</span>
              {t("mpr.marketLabel")}
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-foreground/90">
              {formatCNY(buffCny)}
              <span className="ml-1 text-xs font-medium text-muted-foreground">CNY</span>
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{t("mpr.marketSub")}</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.4)] transition-all hover:shadow-[0_0_32px_-4px_hsl(var(--primary)/0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3 w-3" />
                {t("mpr.finalLabel")}
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-gradient-primary">
                {formatMNT(finalPriceMnt)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{t("mpr.finalSub", { cny: formatCNY(finalCny) })}</p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {t("mpr.footer")}
        </p>

        {competitive && (
          <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {t("mpr.competitive")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
            <Wallet className="h-2.5 w-2.5" /> {t("mpr.storepay")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
            <Smartphone className="h-2.5 w-2.5" /> {t("mpr.qpay")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
            <BadgeCheck className="h-2.5 w-2.5" /> {t("mpr.floatChecked")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            <Repeat className="h-2.5 w-2.5" /> {t("mpr.tradeVerified")}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MarketPriceReference;
