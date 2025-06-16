
-- Create enum for user roles
CREATE TYPE public.user_role_type AS ENUM ('user', 'organizer', 'admin');

-- Create user_roles table to manage user permissions
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'user',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role_type
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_uuid 
  ORDER BY assigned_at DESC 
  LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role user_role_type)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = required_role
  );
$$;

-- Create function to check if user can manage events (organizer or admin)
CREATE OR REPLACE FUNCTION public.can_manage_events(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role IN ('organizer', 'admin')
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update events table RLS policies
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete own events" ON public.events;

-- New RLS policies for events with role-based access
CREATE POLICY "Only organizers and admins can create events" ON public.events
  FOR INSERT WITH CHECK (public.can_manage_events(auth.uid()));

CREATE POLICY "Event creators can update their own events" ON public.events
  FOR UPDATE USING (
    auth.uid() = organizer_id OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Event creators can delete their own events" ON public.events
  FOR DELETE USING (
    auth.uid() = organizer_id OR public.has_role(auth.uid(), 'admin')
  );

-- Update bookings RLS to allow organizers to view bookings for their events
CREATE POLICY "Event organizers can view bookings for their events" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = bookings.event_id 
      AND (events.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- Insert default admin user (replace with your actual user ID after signup)
-- You'll need to update this with the actual user ID of who should be admin
-- INSERT INTO public.user_roles (user_id, role, assigned_by) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin', 'YOUR_USER_ID_HERE');
