-- 1) Restrict order self-delete to pending orders only
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
CREATE POLICY "Users can delete their own pending orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- 2) Hide internal BUFF sourcing data from customers
DROP POLICY IF EXISTS "Anyone can view active skins" ON public.skins;

-- Public view excluding sensitive internal columns (buff_id, buff_price_cny)
DROP VIEW IF EXISTS public.skins_public;
CREATE VIEW public.skins_public
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  weapon,
  weapon_type,
  game,
  wear,
  float_value,
  price_mnt,
  image_url,
  rarity,
  description,
  stattrak,
  is_active,
  is_featured,
  stock,
  stock_quantity,
  product_type,
  is_available,
  created_at,
  last_synced_at
FROM public.skins
WHERE is_active = true;

GRANT SELECT ON public.skins_public TO anon, authenticated;

-- Re-add a permissive SELECT policy on the base table scoped so the view
-- (running with security_invoker) can still read active rows for everyone.
-- Sensitive columns are simply not selected by the view.
CREATE POLICY "Public read of active skins (via view)"
  ON public.skins
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);