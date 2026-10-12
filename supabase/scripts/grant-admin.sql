-- Run in Supabase Dashboard → SQL Editor after the user exists in Authentication.
-- Replace the UUID with the user's ID from Auth → Users.

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
