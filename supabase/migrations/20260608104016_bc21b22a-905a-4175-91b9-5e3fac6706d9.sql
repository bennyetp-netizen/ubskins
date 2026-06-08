ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS actual_buff_price_cny numeric,
  ADD COLUMN IF NOT EXISTS actual_cny_mnt_rate numeric,
  ADD COLUMN IF NOT EXISTS actual_cost_mnt integer;