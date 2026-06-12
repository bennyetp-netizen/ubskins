import { useEffect, useState } from "react";
import { LogIn, Package, Clock, CheckCircle2, Truck, Copy, ExternalLink, ClipboardPaste, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMNT } from "@/data/skins";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface OrderRow {
  id: string;
  skin_name: string;
  skin_image: string | null;
  price_mnt: number;
  payment_method: string;
  status: string;
  created_at: string;
}

const Account = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, loading, signInWithSteam, updateTradeUrl } = useAuth();
  const [tradeUrl, setTradeUrl] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [saving, setSaving] = useState(false);

  const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: t("status.pendingShort"), color: "border-warning/40 bg-warning/10 text-warning", icon: Clock },
    paid: { label: t("status.paid"), color: "border-primary/40 bg-primary/10 text-primary", icon: CheckCircle2 },
    delivered: { label: t("status.delivered"), color: "border-accent/40 bg-accent/10 text-accent", icon: Truck },
    cancelled: { label: t("status.cancelled"), color: "border-destructive/40 bg-destructive/10 text-destructive", icon: Clock },
  };

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
    else toast.success(t("account.tradeUrlSaved"));
  };

  const tradeUrlSettingsLink = profile?.steam_id
    ? `https://steamcommunity.com/profiles/${profile.steam_id}/tradeoffers/privacy`
    : "https://steamcommunity.com/my/tradeoffers/privacy";

  const handlePasteFromClipboard = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        toast.error(t("account.clipEmpty"));
        return;
      }
      if (!/^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+/.test(text)) {
        toast.error(t("account.clipInvalid"));
        return;
      }
      setTradeUrl(text);
      setSaving(true);
      const { error } = await updateTradeUrl(text);
      setSaving(false);
      if (error) toast.error(error.message);
      else toast.success(t("account.tradeUrlSavedAuto"));
    } catch {
      toast.error(t("account.clipReadErr"));
    }
  };

  const handleAutoFetch = () => {
    window.open(tradeUrlSettingsLink, "_blank", "noopener,noreferrer");
    toast.info(t("account.autoFetchToast"), { duration: 6000 });
  };

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">{t("common.loading")}</div>;
  }

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-border bg-gradient-card p-8 text-center max-w-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <LogIn className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">{t("account.loginTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("account.loginDesc")}</p>
          <Button variant="steam" className="mt-5 w-full" onClick={signInWithSteam}>
            <LogIn className="mr-1.5 h-4 w-4" /> {t("nav.loginSteam")}
          </Button>
        </div>
      </div>
    );
  }

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const activeCount = orders.filter((o) => o.status === "pending" || o.status === "paid").length;
  const locale = i18n.language === "en" ? "en-US" : "mn-MN";

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold md:text-4xl">{t("account.title")}</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
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
                  {profile?.display_name ?? t("account.user")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Steam ID: {profile?.steam_id ?? "—"}
                </p>
              </div>
            </div>
            {profile?.profile_url && (
              <a href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-xs text-primary hover:underline">
                {t("account.steamProfile")}
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("account.tradeUrl")}
            </p>
            <div className="mb-3 grid gap-2">
              <Button variant="steam" size="sm" className="w-full" onClick={handleAutoFetch}>
                <Wand2 className="mr-1.5 h-4 w-4" /> {t("account.fetchSteam")}
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={handlePasteFromClipboard}>
                <ClipboardPaste className="mr-1.5 h-4 w-4" /> {t("account.pasteUrl")}
              </Button>
            </div>
            <div className="flex gap-2">
              <Input value={tradeUrl} onChange={(e) => setTradeUrl(e.target.value)} placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..." className="text-xs" />
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(tradeUrl); toast.success(t("account.copied")); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <a href={tradeUrlSettingsLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> {t("account.openSteamManual")}
            </a>
            <Button size="sm" className="mt-3 w-full" onClick={handleSaveTradeUrl} disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-gradient-card p-5 text-center">
            <div>
              <p className="font-display text-xl font-bold">{orders.length}</p>
              <p className="text-[10px] text-muted-foreground">{t("account.statOrders")}</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-accent">{deliveredCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("account.statDelivered")}</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-primary">{activeCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("account.statActive")}</p>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{t("account.recent")}</h2>
            <a href="/orders" className="text-xs text-primary hover:underline">{t("account.viewAll")}</a>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-border bg-gradient-card p-10 text-center text-sm text-muted-foreground">
              {t("account.empty")}
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((o) => {
                const s = statusMap[o.status] ?? statusMap.pending;
                return (
                  <div key={o.id} className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-card p-4">
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
                        {o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString(locale)} · {o.payment_method.toUpperCase()}
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
