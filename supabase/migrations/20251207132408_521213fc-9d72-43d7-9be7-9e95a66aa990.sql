-- Drop existing problematic admin policies that reference auth.users
DROP POLICY IF EXISTS "Admins can view all verifications" ON public.user_verifications;
DROP POLICY IF EXISTS "Admins can update verifications" ON public.user_verifications;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all rides" ON public.rides;
DROP POLICY IF EXISTS "Admins can update all rides" ON public.rides;
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can update all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can view all pre_owned_cars" ON public.pre_owned_cars;
DROP POLICY IF EXISTS "Admins can update all pre_owned_cars" ON public.pre_owned_cars;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users a
    INNER JOIN auth.users u ON u.email = a.email
    WHERE u.id = _user_id
  )
$$;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all verifications"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update verifications"
ON public.user_verifications
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all rides"
ON public.rides
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all rides"
ON public.rides
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all pre_owned_cars"
ON public.pre_owned_cars
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all pre_owned_cars"
ON public.pre_owned_cars
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));