# Referrals System Implementation Guide

## ✅ CHECKPOINT 2 - B2B Push Referral System Complete

### Overview
The B2B Push referral system has been implemented with:
- Member referral submission form
- 5-stage admin workflow (SUBMITTED → REVIEWED → MATCHED → ENGAGED → COMPLETED)
- Admin dashboard for manual referral management
- Basic notification structure (email integration pending)

---

## 📋 Implementation Summary

### Step 2.1: Referral Submission Form ✅
**Status**: Complete

**Member Features**:
- `/dashboard/referrals/new` - Submit new referrals
- `/dashboard/referrals` - View submitted referrals and track status

**Fields Captured**:
- **Client Info**: Name, Email, Phone, Company
- **Project Type**: Dropdown with 20+ construction industry options
- **Value Range**: Budget tiers from "Under $10k" to "Over $1M"
- **Location**: Project location (required)
- **Timeline**: Urgency indicators (Immediate to 6+ months)
- **Notes/Context**: Additional details

**Logic**: All referrals save with status = `SUBMITTED`

---

### Step 2.2: Admin Referral Dashboard ✅
**Status**: Complete

**Location**: `/admin/referrals`

**5-Stage State Machine**:
1. **SUBMITTED** → New referral from member
2. **REVIEWED** → Admin has verified quality/docs
3. **MATCHED** → Admin manually selected a member to route to
4. **ENGAGED** → Member is actively working the lead
5. **COMPLETED** → Project closed

**Admin Features**:
- View all referrals with status filtering
- Stats dashboard showing count by status
- Detailed referral view with timeline
- Manual status transitions
- Member matching interface
- Admin notes field
- Audit logging

---

### Step 2.3: Notifications ✅
**Status**: Complete

**Email Trigger Points**:
1. **New Referral** → Notifies admin when member submits (`/api/referrals/notify-admin`)
2. **Matched** → Notifies member when admin assigns referral (`/api/referrals/notify-member`)

**Implementation Files**:
- `src/lib/email/sendgrid.ts` - Email utility functions
- `src/app/api/referrals/notify-admin/route.ts` - Admin notification API
- `src/app/api/referrals/notify-member/route.ts` - Member notification API
- `src/components/referrals/ReferralSubmissionForm.tsx` - Calls notify-admin on submit
- `src/components/admin/ReferralDetail.tsx` - Calls notify-member on match

**Note**: Stripe Connect automated commission splits are DEFERRED as specified.

---

## 🗄️ Database Schema

### Tables Created

#### `referrals` Table
```sql
- id (UUID, primary key)
- submitted_by (UUID, references profiles)
- client_name (VARCHAR, required)
- client_email (VARCHAR, optional)
- client_phone (VARCHAR, optional)
- client_company (VARCHAR, optional)
- project_type (VARCHAR, required)
- project_description (TEXT, optional)
- value_range (VARCHAR, optional)
- location (VARCHAR, required)
- timeline (VARCHAR, optional)
- notes (TEXT, optional)
- status (ENUM: SUBMITTED|REVIEWED|MATCHED|ENGAGED|COMPLETED)
- matched_to (UUID, references profiles)
- reviewed_by (UUID, references profiles)
- reviewed_at (TIMESTAMP)
- matched_at (TIMESTAMP)
- engaged_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- admin_notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Migrations to Run
Located in `/supabase/migrations/`:
1. `20250114000002_referrals_system.sql` - Create referrals table
2. `20250114000003_referrals_rls_policies.sql` - Row-level security

**To Apply**:
```bash
# Option 1: Run in Supabase SQL Editor
# Copy and paste each migration file into the SQL Editor and execute

