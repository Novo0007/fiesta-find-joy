/*
  # Fix events table RLS

  1. Security Changes
    - Enable RLS on events table
    - Update policies to use auth.uid() instead of uid()

  2. Policy Updates
    - Fix policies to use proper auth.uid() function
*/

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate with auth.uid()
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Everyone can view approved events" ON events;
DROP POLICY IF EXISTS "Event creators can update their own events" ON events;
DROP POLICY IF EXISTS "Event creators can delete their own events" ON events;
DROP POLICY IF EXISTS "Only organizers and admins can create events" ON events;
DROP POLICY IF EXISTS "Admins can view all events" ON events;

-- Recreate policies with auth.uid()
CREATE POLICY "Anyone can view active events"
  ON events
  FOR SELECT
  TO authenticated
  USING (status = 'active' AND moderation_status = 'approved');

CREATE POLICY "Public can view approved events"
  ON events
  FOR SELECT
  TO anon
  USING (status = 'active' AND moderation_status = 'approved');

CREATE POLICY "Event creators can view their own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Event creators can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Event creators can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers and admins can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('organizer', 'admin')
    )
  );

CREATE POLICY "Admins can view all events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );