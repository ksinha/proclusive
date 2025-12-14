-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data, admins have broader access

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Public can view verified member profiles (for directory)
CREATE POLICY "Public can view verified profiles"
  ON profiles FOR SELECT
  USING (is_verified = TRUE);

-- =====================================================
-- APPLICATIONS POLICIES
-- =====================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  USING (is_admin());

-- Admins can update all applications
CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE
  USING (is_admin());

-- =====================================================
-- DOCUMENTS POLICIES
-- =====================================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own unverified documents
CREATE POLICY "Users can delete own unverified documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id AND is_verified = FALSE);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (is_admin());

-- Admins can update all documents (for verification)
CREATE POLICY "Admins can update all documents"
  ON documents FOR UPDATE
  USING (is_admin());

-- =====================================================
-- REFERRALS POLICIES
-- =====================================================

-- Users can view referrals they sent
CREATE POLICY "Users can view sent referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = sender_id);

-- Users can view referrals they received
CREATE POLICY "Users can view received referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = receiver_id);

-- Verified users can insert referrals
CREATE POLICY "Verified users can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_verified = TRUE
    )
  );

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (is_admin());

-- Admins can update all referrals (for matching)
CREATE POLICY "Admins can update all referrals"
  ON referrals FOR UPDATE
  USING (is_admin());

-- Receivers can update engagement status of their referrals
CREATE POLICY "Receivers can update referral status"
  ON referrals FOR UPDATE
  USING (
    auth.uid() = receiver_id AND
    status IN ('matched', 'engaged')
  );

-- =====================================================
-- ADMIN AUDIT LOG POLICIES
-- =====================================================

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON admin_audit_log FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log FOR SELECT
  USING (is_admin());

-- No one can update or delete audit logs (immutable)
-- (No UPDATE or DELETE policies = no one can do these actions)

-- =====================================================
-- STORAGE BUCKET POLICIES
-- =====================================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload to their own folder
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    is_admin()
  );

-- Users can delete their own unverified documents
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user is an admin';
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'RLS: Users can only see their own profile data';
COMMENT ON POLICY "Admins can view all applications" ON applications IS 'RLS: Admins have full visibility for vetting';
COMMENT ON POLICY "Users can view own documents" ON documents IS 'RLS: Documents are private to user and admins only';
