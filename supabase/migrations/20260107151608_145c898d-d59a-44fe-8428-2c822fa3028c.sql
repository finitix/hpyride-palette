-- Create function to create admin users with hashed passwords
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
  VALUES (_email, crypt(_password, gen_salt('bf')), _name, _role, true)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;