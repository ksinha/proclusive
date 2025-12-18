-- Add profile_picture_url field to profiles table
-- This migration adds support for member profile pictures

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.profile_picture_url IS 'Storage path to the member profile picture';

-- Create storage bucket for profile pictures if it doesn't exist
-- Note: This needs to be run separately or the bucket created via Supabase dashboard
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('profile-pictures', 'profile-pictures', true)
-- ON CONFLICT (id) DO NOTHING;
