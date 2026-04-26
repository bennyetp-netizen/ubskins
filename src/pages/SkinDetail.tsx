import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Truck, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { skins, formatMNT, storepayMonthly, wearLabel, wearColor } from "@/data/skins";
import SkinCard from "@/components/SkinCard";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const SkinDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const skin = skins.find((s) => s.id === id);
  const { add } = useCart();

  if (!skin) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Скин олдсонгүй.</p>
        <Link to="/shop"><Button variant="outline" className="mt-4">Дэлгүүр рүү</Button></Link>
      </div>
    );
  }

  const related = skins.filter((s) => s.id !== skin.id && s.weapon === skin.weapon).slice(0, 4);

  const buy = (method: "storepay" | "qpay") => {
    add(skin);
    toast.success(`${method === "storepay" ? "Storepay" : "QPay"} төлбөрт шилжиж байна...`);
    setTimeout(() => nav("/cart"), 600);
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
          <img src={skin.image} alt={`${skin.weaponName} | ${skin.name}`} className="relative mx-auto max-h-[420px] animate-float-slow object-contain" />
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
          </div>

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
              <p className="text-xs text-muted-foreground">Үлдэгдэл</p>
              <p className="mt-1 font-display text-lg font-bold">{skin.stock}</p>
            </div>
          </div>

          {/* float bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>0.00</span><span>0.07</span><span>0.15</span><span>0.38</span><span>0.45</span><span>1.00</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
              <div className="absolute inset-y-0 left-0 w-[7%] bg-wear-fn" />
              <div className="absolute inset-y-0 left-[7%] w-[8%] bg-wear-mw" />
              <div className="absolute inset-y-0 left-[15%] w-[23%] bg-wear-ft" />
              <div className="absolute inset-y-0 left-[38%] w-[7%] bg-wear-ww" />
              <div className="absolute inset-y-0 left-[45%] right-0 bg-wear-bs" />
              <div className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-foreground shadow-lg" style={{ left: `${skin.float * 100}%` }} />
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 rounded-2xl border border-border bg-gradient-card p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Үнэ</p>
                <p className="font-display text-4xl font-bold text-gradient-primary">{formatMNT(skin.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Storepay</p>
                <p className="font-display text-lg font-semibold text-accent">{formatMNT(storepayMonthly(skin.price))} × 4</p>
                <p className="text-[10px] text-muted-foreground">хүүгүй</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button variant="storepay" size="lg" onClick={() => buy("storepay")}>
                Storepay-р авах
              </Button>
              <Button variant="qpay" size="lg" onClick={() => buy("qpay")}>
                QPay-р авах
              </Button>
            </div>
            <Button variant="outline" size="lg" className="mt-2 w-full" onClick={() => { add(skin); toast.success("Сагсанд нэмэгдлээ"); }}>
              <Plus className="mr-1.5 h-4 w-4" /> Сагсанд нэмэх
            </Button>
          </div>

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
