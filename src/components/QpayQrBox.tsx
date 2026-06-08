import { useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatMNT } from "@/data/skins";

interface Props {
  orderId: string;
  amount: number;
  initialQrImage?: string | null;
  initialInvoiceId?: string | null;
  paymentConfirmed: boolean;
  stage?: "deposit" | "remaining";
  onPaid?: () => void;
}

const QpayQrBox = ({ orderId, amount, initialQrImage, initialInvoiceId, paymentConfirmed, stage = "deposit", onPaid }: Props) => {
  const [qrImage, setQrImage] = useState<string | null>(initialQrImage ?? null);
  const [invoiceId, setInvoiceId] = useState<string | null>(initialInvoiceId ?? null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(paymentConfirmed);

  const createInvoice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("qpay-invoice", {
        body: { action: "create", order_id: orderId, stage },
      });
      if (error) throw error;
      if (data?.qr_image) {
        setQrImage(data.qr_image);
        setInvoiceId(data.invoice_id);
      } else {
        throw new Error(data?.error ?? "QR үүсгэж чадсангүй");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "QPay алдаа");
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("qpay-invoice", {
        body: { action: "check", order_id: orderId, stage },
      });
      if (error) throw error;
      if (data?.paid) {
        setPaid(true);
        toast.success("✅ Төлбөр баталгаажлаа!");
        onPaid?.();
      } else {
        toast.info("Төлбөр хараахан ороогүй байна");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Шалгах үед алдаа");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!qrImage && !paid) createInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 5s while QR is shown
  useEffect(() => {
    if (paid || !invoiceId) return;
    const t = setInterval(checkPayment, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, paid]);

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <p className="font-display text-lg font-bold text-emerald-400">Төлбөр баталгаажсан</p>
        <p className="text-xs text-muted-foreground">Бид удахгүй тантай холбогдоно.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-background/60 p-5">
      <p className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
        {stage === "remaining" ? "Үлдсэн 70% төлөх" : "QPay-р төлөх"} — {formatMNT(amount)}
      </p>
      {loading || !qrImage ? (
        <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-secondary/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <img
          src={`data:image/png;base64,${qrImage}`}
          alt="QPay QR"
          className="h-56 w-56 rounded-lg bg-white p-2"
        />
      )}
      <p className="max-w-xs text-center text-[11px] text-muted-foreground">
        Аль ч банкны апп нээж QR код уншуулна. Төлсний дараа автоматаар шалгана.
      </p>
      <Button variant="outline" size="sm" onClick={checkPayment} disabled={checking}>
        {checking ? (
          <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Шалгаж байна...</>
        ) : (
          <><RefreshCw className="mr-1.5 h-3 w-3" /> Төлбөр шалгах</>
        )}
      </Button>
    </div>
  );
};

export default QpayQrBox;
