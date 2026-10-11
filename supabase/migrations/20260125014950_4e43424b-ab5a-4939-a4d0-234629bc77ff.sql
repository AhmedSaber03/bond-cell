-- Fix the verification_logs policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can insert verification logs" ON public.verification_logs;

-- Allow insert only through our edge function by checking for specific context
-- We'll use a security definer function for verification
CREATE OR REPLACE FUNCTION public.log_verification(
    _serial_number_id UUID,
    _action TEXT,
    _ip_address TEXT DEFAULT NULL,
    _country TEXT DEFAULT NULL,
    _city TEXT DEFAULT NULL,
    _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
BEGIN
    INSERT INTO public.verification_logs (serial_number_id, action, ip_address, country, city, user_agent)
    VALUES (_serial_number_id, _action, _ip_address, _country, _city, _user_agent)
    RETURNING id INTO _log_id;
    RETURN _log_id;
END;
$$;

-- Create verification function that checks serial and password
CREATE OR REPLACE FUNCTION public.verify_product(
    _serial_number TEXT,
    _password TEXT,
    _ip_address TEXT DEFAULT NULL,
    _country TEXT DEFAULT NULL,
    _city TEXT DEFAULT NULL,
    _user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _record RECORD;
    _product RECORD;
    _session_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Find the serial number
    SELECT * INTO _record FROM public.serial_numbers WHERE serial_number = _serial_number;
    
    IF _record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid serial number or password');
    END IF;
    
    -- Check if already verified
    IF _record.is_verified = true AND _record.session_expires_at < now() THEN
        -- Log the attempt
        PERFORM public.log_verification(_record.id, 'verification_blocked', _ip_address, _country, _city, _user_agent);
        RETURN jsonb_build_object('success', false, 'error', 'This product has already been verified before.');
    END IF;
    
    -- Check password using crypt
    IF NOT (_record.password_hash = crypt(_password, _record.password_hash)) THEN
        PERFORM public.log_verification(_record.id, 'failed_password', _ip_address, _country, _city, _user_agent);
        RETURN jsonb_build_object('success', false, 'error', 'Invalid serial number or password');
    END IF;

    
    -- Check if within active session
    IF _record.session_expires_at IS NOT NULL AND _record.session_expires_at > now() THEN
        -- Still in active session, get product
        SELECT * INTO _product FROM public.products WHERE id = _record.product_id;
        RETURN jsonb_build_object(
            'success', true,
            'product', jsonb_build_object(
                'id', _product.id,
                'name', _product.name,
                'description', _product.description,
                'manufacturer', _product.manufacturer,
                'images', _product.images,
                'details', _product.details
            ),
            'session_expires_at', _record.session_expires_at
        );
    END IF;
    
    -- First time verification - set session
    _session_expires := now() + interval '60 minutes';
    
    UPDATE public.serial_numbers
    SET is_verified = true,
        verified_at = now(),
        session_expires_at = _session_expires,
        verification_country = _country,
        verification_city = _city,
        verification_ip = _ip_address
    WHERE id = _record.id;
    
    -- Log successful verification
    PERFORM public.log_verification(_record.id, 'verified', _ip_address, _country, _city, _user_agent);
    
    -- Get product details
    SELECT * INTO _product FROM public.products WHERE id = _record.product_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'product', jsonb_build_object(
            'id', _product.id,
            'name', _product.name,
            'description', _product.description,
            'manufacturer', _product.manufacturer,
            'images', _product.images,
            'details', _product.details
        ),
        'session_expires_at', _session_expires,
        'first_verification', true
    );
END;
$$;

-- Function to generate serial numbers with hashed passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.generate_serial_numbers(
    _product_id UUID,
    _count INTEGER DEFAULT 1
)
RETURNS TABLE(serial_number TEXT, raw_password TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _serial TEXT;
    _password TEXT;
    _i INTEGER;
BEGIN
    FOR _i IN 1.._count LOOP
        -- Generate unique serial: NXB-XXXX-XXXX-XXXX
        _serial := 'NXB-' || 
                   upper(substr(md5(random()::text), 1, 4)) || '-' ||
                   upper(substr(md5(random()::text), 1, 4)) || '-' ||
                   upper(substr(md5(random()::text), 1, 4));
        
        -- Generate random password: 8 alphanumeric chars
        _password := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
        
        -- Insert with hashed password
        INSERT INTO public.serial_numbers (product_id, serial_number, password_hash)
        VALUES (_product_id, _serial, crypt(_password, gen_salt('bf')));
        
        serial_number := _serial;
        raw_password := _password;
        RETURN NEXT;
    END LOOP;
END;
$$;