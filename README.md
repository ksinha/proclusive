# Proclusive - High-Trust B2B Referral Network

**Version:** Phase 1 (Base Launch - VaaS Engine)
**Target Launch:** April 16, 2026
**Scope:** Part A - Manual/Admin-Assisted Workflows

## Overview

Proclusive is a B2B referral network platform for the construction industry, featuring a comprehensive 15-point Vetting-as-a-Service (VaaS) verification system. This is the Phase 1 implementation focusing on core vetting functionality and admin-assisted referral matching.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email/Password)
- **Storage:** Supabase Storage (with RLS)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)
- **Email:** SendGrid (to be integrated)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account created
- Git (optional)

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API
3. Copy your project URL and anon/public key
4. Navigate to the SQL Editor in your Supabase dashboard
5. Run the migration files in order:
   - `supabase/migrations/20250101000000_initial_schema.sql`
   - `supabase/migrations/20250101000001_rls_policies.sql`

### 3. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Creating the First Admin

You have two options to create the first admin user:

### Option 1: Using the Setup Page

1. Sign up for a regular account at `/auth/signup`
2. Visit `/setup-admin`
3. Enter your email address and click "Grant Admin Privileges"

### Option 2: Direct Database Update

1. Go to your Supabase dashboard
2. Open the Table Editor
3. Navigate to the `profiles` table
4. Find your user's row (by email)
5. Set the `is_admin` column to `true`

## Application Flow

### User Journey

1. **Sign Up** (`/auth/signup`)
   - Create account with email/password
   - Redirected to vetting wizard

2. **Vetting Wizard** (`/vetting`)
   - Step 1: Business Information
   - Step 2: Document Uploads (Tier 1: 5 documents)
   - Step 3: Terms of Service
   - Step 4: Review & Submit

3. **Waiting for Approval**
   - Application submitted
   - Admin reviews documents
   - User receives email notification (future)

4. **Member Dashboard** (`/dashboard` - future)
   - Access after approval
   - Submit referrals
   - View received referrals

### Admin Journey

1. **Admin Login** (`/auth/login`)
   - If `is_admin = true`, redirected to admin dashboard

2. **Admin Dashboard** (`/admin/dashboard`)
   - View all applications
   - Filter by status (pending, under review, approved, rejected)
   - Review individual applications

3. **Application Review**
   - View applicant profile
   - Preview uploaded documents
   - Verify each of 5 Tier 1 points
   - Assign badge level (Compliance, Capability, Reputation, Enterprise)
   - Approve, reject, or mark under review

## Database Schema

### Key Tables

- **profiles** - User profiles with VaaS badge status
- **applications** - Vetting applications tracking 15-point framework
- **documents** - Document uploads for verification
- **referrals** - B2B referral exchanges (Phase 2)
- **admin_audit_log** - Admin action tracking

### Badge Levels

- **None** (Gray) - No verification
- **Compliance** (Blue) - Tier 1 verified (Base Launch focus)
- **Capability** (Green) - Tier 2 verified (Deferred)
- **Reputation** (Purple) - Tier 3 verified (Deferred)
- **Enterprise** (Gold) - Full verification (Deferred)

## 15-Point VaaS Framework

### Tier 1 (Phase 1 Focus)
1. Business Registration Verification
2. Professional Licensing Confirmation
3. General Liability Insurance Verification
4. Workers' Compensation Compliance
5. Contact & Location Verification

### Tier 2 (Deferred to Part B)
6. Portfolio & Project Documentation
7. Client Reference Verification
8. Professional Certifications & Credentials
9. Financial Stability Indicators
10. Legal & Disciplinary Record Review

### Tier 3 (Deferred to Part B)
11. Extended Operating History
12. Industry Recognition & Awards
13. Client Satisfaction Metrics
14. Proclusive Network Contribution
15. Enterprise Readiness Assessment

## Security Features

- **Row Level Security (RLS)** on all tables
- **Private document storage** (users can only access their own files)
- **Admin-only access** to sensitive data
- **Audit logging** for all admin actions
- **Secure file uploads** with type validation

## Phase 1 Status

✅ **Completed:**
- Next.js scaffolding with TypeScript & Tailwind
- Supabase client setup
- Database schema with 15-point framework
- RLS policies
- Multi-step vetting wizard
- Document upload system
- Terms of Service acceptance
- Admin dashboard
- Application review system
- Badge assignment
- Audit logging

⏳ **Not Implemented (Deferred to Phase 2+):**
- Referral submission flow
- Admin referral matching
- Stripe Connect payments
- SendGrid email integration
- Member directory
- Referral Circles
- CRAFT scoring automation
- Tier 2/3 verification

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Checkpoint 1 Verification

To test the complete Phase 1 workflow:

1. ✅ User signup → redirect to vetting wizard
2. ✅ Complete vetting wizard → upload documents → submit
3. ✅ Admin login → view pending applications
4. ✅ Admin review → verify documents → assign badge → approve
5. ✅ User status updated to verified

## Next Steps (Phase 2)

- Implement referral submission form (B2B Push)
- Build admin referral matching interface
- Add SendGrid email notifications
- Create member directory with badge filtering
- Implement Success Probability Score (SPS) manual input

## Support

For questions or issues, contact the development team.

---

**Built with Claude Code** 🚀
Phase 1 VaaS Engine - January 2025
