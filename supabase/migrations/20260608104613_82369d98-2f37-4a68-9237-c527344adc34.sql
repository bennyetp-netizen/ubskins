
-- 1) New admin-only order_costs table
CREATE TABLE IF NOT EXISTS public.order_costs (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  actual_buff_price_cny numeric,
  actual_cny_mnt_rate numeric,
  actual_cost_mnt integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_costs TO authenticated;
GRANT ALL ON public.order_costs TO service_role;

ALTER TABLE public.order_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view order costs"
  ON public.order_costs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert order costs"
  ON public.order_costs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update order costs"
  ON public.order_costs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order costs"
  ON public.order_costs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_order_costs_updated_at
  BEFORE UPDATE ON public.order_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Migrate existing values then drop columns from orders
INSERT INTO public.order_costs (order_id, actual_buff_price_cny, actual_cny_mnt_rate, actual_cost_mnt)
SELECT id, actual_buff_price_cny, actual_cny_mnt_rate, actual_cost_mnt
FROM public.orders
WHERE actual_buff_price_cny IS NOT NULL
   OR actual_cny_mnt_rate IS NOT NULL
   OR actual_cost_mnt IS NOT NULL
ON CONFLICT (order_id) DO NOTHING;

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS actual_buff_price_cny,
  DROP COLUMN IF EXISTS actual_cny_mnt_rate,
  DROP COLUMN IF EXISTS actual_cost_mnt;

-- 3) Auto-clear QPay credentials once payment is confirmed or order is finalized
CREATE OR REPLACE FUNCTION public.clear_qpay_credentials()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.payment_confirmed = true
      OR NEW.status IN ('paid','delivered','cancelled','trade_holding'))
  THEN
    NEW.qpay_invoice_id := NULL;
    NEW.qpay_qr_image := NULL;
    NEW.qpay_qr_text := NULL;
  END IF;
  IF (NEW.remaining_paid = true
      OR NEW.status IN ('delivered','cancelled'))
  THEN
    NEW.qpay_remaining_invoice_id := NULL;
    NEW.qpay_remaining_qr_image := NULL;
    NEW.qpay_remaining_qr_text := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clear_qpay_credentials_trigger ON public.orders;
CREATE TRIGGER clear_qpay_credentials_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.clear_qpay_credentials();

-- Backfill: clear QPay credentials on already-confirmed/finalized rows
UPDATE public.orders
SET qpay_invoice_id = NULL, qpay_qr_image = NULL, qpay_qr_text = NULL
WHERE payment_confirmed = true OR status IN ('paid','delivered','cancelled','trade_holding');

UPDATE public.orders
SET qpay_remaining_invoice_id = NULL, qpay_remaining_qr_image = NULL, qpay_remaining_qr_text = NULL
WHERE remaining_paid = true OR status IN ('delivered','cancelled');
