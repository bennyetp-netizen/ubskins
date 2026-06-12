import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import SkinCard from "@/components/SkinCard";
import { type Wear, formatMNT } from "@/data/skins";
import { useSkins } from "@/hooks/useSkins";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 12;
const STATE_KEY = "shop:state";

type SavedState = {
  q: string;
  typeFilter: "all" | "ready" | "preorder";
  weapons: string[];
  wears: Wear[];
  minPrice: number;
  maxPrice: number;
  sort: "price-asc" | "price-desc" | "float-asc";
  page: number;
  scrollY: number;
};

const PRICE_MIN = 0;
const PRICE_MAX = 5000000;
const PRICE_STEP = 50000;

const readSaved = (): Partial<SavedState> => {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY) || "{}");
  } catch {
    return {};
  }
};

const weaponOptions = ["AK-47", "AWP", "M4A4", "M4A1-S", "Desert Eagle", "USP-S", "Glock-18", "Knife", "Gloves", "Agent", "Sticker", "Charm"];
const knifeOptions = [
  "Karambit", "M9 Bayonet", "Bayonet", "Butterfly Knife", "Flip Knife", "Gut Knife",
  "Huntsman Knife", "Falchion Knife", "Bowie Knife", "Shadow Daggers", "Navaja Knife",
  "Stiletto Knife", "Talon Knife", "Ursus Knife", "Classic Knife", "Nomad Knife",
  "Paracord Knife", "Survival Knife", "Skeleton Knife", "Kukri Knife",
];
const wearOptions: Wear[] = ["FN", "MW", "FT", "WW", "BS"];
type TypeFilter = "all" | "ready" | "preorder";

