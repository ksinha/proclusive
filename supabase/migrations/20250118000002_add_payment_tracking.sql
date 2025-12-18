-- Add payment tracking and approval date fields to profiles table
-- This migration adds:
-- 1. approved_at: Timestamp when member was approved
-- 2. is_paid: Boolean flag for payment status
-- 3. paid_at: Timestamp when payment was received

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_is_paid ON profiles(is_paid);
CREATE INDEX IF NOT EXISTS idx_profiles_approved_at ON profiles(approved_at);

-- Add comments for documentation
COMMENT ON COLUMN profiles.approved_at IS 'Date when the member application was approved by admin';
COMMENT ON COLUMN profiles.is_paid IS 'Payment status flag - whether member has paid their fees';
COMMENT ON COLUMN profiles.paid_at IS 'Date when payment was received/processed';
