-- Recreate the create_admin_user function with explicit extensions schema
CREATE OR REPLACE FUNCTION public.create_admin_user(
  _email text,
  _password text,
  _name text,
  _role app_role DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.admin_users (email, password_hash, name, role, is_active)
  VALUES (_email, extensions.crypt(_password, extensions.gen_salt('bf')), _name, _role, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Also update verify_admin_password with explicit extensions schema
CREATE OR REPLACE FUNCTION public.verify_admin_password(_email text, _password text)
 RETURNS TABLE(id uuid, email text, name text, role text, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, extensions
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
    AND a.password_hash = extensions.crypt(_password, a.password_hash);
END;
$function$;