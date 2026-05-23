// Public webhook QPay calls when an invoice is paid.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

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
      .select("id, product_type, payment_confirmed, remaining_paid")
      .eq("id", orderId)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: "order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPreorder = order.product_type === "preorder";

    if (stage === "remaining") {
      if (!order.remaining_paid) {
        await admin
          .from("orders")
          .update({ remaining_paid: true, status: "paid" })
          .eq("id", order.id);
      }
    } else if (!order.payment_confirmed) {
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
