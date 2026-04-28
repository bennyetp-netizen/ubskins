-- Buff163 sync-д шаардлагатай талбаруудыг skins хүснэгтэд нэмэх
ALTER TABLE public.skins
  ADD COLUMN IF NOT EXISTS buff_id text,
  ADD COLUMN IF NOT EXISTS buff_price_cny numeric,
  ADD COLUMN IF NOT EXISTS weapon_type text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS skins_buff_id_key ON public.skins(buff_id) WHERE buff_id IS NOT NULL;

-- Захиалгад утасны дугаар талбар нэмэх (заавал биш, хуучин захиалгууд хоосон үлдэнэ)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phone text;

-- Ханшийн түүх хадгалах хүснэгт (нэг мөр, дахин дахин update)
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base text NOT NULL,
  quote text NOT NULL,
  rate numeric NOT NULL,
  source text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(base, quote)
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exchange rates"
  ON public.exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON public.exchange_rates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Cron + http өргөтгөл
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;