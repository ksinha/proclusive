-- RLS Policies for Portfolio Items
-- Allows users to manage their portfolio, members to view public portfolios

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PORTFOLIO_ITEMS POLICIES
-- =====================================================

-- Users can view their own portfolio items
CREATE POLICY "Users can view own portfolio"
  ON portfolio_items FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own portfolio items
CREATE POLICY "Users can insert own portfolio"
  ON portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own portfolio items
CREATE POLICY "Users can update own portfolio"
  ON portfolio_items FOR UPDATE
  USING (auth.uid() = profile_id);

-- Users can delete their own portfolio items
CREATE POLICY "Users can delete own portfolio"
  ON portfolio_items FOR DELETE
  USING (auth.uid() = profile_id);

-- Admins can view all portfolio items
CREATE POLICY "Admins can view all portfolios"
  ON portfolio_items FOR SELECT
  USING (is_admin());

-- Logged-in members can view public portfolios
CREATE POLICY "Members can view public portfolios"
  ON portfolio_items FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = portfolio_items.profile_id
      AND profiles.is_public = TRUE
      AND profiles.is_verified = TRUE
    )
  );

-- =====================================================
-- STORAGE BUCKET POLICIES FOR PORTFOLIO
-- =====================================================

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload to their own portfolio folder
CREATE POLICY "Users can upload own portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own portfolio images
CREATE POLICY "Users can view own portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all portfolio images
CREATE POLICY "Admins can view all portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    is_admin()
  );

-- Logged-in members can view public portfolio images
CREATE POLICY "Members can view public portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = (storage.foldername(name))[1]
      AND profiles.is_public = TRUE
      AND profiles.is_verified = TRUE
    )
  );

-- Users can delete their own portfolio images
CREATE POLICY "Users can delete own portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Members can view public portfolios" ON portfolio_items IS 'RLS: Logged-in members can view portfolios of public, verified profiles';
COMMENT ON POLICY "Users can view own portfolio" ON portfolio_items IS 'RLS: Users can manage their own portfolio items';
