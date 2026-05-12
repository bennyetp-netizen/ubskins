
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS qpay_invoice_id text,
  ADD COLUMN IF NOT EXISTS qpay_qr_image text,
  ADD COLUMN IF NOT EXISTS qpay_qr_text text;
