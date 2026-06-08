UPDATE public.skins s
SET price_mnt = ROUND(sc.cost_price_mnt * CASE
  WHEN sc.cost_price_mnt <= 50000 THEN 1.15
  WHEN sc.cost_price_mnt <= 200000 THEN 1.12
  ELSE 1.08
END)::int
FROM public.skin_costs sc
WHERE sc.skin_id = s.id;