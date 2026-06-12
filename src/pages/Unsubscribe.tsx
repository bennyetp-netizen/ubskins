import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const Unsubscribe = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  useEffect(() => {
    if (!token) { setState("error"); setError(t("unsub.tokenMissing")); return; }
    (async () => {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || t("unsub.tokenInvalid"));
        setEmail(data?.email || "");
        setState("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : t("common.error"));
        setState("error");
      }
    })();
  }, [token, supabaseUrl, anonKey, t]);

  const confirm = async () => {
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) throw error;
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
      setState("error");
    }
  };

  return (
    <div className="container max-w-md py-20 text-center">
      {state === "loading" && (
        <><Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">{t("unsub.checking")}</p></>
      )}
      {state === "ready" && (
        <>
          <h1 className="mb-2 font-display text-2xl font-bold">{t("unsub.title")}</h1>
          <p className="mb-6 text-muted-foreground">
            {email ? <><strong>{email}</strong> {t("unsub.toAddr")} {t("unsub.willStop")}</> : t("unsub.toThis")}
          </p>
          <Button variant="hero" onClick={confirm}>{t("unsub.confirm")}</Button>
        </>
      )}
      {state === "done" && (
        <><CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-500" />
        <h1 className="font-display text-2xl font-bold">{t("unsub.doneTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("unsub.doneDesc")}</p></>
      )}
      {state === "error" && (
        <><XCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h1 className="font-display text-2xl font-bold">{t("unsub.errTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{error}</p></>
      )}
    </div>
  );
};

export default Unsubscribe;
