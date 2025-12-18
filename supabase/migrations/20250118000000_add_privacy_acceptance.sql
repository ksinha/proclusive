-- Add privacy_accepted fields to applications table
-- This migration adds support for tracking Privacy Policy acceptance alongside Terms of Service

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN applications.privacy_accepted IS 'Whether the user has accepted the Privacy Policy';
COMMENT ON COLUMN applications.privacy_accepted_at IS 'Timestamp when the Privacy Policy was accepted';
