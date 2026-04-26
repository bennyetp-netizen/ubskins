import { useEffect, useState } from "react";
import { LogIn, Package, Clock, CheckCircle2, Truck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMNT } from "@/data/skins";
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
}

const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Хүлээгдэж буй", color: "border-warning/40 bg-warning/10 text-warning", icon: Clock },
  paid: { label: "Төлөгдсөн", color: "border-primary/40 bg-primary/10 text-primary", icon: CheckCircle2 },
  delivered: { label: "Хүргэгдсэн", color: "border-accent/40 bg-accent/10 text-accent", icon: Truck },
  cancelled: { label: "Цуцлагдсан", color: "border-destructive/40 bg-destructive/10 text-destructive", icon: Clock },
};

const Account = () => {
  const { user, profile, loading, signInWithSteam, updateTradeUrl } = useAuth();
  const [tradeUrl, setTradeUrl] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTradeUrl(profile?.trade_url ?? "");
  }, [profile?.trade_url]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, skin_name, skin_image, price_mnt, payment_method, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as OrderRow[]);
      });
  }, [user]);

  const handleSaveTradeUrl = async () => {
    setSaving(true);
    const { error } = await updateTradeUrl(tradeUrl);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Trade URL хадгалагдлаа");
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
          <h2 className="font-display text-xl font-semibold">Эхлээд Steam-р нэвтэрнэ үү</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Скин худалдан авахын тулд Steam дансаараа нэвтрэх шаардлагатай
          </p>
          <Button variant="steam" className="mt-5 w-full" onClick={signInWithSteam}>
            <LogIn className="mr-1.5 h-4 w-4" /> Steam-р нэвтрэх
          </Button>
        </div>
      </div>
    );
  }

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const activeCount = orders.filter((o) => o.status === "pending" || o.status === "paid").length;

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold md:text-4xl">Миний бүртгэл</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xl font-bold text-primary-foreground">
                  {profile?.display_name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-display font-semibold">
                  {profile?.display_name ?? "Хэрэглэгч"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Steam ID: {profile?.steam_id ?? "—"}
                </p>
              </div>
            </div>
            {profile?.profile_url && (
              <a
                href={profile.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-xs text-primary hover:underline"
              >
                Steam профайл харах →
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trade URL
            </p>
            <div className="flex gap-2">
              <Input
                value={tradeUrl}
                onChange={(e) => setTradeUrl(e.target.value)}
                placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
                className="text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(tradeUrl);
                  toast.success("Хууллаа");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Steam → Inventory → Trade Offers → Who can send → Trade URL
            </p>
            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={handleSaveTradeUrl}
              disabled={saving}
            >
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-gradient-card p-5 text-center">
            <div>
              <p className="font-display text-xl font-bold">{orders.length}</p>
              <p className="text-[10px] text-muted-foreground">Захиалга</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-accent">{deliveredCount}</p>
              <p className="text-[10px] text-muted-foreground">Хүргэгдсэн</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-primary">{activeCount}</p>
              <p className="text-[10px] text-muted-foreground">Идэвхтэй</p>
            </div>
          </div>
        </aside>

        {/* Orders */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Захиалгын түүх</h2>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center text-sm text-muted-foreground">
              Одоогоор захиалга алга. Дэлгүүрээс скинээ сонгоорой.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const s = statusMap[o.status] ?? statusMap.pending;
                return (
                  <div
                    key={o.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4"
                  >
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                      {o.skin_image && (
                        <img src={o.skin_image} alt="" className="max-h-full object-contain" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display font-semibold">{o.skin_name}</p>
                        <Badge variant="outline" className={s.color}>
                          <s.icon className="mr-1 h-3 w-3" /> {s.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.id.slice(0, 8)} ·{" "}
                        {new Date(o.created_at).toLocaleDateString("mn-MN")} ·{" "}
                        {o.payment_method.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold">{formatMNT(o.price_mnt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
