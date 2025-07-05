/*
  # Fix user_reports table RLS

  1. Security Changes
    - Enable RLS on user_reports table
    - Update policies to use auth.uid() instead of uid()

  2. Policy Updates
    - Fix policies to use proper auth.uid() function
*/

-- Enable RLS on user_reports table
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate with auth.uid()
DROP POLICY IF EXISTS "Users can create reports" ON user_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON user_reports;

-- Recreate policies with auth.uid()
CREATE POLICY "Users can create reports"
  ON user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON user_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own reports"
  ON user_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);