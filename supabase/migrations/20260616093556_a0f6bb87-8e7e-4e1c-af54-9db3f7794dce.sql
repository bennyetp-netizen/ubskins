-- 1. Create a security-barrier view exposing only customer-safe columns.
--    The view runs with its owner's privileges (default), so it bypasses the
--    table-level RLS policy and column grants — this is the access path for
--    anon/authenticated. Buff sourcing fields are physically absent from the view.
CREATE OR REPLACE VIEW public.skins_public
WITH (security_barrier = true) AS
SELECT
  id, name, weapon, weapon_type, game, wear, float_value, price_mnt,
  image_url, rarity, description, stattrak, is_active, is_featured,
  stock, stock_quantity, product_type, is_available, created_at, last_synced_at
FROM public.skins
WHERE is_active = true;

ALTER VIEW public.skins_public OWNER TO postgres;

REVOKE ALL ON public.skins_public FROM PUBLIC;
GRANT SELECT ON public.skins_public TO anon, authenticated;

-- 2. Remove the broad public SELECT policy on the base table so anon/authenticated
--    can no longer read directly from public.skins. Admin SELECT policy is retained.
DROP POLICY IF EXISTS "Public read of active skins (via view)" ON public.skins;

-- 3. Revoke the column-level SELECT grants on the base table from anon/authenticated.
--    All public reads must go through skins_public.
REVOKE SELECT ON public.skins FROM anon, authenticated;

-- 4. Ensure admin reads keep working (admin RLS policy + table grant to authenticated).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skins TO authenticated;
GRANT ALL ON public.skins TO service_role;