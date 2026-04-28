DROP INDEX IF EXISTS public.skins_buff_id_key;
ALTER TABLE public.skins ADD CONSTRAINT skins_buff_id_unique UNIQUE (buff_id);