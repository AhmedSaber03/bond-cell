-- Recreate the generate_serial_numbers function with correct pgcrypto reference
CREATE OR REPLACE FUNCTION public.generate_serial_numbers(_product_id uuid, _count integer DEFAULT 1)
 RETURNS TABLE(serial_number text, raw_password text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
        
        -- Insert with hashed password using extensions schema
        INSERT INTO public.serial_numbers (product_id, serial_number, password_hash)
        VALUES (_product_id, _serial, extensions.crypt(_password, extensions.gen_salt('bf')));
        
        serial_number := _serial;
        raw_password := _password;
        RETURN NEXT;
    END LOOP;
END;
$function$;