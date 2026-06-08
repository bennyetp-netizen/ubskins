-- Add cost price column to skins and backfill from existing data
ALTER TABLE public.skins ADD COLUMN IF NOT EXISTS cost_price_mnt integer;

-- Backfill cost: use buff_price_cny * fixed rate (490) when available,
-- otherwise derive from current price_mnt assuming old 20% margin.
UPDATE public.skins
SET cost_price_mnt = CASE
  WHEN buff_price_cny IS NOT NULL AND buff_price_cny > 0
    THEN ROUND(buff_price_cny * 490)::int
  ELSE ROUND(price_mnt / 1.20)::int
END
WHERE cost_price_mnt IS NULL;

-- Recalculate selling price (price_mnt) using tiered markup:
-- 0-50k -> 15%, 50_001-200k -> 12%, >200k -> 8%; round to nearest 100
UPDATE public.skins
SET price_mnt = (
  ROUND(
    (cost_price_mnt * CASE
      WHEN cost_price_mnt <= 50000 THEN 1.15
      WHEN cost_price_mnt <= 200000 THEN 1.12
      ELSE 1.08
    END) / 100
  )::int * 100
)
WHERE cost_price_mnt IS NOT NULL;
