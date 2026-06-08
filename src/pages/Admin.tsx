import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, TrendingUp, Clock, CheckCircle2, Truck, Package, Loader2, Upload, ShieldAlert, Eye, EyeOff, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatMNT, calcSellingPrice } from "@/data/skins";
import ProductTypeBadge from "@/components/ProductTypeBadge";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// stats нь dynamic — orders-аас тооцно (доорх useMemo)

interface SkinForm {
  id?: string;
  name: string;
  weapon: string;
  game: string;
  wear: string;
  float_value: string;
  price_mnt: string;
  image_url: string;
  rarity: string;
  description: string;
  stattrak: boolean;
  is_active: boolean;
  is_featured: boolean;
  stock: string;
  product_type: "ready" | "preorder";
  stock_quantity: string;
}

const emptyForm: SkinForm = {
  name: "",
  weapon: "",
  game: "CS2",
  wear: "FT",
  float_value: "",
  price_mnt: "",
  image_url: "",
  rarity: "Mil-Spec",
  description: "",
  stattrak: false,
  is_active: true,
  is_featured: false,
  stock: "1",
  product_type: "ready",
  stock_quantity: "1",
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [tab, setTab] = useState<"orders" | "inventory">("inventory");
  const [skins, setSkins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SkinForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMode, setSyncMode] = useState("priority");
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "paid" | "delivered">("all");

  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "delivered");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.price_mnt ?? 0), 0);
  const readyRevenue = paidOrders
    .filter((o) => (o.product_type ?? "ready") === "ready")
    .reduce((sum, o) => sum + (o.price_mnt ?? 0), 0);
  const preorderRevenue = paidOrders
    .filter((o) => o.product_type === "preorder")
    .reduce((sum, o) => sum + (o.price_mnt ?? 0), 0);

  const stats = [
    { label: "Нийт захиалга", value: `${orders.length}`, icon: TrendingUp, color: "text-accent" },
    { label: "Нийт орлого", value: formatMNT(totalRevenue), icon: TrendingUp, color: "text-primary" },
    { label: "БЭЛЭН-ээс", value: formatMNT(readyRevenue), icon: TrendingUp, color: "text-emerald-400" },
    { label: "ЗАХИАЛГА-аас", value: formatMNT(preorderRevenue), icon: TrendingUp, color: "text-orange-400" },
  ];

  const syncFromBuff = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-buff-skins", { body: { mode: syncMode } });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Тодорхойгүй алдаа");
      toast.success(`${data.upserted} item шинэчлэгдлээ. Ханш: 1¥ = ${Number(data.rate_cny_mnt).toFixed(2)}₮`);
      loadSkins();
    } catch (e: any) {
      toast.error(e.message ?? "Sync хийхэд алдаа гарлаа");
    } finally {
      setSyncing(false);
    }
  };

  const loadSkins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("skins").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setSkins(data ?? []);
    setLoading(false);
  };

  const [profiles, setProfiles] = useState<Record<string, { steam_id: string | null; profile_url: string | null; trade_url: string | null; display_name: string | null }>>({});

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    const list = data ?? [];
    setOrders(list);
    const userIds = Array.from(new Set(list.map((o: any) => o.user_id).filter(Boolean)));
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, steam_id, profile_url, trade_url, display_name")
        .in("user_id", userIds);
      const map: Record<string, any> = {};
      (profs ?? []).forEach((p: any) => { map[p.user_id] = p; });
      setProfiles(map);
    }
  };

  const setOrderStatus = async (id: string, status: string, payment_confirmed?: boolean) => {
    const patch: any = { status };
    if (payment_confirmed !== undefined) patch.payment_confirmed = payment_confirmed;
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Шинэчиллээ");
      loadOrders();
    }
  };

  const updateOrder = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("orders").update(patch as any).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Шинэчиллээ");
      loadOrders();
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadSkins();
      loadOrders();
    }
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="container flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Уншиж байна...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold">Нэвтрэх шаардлагатай</h2>
        <p className="mt-2 text-muted-foreground">Админ хуудас руу орохын тулд эхлээд Steam-р нэвтэрнэ үү.</p>
        <Link to="/"><Button variant="hero" className="mt-6">Нүүр хуудас</Button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-20 text-center">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="font-display text-2xl font-bold">Хандах эрхгүй</h2>
        <p className="mt-2 text-muted-foreground">Энэ хуудсыг зөвхөн админ ажилтан үзэх боломжтой.</p>
        <Link to="/"><Button variant="outline" className="mt-6">Буцах</Button></Link>
      </div>
    );
  }

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (s: any) => {
    setForm({
      id: s.id,
      name: s.name ?? "",
      weapon: s.weapon ?? "",
      game: s.game ?? "CS2",
      wear: s.wear ?? "FT",
      float_value: s.float_value?.toString() ?? "",
      price_mnt: s.price_mnt?.toString() ?? "",
      image_url: s.image_url ?? "",
      rarity: s.rarity ?? "Mil-Spec",
      description: s.description ?? "",
      stattrak: !!s.stattrak,
      is_active: s.is_active ?? true,
      is_featured: !!s.is_featured,
      stock: s.stock?.toString() ?? "1",
      product_type: (s.product_type as "ready" | "preorder") ?? "ready",
      stock_quantity: s.stock_quantity?.toString() ?? "1",
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("skin-images").upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("skin-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Зураг амжилттай хуулагдлаа");
    } catch (e: any) {
      toast.error(e.message ?? "Зураг хуулахад алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.weapon || !form.price_mnt) {
      toast.error("Нэр, Зэвсэг, Үнэ заавал бөглөнө үү");
      return;
    }
    setSaving(true);
    const payload: any = {
      name: form.name,
      weapon: form.weapon,
      game: form.game,
      wear: form.wear || null,
      float_value: form.float_value ? Number(form.float_value) : null,
      price_mnt: Number(form.price_mnt),
      image_url: form.image_url || null,
      rarity: form.rarity || null,
      description: form.description || null,
      stattrak: form.stattrak,
      is_active: form.is_active,
      is_featured: form.is_featured,
      stock: Number(form.stock) || 0,
      product_type: form.product_type,
      stock_quantity: Number(form.stock_quantity) || 0,
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from("skins").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("skins").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(form.id ? "Шинэчиллээ" : "Шинэ скин нэмэгдлээ");
      setOpen(false);
      loadSkins();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Энэ скинийг устгах уу?")) return;
    const { error } = await supabase.from("skins").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Устгагдлаа");
      loadSkins();
    }
  };

  const removeAllSkins = async () => {
    if (skins.length === 0) return;
    if (!confirm(`Нийт ${skins.length} скиний БҮГДИЙГ устгах уу? Энэ үйлдлийг буцаах боломжгүй!`)) return;
    if (!confirm("Та үнэхээр итгэлтэй байна уу?")) return;
    const { error } = await supabase.from("skins").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) toast.error(error.message);
    else {
      toast.success(`${skins.length} скин устгагдлаа`);
      loadSkins();
    }
  };

  const removeOrder = async (id: string) => {
    if (!confirm("Энэ захиалгыг устгах уу?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Захиалга устгагдлаа");
      loadOrders();
    }
  };

  const removeAllOrders = async () => {
    const list = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
    if (list.length === 0) return;
    const label = orderFilter === "all" ? "БҮХ" : `"${orderFilter}" төлөвтэй`;
    if (!confirm(`${label} ${list.length} захиалгыг устгах уу? Энэ үйлдлийг буцаах боломжгүй!`)) return;
    if (!confirm("Та үнэхээр итгэлтэй байна уу?")) return;
    const ids = list.map((o) => o.id);
    const { error } = await supabase.from("orders").delete().in("id", ids);
    if (error) toast.error(error.message);
    else {
      toast.success(`${ids.length} захиалга устгагдлаа`);
      loadOrders();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("skins").update({ is_active: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else loadSkins();
  };

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
          onClick={() => setTab("inventory")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${tab === "inventory" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          <Package className="mr-1.5 inline h-3.5 w-3.5" /> Агуулах
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${tab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Захиалга
        </button>
      </div>

      {tab === "orders" ? (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {([
              { key: "all", label: "Бүгд" },
              { key: "pending", label: "Төлбөр хүлээгдэж байна" },
              { key: "paid", label: "Баталгаажсан" },
              { key: "delivered", label: "Хүргэгдсэн" },
            ] as const).map((f) => {
              const count = f.key === "all" ? orders.length : orders.filter((o) => o.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    orderFilter === f.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label} <span className="ml-1 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="mb-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={removeAllOrders} className="border-destructive/40 text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {orderFilter === "all" ? "Бүх захиалга устгах" : "Шүүсэн захиалгыг устгах"}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">Төрөл</th>
                  <th className="px-4 py-3">Скин</th>
                  <th className="px-4 py-3">Үнэ</th>
                  <th className="px-4 py-3">Утас</th>
                  <th className="px-4 py-3">Төлөв</th>
                  <th className="px-4 py-3">Огноо</th>
                  <th className="px-4 py-3">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const list = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
                  if (list.length === 0) {
                    return (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Захиалга байхгүй</td></tr>
                    );
                  }
                  return list.map((o) => {
                    const ptype = (o.product_type as "ready" | "preorder") ?? "ready";
                    return (
                    <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 align-top">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{o.order_number ?? o.id.slice(0, 8)}</td>

                      <td className="px-4 py-3"><ProductTypeBadge type={ptype} /></td>
                      <td className="px-4 py-3 max-w-[360px]">
                         <p className="font-medium">{o.skin_name}</p>
                         <p className="text-[11px] text-muted-foreground">{o.payment_method}</p>
                         {o.wear && (
                           <div className="mt-1.5 space-y-0.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5 text-[11px]">
                              <p><span className="text-muted-foreground">Wear:</span> <span className="text-foreground">{o.wear}</span>{o.float_value ? <span className="text-muted-foreground"> ({o.float_value})</span> : null}</p>
                           </div>
                         )}
                         {(() => {
                           const p = profiles[o.user_id];
                           if (!p) return null;
                           return (
                             <div className="mt-1.5 space-y-1 rounded-md border border-sky-400/30 bg-sky-500/5 px-2 py-1.5 text-[11px]">
                               {p.display_name && <p className="font-semibold text-sky-300">{p.display_name}</p>}
                               {p.trade_url ? (
                                 <div className="flex items-center gap-1.5">
                                   <a href={p.trade_url} target="_blank" rel="noreferrer" className="truncate text-sky-300 underline hover:text-sky-200" title={p.trade_url}>
                                     Trade URL
                                   </a>
                                   <button
                                     type="button"
                                     className="rounded border border-sky-400/40 px-1.5 py-0.5 text-[10px] hover:bg-sky-500/10"
                                     onClick={() => { navigator.clipboard.writeText(p.trade_url!); toast.success("Trade URL хууллаа"); }}
                                   >
                                     Copy
                                   </button>
                                 </div>
                               ) : (
                                 <p className="text-destructive">Trade URL байхгүй</p>
                               )}
                               {p.profile_url && (
                                 <a href={p.profile_url} target="_blank" rel="noreferrer" className="block truncate text-muted-foreground underline hover:text-foreground">
                                   Steam profile
                                 </a>
                               )}
                               {p.steam_id && (
                                 <p className="text-[10px] text-muted-foreground">SteamID: {p.steam_id}</p>
                               )}
                             </div>
                           );
                         })()}
                        </td>
                      <td className="px-4 py-3 font-display font-semibold">{formatMNT(o.price_mnt)}</td>
                      <td className="px-4 py-3 text-xs">{o.phone ?? "—"}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{o.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("mn-MN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {ptype === "ready" ? (
                            <label className="flex items-center gap-2 text-xs">
                              <Switch
                                checked={!!o.payment_confirmed}
                                onCheckedChange={(v) =>
                                  updateOrder(o.id, { payment_confirmed: v, status: v ? "paid" : "pending" })
                                }
                              />
                              Төлбөр баталгаажсан уу?
                            </label>
                          ) : (
                            <>
                              <label className="flex items-center gap-2 text-xs">
                                <Switch
                                  checked={!!o.deposit_paid}
                                  onCheckedChange={(v) =>
                                    updateOrder(o.id, {
                                      deposit_paid: v,
                                      status: o.remaining_paid ? "delivered" : "pending",
                                    })
                                  }
                                />
                                Урьдчилгаа орсон уу?
                              </label>
                              <label className="flex items-center gap-2 text-xs">
                                <Switch
                                  checked={!!o.remaining_paid}
                                  onCheckedChange={(v) =>
                                    updateOrder(o.id, { remaining_paid: v })
                                  }
                                />
                                Үлдэгдэл орсон уу?
                              </label>
                            </>
                          )}
                          {!o.trade_hold_until && (o.payment_confirmed || o.remaining_paid) && o.status !== "delivered" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-warning/40 text-warning hover:bg-warning/10"
                              onClick={() => {
                                const now = new Date();
                                const until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                                updateOrder(o.id, {
                                  buff_purchased_at: now.toISOString(),
                                  trade_hold_until: until.toISOString(),
                                  status: "trade_holding",
                                });
                              }}
                            >
                              🔒 Худалдан авлаа (7 хоног hold)
                            </Button>
                          )}
                          {o.trade_hold_until && o.status !== "delivered" && (
                            <div className="rounded-md border border-warning/30 bg-warning/5 px-2 py-1 text-[10px] text-warning">
                              Hold дуусах: {new Date(o.trade_hold_until).toLocaleString("mn-MN")}
                            </div>
                          )}
                          {o.status !== "delivered" && (
                            <Button size="sm" variant="outline" onClick={() => updateOrder(o.id, { status: "delivered" })}>
                              Хүргэгдсэн
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => removeOrder(o.id)} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Устгах
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {(() => {
            const synced = skins.filter((s) => s.last_synced_at).map((s) => new Date(s.last_synced_at).getTime());
            const lastSync = synced.length ? Math.max(...synced) : null;
            const hoursAgo = lastSync ? Math.floor((Date.now() - lastSync) / 3_600_000) : null;
            const minsAgo = lastSync ? Math.floor((Date.now() - lastSync) / 60_000) : null;
            const label =
              lastSync == null ? "Хэзээ ч sync хийгдээгүй"
              : hoursAgo! >= 1 ? `Сүүлд sync: ${hoursAgo} цагийн өмнө`
              : `Сүүлд sync: ${minsAgo} минутын өмнө`;
            return (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-card px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">
                    Нийт: {skins.length} скин
                  </Badge>
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={syncMode}
                    onChange={(e) => setSyncMode(e.target.value)}
                    disabled={syncing}
                    className="h-10 rounded-md border border-border bg-secondary px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="priority">Зэвсэг</option>
                    <option value="agents">Agent</option>
                    <option value="stickers">Sticker</option>
                    <option value="charms">Charm</option>
                    <option value="all">Бүгд</option>
                  </select>
                  <Button variant="outline" onClick={syncFromBuff} disabled={syncing}>
                    {syncing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
                    Скин шинэчлэх
                  </Button>
                  <Button variant="outline" onClick={removeAllSkins} disabled={skins.length === 0} className="border-destructive/40 text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-1 h-4 w-4" /> Бүх скин устгах
                  </Button>
                  <Button variant="hero" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Шинэ скин нэмэх</Button>
                </div>
              </div>
            );
          })()}
          <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-card">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Уншиж байна...
              </div>
            ) : skins.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Скин байхгүй. "Шинэ скин нэмэх" дээр дарж эхэлнэ үү.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Скин</th>
                    <th className="px-4 py-3">Wear</th>
                    <th className="px-4 py-3">Float</th>
                    <th className="px-4 py-3">Үнэ (MNT)</th>
                    <th className="px-4 py-3">Үлдэгдэл</th>
                    <th className="px-4 py-3">Төлөв</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {skins.map((s) => (
                    <tr key={s.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md bg-secondary/50">
                            {s.image_url ? (
                              <img src={s.image_url} alt="" className="max-h-full object-contain" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{s.weapon}</p>
                            <p className="text-xs text-muted-foreground">
                              {s.name} {s.is_featured && <Star className="ml-1 inline h-3 w-3 text-warning" />}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline">{s.wear ?? "—"}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.float_value?.toFixed(3) ?? "—"}</td>
                      <td className="px-4 py-3 font-display font-semibold">{formatMNT(s.price_mnt)}</td>
                      <td className="px-4 py-3">{s.stock}</td>
                      <td className="px-4 py-3">
                        {s.is_active ? (
                          <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">Идэвхтэй</Badge>
                        ) : (
                          <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">Хаалттай</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleActive(s.id, s.is_active)}
                            title={s.is_active ? "Хаах" : "Нээх"}
                          >
                            {s.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(s.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Скин засах" : "Шинэ скин нэмэх"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Зураг</Label>
              <div className="mt-1.5 flex items-start gap-3">
                <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/40">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="max-h-full object-contain" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Хуулж байна..." : "Зураг сонгох"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                    />
                  </label>
                  <Input
                    placeholder="эсвэл URL шууд оруулах"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label>Бүтээгдэхүүний төрөл *</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, product_type: "ready" })}
                  className={`rounded-lg border p-3 text-left transition ${
                    form.product_type === "ready"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-secondary/30 hover:border-emerald-500/40"
                  }`}
                >
                  <p className="font-display text-sm font-semibold text-emerald-400">🟢 БЭЛЭН</p>
                  <p className="text-[11px] text-muted-foreground">Агуулахад бэлэн · бүтэн төлбөр</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, product_type: "preorder" })}
                  className={`rounded-lg border p-3 text-left transition ${
                    form.product_type === "preorder"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border bg-secondary/30 hover:border-orange-500/40"
                  }`}
                >
                  <p className="font-display text-sm font-semibold text-orange-400">🟡 ЗАХИАЛГА</p>
                  <p className="text-[11px] text-muted-foreground">Захиалгаар · 30% урьдчилгаа</p>
                </button>
              </div>
            </div>
            <div>
              <Label>Зэвсэг *</Label>
              <Input
                placeholder="AK-47, AWP, ★ Karambit..."
                value={form.weapon}
                onChange={(e) => setForm({ ...form, weapon: e.target.value })}
              />
            </div>
            <div>
              <Label>Скиний нэр *</Label>
              <Input
                placeholder="Redline, Asiimov, Fade..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Үнэ (MNT) *</Label>
              <Input
                type="number"
                placeholder="285000"
                value={form.price_mnt}
                onChange={(e) => setForm({ ...form, price_mnt: e.target.value })}
              />
            </div>
            <div>
              <Label>Үлдэгдэл</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>

            <div>
              <Label>Wear</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.wear}
                onChange={(e) => setForm({ ...form, wear: e.target.value })}
              >
                <option value="FN">FN — Factory New</option>
                <option value="MW">MW — Minimal Wear</option>
                <option value="FT">FT — Field-Tested</option>
                <option value="WW">WW — Well-Worn</option>
                <option value="BS">BS — Battle-Scarred</option>
              </select>
            </div>
            <div>
              <Label>Float</Label>
              <Input
                type="number"
                step="0.001"
                placeholder="0.124"
                value={form.float_value}
                onChange={(e) => setForm({ ...form, float_value: e.target.value })}
              />
            </div>

            <div>
              <Label>Rarity</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value })}
              >
                <option value="Mil-Spec">Mil-Spec</option>
                <option value="Restricted">Restricted</option>
                <option value="Classified">Classified</option>
                <option value="Covert">Covert</option>
              </select>
            </div>
            <div>
              <Label>Тоглоом</Label>
              <Input
                value={form.game}
                onChange={(e) => setForm({ ...form, game: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Тайлбар</Label>
              <Textarea
                placeholder="Нэмэлт мэдээлэл..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">StatTrak™</p>
                <p className="text-xs text-muted-foreground">Алалт тоологчтой</p>
              </div>
              <Switch
                checked={form.stattrak}
                onCheckedChange={(v) => setForm({ ...form, stattrak: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Идэвхтэй</p>
                <p className="text-xs text-muted-foreground">Дэлгүүрт харагдах</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Онцлох</p>
                <p className="text-xs text-muted-foreground">Нүүр хуудсанд гарна</p>
              </div>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Болих</Button>
            <Button variant="hero" onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.id ? "Хадгалах" : "Нэмэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
