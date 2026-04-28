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
import { formatMNT } from "@/data/skins";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const stats = [
  { label: "Нийт борлуулалт", value: "—", icon: TrendingUp, color: "text-accent" },
  { label: "Хүлээгдэж буй", value: "—", icon: Clock, color: "text-warning" },
  { label: "Төлөгдсөн", value: "—", icon: CheckCircle2, color: "text-primary" },
  { label: "Хүргэгдсэн", value: "—", icon: Truck, color: "text-accent" },
];

interface SkinForm {
  id?: string;
  name: string;
  weapon: string; // "AK-47" гэх мэт
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

  const loadSkins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("skins").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setSkins(data ?? []);
    setLoading(false);
  };

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
    setOrders(data ?? []);
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
    const payload = {
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
        <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Скин</th>
                <th className="px-4 py-3">Үнэ</th>
                <th className="px-4 py-3">Төлбөр</th>
                <th className="px-4 py-3">Төлөв</th>
                <th className="px-4 py-3">Огноо</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Захиалга байхгүй</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{o.skin_name}</td>
                    <td className="px-4 py-3 font-display font-semibold">{formatMNT(o.price_mnt)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.payment_method}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{o.status}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("mn-MN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <Button variant="hero" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Шинэ скин нэмэх</Button>
          </div>
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
