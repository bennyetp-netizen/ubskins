import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Package, Clock, CheckCircle2, Truck, ShoppingBag, Copy, ChevronDown, ChevronUp, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMNT } from "@/data/skins";
import { PAYMENTS, calcPrepayment, mntToUsd, paymentLabel, type PaymentMethod } from "@/data/payment";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderRow {
  id: string;
  skin_name: string;
  skin_image: string | null;
  price_mnt: number;
  payment_method: string;
  status: string;
  created_at: string;
  wear: string | null;
  trade_offer_id: string | null;
}

const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Төлбөр хүлээж буй", color: "border-warning/40 bg-warning/10 text-warning", icon: Clock },
  paid: { label: "Төлөгдсөн", color: "border-primary/40 bg-primary/10 text-primary", icon: CheckCircle2 },
  delivered: { label: "Хүргэгдсэн", color: "border-accent/40 bg-accent/10 text-accent", icon: Truck },
  cancelled: { label: "Цуцлагдсан", color: "border-destructive/40 bg-destructive/10 text-destructive", icon: Clock },
};

const Orders = () => {
  const { user, loading, signInWithSteam } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "delivered">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, skin_name, skin_image, price_mnt, payment_method, status, created_at, wear, trade_offer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setOrders(data as OrderRow[]);
          // pending захиалга байвал хамгийн сүүлийнхийг автоматаар нээнэ
          const firstPending = (data as OrderRow[]).find((o) => o.status === "pending");
          if (firstPending) setExpanded(firstPending.id);
        }
      });
  }, [user]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} хуулагдлаа`);
  };

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Уншиж байна...</div>;
  }

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 text-center max-w-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <LogIn className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">Захиалга харахын тулд нэвтэрнэ үү</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Steam дансаараа нэвтэрснээр захиалгын түүхээ харах боломжтой
          </p>
          <Button variant="steam" className="mt-5 w-full" onClick={signInWithSteam}>
            <LogIn className="mr-1.5 h-4 w-4" /> Steam-р нэвтрэх
          </Button>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Миний захиалгууд</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Нийт {orders.length} захиалга
          </p>
        </div>
        <Link to="/shop">
          <Button variant="hero">
            <ShoppingBag className="mr-1.5 h-4 w-4" /> Дэлгүүрт буцах
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { key: "all", label: "Бүгд" },
          { key: "pending", label: "Төлбөр хүлээж буй" },
          { key: "paid", label: "Төлөгдсөн" },
          { key: "delivered", label: "Хүргэгдсэн" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === t.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="ml-1 opacity-60">({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-gradient-card p-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            {filter === "all"
              ? "Одоогоор захиалга алга. Дэлгүүрээс скинээ сонгоорой."
              : "Энэ ангилалд захиалга алга байна."}
          </p>
          <Link to="/shop" className="mt-4 inline-block">
            <Button variant="hero" size="sm">Скин сонгох</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const s = statusMap[o.status] ?? statusMap.pending;
            const isOpen = expanded === o.id;
            const payment = PAYMENTS[o.payment_method as PaymentMethod];
            const prepay = calcPrepayment(o.price_mnt);
            const usd = mntToUsd(o.price_mnt);

            return (
              <div
                key={o.id}
                className="rounded-2xl border border-border bg-gradient-card transition-colors hover:border-primary/30"
              >
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                    {o.skin_image ? (
                      <img src={o.skin_image} alt="" className="max-h-full object-contain" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-semibold">{o.skin_name}</p>
                      <Badge variant="outline" className={s.color}>
                        <s.icon className="mr-1 h-3 w-3" /> {s.label}
                      </Badge>
                      {o.wear && (
                        <Badge variant="outline" className="border-border text-[10px]">
                          {o.wear}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      №{o.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(o.created_at).toLocaleString("mn-MN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {paymentLabel(o.payment_method)}
                    </p>
                    {o.trade_offer_id && (
                      <a
                        href={`https://steamcommunity.com/tradeoffer/${o.trade_offer_id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-primary hover:underline"
                      >
                        Steam Trade Offer харах →
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold">{formatMNT(o.price_mnt)}</p>
                    {o.status === "pending" && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : o.id)}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Төлбөрийн заавар
                        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment instructions */}
                {isOpen && o.status === "pending" && payment && (
                  <div className="border-t border-border bg-background/40 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-accent" />
                      <h4 className="font-display text-sm font-semibold">
                        {payment.label} төлбөрийн заавар
                      </h4>
                    </div>

                    {/* Amount summary */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-warning">
                          Урьдчилгаа (30%)
                        </p>
                        <p className="mt-1 font-display text-lg font-bold">{formatMNT(prepay)}</p>
                        <p className="text-[10px] text-muted-foreground">≈ ${mntToUsd(prepay)} USD</p>
                      </div>
                      <div className="rounded-xl border border-border bg-secondary/40 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Үлдэгдэл
                        </p>
                        <p className="mt-1 font-display text-lg font-bold">
                          {formatMNT(o.price_mnt - prepay)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ≈ ${usd - mntToUsd(prepay)} USD · trade-ийн өмнө
                        </p>
                      </div>
                    </div>

                    {/* Account fields */}
                    <div className="space-y-2">
                      {payment.fields.map((f) => (
                        <div
                          key={f.key}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              {f.label}
                            </p>
                            <p className="truncate font-mono text-sm">{f.value}</p>
                          </div>
                          {f.copy !== false && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => copy(f.value, f.label)}
                              aria-label="Хуулах"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reference */}
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-primary">
                          Reference / Гүйлгээний утга (заавал!)
                        </p>
                        <p className="truncate font-mono text-sm font-bold">
                          UBSKINS-{o.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() =>
                          copy(`UBSKINS-${o.id.slice(0, 8).toUpperCase()}`, "Reference")
                        }
                        aria-label="Хуулах"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Notes */}
                    <ul className="mt-4 space-y-1.5">
                      {payment.notes.map((n, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-primary">•</span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                      Төлбөр шилжүүлсний дараа{" "}
                      <a
                        href="https://t.me/ubskins"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        @ubskins Telegram
                      </a>{" "}
                      руу screenshot илгээнэ үү. Бид 1-2 цагийн дотор баталгаажуулна.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
