
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS qpay_remaining_invoice_id text,
  ADD COLUMN IF NOT EXISTS qpay_remaining_qr_image text,
  ADD COLUMN IF NOT EXISTS qpay_remaining_qr_text text;
