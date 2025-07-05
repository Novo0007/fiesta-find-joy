/*
  # Fix notifications table RLS and policies

  1. Security Changes
    - Enable RLS on notifications table
    - Update policies to use auth.uid() instead of uid()
    - Add proper policy for inserting notifications

  2. Policy Updates
    - Fix SELECT policy for viewing own notifications
    - Fix UPDATE policy for updating own notifications
    - Add INSERT policy for creating notifications
*/

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create new policies with proper auth.uid() function
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow system/admin to insert notifications for any user
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);