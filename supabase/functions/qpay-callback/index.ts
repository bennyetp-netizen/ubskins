// Public webhook QPay calls when an invoice is paid.
// Verifies payment with QPay before marking the order paid.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const QPAY_BASE = "https://merchant.qpay.mn/v2";
const QPAY_USERNAME = Deno.env.get("QPAY_USERNAME") ?? "TEST_MERCHANT";
const QPAY_PASSWORD = Deno.env.get("QPAY_PASSWORD") ?? "WBDUzy8n";

async function getQpayToken() {
  const auth = btoa(`${QPAY_USERNAME}:${QPAY_PASSWORD}`);
  const r = await fetch(`${QPAY_BASE}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`QPay auth failed: ${r.status}`);
  const data = await r.json();
  return data.access_token as string;
}

async function invoiceIsPaid(invoiceId: string, token: string): Promise<boolean> {
  // Use QPay payment check by invoice
  const r = await fetch(`${QPAY_BASE}/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });
  if (!r.ok) return false;
  const data = await r.json();
  const count = Number(data?.count ?? data?.paid_amount ?? 0);
  const rows: any[] = Array.isArray(data?.rows) ? data.rows : [];
  if (count > 0 && rows.some((row) => String(row?.payment_status).toUpperCase() === "PAID")) {
    return true;
  }
  return rows.length > 0 && rows.every((row) => String(row?.payment_status).toUpperCase() === "PAID");
}

async function sendOrderConfirmationEmail(
  admin: ReturnType<typeof createClient>,
  supabaseUrl: string,
  serviceKey: string,
  orderId: string,
  stage: "deposit" | "remaining",
) {
  try {
    const { data: o } = await admin
      .from("orders")
      .select("id, order_number, email, skin_name, wear, float_value, price_mnt, deposit_amount, payment_method")
      .eq("id", orderId)
      .single();
    if (!o?.email) return;
    const total = Number(o.price_mnt ?? 0);
    const deposit = Number(o.deposit_amount ?? 0);
    const wearStr = o.wear
      ? `${o.wear}${o.float_value ? ` · Float ${Number(o.float_value).toFixed(3)}` : ""}`
      : "";
    const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        apikey: serviceKey,
      },
      body: JSON.stringify({
        templateName: "order-confirmation",
        recipientEmail: o.email,
        idempotencyKey: `order-confirmation-${o.id}-${stage}`,
        templateData: {
          orderNumber: o.order_number ?? "",
          customerName: "",
          items: [{ name: o.skin_name, price: total, wear: wearStr }],
          total,
          depositAmount: deposit,
          paymentMethod: o.payment_method ?? "qpay",
          ordersUrl: "https://ubskins.mn/orders",
        },
      }),
    });
    if (!res.ok) console.warn("order-confirmation email send failed", await res.text());
  } catch (e) {
    console.warn("order-confirmation email error", e);
  }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");
    const stage = (url.searchParams.get("stage") ?? "deposit") as "deposit" | "remaining";
    if (!orderId) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order } = await admin
      .from("orders")
      .select("id, product_type, payment_confirmed, remaining_paid, qpay_invoice_id, qpay_remaining_invoice_id")
      .eq("id", orderId)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: "order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify against QPay before updating — prevents fraudulent confirmations.
    const invoiceId = stage === "remaining" ? order.qpay_remaining_invoice_id : order.qpay_invoice_id;
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: "no invoice for stage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getQpayToken();
    const paid = await invoiceIsPaid(invoiceId, token);
    if (!paid) {
      return new Response(JSON.stringify({ error: "invoice not paid" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPreorder = order.product_type === "preorder";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (stage === "remaining") {
      if (!order.remaining_paid) {
        await admin
          .from("orders")
          .update({ remaining_paid: true, status: "paid" })
          .eq("id", order.id);
        await sendOrderConfirmationEmail(admin, supabaseUrl, serviceKey, order.id, "remaining");
      }
    } else if (!order.payment_confirmed) {
      await admin
        .from("orders")
        .update({
          payment_confirmed: true,
          deposit_paid: true,
          remaining_paid: !isPreorder,
          // Preorder: keep "pending" so user still sees UI for the 70% remaining payment
          status: isPreorder ? "pending" : "paid",
        })
        .eq("id", order.id);
      await sendOrderConfirmationEmail(admin, supabaseUrl, serviceKey, order.id, "deposit");
    }


    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("qpay-callback error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
