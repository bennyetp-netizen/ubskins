import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { X, ShoppingBag, ShieldCheck, Globe2, Loader2, LogIn, Phone, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatMNT, wearColor } from "@/data/skins";
import { calcPrepayment, mntToCny, formatCNY, getPayments, type PaymentMethod } from "@/data/payment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MAINTENANCE_MODE } from "@/config/maintenance";

const Cart = () => {
  const { t } = useTranslation();
  const PAYMENTS = getPayments(t);
  const { items, remove, clear, total } = useCart();
  const { user, signInWithSteam } = useAuth();
  const nav = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("bank");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const itemDeposit = (skin: typeof items[number]["skin"]) =>
    skin.productType === "preorder" ? calcPrepayment(skin.price) : skin.price;
  const totalDeposit = items.reduce((s, { skin }) => s + itemDeposit(skin), 0);
  const totalRemaining = total - totalDeposit;
  const cnyTotal = mntToCny(total);
  const hasPreorder = items.some(({ skin }) => skin.productType === "preorder");
  const hasReady = items.some(({ skin }) => skin.productType === "ready");

  const handleCreateOrder = async () => {
    if (MAINTENANCE_MODE) {
      toast.error("🛠️ Захиалга авах боломжгүй. Сайт засварын горимд байна.");
      return;
    }
    if (!user) {
      toast.error(t("cart.needLogin"));
      try { await signInWithSteam(); } catch (e) {
        toast.error(e instanceof Error ? e.message : t("cart.loginErr"));
      }
      return;
    }
    if (items.length === 0) return;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      toast.error(t("cart.phoneInvalid"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error(t("cart.emailInvalid"));
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
        .select("id, order_number");
      if (error) throw error;

      try {
        const orderNumber = (inserted?.[0] as any)?.order_number || "";
        if (method !== "qpay") {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "order-confirmation",
              recipientEmail: email.trim().toLowerCase(),
              idempotencyKey: `order-confirmation-${(inserted?.[0] as any)?.id}-create`,
              templateData: {
                orderNumber,
                customerName: user?.user_metadata?.display_name || "",
                items: items.map(({ skin }) => ({
                  name: `${skin.weaponName} | ${skin.name}`,
                  price: skin.price,
                  wear: `${skin.wear} · Float ${skin.float.toFixed(3)}`,
                })),
                total,
                depositAmount: totalDeposit,
                paymentMethod: method,
                ordersUrl: `${window.location.origin}/orders`,
              },
            },
          });
        }

        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-order-notification",
            templateData: {
              orderNumber,
              customerEmail: email.trim().toLowerCase(),
              customerPhone: phone.trim(),
              customerName: user?.user_metadata?.display_name || "",
              items: items.map(({ skin }) => ({
                name: `${skin.weaponName} | ${skin.name}`,
                price: skin.price,
                wear: `${skin.wear} · Float ${skin.float.toFixed(3)}`,
              })),
              total,
              depositAmount: totalDeposit,
              paidAmount: totalDeposit,
              paymentMethod: method,
              adminUrl: `${window.location.origin}/admin`,
            },
          },
        });
      } catch (mailErr) {
        console.warn("email send failed", mailErr);
      }

      toast.success(t("cart.success"));
      clear();
      const firstId = inserted?.[0]?.id;
      setTimeout(() => nav(firstId ? `/orders?open=${firstId}` : "/orders"), 500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("cart.createErr"));
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
        <h1 className="font-display text-2xl font-bold">{t("cart.emptyTitle")}</h1>
        <p className="mt-1 text-muted-foreground">{t("cart.emptyDesc")}</p>
        <Link to="/shop"><Button variant="hero" className="mt-6">{t("cart.toShop")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">{t("cart.title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("cart.intro")}</p>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {items.map(({ skin, lineId }) => (
            <div key={lineId} className="relative flex gap-4 rounded-2xl border border-border bg-gradient-card p-4 pr-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(lineId)}
                aria-label={t("cart.remove")}
                className="absolute right-2 top-2 h-9 w-9 rounded-full"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
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
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <h3 className="font-display text-lg font-semibold">{t("cart.summary")}</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.itemCount")}</span><span>{items.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.fee")}</span><span>{formatMNT(0)}</span>
              </div>
              <div className="my-3 border-t border-border" />
              <div className="flex justify-between font-display text-lg font-bold">
                <span>{t("cart.total")}</span><span className="text-gradient-primary">{formatMNT(total)}</span>
              </div>
              <p className="text-right text-xs text-muted-foreground">≈ {formatCNY(cnyTotal)} CNY</p>
              {hasPreorder && hasReady ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-xs font-semibold text-emerald-400">{t("cart.readyFull")}</p>
                    <p className="mt-0.5 font-display text-base font-bold">
                      {formatMNT(items.filter(i => i.skin.productType === "ready").reduce((s, i) => s + i.skin.price, 0))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                    <p className="text-xs font-semibold text-orange-400">{t("cart.preorderDeposit")}</p>
                    <p className="mt-0.5 font-display text-base font-bold">
                      {formatMNT(items.filter(i => i.skin.productType === "preorder").reduce((s, i) => s + calcPrepayment(i.skin.price), 0))}
                    </p>
                  </div>
                </div>
              ) : hasPreorder ? (
                <div className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                  <p className="text-xs font-semibold text-orange-400">{t("cart.preorderDepositLg")}</p>
                  <p className="mt-0.5 font-display text-base font-bold">{formatMNT(totalDeposit)}</p>
                  <p className="text-[11px] text-muted-foreground">{t("cart.remainingNote", { amount: formatMNT(totalRemaining) })}</p>
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-xs font-semibold text-emerald-400">{t("cart.readyOnly")}</p>
                  <p className="mt-0.5 font-display text-base font-bold">{formatMNT(total)}</p>
                  <p className="text-[11px] text-muted-foreground">{t("cart.readyOnlyNote")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <Label htmlFor="phone" className="flex items-center gap-2 font-display text-base font-semibold">
              <Phone className="h-4 w-4 text-accent" /> {t("cart.phone")}
            </Label>
            <Input id="phone" type="tel" inputMode="tel" placeholder="9911-2233" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t("cart.phoneHint")}</p>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <Label htmlFor="email" className="flex items-center gap-2 font-display text-base font-semibold">
              <Mail className="h-4 w-4 text-accent" /> {t("cart.email")}
            </Label>
            <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t("cart.emailHint")}</p>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-accent" />
              <h3 className="font-display text-base font-semibold">{t("cart.method")}</h3>
            </div>
            <div className="space-y-2">
              {(Object.values(PAYMENTS)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setMethod(p.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    method === p.id ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold">{p.label}</span>
                    <span className={`h-3 w-3 rounded-full border-2 ${method === p.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{p.badge}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
              {t("cart.priceWarn")}
            </div>

            <Button
              variant="hero"
              size="lg"
              className="mt-4 w-full"
              onClick={handleCreateOrder}
              disabled={submitting || MAINTENANCE_MODE}
            >
              {MAINTENANCE_MODE ? (
                <><AlertTriangle className="mr-1.5 h-4 w-4" /> Засварын горим</>
              ) : submitting ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t("cart.creating")}</>
              ) : !user ? (
                <><LogIn className="mr-1.5 h-4 w-4" /> {t("cart.loginCreate")}</>
              ) : (
                <>{t("cart.create")}</>
              )}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("cart.afterCreate")}</p>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" /> {t("cart.secureTitle")}
            </div>
            <p className="text-muted-foreground">{t("cart.secureDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
