-- ============================================
-- COMPREHENSIVE SECURITY FIX FOR PRODUCTION
-- ============================================

-- 1. FIX ADMIN_USERS TABLE - Hash password and restrict access
-- First, update the password to a proper hash (using pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update admin password to be properly hashed
UPDATE admin_users 
SET password_hash = crypt('admin@1234', gen_salt('bf', 10))
WHERE email = 'hpyride@admin.com';

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Admin users can view admin list" ON admin_users;

-- Create secure policy - only accessible via service role (edge function)
-- No direct client access to admin_users table
CREATE POLICY "No direct access to admin_users"
ON admin_users FOR SELECT
USING (false);

-- 2. FIX PROFILES TABLE - Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create secure policies for profiles
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view basic info of others they interact with"
ON profiles FOR SELECT
USING (
  -- Allow viewing profiles of users you have bookings with
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE (bookings.user_id = auth.uid() AND bookings.driver_id = profiles.user_id)
       OR (bookings.driver_id = auth.uid() AND bookings.user_id = profiles.user_id)
  )
  OR
  -- Allow viewing profiles of ride owners
  EXISTS (
    SELECT 1 FROM rides WHERE rides.user_id = profiles.user_id
  )
);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. FIX USER_VERIFICATIONS TABLE - Restrict to own data only
DROP POLICY IF EXISTS "Authenticated users can view verifications" ON user_verifications;
DROP POLICY IF EXISTS "Authenticated users can update verifications" ON user_verifications;
DROP POLICY IF EXISTS "Users can view their own verification" ON user_verifications;
DROP POLICY IF EXISTS "Users can create their own verification" ON user_verifications;
DROP POLICY IF EXISTS "Users can update their own pending verification" ON user_verifications;

-- Create secure policies for user_verifications
CREATE POLICY "Users can view only their own verification"
ON user_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification"
ON user_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verification"
ON user_verifications FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'rejected'))
WITH CHECK (auth.uid() = user_id);

-- 4. FIX BOOKINGS TABLE - Only participants can see
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;

CREATE POLICY "Participants can view their bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = driver_id);

CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update their bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = driver_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = driver_id);

-- 5. FIX NOTIFICATIONS TABLE - Remove permissive insert
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

-- Only allow users to view/update their own notifications
-- Inserts will be done via service role in edge functions
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. FIX VEHICLES TABLE - Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authenticated users can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can create their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;

-- Users can view their own vehicles and verified vehicles (for ride display)
CREATE POLICY "Users can view own and verified vehicles"
ON vehicles FOR SELECT
USING (auth.uid() = user_id OR verification_status = 'verified');

CREATE POLICY "Users can create their own vehicles"
ON vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
ON vehicles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
ON vehicles FOR DELETE
USING (auth.uid() = user_id);

-- 7. FIX RIDES TABLE - Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all rides" ON rides;
DROP POLICY IF EXISTS "Authenticated users can update rides" ON rides;
DROP POLICY IF EXISTS "Anyone can view published rides" ON rides;
DROP POLICY IF EXISTS "Users can create their own rides" ON rides;
DROP POLICY IF EXISTS "Users can update their own rides" ON rides;
DROP POLICY IF EXISTS "Users can delete their own rides" ON rides;

-- Users can view published rides or their own rides
CREATE POLICY "View published rides or own rides"
ON rides FOR SELECT
USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own rides"
ON rides FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rides"
ON rides FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rides"
ON rides FOR DELETE
USING (auth.uid() = user_id);

-- 8. FIX PRE_OWNED_CARS TABLE - Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all cars" ON pre_owned_cars;
DROP POLICY IF EXISTS "Authenticated users can update cars" ON pre_owned_cars;
DROP POLICY IF EXISTS "Anyone can view active cars" ON pre_owned_cars;
DROP POLICY IF EXISTS "Users can create their own car listings" ON pre_owned_cars;
DROP POLICY IF EXISTS "Users can update their own car listings" ON pre_owned_cars;
DROP POLICY IF EXISTS "Users can delete their own car listings" ON pre_owned_cars;

-- Users can view verified/active cars or their own
CREATE POLICY "View active verified cars or own cars"
ON pre_owned_cars FOR SELECT
USING (
  (status = 'active' AND verification_status = 'verified') 
  OR auth.uid() = user_id
);

CREATE POLICY "Users can create their own car listings"
ON pre_owned_cars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own car listings"
ON pre_owned_cars FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own car listings"
ON pre_owned_cars FOR DELETE
USING (auth.uid() = user_id);

-- 9. Create function to verify admin password securely
CREATE OR REPLACE FUNCTION public.verify_admin_password(
  _email text,
  _password text
)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;