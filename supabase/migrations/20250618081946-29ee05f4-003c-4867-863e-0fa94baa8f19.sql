
-- Add profile management fields and QR codes for tickets
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id);

-- Create admin actions log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user', 'event', 'booking'
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin actions - only admins can view
CREATE POLICY "Admins can view all admin actions" ON public.admin_actions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create admin actions" ON public.admin_actions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add moderation fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Update events RLS to include moderation
DROP POLICY IF EXISTS "Everyone can view active events" ON public.events;
CREATE POLICY "Everyone can view approved events" ON public.events
  FOR SELECT USING (status = 'active' AND moderation_status = 'approved');

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate QR codes for bookings
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'QR-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 12));
END;
$$;

-- Trigger to generate QR codes for new bookings
CREATE OR REPLACE FUNCTION public.set_booking_qr_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code = generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_booking_qr_code_trigger ON public.bookings;
CREATE TRIGGER set_booking_qr_code_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_qr_code();

-- Update profiles table for better role management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS organization TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create user reports table for moderation
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  reported_event_id UUID REFERENCES public.events(id),
  report_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.user_reports
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
