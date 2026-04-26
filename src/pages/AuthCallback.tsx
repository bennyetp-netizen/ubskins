import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const query = window.location.search.slice(1); // strip leading "?"
        if (!query) {
          setError("Steam-аас хариу ирсэнгүй");
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
          setError(data?.error ?? "Нэвтрэхэд алдаа гарлаа");
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
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-border bg-gradient-card p-8 text-center">
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <h2 className="font-display text-xl font-semibold">Нэвтрэх амжилтгүй</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Нүүр рүү буцах
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <h2 className="font-display text-xl font-semibold">Steam-р нэвтэрч байна...</h2>
            <p className="mt-2 text-sm text-muted-foreground">Түр хүлээнэ үү</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
