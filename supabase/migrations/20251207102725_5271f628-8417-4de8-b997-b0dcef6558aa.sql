
-- Create enum for vehicle types
CREATE TYPE public.vehicle_type AS ENUM ('private', 'commercial', 'other');

-- Create enum for vehicle category
CREATE TYPE public.vehicle_category AS ENUM ('car', 'bike', 'auto', 'taxi', 'suv', 'van', 'mini_bus', 'luxury', 'ev', 'other');

-- Create enum for ride status
CREATE TYPE public.ride_status AS ENUM ('pending', 'verified', 'published', 'completed', 'cancelled');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL,
  category vehicle_category NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  number TEXT NOT NULL,
  rc_book_url TEXT,
  insurance_url TEXT,
  pollution_url TEXT,
  front_image_url TEXT,
  side_image_url TEXT,
  rear_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status verification_status DEFAULT 'pending',
  seats INTEGER DEFAULT 4,
  has_ac BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rides table
CREATE TABLE public.rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  drop_location TEXT NOT NULL,
  drop_lat DOUBLE PRECISION NOT NULL,
  drop_lng DOUBLE PRECISION NOT NULL,
  ride_date DATE NOT NULL,
  ride_time TIME NOT NULL,
  route_type TEXT DEFAULT 'shortest',
  route_polyline TEXT,
  distance_km DOUBLE PRECISION,
  duration_minutes INTEGER,
  seats_available INTEGER NOT NULL DEFAULT 1,
  price_per_km DOUBLE PRECISION NOT NULL,
  total_price DOUBLE PRECISION,
  has_ac BOOLEAN DEFAULT TRUE,
  music_allowed BOOLEAN DEFAULT TRUE,
  female_only BOOLEAN DEFAULT FALSE,
  luggage_allowed BOOLEAN DEFAULT TRUE,
  pickup_flexibility TEXT DEFAULT 'exact',
  status ride_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL DEFAULT 1,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  alternate_phone TEXT,
  notes TEXT,
  pickup_location TEXT,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  drop_location TEXT,
  drop_lat DOUBLE PRECISION,
  drop_lng DOUBLE PRECISION,
  total_fare DOUBLE PRECISION NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  status booking_status DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver verification table
CREATE TABLE public.driver_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dl_number TEXT,
  dl_front_url TEXT,
  dl_back_url TEXT,
  status verification_status DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_verifications ENABLE ROW LEVEL SECURITY;

-- Vehicles policies
CREATE POLICY "Users can view all vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Users can create their own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = user_id);

-- Rides policies
CREATE POLICY "Anyone can view published rides" ON public.rides FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can create their own rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rides" ON public.rides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rides" ON public.rides FOR DELETE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view their bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = driver_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = driver_id);

-- Chat messages policies
CREATE POLICY "Chat participants can view messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND (user_id = auth.uid() OR driver_id = auth.uid()))
);
CREATE POLICY "Chat participants can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND (user_id = auth.uid() OR driver_id = auth.uid()))
);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Driver verifications policies
CREATE POLICY "Users can view their verification" ON public.driver_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their verification" ON public.driver_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their verification" ON public.driver_verifications FOR UPDATE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-documents', 'vehicle-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('driver-documents', 'driver-documents', false);

-- Storage policies for vehicle documents
CREATE POLICY "Users can upload vehicle documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their vehicle documents" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for vehicle images (public)
CREATE POLICY "Anyone can view vehicle images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
CREATE POLICY "Users can upload vehicle images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for driver documents
CREATE POLICY "Users can upload driver documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'driver-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their driver documents" ON storage.objects FOR SELECT USING (bucket_id = 'driver-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for rides and bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add update triggers
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_driver_verifications_updated_at BEFORE UPDATE ON public.driver_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
