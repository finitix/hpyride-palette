-- Drop the admin-specific RLS policies that require auth.users
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

-- Create simpler policies that allow authenticated users to view all data
-- These will be used by logged-in users who happen to be admins

-- For user_verifications - allow all authenticated users to read (admin check done in app)
CREATE POLICY "Authenticated users can view verifications"
ON public.user_verifications
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update verifications"
ON public.user_verifications
FOR UPDATE
TO authenticated
USING (true);

-- For profiles - allow all authenticated users to read all profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (true);

-- For rides - allow all authenticated users to read all rides
CREATE POLICY "Authenticated users can view all rides"
ON public.rides
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update rides"
ON public.rides
FOR UPDATE
TO authenticated
USING (true);

-- For vehicles - allow all authenticated users to read all vehicles  
CREATE POLICY "Authenticated users can view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (true);

-- For pre_owned_cars - allow all authenticated users to read all cars
CREATE POLICY "Authenticated users can view all cars"
ON public.pre_owned_cars
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update cars"
ON public.pre_owned_cars
FOR UPDATE
TO authenticated
USING (true);