import { LogIn, Package, Clock, CheckCircle2, Truck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { skins, formatMNT } from "@/data/skins";
import { toast } from "sonner";

const orders = [
  { id: "ORD-1042", skin: skins[0], status: "Delivered", date: "2025-04-24", method: "Storepay" },
  { id: "ORD-1041", skin: skins[3], status: "Paid", date: "2025-04-25", method: "QPay" },
  { id: "ORD-1040", skin: skins[1], status: "Pending", date: "2025-04-25", method: "Storepay" },
];

const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  Pending: { label: "Хүлээгдэж буй", color: "border-warning/40 bg-warning/10 text-warning", icon: Clock },
  Paid: { label: "Төлөгдсөн", color: "border-primary/40 bg-primary/10 text-primary", icon: CheckCircle2 },
  Delivered: { label: "Хүргэгдсэн", color: "border-accent/40 bg-accent/10 text-accent", icon: Truck },
};

const Account = () => {
  const tradeUrl = "https://steamcommunity.com/tradeoffer/new/?partner=...&token=...";

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold md:text-4xl">Миний бүртгэл</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xl font-bold text-primary-foreground">
                M
              </div>
              <div>
                <p className="font-display font-semibold">Мөнхбат_MGL</p>
                <p className="text-xs text-muted-foreground">Steam ID: 7656119...</p>
              </div>
            </div>
            <Button variant="steam" size="sm" className="mt-4 w-full">
              <LogIn className="mr-1.5 h-4 w-4" /> Steam-р дахин нэвтрэх
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trade URL</p>
            <div className="flex gap-2">
              <Input defaultValue={tradeUrl} className="text-xs" />
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(tradeUrl); toast.success("Хууллаа"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Steam → Inventory → Trade Offers → Who can send → Trade URL
            </p>
            <Button size="sm" className="mt-3 w-full">Хадгалах</Button>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-gradient-card p-5 text-center">
            <div><p className="font-display text-xl font-bold">12</p><p className="text-[10px] text-muted-foreground">Захиалга</p></div>
            <div><p className="font-display text-xl font-bold text-accent">10</p><p className="text-[10px] text-muted-foreground">Хүргэгдсэн</p></div>
            <div><p className="font-display text-xl font-bold text-primary">2</p><p className="text-[10px] text-muted-foreground">Идэвхтэй</p></div>
          </div>
        </aside>

        {/* Orders */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Захиалгын түүх</h2>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {orders.map((o) => {
              const s = statusMap[o.status];
              return (
                <div key={o.id} className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4">
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                    <img src={o.skin.image} alt={o.skin.name} className="max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-semibold">{o.skin.weaponName} | {o.skin.name}</p>
                      <Badge variant="outline" className={s.color}>
                        <s.icon className="mr-1 h-3 w-3" /> {s.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {o.id} · {o.date} · {o.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold">{formatMNT(o.skin.price)}</p>
                    <button className="text-xs text-primary hover:underline">Дэлгэрэнгүй →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
