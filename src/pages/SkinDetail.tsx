import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, Truck, Tag, Loader2, Globe2, ShoppingCart, BadgeCheck, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMNT, wearLabel, wearColor } from "@/data/skins";
import { calcPrepayment, mntToCny, formatCNY } from "@/data/payment";
import SkinCard from "@/components/SkinCard";
import MarketPriceReference from "@/components/MarketPriceReference";
import { useCart } from "@/hooks/useCart";
import { useSkin, useSkins } from "@/hooks/useSkins";
import { toast } from "sonner";

const WEAR_ORDER: Array<"FN" | "MW" | "FT" | "WW" | "BS"> = ["FN", "MW", "FT", "WW", "BS"];
const DEFAULT_FLOAT: Record<typeof WEAR_ORDER[number], number> = {
  FN: 0.03, MW: 0.10, FT: 0.20, WW: 0.40, BS: 0.55,
};

const SkinDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { skin: dbSkin, loading } = useSkin(id);
  const { skins: all } = useSkins();
  const { add } = useCart();
  const [overrideWear, setOverrideWear] = useState<typeof WEAR_ORDER[number] | null>(null);

  // Хэрэв DB-д тухайн wear-тэй мөр байхгүй бол одоогийн скиныг wear-оор нь
  // override хийж харуулна (preorder болгож сагсанд нэмнэ).
  const skin = dbSkin && overrideWear && overrideWear !== dbSkin.wear
    ? { ...dbSkin, wear: overrideWear, float: DEFAULT_FLOAT[overrideWear], productType: "preorder" as const }
    : dbSkin;

  // Same skin's other wear variants (group by weapon + name).
  const variants = skin
    ? all
        .filter((s) => s.weapon === skin.weapon && s.name === skin.name)
        .reduce((acc: typeof all, s) => {
          // Keep the cheapest listing per wear.
          const existing = acc.find((x) => x.wear === s.wear);
          if (!existing) acc.push(s);
          else if (s.price < existing.price)
            acc.splice(acc.indexOf(existing), 1, s);
          return acc;
        }, [])
        .sort((a, b) => WEAR_ORDER.indexOf(a.wear) - WEAR_ORDER.indexOf(b.wear))
    : [];

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Уншиж байна...
      </div>
    );
  }

  if (!skin) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Скин олдсонгүй.</p>
        <Link to="/shop"><Button variant="outline" className="mt-4">Дэлгүүр рүү</Button></Link>
      </div>
    );
  }

  const related = all.filter((s) => s.id !== skin.id && s.weapon === skin.weapon && s.name !== skin.name).slice(0, 4);

  const orderNow = () => {
    add(skin);
    toast.success("Сагсанд нэмэгдлээ. Захиалга үүсгэх рүү шилжиж байна...");
    setTimeout(() => nav("/cart"), 500);
  };

  return (
    <div className="container py-10">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Дэлгүүр рүү буцах
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary/40 to-background p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(186_100%_50%/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <img src={skin.image || "/placeholder.svg"} alt={`${skin.weaponName} | ${skin.name}`} referrerPolicy="no-referrer" onError={(e) => { const i = e.currentTarget; if (!i.src.endsWith("/placeholder.svg")) i.src = "/placeholder.svg"; }} className="relative mx-auto max-h-[420px] animate-float-slow object-contain" />
          {skin.statTrak && (
            <Badge className="absolute left-5 top-5 border-warning/30 bg-warning/10 text-warning hover:bg-warning/20">StatTrak™</Badge>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">{skin.weaponName}</p>
          <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">{skin.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">{skin.rarity}</Badge>
            <Badge variant="outline" className={`border-current/40 bg-background ${wearColor[skin.wear]}`}>{wearLabel[skin.wear]}</Badge>
            <Badge variant="outline" className="gap-1 border-sky-400/40 bg-sky-400/10 text-sky-300">
              <BadgeCheck className="h-3 w-3" /> Float Checked
            </Badge>
            <Badge variant="outline" className="gap-1 border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
              <Repeat className="h-3 w-3" /> Trade Verified
            </Badge>
          </div>

          {/* Wear selector — бүх 5 wear-ийг харуулж, байхгүйг нь "Боломжгүй" гэж тэмдэглэнэ */}
          <div className="mt-5 rounded-2xl border border-border bg-card/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wear сонгох
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {WEAR_ORDER.map((w) => {
                const v = variants.find((x) => x.wear === w);
                const active = v?.id === skin.id;
                const available = !!v;
                return (
                  <button
                    key={w}
                    disabled={!available || active}
                    onClick={() => v && !active && nav(`/skin/${v.id}`)}
                    className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : available
                          ? "border-border bg-secondary/30 hover:border-primary/50"
                          : "cursor-not-allowed border-dashed border-border bg-secondary/10 opacity-50"
                    }`}
                  >
                    <span className={`font-display text-sm font-bold ${wearColor[w]}`}>{w}</span>
                    <span className="mt-0.5 text-[10px] uppercase text-muted-foreground">
                      {wearLabel[w]}
                    </span>
                    <span className="mt-1 text-xs font-semibold">
                      {available ? formatMNT(v!.price) : "Боломжгүй"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>



          {/* Product type banner */}
          {skin.productType === "ready" ? (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <p className="font-display text-sm font-bold text-emerald-400">
                🟢 БЭЛЭН — Өнөөдөр хүргэнэ
              </p>
              <p className="mt-1 text-xs text-emerald-300/80">
                Энэ скин агуулахад бэлэн байна. Бүтэн төлбөрөө шилжүүлсний дараа Steam trade offer шууд илгээнэ.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4">
              <p className="font-display text-sm font-bold text-orange-400">
                🟡 ЗАХИАЛГА — өдөрт нь хүргэнэ
              </p>
              <p className="mt-1 text-xs text-orange-300/80">
                Захиалгаар авна. 30% урьдчилгаа төлсний дараа худалдан авч, ирмэгц үлдэгдлийг төлж trade offer хүлээн авна.
              </p>
            </div>
          )}

          {/* stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Float</p>
              <p className="mt-1 font-display text-lg font-bold">{skin.float.toFixed(4)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Wear</p>
              <p className={`mt-1 font-display text-lg font-bold ${wearColor[skin.wear]}`}>{skin.wear}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                {skin.productType === "ready" ? "Үлдэгдэл" : "Хүргэх"}
              </p>
              <p className="mt-1 font-display text-lg font-bold">
                {skin.productType === "ready" ? (skin.stockQuantity || skin.stock) : "Өдөрт нь"}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 rounded-2xl border border-border bg-gradient-card p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Үнэ</p>
                <p className="font-display text-4xl font-bold text-gradient-primary">{formatMNT(skin.price)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ {formatCNY(mntToCny(skin.price))} CNY
                </p>
              </div>
              {skin.productType === "preorder" ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Урьдчилгаа (30%)</p>
                  <p className="font-display text-lg font-semibold text-warning">{formatMNT(calcPrepayment(skin.price))}</p>
                  <p className="text-[10px] text-muted-foreground">үлдэгдлийг хүргэх үед</p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Бүтэн төлбөр</p>
                  <p className="font-display text-lg font-semibold text-emerald-400">{formatMNT(skin.price)}</p>
                  <p className="text-[10px] text-muted-foreground">100% урьдчилан</p>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-2">
              <Button variant="hero" size="lg" onClick={orderNow}>
                <Globe2 className="mr-1.5 h-4 w-4" /> Захиалга үүсгэх
              </Button>
              <Button variant="outline" size="lg" onClick={() => { add(skin); toast.success("Сагсанд нэмэгдлээ"); }}>
                <ShoppingCart className="mr-1.5 h-4 w-4" /> Сагсанд нэмэх
              </Button>
            </div>
          </div>

          <MarketPriceReference finalPriceMnt={skin.price} />

          {skin.description && (
            <div className="mt-5 rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
              {skin.description}
            </div>
          )}

          {/* features */}
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> Steam OpenID-р найдвартай нэвтрэлт</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Truck className="h-4 w-4 text-primary" /> Төлбөр баталгаажмагц trade offer автоматаар явна</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4 text-primary" /> Ил тод үнэ, нуугдмал зардалгүй</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold">Ижил төстэй скинүүд</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((s) => <SkinCard key={s.id} skin={s} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default SkinDetail;
