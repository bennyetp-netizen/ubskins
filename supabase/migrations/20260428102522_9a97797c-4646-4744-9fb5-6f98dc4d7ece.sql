-- Sequence: дараалсан тоо
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

-- Шинэ багана
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_confirmed boolean NOT NULL DEFAULT false;

-- Trigger функц: order_number автомат олгох (UBS-001 формат, 3 оронтой padding)
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'UBS-' || LPAD(nextval('public.order_number_seq')::text, 3, '0');
  END IF;
  IF NEW.payment_reference IS NULL THEN
    NEW.payment_reference := NEW.order_number;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_number ON public.orders;
CREATE TRIGGER orders_set_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Хуучин захиалгуудад дугаар олгох
UPDATE public.orders
SET order_number = 'UBS-' || LPAD(nextval('public.order_number_seq')::text, 3, '0')
WHERE order_number IS NULL;

UPDATE public.orders
SET payment_reference = order_number
WHERE payment_reference IS NULL OR payment_reference NOT LIKE 'UBS-%';

-- payment_method шалгуурт 'bank' нэмэх (Хаан банкны шууд шилжүүлэг)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = ANY (ARRAY['wise'::text, 'payoneer'::text, 'swift'::text, 'usdt'::text, 'qpay'::text, 'storepay'::text, 'bank'::text, 'khan'::text]));