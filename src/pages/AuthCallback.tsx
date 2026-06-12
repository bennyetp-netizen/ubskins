import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const query = window.location.search.slice(1);
        if (!query) {
          setError(t("auth.noResponse"));
          return;
        }

        const projectUrl = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(`${projectUrl}/functions/v1/steam-auth-callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ query }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? t("auth.loginErr"));
          return;
        }

        const { error: setErr } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (setErr) {
          setError(setErr.message);
          return;
        }

        navigate("/account", { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : t("common.error"));
      }
    };

    handleCallback();
  }, [navigate, t]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-border bg-gradient-card p-8 text-center">
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <h2 className="font-display text-xl font-semibold">{t("auth.failTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              {t("auth.toHome")}
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <h2 className="font-display text-xl font-semibold">{t("auth.loading")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("auth.wait")}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
