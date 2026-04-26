import { useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp, Clock, CheckCircle2, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { skins as initial, formatMNT, type Skin } from "@/data/skins";

const stats = [
  { label: "Нийт борлуулалт", value: "48,250,000₮", icon: TrendingUp, color: "text-accent" },
  { label: "Хүлээгдэж буй", value: "7", icon: Clock, color: "text-warning" },
  { label: "Төлөгдсөн", value: "12", icon: CheckCircle2, color: "text-primary" },
  { label: "Хүргэгдсэн", value: "143", icon: Truck, color: "text-accent" },
];

const orders = [
  { id: "ORD-1042", user: "Мөнхбат_MGL", skin: "AK-47 | Redline", amount: 285000, status: "Pending", method: "Storepay" },
  { id: "ORD-1041", user: "Bilguun.cs", skin: "AWP | Asiimov", amount: 412000, status: "Paid", method: "QPay" },
  { id: "ORD-1040", user: "tsetseg99", skin: "M4A4 | Neon Revolution", amount: 198000, status: "Delivered", method: "Storepay" },
  { id: "ORD-1039", user: "ariunaa_g", skin: "★ Karambit | Fade", amount: 4280000, status: "Paid", method: "Bank" },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Pending: "border-warning/40 bg-warning/10 text-warning",
    Paid: "border-primary/40 bg-primary/10 text-primary",
    Delivered: "border-accent/40 bg-accent/10 text-accent",
  };
  return map[s];
};

const Admin = () => {
  const [inv, setInv] = useState<Skin[]>(initial);
  const [tab, setTab] = useState<"orders" | "inventory">("orders");

  const updatePrice = (id: string, p: number) =>
    setInv(inv.map((s) => (s.id === id ? { ...s, price: p } : s)));
  const updateStock = (id: string, st: number) =>
    setInv(inv.map((s) => (s.id === id ? { ...s, stock: st } : s)));
  const removeSkin = (id: string) => setInv(inv.filter((s) => s.id !== id));

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Админ удирдлага</h1>
          <p className="mt-1 text-muted-foreground">Захиалга, агуулах, борлуулалт</p>
        </div>
        <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">● Live</Badge>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 inline-flex rounded-full border border-border bg-secondary p-1">
        <button
          onClick={() => setTab("orders")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${tab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <Package className="mr-1.5 inline h-3.5 w-3.5" /> Захиалга
        </button>
        <button
          onClick={() => setTab("inventory")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${tab === "inventory" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Агуулах
        </button>
      </div>

      {tab === "orders" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Хэрэглэгч</th>
                <th className="px-4 py-3">Скин</th>
                <th className="px-4 py-3">Үнэ</th>
                <th className="px-4 py-3">Төлбөр</th>
                <th className="px-4 py-3">Төлөв</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id}</td>
                  <td className="px-4 py-3">{o.user}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.skin}</td>
                  <td className="px-4 py-3 font-display font-semibold">{formatMNT(o.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.method}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusBadge(o.status)}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">Шинэчлэх</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <Button variant="hero"><Plus className="mr-1 h-4 w-4" /> Шинэ скин нэмэх</Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Скин</th>
                  <th className="px-4 py-3">Wear</th>
                  <th className="px-4 py-3">Float</th>
                  <th className="px-4 py-3">Үнэ (MNT)</th>
                  <th className="px-4 py-3">Үлдэгдэл</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {inv.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-secondary/50">
                          <img src={s.image} alt="" className="max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-medium">{s.weaponName}</p>
                          <p className="text-xs text-muted-foreground">{s.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{s.wear}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{s.float.toFixed(3)}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={s.price}
                        onChange={(e) => updatePrice(s.id, Number(e.target.value))}
                        className="h-8 w-32 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={s.stock}
                        onChange={(e) => updateStock(s.id, Number(e.target.value))}
                        className="h-8 w-20 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSkin(s.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
