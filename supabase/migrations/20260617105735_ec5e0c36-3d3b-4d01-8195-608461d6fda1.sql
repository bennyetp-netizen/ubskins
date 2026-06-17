CREATE OR REPLACE VIEW public.skins_public
WITH (security_invoker = off) AS
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
WHERE is_active = true
  AND is_available = true;

ALTER VIEW public.skins_public OWNER TO postgres;
REVOKE ALL ON public.skins_public FROM PUBLIC;
GRANT SELECT ON public.skins_public TO anon, authenticated;
GRANT ALL ON public.skins_public TO service_role;