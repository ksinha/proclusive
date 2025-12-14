-- Proclusive Database Schema Update
-- Portfolio, Privacy, and Tax Compliance Features
-- Adds: Portfolio items, Privacy settings, Tax information

-- =====================================================
-- UPDATE ENUMS
-- =====================================================

-- Add tax_compliance document type
ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'tax_compliance';

-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================

-- Add privacy and tax fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tin_number TEXT; -- Tax Identification Number (encrypted/secure)

-- =====================================================
-- NEW TABLES
-- =====================================================

-- Portfolio Items (5+ images per profile)
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Portfolio details
  image_url TEXT NOT NULL, -- Supabase Storage path
  description TEXT,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_portfolio_items_profile_id ON portfolio_items(profile_id);
CREATE INDEX idx_portfolio_items_display_order ON portfolio_items(profile_id, display_order);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for portfolio_items
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN profiles.is_public IS 'Profile visibility in member directory (default: public)';
COMMENT ON COLUMN profiles.tin_number IS 'Tax Identification Number (TIN/EIN) - sensitive data, encrypted';
COMMENT ON TABLE portfolio_items IS 'Portfolio images showcasing member work (5+ required for verification)';
