-- 1. Create admin-only cost table
CREATE TABLE public.skin_costs (
  skin_id uuid PRIMARY KEY REFERENCES public.skins(id) ON DELETE CASCADE,
  cost_price_mnt integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Grants — admins-only via RLS; no anon access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skin_costs TO authenticated;
GRANT ALL ON public.skin_costs TO service_role;

-- 3. RLS
ALTER TABLE public.skin_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view skin costs"
  ON public.skin_costs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert skin costs"
  ON public.skin_costs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update skin costs"
  ON public.skin_costs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete skin costs"
  ON public.skin_costs FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. updated_at trigger
CREATE TRIGGER update_skin_costs_updated_at
  BEFORE UPDATE ON public.skin_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Backfill from existing column
INSERT INTO public.skin_costs (skin_id, cost_price_mnt)
SELECT id, cost_price_mnt FROM public.skins WHERE cost_price_mnt IS NOT NULL
ON CONFLICT (skin_id) DO UPDATE SET cost_price_mnt = EXCLUDED.cost_price_mnt;

-- 6. Remove the publicly-readable column
ALTER TABLE public.skins DROP COLUMN cost_price_mnt;
