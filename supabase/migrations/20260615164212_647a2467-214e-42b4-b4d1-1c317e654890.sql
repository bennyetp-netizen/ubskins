
CREATE TABLE IF NOT EXISTS public.sync_state (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.sync_state TO service_role;
ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.sync_state(key, value) VALUES ('fillwears', '{"offset":0}'::jsonb)
  ON CONFLICT (key) DO NOTHING;
