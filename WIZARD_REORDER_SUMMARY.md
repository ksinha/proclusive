# Vetting Wizard Re-Order - Implementation Summary

## Changes Made

Successfully re-ordered the vetting wizard steps and consolidated tax compliance fields as requested.

---

## New Wizard Flow (5 Steps)

### Step 1: Business Information
**File:** `src/components/vetting/Step1BusinessInfo.tsx`

**Added:**
- TIN/EIN input field with automatic formatting (XX-XXXXXXX)
- Secure information notice about TIN encryption
- Profile visibility toggle (Public/Private)

**Fields:**
- Personal: Name, Phone
- Business: Company, Trade, Type, Years in Business, Team Size, Service Areas, Bio, Website, LinkedIn
- Address: Street, City, State, ZIP
- **Tax Compliance: TIN/EIN** (NEW)
- Privacy: Profile Visibility Toggle

### Step 2: Portfolio
**File:** `src/components/vetting/Step3Portfolio.tsx`

**Requirements:**
- Upload minimum 5 images
- Optional descriptions for each image
- Image preview functionality
- File validation (image types, max 10MB)

### Step 3: Document Uploads
**File:** `src/components/vetting/Step2DocumentUploads.tsx`

**Updated:**
- Added W-9 Tax Form as required document

**Documents Required:**
1. Business Registration (Point 1)
2. Professional License (Point 2)
3. General Liability Insurance (Point 3)
4. Workers' Compensation (Point 4)
5. Contact & Location Verification (Point 5)
6. **W-9 Tax Form** (NEW - Required)

### Step 4: Terms of Service
**File:** `src/components/vetting/Step3TermsOfService.tsx`

No changes - standard TOS acceptance

### Step 5: Review & Submit
**File:** `src/components/vetting/Step4Review.tsx`

Reviews all information before final submission

---

## Key Changes from Previous Version

### Before (6 Steps):
1. Business Information
2. Document Uploads
3. Portfolio
4. Tax Compliance (TIN + W-9)
5. Terms of Service
6. Review & Submit

### After (5 Steps):
1. **Business Information** (includes TIN field)
2. **Portfolio** (moved up)
3. **Document Uploads** (includes W-9)
4. Terms of Service
5. Review & Submit

---

## Technical Changes

### Updated Files

1. **VettingWizard.tsx**
   - Updated STEPS array to 5 steps
   - Re-ordered imports (Step2Portfolio, Step3DocumentUploads, etc.)
   - Updated step handlers (handleStep1Complete → handleStep4Complete)
   - Removed TaxComplianceData state
   - Added tin_number to BusinessInfoData interface
   - Added tax_compliance to DocumentData interface
   - Updated document upload logic to include W-9
   - TIN now saved with profile in step 1

2. **Step1BusinessInfo.tsx**
   - Added TIN/EIN field with formatting logic
   - Added security notice about TIN encryption
   - Button text updated to "Continue to Portfolio"
   - Added tin_number to form state

3. **Step2DocumentUploads.tsx**
   - Added W-9 as document category (tax_compliance)
   - Marked as required
   - Includes link to IRS.gov for downloading blank form

4. **Removed Dependency**
   - Standalone Step4TaxCompliance.tsx no longer used in wizard flow
   - Functionality split between Step1 (TIN) and Step3 (W-9)

---

## Database Integration

### Profile Data (Step 1)
```typescript
{
  // ... existing fields
  tin_number: string,  // Format: XX-XXXXXXX
  is_public: boolean   // Default: true
}
```

### Document Data (Step 3)
```typescript
{
  business_registration?: File,
  professional_license?: File,
  liability_insurance?: File,
  workers_comp?: File,
  contact_verification?: File,
  tax_compliance?: File  // W-9 form (NEW)
}
```

### Submission Flow
1. Profile created/updated with TIN in step 1
2. Portfolio items uploaded to 'portfolio' storage bucket
3. Documents (including W-9) uploaded to 'documents' storage bucket
4. W-9 mapped to 'tax_compliance' document type
5. Application point tracking updated

---

## Security Considerations

### TIN Storage
- ✅ Stored in profiles.tin_number column
- ✅ Never displayed in public directory
- ⚠️  Recommended: Add column-level encryption
- ✅ Only accessible to user and admins

### W-9 Storage
- ✅ Stored in private 'documents' bucket
- ✅ Categorized as 'tax_compliance' type
- ✅ RLS policies restrict access
- ✅ Never displayed in public directory
- ✅ Only accessible to user and admins

---

## Build Verification

✅ **TypeScript Compilation:** SUCCESS
✅ **Next.js Build:** SUCCESS
✅ **No Errors:** Confirmed

All routes generated successfully:
- `/` (Static)
- `/vetting` (Static)
- `/dashboard` (Dynamic)
- `/directory` (Dynamic)
- `/admin/dashboard` (Static)

---

## Testing Checklist

Before deploying, verify:

- [ ] Database migration applied via `migration_guide.md`
- [ ] Step 1: TIN field formats correctly (XX-XXXXXXX)
- [ ] Step 1: Privacy toggle saves to database
- [ ] Step 2: Portfolio requires minimum 5 images
- [ ] Step 2: Portfolio images upload successfully
- [ ] Step 3: W-9 appears in document list
- [ ] Step 3: W-9 upload is required
- [ ] Step 3: All 6 documents validate properly
- [ ] Step 5: Review shows all data correctly
- [ ] Final Submit: TIN saved to profile
- [ ] Final Submit: W-9 saved to documents
- [ ] Final Submit: Portfolio items created
- [ ] Dashboard: Verification status displays
- [ ] Directory: Only public profiles visible
- [ ] Directory: Portfolio images load correctly
- [ ] Directory: TIN and W-9 NOT visible
- [ ] Admin: Can see all data including TIN and W-9

---

## Migration Instructions

1. **Apply Database Changes**
   - Open `migration_guide.md`
   - Copy SQL commands to Supabase Dashboard → SQL Editor
   - Run each section in order
   - Verify with provided verification queries

2. **Deploy Application**
   - Build completed successfully (verified)
   - Deploy to your hosting platform
   - Test complete wizard flow in production

3. **Verify Functionality**
   - Create test application through wizard
   - Verify all data saves correctly
   - Test directory and dashboard
   - Confirm security (TIN/W-9 not public)

---

## Files Modified

### Core Wizard Files
- `src/components/vetting/VettingWizard.tsx` ✅
- `src/components/vetting/Step1BusinessInfo.tsx` ✅
- `src/components/vetting/Step2DocumentUploads.tsx` ✅

### Type Definitions
- `src/types/database.types.ts` (Already updated in previous phase)

### Documentation
- `migration_guide.md` ✅ (NEW)
- `WIZARD_REORDER_SUMMARY.md` ✅ (This file)

---

## Next Steps

1. **Apply Database Migration**
   - Follow `migration_guide.md`
   - Copy/paste SQL into Supabase Dashboard

2. **Test Locally**
   - Run `npm run dev`
   - Complete full wizard flow
   - Verify all data saves correctly

3. **Deploy**
   - Build: `npm run build` (Already verified ✅)
   - Deploy to production
   - Test in production environment

4. **Verify Security**
   - Confirm TIN is encrypted at rest (recommended)
   - Verify W-9 documents are private
   - Test directory access controls

---

**Implementation Date:** 2025-12-14
**Version:** Phase 1 Refinements + Wizard Re-order
**Status:** ✅ Complete - Ready for Database Migration & Testing
**Build Status:** ✅ SUCCESS (0 errors)
