/*
  # Fix admin_actions table RLS

  1. Security Changes
    - Enable RLS on admin_actions table
    - Update policies to use auth.uid() instead of uid()

  2. Policy Updates
    - Fix policies to use proper auth.uid() function
*/

-- Enable RLS on admin_actions table
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate with auth.uid()
DROP POLICY IF EXISTS "Admins can create admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can view all admin actions" ON admin_actions;

-- Recreate policies with auth.uid()
CREATE POLICY "Admins can create admin actions"
  ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all admin actions"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );