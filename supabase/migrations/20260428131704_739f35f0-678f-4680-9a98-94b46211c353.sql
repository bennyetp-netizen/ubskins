CREATE POLICY "Users can delete their own orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any orders"
ON public.orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  parsed_amount INTEGER,
  parsed_reference TEXT,
  matched_order_id UUID,
  matched_action TEXT,
  source_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sms logs"
ON public.sms_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sms logs"
ON public.sms_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));