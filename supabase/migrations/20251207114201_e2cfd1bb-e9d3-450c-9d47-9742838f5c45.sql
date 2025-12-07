-- Create reviews table for ride feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can create reviews for their bookings
CREATE POLICY "Users can create reviews for their bookings"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;