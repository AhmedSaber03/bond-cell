-- Harden verification: correct status transitions, return full product data,
-- lock rows on verify, close anon password_hash exposure, guard serial generation.

-- 1) Drop public SELECT on serial_numbers (verification uses SECURITY DEFINER RPC)
DROP POLICY IF EXISTS "Allow anonymous select for verification" ON public.serial_numbers;

-- 2) Allow super_admin to manage serials + view logs (matches app auth checks)
DROP POLICY IF EXISTS "Admins can manage serial numbers" ON public.serial_numbers;
CREATE POLICY "Admins can manage serial numbers"
ON public.serial_numbers
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Admins can view verification logs" ON public.verification_logs;
CREATE POLICY "Admins can view verification logs"
ON public.verification_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

-- 3) Fixed verify_product
CREATE OR REPLACE FUNCTION public.verify_product(
  _serial_number text,
  _password text,
  _ip_address text DEFAULT NULL,
  _country text DEFAULT NULL,
  _city text DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _record RECORD;
  _product RECORD;
  _session_expires TIMESTAMP WITH TIME ZONE;
  _product_json jsonb;
  _updated_id uuid;
BEGIN
  SELECT * INTO _record
  FROM public.serial_numbers
  WHERE serial_number = _serial_number
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid serial number or password'
    );
  END IF;

  -- Already used and session over (or missing expiry) → permanently blocked
  IF _record.is_verified = true
     AND (_record.session_expires_at IS NULL OR _record.session_expires_at <= now()) THEN
    PERFORM public.log_verification(
      _record.id, 'verification_blocked',
      _ip_address, _country, _city, _user_agent
    );
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This product has already been verified before.'
    );
  END IF;

  IF _record.password_hash != extensions.crypt(_password, _record.password_hash) THEN
    PERFORM public.log_verification(
      _record.id, 'failed_password',
      _ip_address, _country, _city, _user_agent
    );
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid serial number or password'
    );
  END IF;

  SELECT * INTO _product FROM public.products WHERE id = _record.product_id;

  IF _product IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found for this serial number'
    );
  END IF;

  _product_json := jsonb_build_object(
    'id', _product.id,
    'name', _product.name,
    'description', _product.description,
    'manufacturer', _product.manufacturer,
    'images', _product.images,
    'details', _product.details,
    'specifications', COALESCE(_product.specifications, '{}'::jsonb),
    'in_stock', COALESCE(_product.in_stock, true)
  );

  -- Active 60-minute window: allow re-access without rewriting status
  IF _record.is_verified = true
     AND _record.session_expires_at IS NOT NULL
     AND _record.session_expires_at > now() THEN
    RETURN jsonb_build_object(
      'success', true,
      'product', _product_json,
      'session_expires_at', _record.session_expires_at,
      'verified_at', _record.verified_at,
      'first_verification', false
    );
  END IF;

  -- First successful verification only
  IF _record.is_verified = true THEN
    PERFORM public.log_verification(
      _record.id, 'verification_blocked',
      _ip_address, _country, _city, _user_agent
    );
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This product has already been verified before.'
    );
  END IF;

  _session_expires := now() + interval '60 minutes';

  UPDATE public.serial_numbers
  SET
    is_verified = true,
    verified_at = now(),
    session_expires_at = _session_expires,
    verification_country = _country,
    verification_city = _city,
    verification_ip = _ip_address
  WHERE id = _record.id
    AND is_verified = false
  RETURNING id INTO _updated_id;

  IF _updated_id IS NULL THEN
    PERFORM public.log_verification(
      _record.id, 'verification_blocked',
      _ip_address, _country, _city, _user_agent
    );
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This product has already been verified before.'
    );
  END IF;

  PERFORM public.log_verification(
    _record.id, 'verified',
    _ip_address, _country, _city, _user_agent
  );

  RETURN jsonb_build_object(
    'success', true,
    'product', _product_json,
    'session_expires_at', _session_expires,
    'verified_at', now(),
    'first_verification', true
  );
END;
$function$;

-- 4) Guard serial generation to admins only
CREATE OR REPLACE FUNCTION public.generate_serial_numbers(
  _product_id uuid,
  _count integer DEFAULT 1
)
RETURNS TABLE(serial_number text, raw_password text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _serial TEXT;
  _password TEXT;
  _i INTEGER;
  _attempts INTEGER;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Not authorized to generate serial numbers';
  END IF;

  IF _count IS NULL OR _count < 1 OR _count > 500 THEN
    RAISE EXCEPTION 'Count must be between 1 and 500';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = _product_id) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  FOR _i IN 1.._count LOOP
    _attempts := 0;
    LOOP
      _attempts := _attempts + 1;
      _serial := 'NXB-' ||
                 upper(substr(md5(random()::text || clock_timestamp()::text || _i::text), 1, 4)) || '-' ||
                 upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' ||
                 upper(substr(md5(random()::text || gen_random_uuid()::text), 1, 4));

      _password := upper(substr(md5(random()::text || clock_timestamp()::text || gen_random_uuid()::text), 1, 8));

      BEGIN
        INSERT INTO public.serial_numbers (product_id, serial_number, password_hash)
        VALUES (_product_id, _serial, extensions.crypt(_password, extensions.gen_salt('bf')));
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        IF _attempts >= 5 THEN
          RAISE EXCEPTION 'Failed to generate unique serial number';
        END IF;
      END;
    END LOOP;

    serial_number := _serial;
    raw_password := _password;
    RETURN NEXT;
  END LOOP;
END;
$function$;
