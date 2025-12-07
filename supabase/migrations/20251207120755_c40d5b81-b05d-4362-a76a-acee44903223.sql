-- Create pre-owned cars table
CREATE TABLE public.pre_owned_cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year_of_purchase INTEGER NOT NULL,
  variant TEXT,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  ownership TEXT NOT NULL,
  km_driven INTEGER NOT NULL,
  color TEXT,
  insurance_valid_till DATE,
  service_history_available BOOLEAN DEFAULT false,
  expected_price NUMERIC NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  status TEXT DEFAULT 'active',
  body_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create car images table
CREATE TABLE public.car_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.pre_owned_cars(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create car interests table
CREATE TABLE public.car_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.pre_owned_cars(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  preferred_call_time TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  seller_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create car chats table
CREATE TABLE public.car_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.pre_owned_cars(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create car reports table
CREATE TABLE public.car_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.pre_owned_cars(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pre_owned_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_reports ENABLE ROW LEVEL SECURITY;

-- Pre-owned cars policies
CREATE POLICY "Anyone can view active cars" ON public.pre_owned_cars FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Users can create their own car listings" ON public.pre_owned_cars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own car listings" ON public.pre_owned_cars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own car listings" ON public.pre_owned_cars FOR DELETE USING (auth.uid() = user_id);

-- Car images policies
CREATE POLICY "Anyone can view car images" ON public.car_images FOR SELECT USING (true);
CREATE POLICY "Users can add images to their cars" ON public.car_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.pre_owned_cars WHERE id = car_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their car images" ON public.car_images FOR DELETE USING (EXISTS (SELECT 1 FROM public.pre_owned_cars WHERE id = car_id AND user_id = auth.uid()));

-- Car interests policies
CREATE POLICY "Buyers can view their interests" ON public.car_interests FOR SELECT USING (buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.pre_owned_cars WHERE id = car_id AND user_id = auth.uid()));
CREATE POLICY "Users can create interests" ON public.car_interests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update interest status" ON public.car_interests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.pre_owned_cars WHERE id = car_id AND user_id = auth.uid()));

-- Car chats policies
CREATE POLICY "Chat participants can view messages" ON public.car_chats FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.car_chats FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Car reports policies
CREATE POLICY "Users can create reports" ON public.car_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public) VALUES ('car-listings', 'car-listings', true);

-- Storage policies for car listings
CREATE POLICY "Anyone can view car listing images" ON storage.objects FOR SELECT USING (bucket_id = 'car-listings');
CREATE POLICY "Users can upload car listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-listings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their car listing images" ON storage.objects FOR DELETE USING (bucket_id = 'car-listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at
CREATE TRIGGER update_pre_owned_cars_updated_at
BEFORE UPDATE ON public.pre_owned_cars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();