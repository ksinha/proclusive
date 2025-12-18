-- Migration: Add reference number system with sequences and triggers
-- Created: 2025-12-18
-- Description: Adds auto-generated reference numbers for referrals and member numbers for approved profiles

-- ============================================================================
-- SEQUENCES
-- ============================================================================

-- Sequence for referral reference numbers
CREATE SEQUENCE IF NOT EXISTS referral_reference_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- Sequence for member numbers
CREATE SEQUENCE IF NOT EXISTS member_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- ============================================================================
-- ALTER TABLES - ADD COLUMNS
-- ============================================================================

-- Add reference_number column to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

-- Add member_number column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS member_number TEXT;

-- Add unique constraint for member_number (where not null)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_member_number_key
  ON profiles(member_number)
  WHERE member_number IS NOT NULL;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to generate referral reference number
-- Format: REF-YYYYMM-NNNNN
CREATE OR REPLACE FUNCTION generate_referral_reference_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month TEXT;
  sequence_num TEXT;
  new_reference TEXT;
BEGIN
  -- Only generate if reference_number is not already set
  IF NEW.reference_number IS NULL THEN
    -- Get current year-month in YYYYMM format
    year_month := to_char(CURRENT_DATE, 'YYYYMM');

    -- Get next sequence number and pad to 5 digits
    sequence_num := lpad(nextval('referral_reference_seq')::TEXT, 5, '0');

    -- Construct the reference number
    new_reference := 'REF-' || year_month || '-' || sequence_num;

    -- Set the reference number
    NEW.reference_number := new_reference;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate member number when profile is approved
-- Format: MEM-YYYYMM-NNNNN
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month TEXT;
  sequence_num TEXT;
  new_member_number TEXT;
BEGIN
  -- Only generate member number if:
  -- 1. approved_at is being set (not NULL)
  -- 2. member_number is not already set
  -- 3. This is either an INSERT with approved_at or an UPDATE where approved_at changed from NULL
  IF NEW.approved_at IS NOT NULL AND NEW.member_number IS NULL THEN
    -- Check if this is a new approval (not already approved)
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.approved_at IS NULL) THEN
      -- Get current year-month in YYYYMM format
      year_month := to_char(CURRENT_DATE, 'YYYYMM');

      -- Get next sequence number and pad to 5 digits
      sequence_num := lpad(nextval('member_number_seq')::TEXT, 5, '0');

      -- Construct the member number
      new_member_number := 'MEM-' || year_month || '-' || sequence_num;

      -- Set the member number
      NEW.member_number := new_member_number;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for referrals table - auto-generate reference number on INSERT
DROP TRIGGER IF EXISTS trigger_generate_referral_reference ON referrals;
CREATE TRIGGER trigger_generate_referral_reference
  BEFORE INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_reference_number();

-- Trigger for profiles table - generate member number when approved
DROP TRIGGER IF EXISTS trigger_generate_member_number ON profiles;
CREATE TRIGGER trigger_generate_member_number
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_member_number();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN referrals.reference_number IS
  'Auto-generated reference number in format REF-YYYYMM-NNNNN';

COMMENT ON COLUMN profiles.member_number IS
  'Auto-generated member number in format MEM-YYYYMM-NNNNN, assigned when profile is approved';

COMMENT ON SEQUENCE referral_reference_seq IS
  'Global sequence for referral reference numbers';

COMMENT ON SEQUENCE member_number_seq IS
  'Global sequence for member numbers';

-- ============================================================================
-- BACKFILL EXISTING DATA (Optional)
-- ============================================================================

-- Uncomment the following sections if you want to backfill reference numbers
-- for existing records

-- Backfill referral reference numbers for existing records
-- UPDATE referrals
-- SET reference_number = 'REF-' || to_char(created_at, 'YYYYMM') || '-' ||
--     lpad(nextval('referral_reference_seq')::TEXT, 5, '0')
-- WHERE reference_number IS NULL;

-- Backfill member numbers for existing approved profiles
-- UPDATE profiles
-- SET member_number = 'MEM-' || to_char(approved_at, 'YYYYMM') || '-' ||
--     lpad(nextval('member_number_seq')::TEXT, 5, '0')
-- WHERE approved_at IS NOT NULL
--   AND member_number IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the migration
-- SELECT
--   'referrals' as table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'referrals'
--   AND column_name = 'reference_number'
-- UNION ALL
-- SELECT
--   'profiles' as table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
--   AND column_name = 'member_number';

-- Test the triggers
-- INSERT INTO referrals (...) VALUES (...);
-- SELECT reference_number FROM referrals ORDER BY created_at DESC LIMIT 1;
