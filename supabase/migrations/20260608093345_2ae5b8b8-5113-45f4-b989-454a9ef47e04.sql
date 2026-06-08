-- Replace view approach with column-level grants on the base table.
DROP VIEW IF EXISTS public.skins_public;

-- Revoke the broad SELECT and re-grant only customer-facing columns.
REVOKE SELECT ON public.skins FROM anon, authenticated;

GRANT SELECT (
  id, name, weapon, weapon_type, game, wear, float_value, price_mnt,
  image_url, rarity, description, stattrak, is_active, is_featured,
  stock, stock_quantity, product_type, is_available, created_at, last_synced_at
) ON public.skins TO anon, authenticated;

-- Admins also need to read sensitive columns; service_role and admin policy
-- already cover that, but make sure authenticated admins (going through the
-- API) can still SELECT every column. Admins are authenticated, so add a
-- full-table SELECT grant to a dedicated "admin" usage path via service_role.
GRANT SELECT ON public.skins TO service_role;