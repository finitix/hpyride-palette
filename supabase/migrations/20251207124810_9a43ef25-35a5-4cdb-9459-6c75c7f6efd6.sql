-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create user_verifications table
CREATE TABLE public.user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('aadhar', 'voter', 'pan')),
  id_front_url TEXT NOT NULL,
  id_back_url TEXT NOT NULL,
  selfie_video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for admin panel authentication
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-verifications', 'user-verifications', false);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is verified
CREATE OR REPLACE FUNCTION public.is_user_verified(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_verifications
    WHERE user_id = _user_id
      AND status = 'verified'
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for user_verifications
CREATE POLICY "Users can view their own verification"
ON public.user_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification"
ON public.user_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verification"
ON public.user_verifications FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'rejected'));

-- RLS Policies for admin_users (admins can view all)
CREATE POLICY "Admin users can view admin list"
ON public.admin_users FOR SELECT
USING (true);

-- Storage policies for verification documents
CREATE POLICY "Users can upload their verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add verification_status column to rides if not exists
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add verification_status to pre_owned_cars if not exists
ALTER TABLE public.pre_owned_cars ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE public.pre_owned_cars ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update profiles to include verification reference
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Insert demo admin user (password: admin@1234 - hashed with simple approach for demo)
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES ('hpyride@admin.com', 'admin@1234', 'Super Admin', 'super_admin');

-- Create trigger for updated_at on user_verifications
CREATE TRIGGER update_user_verifications_updated_at
BEFORE UPDATE ON public.user_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on admin_users
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();