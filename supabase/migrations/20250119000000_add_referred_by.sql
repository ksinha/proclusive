-- Add referred_by column to profiles table
-- This field tracks who referred the member to Proclusive

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referred_by TEXT;

COMMENT ON COLUMN profiles.referred_by IS 'Name of the Proclusive member who referred this user';