const Shop = () => {
  const { t } = useTranslation();
  const { skins, loading } = useSkins();
  const saved = useRef<Partial<SavedState>>(readSaved()).current;
  const [q, setQ] = useState(saved.q ?? "");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(saved.typeFilter ?? "all");
  const [weapons, setWeapons] = useState<string[]>(saved.weapons ?? []);
  const [wears, setWears] = useState<Wear[]>(saved.wears ?? []);
  const [minPrice, setMinPrice] = useState(saved.minPrice ?? PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(saved.maxPrice ?? PRICE_MAX);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "float-asc">(saved.sort ?? "price-asc");
  const [page, setPage] = useState(saved.page ?? 1);
  const restoredScroll = useRef(false);

  const filtered = useMemo(() => {
    let list = skins.filter((s) => {
      if (typeFilter !== "all" && s.productType !== typeFilter) return false;
      if (q && !`${s.weaponName} ${s.name}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (weapons.length) {
        const sw = s.weapon.toLowerCase();
        const knifeSubs = weapons.filter((w) => knifeOptions.includes(w));
        const others = weapons.filter((w) => w !== "Knife" && !knifeOptions.includes(w));
        const match = others.some((w) => sw.includes(w.toLowerCase()))
          || (knifeSubs.length
            ? knifeSubs.some((k) => sw.includes(k.toLowerCase()))
            : weapons.includes("Knife")
              ? (knifeOptions.some((k) => sw.includes(k.toLowerCase())) || sw.includes("knife"))
              : false);
        if (!match) return false;
      }
      if (wears.length && !wears.includes(s.wear)) return false;
      if (s.price > maxPrice || s.price < minPrice) return false;
      return true;
    });
    const groups = new Map<string, typeof list[number]>();
    for (const s of list) {
      const key = `${s.weapon}|${s.name}`;
      const existing = groups.get(key);
      if (!existing || s.price < existing.price) groups.set(key, s);
    }
    list = Array.from(groups.values());
    list = [...list].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : a.float - b.float
    );
    return list;
  }, [skins, q, typeFilter, weapons, wears, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const isFirstFilterChange = useRef(true);
  useEffect(() => {
    if (isFirstFilterChange.current) {
      isFirstFilterChange.current = false;
      return;
    }
    setPage(1);
  }, [q, typeFilter, weapons, wears, minPrice, maxPrice, sort]);

  useEffect(() => {
    if (loading || restoredScroll.current) return;
    if (typeof saved.scrollY === "number") {
      window.scrollTo({ top: saved.scrollY, behavior: "instant" as ScrollBehavior });
    }
    restoredScroll.current = true;
  }, [loading, saved.scrollY]);

  useEffect(() => {
    const save = () => {
      const state: SavedState = { q, typeFilter, weapons, wears, minPrice, maxPrice, sort, page: currentPage, scrollY: window.scrollY };
      sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    };
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, [q, typeFilter, weapons, wears, minPrice, maxPrice, sort, currentPage]);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = <T,>(arr: T[], v: T, set: (n: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const typeTabs: { key: TypeFilter; label: string; count: number }[] = [
    { key: "all", label: t("shop.tabAll"), count: skins.length },
    { key: "ready", label: t("shop.tabReady"), count: skins.filter((s) => s.productType === "ready").length },
    { key: "preorder", label: t("shop.tabPreorder"), count: skins.filter((s) => s.productType === "preorder").length },
  ];

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t("shop.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("shop.sub")}</p>
      </div>

      <div className="glass-card mb-5 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("shop.searchPlaceholder")}
            className="h-11 border-transparent bg-secondary/40 pl-9 text-sm focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-11 rounded-lg border border-border bg-secondary px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="price-asc">{t("shop.sortPriceAsc")}</option>
            <option value="price-desc">{t("shop.sortPriceDesc")}</option>
            <option value="float-asc">{t("shop.sortFloatAsc")}</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {typeTabs.map((tt) => (
          <button
            key={tt.key}
            onClick={() => setTypeFilter(tt.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${
              typeFilter === tt.key
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_hsl(186_100%_50%/0.25)]"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tt.label} <span className="ml-1 opacity-60">({tt.count})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-border bg-gradient-card p-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("shop.weapon")}</p>
            <div className="flex flex-wrap gap-2">
              {weaponOptions.map((w) => (
                <button
                  key={w}
                  onClick={() => toggle(weapons, w, setWeapons)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    weapons.includes(w)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            {weapons.includes("Knife") && (
              <div className="mt-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("shop.knifeType")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {knifeOptions.map((k) => (
                    <button
                      key={k}
                      onClick={() => toggle(weapons, k, setWeapons)}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
                        weapons.includes(k)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("shop.wear")}</p>
            <div className="flex flex-wrap gap-2">
              {wearOptions.map((w) => (
                <button
                  key={w}
                  onClick={() => toggle(wears, w, setWears)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    wears.includes(w)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("shop.priceRange")}</p>
              <span className="text-xs text-foreground">
                {formatMNT(minPrice)} – {formatMNT(maxPrice)}
              </span>
            </div>
            <Slider
              value={[minPrice, maxPrice]}
              onValueChange={(v) => {
                const [lo, hi] = v;
                setMinPrice(Math.min(lo, hi));
                setMaxPrice(Math.max(lo, hi));
              }}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              minStepsBetweenThumbs={1}
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{t("shop.min")}</span>
              <span>{t("shop.max")}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setQ("");
              setWeapons([]);
              setWears([]);
              setMinPrice(PRICE_MIN);
              setMaxPrice(PRICE_MAX);
              setTypeFilter("all");
            }}
          >
            {t("shop.clear")}
          </Button>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> {t("shop.tabAll").toLowerCase() === "all" ? "skins found" : "скин олдсон"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> {t("shop.liveStock")}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-border p-20 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("common.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {skins.length === 0 ? t("shop.empty") : t("shop.noMatch")}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((s) => (
                  <SkinCard key={s.id} skin={s} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center gap-2">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-muted-foreground">…</span>
                        )}
                        <Button
                          variant={p === currentPage ? "default" : "outline"}
                          size="sm"
                          className="min-w-9"
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </Button>
                      </span>
                    ))}
                  <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-muted-foreground">
                {t("shop.pageInfo", { cur: currentPage, total: totalPages, count: filtered.length })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
