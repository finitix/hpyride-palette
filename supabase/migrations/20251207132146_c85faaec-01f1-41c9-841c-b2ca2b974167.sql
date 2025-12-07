-- Add admin update policy for vehicles
CREATE POLICY "Admins can update all vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Enable realtime for tables not yet added
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pre_owned_cars;