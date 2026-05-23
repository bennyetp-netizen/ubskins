
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buff_purchased_at timestamptz,
  ADD COLUMN IF NOT EXISTS trade_hold_until timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_trade_hold_until ON public.orders(trade_hold_until) WHERE trade_hold_until IS NOT NULL;
