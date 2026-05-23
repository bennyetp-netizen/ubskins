
-- 1. Restrict profiles visibility (was public to everyone)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrict Realtime channel subscriptions to the user's own orders topic
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to their own orders channel" ON realtime.messages;

CREATE POLICY "Users can subscribe to their own orders channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('orders-' || auth.uid()::text)
);