# Option 2: If using Supabase CLI
supabase db push
```

---

## 🎯 User Workflows

### Member Workflow (B2B Push)
1. Member navigates to `/dashboard/referrals`
2. Clicks "New Referral" button
3. Fills out referral submission form with client/project details
4. Submits → Status: SUBMITTED
5. Can track referral status on referrals page
6. Receives email when admin matches referral (pending SendGrid)

### Admin Workflow (Manual Review & Matching)
1. Admin navigates to `/admin/referrals`
2. Views dashboard with referrals filtered by status
3. Clicks on a referral to view details
4. **Stage 1 → 2**: Reviews quality, clicks "Mark as Reviewed"
5. **Stage 2 → 3**: Selects member from dropdown, clicks "Match to Member"
   - Email sent to matched member (pending SendGrid)
6. **Stage 3 → 4**: When member engages, clicks "Mark as Engaged"
7. **Stage 4 → 5**: When project closes, clicks "Mark as Completed"

---

## 📁 Files Created

### Database
- `/supabase/migrations/20250114000002_referrals_system.sql`
- `/supabase/migrations/20250114000003_referrals_rls_policies.sql`

### Types
- Updated `/src/types/database.types.ts`:
  - `ReferralStatus` type
  - `Referral` interface

### Components
- `/src/components/referrals/ReferralSubmissionForm.tsx` - Member submission form
- `/src/components/admin/ReferralsList.tsx` - Admin referrals list with filtering
- `/src/components/admin/ReferralDetail.tsx` - Detailed view with state transitions

### Pages
- `/src/app/dashboard/referrals/page.tsx` - Member referrals list
- `/src/app/dashboard/referrals/new/page.tsx` - Member submission page
- `/src/app/admin/referrals/page.tsx` - Admin dashboard

---

## 🔧 SendGrid Configuration

### Required Environment Variables
Add to `.env.local`:
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@proclusive.com
SENDGRID_ADMIN_EMAIL=admin@proclusive.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Email Templates (Built-in)
1. **New Referral (to Admin)**
   - Subject: "New Referral Submitted by [Member Name]"
   - Content: Client name, project type, value range, link to admin dashboard

2. **Matched (to Member)**
   - Subject: "New Referral Match: [Client Name]"
   - Content: Client details, project info, contact information

### Implementation Files
- `/src/lib/email/sendgrid.ts` - SendGrid email utility
- `/src/app/api/referrals/notify-admin/route.ts` - Admin notification endpoint
- `/src/app/api/referrals/notify-member/route.ts` - Member notification endpoint

---

## ✅ Verification Checklist

### Database
- [ ] Run migration `20250114000002_referrals_system.sql`
- [ ] Run migration `20250114000003_referrals_rls_policies.sql`
- [ ] Verify `referrals` table exists in Supabase

### Member Flow
- [ ] Navigate to `/dashboard/referrals`
- [ ] Click "New Referral"
- [ ] Submit a test referral
- [ ] Verify it appears with status "Submitted"

### Admin Flow
- [ ] Navigate to `/admin/referrals` (requires admin account)
- [ ] See test referral with status "SUBMITTED"
- [ ] Click on referral to open detail view
- [ ] Progress through all 5 stages:
  - [ ] SUBMITTED → REVIEWED
  - [ ] REVIEWED → MATCHED (select a member)
  - [ ] MATCHED → ENGAGED
  - [ ] ENGAGED → COMPLETED

### Email Notifications (Requires SendGrid API key in .env.local)
- [ ] Submit referral → Admin receives email
- [ ] Match referral → Member receives email

---

## 🚧 Deferred Features (As Specified)
- Stripe Connect automated commission splits
- Automated payment processing
- Commission tracking (manual for now)

---

## 📊 Current Status

**CHECKPOINT 2: COMPLETE** ✅
- ✅ B2B Push referral submission form
- ✅ 5-stage admin workflow with manual transitions
- ✅ Email notifications (SendGrid integration complete)
- ✅ Admin referral dashboard
- ✅ Member referral tracking

**All features implemented. Configure SendGrid API key in `.env.local` to enable email notifications.**
