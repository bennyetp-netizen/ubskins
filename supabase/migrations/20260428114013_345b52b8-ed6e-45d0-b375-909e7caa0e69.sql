
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS deposit_amount integer,
  ADD COLUMN IF NOT EXISTS remaining_amount integer,
  ADD COLUMN IF NOT EXISTS deposit_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS remaining_paid boolean NOT NULL DEFAULT false;

ALTER TABLE public.skins
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'preorder',
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_product_type_check') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_product_type_check CHECK (product_type IN ('ready','preorder'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skins_product_type_check') THEN
    ALTER TABLE public.skins ADD CONSTRAINT skins_product_type_check CHECK (product_type IN ('ready','preorder'));
  END IF;
END $$;
