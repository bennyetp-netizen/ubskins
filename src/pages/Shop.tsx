import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import SkinCard from "@/components/SkinCard";
import { type Wear } from "@/data/skins";
import { useSkins } from "@/hooks/useSkins";

const weaponOptions = ["Rifle", "Sniper", "Knife", "Pistol", "SMG"];
const wearOptions: Wear[] = ["FN", "MW", "FT", "WW", "BS"];

const Shop = () => {
  const { skins, loading } = useSkins();
  const [q, setQ] = useState("");
  const [weapons, setWeapons] = useState<string[]>([]);
  const [wears, setWears] = useState<Wear[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "float-asc">("price-asc");

  const filtered = useMemo(() => {
    let list = skins.filter((s) => {
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
  }, [skins, q, weapons, wears, maxPrice, sort]);

  const toggle = <T,>(arr: T[], v: T, set: (n: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Скин дэлгүүр</h1>
        <p className="mt-1 text-muted-foreground">Зэвсэг, wear, float, үнээр шүүж сонго</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6 rounded-2xl border border-border bg-gradient-card p-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Search className="h-3.5 w-3.5" /> Хайх
            </label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="AK-47, Asiimov..." />
          </div>

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
            }}
          >
            Шүүлтүүр цэвэрлэх
          </Button>
        </aside>

        {/* Grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} скин олдсон</p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="price-asc">Үнэ: бага → их</option>
                <option value="price-desc">Үнэ: их → бага</option>
                <option value="float-asc">Float: сайн → муу</option>
              </select>
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
