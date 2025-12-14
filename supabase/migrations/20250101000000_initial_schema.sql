-- Proclusive Database Schema v1.0
-- 15-Point VaaS Framework Implementation
-- Part A: Base Launch (Tier 1 Focus)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Badge levels (mapped to VaaS Tiers)
CREATE TYPE badge_level AS ENUM ('none', 'compliance', 'capability', 'reputation', 'enterprise');

-- Application status
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Referral status (5-stage flow)
CREATE TYPE referral_status AS ENUM ('submitted', 'reviewed', 'matched', 'engaged', 'completed', 'cancelled');

-- Document types (15-point framework)
CREATE TYPE document_type AS ENUM (
  -- Tier 1 (Points 1-5) - Base Launch Focus
  'business_registration',
  'professional_license',
  'liability_insurance',
  'workers_comp',
  'contact_verification',
  -- Tier 2 (Points 6-10) - Deferred to Part B
  'portfolio_project',
  'client_reference',
  'professional_certification',
  'financial_stability',
  'legal_record',
  -- Tier 3 (Points 11-15) - Deferred to Part B
  'operating_history',
  'industry_recognition',
  'satisfaction_metrics',
  'network_contribution',
  'enterprise_assessment',
  -- General
  'other'
);

-- Verification status for each point
CREATE TYPE verification_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,

  -- Business details
  business_type TEXT, -- e.g., "Architecture Firm", "Interior Design Studio", "General Contractor"
  primary_trade TEXT NOT NULL, -- Main service category
  service_areas TEXT[], -- Geographic service areas
  website TEXT,
  linkedin_url TEXT,

  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- VaaS Status
  badge_level badge_level DEFAULT 'none',
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_completed_at TIMESTAMP WITH TIME ZONE,

  -- Profile metadata
  bio TEXT,
  years_in_business INTEGER,
  team_size TEXT, -- e.g., "1-5", "6-10", "11-25", "26-50", "50+"

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications (Vetting submissions)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',

  -- Application data (15-point framework tracking)
  -- Tier 1 (Points 1-5)
  point_1_business_reg verification_status DEFAULT 'not_submitted',
  point_2_prof_license verification_status DEFAULT 'not_submitted',
  point_3_liability_ins verification_status DEFAULT 'not_submitted',
  point_4_workers_comp verification_status DEFAULT 'not_submitted',
  point_5_contact_verify verification_status DEFAULT 'not_submitted',

  -- Tier 2 (Points 6-10) - Deferred
  point_6_portfolio verification_status DEFAULT 'not_submitted',
  point_7_references verification_status DEFAULT 'not_submitted',
  point_8_certifications verification_status DEFAULT 'not_submitted',
  point_9_financial verification_status DEFAULT 'not_submitted',
  point_10_legal_record verification_status DEFAULT 'not_submitted',

  -- Tier 3 (Points 11-15) - Deferred
  point_11_operating_history verification_status DEFAULT 'not_submitted',
  point_12_industry_awards verification_status DEFAULT 'not_submitted',
  point_13_satisfaction verification_status DEFAULT 'not_submitted',
  point_14_network_contrib verification_status DEFAULT 'not_submitted',
  point_15_enterprise verification_status DEFAULT 'not_submitted',

  -- Admin review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,

  -- Terms acceptance
  tos_accepted BOOLEAN DEFAULT FALSE,
  tos_accepted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents (File storage references)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Document details
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER, -- bytes
  mime_type TEXT,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals (B2B Push - 5-stage flow)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Sender (Member making referral)
  sender_id UUID NOT NULL REFERENCES profiles(id),
  sender_company TEXT NOT NULL,

  -- Receiver (Member receiving referral) - Admin matched
  receiver_id UUID REFERENCES profiles(id),
  receiver_company TEXT,

  -- Client details (BANT intake)
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,

  -- Project details
  project_type TEXT NOT NULL,
  project_description TEXT,
  project_value_range TEXT NOT NULL, -- e.g., "<$25K", "$25K-$100K", ">$100K"
  project_location TEXT NOT NULL,
  project_timeline TEXT, -- e.g., "Immediate", "1-3 months", "3-6 months", "6-12 months", ">12 months"

  -- BANT/CRAFT Scoring (Manual for MVP)
  urgency_level TEXT, -- e.g., "High", "Medium", "Low"
  budget_confirmed BOOLEAN DEFAULT FALSE,
  authority_level TEXT, -- e.g., "Decision Maker", "Influencer", "Researcher"
  success_probability_score INTEGER, -- 0-100, manually set by admin

  -- Status tracking (5 stages)
  status referral_status DEFAULT 'submitted',

  -- Stage timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  matched_at TIMESTAMP WITH TIME ZONE,
  engaged_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Admin matching
  matched_by UUID REFERENCES profiles(id),
  matching_notes TEXT,

  -- Commission tracking (Manual for Part A)
  commission_rate DECIMAL(5,2), -- e.g., 3.00 for 3%
  commission_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2), -- Fixed 0.5%

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Audit Log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- e.g., "verified_application", "assigned_badge", "matched_referral"
  entity_type TEXT NOT NULL, -- e.g., "application", "referral", "profile"
  entity_id UUID NOT NULL,
  details JSONB, -- Flexible field for additional context

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_badge_level ON profiles(badge_level);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);

CREATE INDEX idx_referrals_sender_id ON referrals(sender_id);
CREATE INDEX idx_referrals_receiver_id ON referrals(receiver_id);
CREATE INDEX idx_referrals_status ON referrals(status);

CREATE INDEX idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_entity ON admin_audit_log(entity_type, entity_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles with VaaS badge status';
COMMENT ON TABLE applications IS 'Vetting applications tracking 15-point framework';
COMMENT ON TABLE documents IS 'Document uploads for verification';
COMMENT ON TABLE referrals IS 'B2B referral exchanges with 5-stage flow';
COMMENT ON TABLE admin_audit_log IS 'Admin action tracking for compliance';
