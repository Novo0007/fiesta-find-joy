
-- Enable RLS on events table if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view active events" ON public.events;
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;

-- Allow everyone to view active events
CREATE POLICY "Everyone can view active events" ON public.events
  FOR SELECT USING (status = 'active');

-- Allow organizers and admins to create events
CREATE POLICY "Organizers can create events" ON public.events
  FOR INSERT WITH CHECK (
    public.can_manage_events(auth.uid()) AND 
    auth.uid() = organizer_id
  );

-- Allow organizers to update their own events
CREATE POLICY "Organizers can update their own events" ON public.events
  FOR UPDATE USING (
    auth.uid() = organizer_id AND 
    public.can_manage_events(auth.uid())
  );

-- Allow admins to manage all events
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
