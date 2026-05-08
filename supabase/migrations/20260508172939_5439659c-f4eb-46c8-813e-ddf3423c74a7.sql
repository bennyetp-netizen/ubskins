ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS float_preference text,
  ADD COLUMN IF NOT EXISTS exact_float_request text,
  ADD COLUMN IF NOT EXISTS sticker_request text,
  ADD COLUMN IF NOT EXISTS price_adjustment_pct integer NOT NULL DEFAULT 0;