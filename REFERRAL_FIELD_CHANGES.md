# "Who Referred You" Field Implementation

## Summary
Added a required "Who Referred You?" text input field to the vetting process in Step 1 (Business Information). This field captures the name of the Proclusive member who referred the applicant.

## Changes Made

### 1. Type Definitions

#### `/src/components/vetting/VettingWizard.tsx`
- Added `referred_by: string` to the `BusinessInfoData` interface

#### `/src/types/database.types.ts`
- Added `referred_by: string | null` to the `Profile` interface

### 2. Form Component

#### `/src/components/vetting/Step1BusinessInfo.tsx`
**Added:**
- `referred_by` to the `ValidationErrors` interface
- `referred_by: ""` to initial form data state
- Validation logic requiring the field to be filled
- New "Referral Information" card section positioned ABOVE "Member Profile Visibility" section
- Text input field with:
  - Label: "Who Referred You?"
  - Placeholder: "Enter the name of the Proclusive member who referred you"
  - Helper text: "Enter the name of the Proclusive member who referred you"
  - Required field validation
  - Error display

**Field Location:**
The field appears between "Tax Compliance" and "Member Profile Visibility" sections.

### 3. Data Flow

#### `/src/components/vetting/VettingWizard.tsx`
**Updated:**
- Added `referred_by` field to profile data loading (both edit mode and resume mode)
- Field is saved to the database along with other profile data

### 4. Review Page

#### `/src/components/vetting/Step4Review.tsx`
**Added:**
- Display of "Referred By" field in the review section
- Shows the referrer's name if provided
- Positioned in the business information section

### 5. Admin Dashboard

#### `/src/components/admin/ApplicationDetail.tsx`
**Added:**
- "Referred By" field display in the Profile Information card
- Shows the referrer's name or "N/A" if not provided
- Admin can view who referred each applicant

### 6. Database Migration

#### `/supabase/migrations/20250119000000_add_referred_by.sql`
**Created:**
- New migration file to add `referred_by` column to the `profiles` table
- Column type: TEXT (nullable)
- Includes a comment explaining the field's purpose

## Field Characteristics

1. **Required Field**: Users must fill this field to proceed
2. **Data Type**: Free text input (string)
3. **Saved**: Stored in the profiles table
4. **Visibility**:
   - ✅ Shows on vetting review page (Step 4)
   - ✅ Shows in admin dashboard when viewing applications
   - ❌ Does NOT appear on member's public profile
5. **Validation**: Field must not be empty

## How to Deploy

1. Run the database migration:
   ```bash
   supabase db push
   ```
   Or if using Supabase CLI locally:
   ```bash
   supabase migration up
   ```

2. The frontend changes are already in place and will work once the database migration is applied.

## Testing Checklist

- [ ] Field appears in Step 1 of vetting process
- [ ] Field is positioned above "Member Profile Visibility" section
- [ ] Validation error shows if field is left empty
- [ ] Data is saved when moving to next step
- [ ] Field value appears on review page (Step 4)
- [ ] Field value persists if user leaves and returns to vetting
- [ ] Admin can see "Referred By" value in application detail view
- [ ] Field does NOT appear on public member profiles
- [ ] Existing applications without this field show "N/A" in admin view
