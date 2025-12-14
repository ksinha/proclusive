-- RLS Policies for Referrals System

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Members can view their own submitted referrals
CREATE POLICY "Members can view their own referrals"
  ON referrals
  FOR SELECT
  USING (
    auth.uid() = submitted_by
    OR auth.uid() = matched_to
  );

-- Members can create referrals
CREATE POLICY "Members can create referrals"
  ON referrals
  FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by
  );

-- Members can update their own submitted referrals (only if status is SUBMITTED)
CREATE POLICY "Members can update their own submitted referrals"
  ON referrals
  FOR UPDATE
  USING (
    auth.uid() = submitted_by
    AND status = 'SUBMITTED'
  )
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'SUBMITTED'
  );

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update all referrals
CREATE POLICY "Admins can update all referrals"
  ON referrals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete referrals
CREATE POLICY "Admins can delete referrals"
  ON referrals
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
