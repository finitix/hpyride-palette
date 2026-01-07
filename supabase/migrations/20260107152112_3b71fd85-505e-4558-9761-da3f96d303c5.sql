-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the create_admin_user function with proper casting
CREATE OR REPLACE FUNCTION public.create_admin_user(
  _email text,
  _password text,
  _name text,
  _role app_role DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.admin_users (email, password_hash, name, role, is_active)
  VALUES (_email, crypt(_password, gen_salt('bf'::text)), _name, _role, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Also update verify_admin_password to use proper casting
CREATE OR REPLACE FUNCTION public.verify_admin_password(_email text, _password text)
 RETURNS TABLE(id uuid, email text, name text, role text, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.name,
    a.role::text,
    a.is_active
  FROM admin_users a
  WHERE a.email = _email
    AND a.is_active = true
    AND a.password_hash = crypt(_password, a.password_hash);
END;
$function$;