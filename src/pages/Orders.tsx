import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Package, Clock, CheckCircle2, Truck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMNT } from "@/data/skins";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  pending: { label: "Хүлээгдэж буй", color: "border-warning/40 bg-warning/10 text-warning", icon: Clock },
  paid: { label: "Төлөгдсөн", color: "border-primary/40 bg-primary/10 text-primary", icon: CheckCircle2 },
  delivered: { label: "Хүргэгдсэн", color: "border-accent/40 bg-accent/10 text-accent", icon: Truck },
  cancelled: { label: "Цуцлагдсан", color: "border-destructive/40 bg-destructive/10 text-destructive", icon: Clock },
};

const Orders = () => {
  const { user, loading, signInWithSteam } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "delivered">("all");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, skin_name, skin_image, price_mnt, payment_method, status, created_at, wear, trade_offer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as OrderRow[]);
      });
  }, [user]);

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
          { key: "pending", label: "Хүлээгдэж буй" },
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
            return (
              <div
                key={o.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4 transition-colors hover:border-primary/30"
              >
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
                    · {o.payment_method.toUpperCase()}
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
