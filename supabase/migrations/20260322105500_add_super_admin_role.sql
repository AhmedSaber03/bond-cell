-- Required before policies that call has_role(..., 'super_admin')
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
