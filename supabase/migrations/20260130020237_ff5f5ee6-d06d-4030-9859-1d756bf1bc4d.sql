-- Fix the verify_product function to use extensions.crypt instead of crypt
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
BEGIN
    -- Find the serial number
    SELECT * INTO _record FROM public.serial_numbers WHERE serial_number = _serial_number;
    
    IF _record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid serial number or password');
    END IF;
    
    -- Check if already verified and session expired
    IF _record.is_verified = true AND _record.session_expires_at < now() THEN
        -- Log the attempt
        PERFORM public.log_verification(_record.id, 'verification_blocked', _ip_address, _country, _city, _user_agent);
        RETURN jsonb_build_object('success', false, 'error', 'This product has already been verified before.');
    END IF;
    
    -- Check password using extensions.crypt (FIXED!)
    IF _record.password_hash != extensions.crypt(_password, _record.password_hash) THEN
        -- Log failed attempt
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
$function$;