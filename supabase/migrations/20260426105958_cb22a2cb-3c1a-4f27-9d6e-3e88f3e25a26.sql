
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role security definer function (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. user_roles RLS policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. skins table
CREATE TABLE public.skins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  weapon TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT 'CS2',
  wear TEXT,
  float_value NUMERIC,
  price_mnt INTEGER NOT NULL,
  image_url TEXT,
  rarity TEXT,
  description TEXT,
  stattrak BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skins ENABLE ROW LEVEL SECURITY;

-- 6. skins RLS policies
CREATE POLICY "Anyone can view active skins"
  ON public.skins FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all skins"
  ON public.skins FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert skins"
  ON public.skins FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update skins"
  ON public.skins FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete skins"
  ON public.skins FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. updated_at trigger
CREATE TRIGGER update_skins_updated_at
  BEFORE UPDATE ON public.skins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Storage bucket for skin images
INSERT INTO storage.buckets (id, name, public)
VALUES ('skin-images', 'skin-images', true);

-- 9. Storage policies
CREATE POLICY "Skin images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skin-images');

CREATE POLICY "Admins can upload skin images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'skin-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update skin images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'skin-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete skin images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'skin-images' AND public.has_role(auth.uid(), 'admin'));

-- 10. Make BENNY^ (Steam ID 76561198843736129) the first admin
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::public.app_role
FROM public.profiles
WHERE steam_id = '76561198843736129'
ON CONFLICT (user_id, role) DO NOTHING;
