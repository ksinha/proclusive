// Database types generated from schema

// VaaS Tier Badge Levels
// - verified (blue): Basic verification complete
// - vetted (green): Full vetting complete
// - elite (gold): Top-tier founding member
// Legacy values (compliance, capability, reputation, enterprise) kept for backward compatibility
export type BadgeLevel = 'none' | 'verified' | 'vetted' | 'elite' | 'compliance' | 'capability' | 'reputation' | 'enterprise';

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type ReferralStatus = 'SUBMITTED' | 'REVIEWED' | 'MATCHED' | 'ENGAGED' | 'COMPLETED';

export type DocumentType =
  | 'business_registration'
  | 'professional_license'
  | 'liability_insurance'
  | 'workers_comp'
  | 'contact_verification'
  | 'tax_compliance'
  | 'portfolio_project'
  | 'client_reference'
  | 'professional_certification'
  | 'financial_stability'
  | 'legal_record'
  | 'operating_history'
  | 'industry_recognition'
  | 'satisfaction_metrics'
  | 'network_contribution'
  | 'enterprise_assessment'
  | 'other';

export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  phone: string | null;
  business_type: string | null;
  primary_trade: string;
  service_areas: string[] | null;
  website: string | null;
  linkedin_url: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  badge_level: BadgeLevel;
  is_admin: boolean;
  is_verified: boolean;
  verification_completed_at: string | null;
  approved_at: string | null;
  is_paid: boolean;
  paid_at: string | null;
  bio: string | null;
  years_in_business: number | null;
  team_size: string | null;
  is_public: boolean;
  tin_number: string | null;
  profile_picture_url: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  point_1_business_reg: VerificationStatus;
  point_2_prof_license: VerificationStatus;
  point_3_liability_ins: VerificationStatus;
  point_4_workers_comp: VerificationStatus;
  point_5_contact_verify: VerificationStatus;
  point_6_portfolio: VerificationStatus;
  point_7_references: VerificationStatus;
  point_8_certifications: VerificationStatus;
  point_9_financial: VerificationStatus;
  point_10_legal_record: VerificationStatus;
  point_11_operating_history: VerificationStatus;
  point_12_industry_awards: VerificationStatus;
  point_13_satisfaction: VerificationStatus;
  point_14_network_contrib: VerificationStatus;
  point_15_enterprise: VerificationStatus;
  workers_comp_exempt_sole_prop: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  tos_accepted: boolean;
  tos_accepted_at: string | null;
  privacy_accepted: boolean;
  privacy_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  application_id: string;
  user_id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;

  // Submitter
  submitted_by: string;

  // Client Information
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;

  // Project Details
  project_type: string;
  project_description: string | null;
  value_range: string | null;
  location: string;
  timeline: string | null;

  // Additional Context
  notes: string | null;

  // State Machine
  status: ReferralStatus;

  // Admin Assignment
  matched_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  matched_at: string | null;
  engaged_at: string | null;
  completed_at: string | null;

  // Admin Notes
  admin_notes: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any> | null;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  profile_id: string;
  image_url: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}
