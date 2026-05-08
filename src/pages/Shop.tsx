import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import SkinCard from "@/components/SkinCard";
import { type Wear } from "@/data/skins";
import { useSkins } from "@/hooks/useSkins";

const weaponOptions = ["AK-47", "AWP", "M4A4", "M4A1-S", "Desert Eagle", "USP-S", "Glock-18", "Knife", "Gloves"];
const wearOptions: Wear[] = ["FN", "MW", "FT", "WW", "BS"];
type TypeFilter = "all" | "ready" | "preorder";

const Shop = () => {
  const { skins, loading } = useSkins();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [weapons, setWeapons] = useState<string[]>([]);
  const [wears, setWears] = useState<Wear[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "float-asc">("price-asc");

  const filtered = useMemo(() => {
    let list = skins.filter((s) => {
      if (typeFilter !== "all" && s.productType !== typeFilter) return false;
      if (q && !`${s.weaponName} ${s.name}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (weapons.length && !weapons.some((w) => s.weapon.toLowerCase().includes(w.toLowerCase()))) return false;
      if (wears.length && !wears.includes(s.wear)) return false;
      if (s.price > maxPrice) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : a.float - b.float
    );
    return list;
  }, [skins, q, typeFilter, weapons, wears, maxPrice, sort]);

  const toggle = <T,>(arr: T[], v: T, set: (n: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const typeTabs: { key: TypeFilter; label: string; count: number }[] = [
    { key: "all", label: "Бүгд", count: skins.length },
    { key: "ready", label: "🟢 Бэлэн", count: skins.filter((s) => s.productType === "ready").length },
    { key: "preorder", label: "🟡 Захиалга", count: skins.filter((s) => s.productType === "preorder").length },
  ];

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold md:text-4xl">CS2 Скин Маркет</h1>
        <p className="mt-1 text-muted-foreground">Бэлэн скин эсвэл захиалгаар · Float шалгасан · Trade баталгаажсан</p>
      </div>

      <div className="glass-card mb-5 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="AK-47 Redline, Karambit Doppler, AWP Asiimov…"
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
            <option value="price-asc">Үнэ ↑</option>
            <option value="price-desc">Үнэ ↓</option>
            <option value="float-asc">Float ↑</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {typeTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${
              typeFilter === t.key
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_hsl(186_100%_50%/0.25)]"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="ml-1 opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-border bg-gradient-card p-5 lg:sticky lg:top-24 lg:self-start">

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Зэвсэг</p>
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
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wear</p>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Дээд үнэ</p>
              <span className="text-xs text-foreground">
                {new Intl.NumberFormat("mn-MN").format(maxPrice)}₮
              </span>
            </div>
            <Slider
              value={[maxPrice]}
              onValueChange={(v) => setMaxPrice(v[0])}
              min={100000}
              max={5000000}
              step={50000}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setQ("");
              setWeapons([]);
              setWears([]);
              setMaxPrice(5000000);
              setTypeFilter("all");
            }}
          >
            Шүүлтүүр цэвэрлэх
          </Button>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> скин олдсон
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Шууд агуулах
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-border p-20 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Уншиж байна...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {skins.length === 0 ? "Одоогоор скин нэмэгдээгүй байна." : "Скин олдсонгүй. Шүүлтүүрээ өөрчилнө үү."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => (
                <SkinCard key={s.id} skin={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
