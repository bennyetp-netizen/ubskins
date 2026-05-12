// QPay invoice edge function — create invoice + check payment status
// Uses TEST_MERCHANT credentials by default; override via QPAY_USERNAME / QPAY_PASSWORD / QPAY_INVOICE_CODE secrets.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const QPAY_BASE = "https://merchant.qpay.mn/v2";
const QPAY_USERNAME = Deno.env.get("QPAY_USERNAME") ?? "TEST_MERCHANT";
const QPAY_PASSWORD = Deno.env.get("QPAY_PASSWORD") ?? "WBDUzy8n";
const QPAY_INVOICE_CODE = Deno.env.get("QPAY_INVOICE_CODE") ?? "TEST_INVOICE";

async function getQpayToken() {
  const auth = btoa(`${QPAY_USERNAME}:${QPAY_PASSWORD}`);
  const r = await fetch(`${QPAY_BASE}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`QPay auth failed: ${r.status} ${await r.text()}`);
  const data = await r.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate user JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = body.action as "create" | "check";
    const orderId = body.order_id as string;
    if (!action || !orderId) {
      return new Response(JSON.stringify({ error: "action & order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw new Error("Order not found");
    if (order.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getQpayToken();

    if (action === "create") {
      // If already created, return cached
      if (order.qpay_invoice_id && order.qpay_qr_image) {
        return new Response(
          JSON.stringify({
            invoice_id: order.qpay_invoice_id,
            qr_image: order.qpay_qr_image,
            qr_text: order.qpay_qr_text,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const amount =
        (order.product_type === "preorder" ? order.deposit_amount : order.price_mnt) ??
        order.price_mnt;
      const callbackUrl = `${supabaseUrl}/functions/v1/qpay-callback?order_id=${order.id}`;

      const invRes = await fetch(`${QPAY_BASE}/invoice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_code: QPAY_INVOICE_CODE,
          sender_invoice_no: order.order_number ?? order.id.slice(0, 12),
          invoice_receiver_code: "terminal",
          invoice_description: `UBSkins ${order.skin_name}`,
          amount,
          callback_url: callbackUrl,
        }),
      });
      const invJson = await invRes.json();
      if (!invRes.ok) {
        console.error("QPay invoice err", invJson);
        throw new Error(invJson?.message || "QPay invoice failed");
      }

      await admin
        .from("orders")
        .update({
          qpay_invoice_id: invJson.invoice_id,
          qpay_qr_image: invJson.qr_image,
          qpay_qr_text: invJson.qr_text,
        })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({
          invoice_id: invJson.invoice_id,
          qr_image: invJson.qr_image,
          qr_text: invJson.qr_text,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "check") {
      if (!order.qpay_invoice_id) {
        return new Response(JSON.stringify({ paid: false, reason: "no_invoice" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const checkRes = await fetch(`${QPAY_BASE}/payment/check`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          object_type: "INVOICE",
          object_id: order.qpay_invoice_id,
          offset: { page_number: 1, page_limit: 100 },
        }),
      });
      const checkJson = await checkRes.json();
      const paid = (checkJson?.count ?? 0) > 0 ||
        (Array.isArray(checkJson?.rows) && checkJson.rows.length > 0);

      if (paid && !order.payment_confirmed) {
        const isPreorder = order.product_type === "preorder";
        await admin
          .from("orders")
          .update({
            payment_confirmed: true,
            deposit_paid: true,
            remaining_paid: !isPreorder,
            status: "paid",
          })
          .eq("id", order.id);
      }

      return new Response(JSON.stringify({ paid, raw: checkJson }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("qpay-invoice error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
