import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Trash2, ShoppingBag, ShieldCheck, Globe2, Loader2, LogIn, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatMNT, wearColor } from "@/data/skins";
import { PAYMENTS, calcPrepayment, mntToCny, formatCNY, type PaymentMethod } from "@/data/payment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cart = () => {
  const { items, remove, clear, total } = useCart();
  const { user, signInWithSteam } = useAuth();
  const nav = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("bank");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-item deposit: ready=100% (no deposit), preorder=30%
  const itemDeposit = (skin: typeof items[number]["skin"]) =>
    skin.productType === "preorder" ? calcPrepayment(skin.price) : skin.price;
  const totalDeposit = items.reduce((s, { skin }) => s + itemDeposit(skin), 0);
  const totalRemaining = total - totalDeposit;
  const cnyTotal = mntToCny(total);
  const hasPreorder = items.some(({ skin }) => skin.productType === "preorder");
  const hasReady = items.some(({ skin }) => skin.productType === "ready");

  const handleCreateOrder = async () => {
    if (!user) {
      toast.error("Эхлээд Steam-р нэвтэрнэ үү");
      try { await signInWithSteam(); } catch (e) {
        toast.error(e instanceof Error ? e.message : "Нэвтрэх алдаа");
      }
      return;
    }
    if (items.length === 0) return;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      toast.error("Утасны дугаараа зөв оруулна уу");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("И-мэйл хаягаа зөв оруулна уу");
      return;
    }

    setSubmitting(true);
    try {
      const rows = items.map(({ skin }) => {
        const deposit = itemDeposit(skin);
        return {
          user_id: user.id,
          skin_id: skin.id,
          skin_name: `${skin.weaponName} | ${skin.name}`,
          skin_image: skin.image,
          wear: skin.wear,
          float_value: skin.float,
          price_mnt: skin.price,
          payment_method: method,
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          status: "pending" as const,
          product_type: skin.productType,
          deposit_amount: deposit,
          remaining_amount: skin.price - deposit,
        };
      });

      const { data: inserted, error } = await supabase
        .from("orders")
        .insert(rows as any)
        .select("id");
      if (error) throw error;

      toast.success("✅ Захиалга амжилттай! Төлбөрийн заавар руу шилжиж байна...");
      clear();
      const firstId = inserted?.[0]?.id;
      setTimeout(() => nav(firstId ? `/orders?open=${firstId}` : "/orders"), 500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Захиалга үүсгэхэд алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold">Сагс хоосон байна</h1>
        <p className="mt-1 text-muted-foreground">Дэлгүүрээс дуртай скинээ сонгоно уу.</p>
        <Link to="/shop"><Button variant="hero" className="mt-6">Дэлгүүр рүү</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Сагс / Захиалга</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Захиалгаа үүсгээд Хаан банкны дансруу 30% урьдчилгаа шилжүүлээрэй.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {items.map(({ skin, lineId }) => {
            return (
              <div key={lineId} className="flex gap-4 rounded-2xl border border-border bg-gradient-card p-4">
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                  <img src={skin.image || "/placeholder.svg"} alt={skin.name} referrerPolicy="no-referrer" onError={(e) => { const i = e.currentTarget; if (!i.src.endsWith("/placeholder.svg")) i.src = "/placeholder.svg"; }} className="max-h-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{skin.weaponName}</p>
                    <p className="font-display font-semibold">{skin.name}</p>
                    <p className={`text-xs ${wearColor[skin.wear]}`}>{skin.wear} · Float {skin.float.toFixed(3)}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="font-display text-lg font-bold">{formatMNT(skin.price)}</p>
                    <Button variant="ghost" size="icon" onClick={() => remove(lineId)} aria-label="Устгах">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary + Payment selection */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <h3 className="font-display text-lg font-semibold">Захиалгын хураангуй</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Барааны тоо</span><span>{items.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Үйлчилгээний шимтгэл</span><span>0₮</span>
              </div>
              <div className="my-3 border-t border-border" />
              <div className="flex justify-between font-display text-lg font-bold">
                <span>Нийт</span><span className="text-gradient-primary">{formatMNT(total)}</span>
              </div>
              <p className="text-right text-xs text-muted-foreground">≈ {formatCNY(cnyTotal)} CNY</p>
              {hasPreorder && hasReady ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-xs font-semibold text-emerald-400">🟢 Бэлэн скин — бүтэн төлбөр</p>
                    <p className="mt-0.5 font-display text-base font-bold">
                      {formatMNT(items.filter(i => i.skin.productType === "ready").reduce((s, i) => s + i.skin.price, 0))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                    <p className="text-xs font-semibold text-orange-400">🟡 Захиалга — 30% урьдчилгаа</p>
                    <p className="mt-0.5 font-display text-base font-bold">
                      {formatMNT(items.filter(i => i.skin.productType === "preorder").reduce((s, i) => s + calcPrepayment(i.skin.price), 0))}
                    </p>
                  </div>
                </div>
              ) : hasPreorder ? (
                <div className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                  <p className="text-xs font-semibold text-orange-400">🟡 ЗАХИАЛГА — 30% урьдчилгаа</p>
                  <p className="mt-0.5 font-display text-base font-bold">{formatMNT(totalDeposit)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Үлдэгдэл {formatMNT(totalRemaining)} — скин ирмэгц төлнө.
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-xs font-semibold text-emerald-400">🟢 БЭЛЭН — бүтэн төлбөр</p>
                  <p className="mt-0.5 font-display text-base font-bold">{formatMNT(total)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Төлбөр баталгаажсаны дараа Steam trade offer шууд илгээнэ.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Phone number */}
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <Label htmlFor="phone" className="flex items-center gap-2 font-display text-base font-semibold">
              <Phone className="h-4 w-4 text-accent" /> Холбоо барих утас
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="9911-2233"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Захиалга баталгаажихад тантай холбогдоход хэрэгтэй.
            </p>
          </div>

          {/* Email */}
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <Label htmlFor="email" className="flex items-center gap-2 font-display text-base font-semibold">
              <Mail className="h-4 w-4 text-accent" /> И-мэйл хаяг
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Захиалга баталгаажсан болон скин ирсэн мэдэгдлийг и-мэйлээр илгээнэ.
            </p>
          </div>



          {/* Payment method picker */}
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-accent" />
              <h3 className="font-display text-base font-semibold">Төлбөрийн арга</h3>
            </div>
            <div className="space-y-2">
              {(Object.values(PAYMENTS)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setMethod(p.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    method === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold">{p.label}</span>
                    <span
                      className={`h-3 w-3 rounded-full border-2 ${
                        method === p.id ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{p.badge}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
              ⚠️ Эцсийн үнэ нь float, хээ болон зах зээлийн нөөцөөс хамаарч бага зэрэг өөрчлөгдөж болно.
              Хүргэхээс өмнө бид яг ямар скин болохыг танд баталгаажуулна.
            </div>

            <Button
              variant="hero"
              size="lg"
              className="mt-4 w-full"
              onClick={handleCreateOrder}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Үүсгэж байна...</>
              ) : !user ? (
                <><LogIn className="mr-1.5 h-4 w-4" /> Нэвтэрч захиалга үүсгэх</>
              ) : (
                <>Захиалга үүсгэх</>
              )}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Захиалга үүсгэсний дараа төлбөрийн заавар автоматаар харагдана
            </p>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" /> Хамгаалалттай төлбөр
            </div>
            <p className="text-muted-foreground">
              Урьдчилгаа төлбөр баталгаажсаны дараа скинийг reserve хийнэ. Үлдэгдэл төлбөр баталгаажмагц Steam trade offer автоматаар явна.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
