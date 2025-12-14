-- Referrals System Migration
-- B2B Push workflow with 5-stage state machine

-- Create referral_status enum type
CREATE TYPE referral_status AS ENUM (
  'SUBMITTED',
  'REVIEWED',
  'MATCHED',
  'ENGAGED',
  'COMPLETED'
);

-- Create referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Submitter (Member who submits the referral)
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  client_company VARCHAR(255),

  -- Project Details
  project_type VARCHAR(255) NOT NULL,
  project_description TEXT,
  value_range VARCHAR(50), -- e.g., "$10k-$50k", "$50k-$100k"
  location VARCHAR(255) NOT NULL,
  timeline VARCHAR(255), -- e.g., "Immediate", "1-3 months", "3-6 months"

  -- Additional Context
  notes TEXT,

  -- State Machine
  status referral_status NOT NULL DEFAULT 'SUBMITTED',

  -- Admin Assignment
  matched_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  matched_at TIMESTAMP WITH TIME ZONE,
  engaged_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Admin Notes
  admin_notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_referrals_submitted_by ON referrals(submitted_by);
CREATE INDEX idx_referrals_matched_to ON referrals(matched_to);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();

-- Add comment
COMMENT ON TABLE referrals IS 'B2B Push referrals with 5-stage manual workflow';
