-- =====================================================
-- Proclusive Database Migration
-- Portfolio, Privacy & Tax Compliance
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. Add 'tax_compliance' to document_type enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'tax_compliance'
        AND enumtypid = 'document_type'::regtype
    ) THEN
        ALTER TYPE document_type ADD VALUE 'tax_compliance';
    END IF;
END $$;

-- 2. Add columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tin_number TEXT;

COMMENT ON COLUMN profiles.is_public IS 'Profile visibility in member directory (default: public)';
COMMENT ON COLUMN profiles.tin_number IS 'Tax Identification Number (TIN/EIN) - sensitive data, should be encrypted';

-- 3. Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_profile_id ON portfolio_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_display_order ON portfolio_items(profile_id, display_order);

COMMENT ON TABLE portfolio_items IS 'Portfolio images showcasing member work (5+ required for verification)';

-- 4. Add trigger for portfolio_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_portfolio_items_updated_at'
    ) THEN
        CREATE TRIGGER update_portfolio_items_updated_at
        BEFORE UPDATE ON portfolio_items
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. Enable RLS on portfolio_items
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for portfolio_items
CREATE POLICY "Users can view own portfolio"
  ON portfolio_items FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own portfolio"
  ON portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own portfolio"
  ON portfolio_items FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own portfolio"
  ON portfolio_items FOR DELETE
  USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all portfolios"
  ON portfolio_items FOR SELECT
  USING (is_admin());

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

-- 7. Create portfolio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage policies for portfolio bucket
CREATE POLICY "Users can upload own portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    is_admin()
  );

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

CREATE POLICY "Users can delete own portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- Migration Complete
-- =====================================================
