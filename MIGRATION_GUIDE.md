# Proclusive Database Migration Guide

This guide contains SQL commands to be executed manually in the Supabase Dashboard SQL Editor.

## Overview

These migrations add support for:
- **Portfolio functionality** - Allow members to upload 5+ portfolio images
- **Privacy settings** - Control profile visibility in the member directory
- **Tax compliance** - Store TIN/EIN and W-9 documents securely

## Prerequisites

- Access to your Supabase project dashboard
- Admin privileges to execute SQL commands
- Backup recommended before running migrations

---

## Migration Steps

### Step 1: Execute Schema Changes

Navigate to your Supabase Dashboard → SQL Editor and run the following commands **in order**:

#### 1.1 - Add New Document Type (Tax Compliance)

```sql
-- Add 'tax_compliance' to the document_type enum
-- This allows W-9 forms to be categorized properly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'tax_compliance'
        AND enumtypid = 'document_type'::regtype
    ) THEN
        ALTER TYPE document_type ADD VALUE 'tax_compliance';
    END IF;
END $$;
```

#### 1.2 - Add Columns to Profiles Table

```sql
-- Add privacy and tax compliance fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tin_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_public IS 'Profile visibility in member directory (default: public)';
COMMENT ON COLUMN profiles.tin_number IS 'Tax Identification Number (TIN/EIN) - sensitive data, should be encrypted';
```

#### 1.3 - Create Portfolio Items Table

```sql
-- Create table for portfolio images
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Portfolio details
  image_url TEXT NOT NULL, -- Supabase Storage path
  description TEXT,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_profile_id ON portfolio_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_display_order ON portfolio_items(profile_id, display_order);

-- Add comment
COMMENT ON TABLE portfolio_items IS 'Portfolio images showcasing member work (5+ required for verification)';
```

#### 1.4 - Add Updated At Trigger for Portfolio Items

```sql
-- Apply auto-update trigger to portfolio_items table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_portfolio_items_updated_at'
    ) THEN
        CREATE TRIGGER update_portfolio_items_updated_at
        BEFORE UPDATE ON portfolio_items
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

---

### Step 2: Configure Row Level Security (RLS)

#### 2.1 - Enable RLS on Portfolio Items

```sql
-- Enable Row Level Security
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
```

#### 2.2 - Add RLS Policies for Portfolio Items

```sql
-- Users can view their own portfolio items
CREATE POLICY "Users can view own portfolio"
  ON portfolio_items FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can insert their own portfolio items
CREATE POLICY "Users can insert own portfolio"
  ON portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own portfolio items
CREATE POLICY "Users can update own portfolio"
  ON portfolio_items FOR UPDATE
  USING (auth.uid() = profile_id);

-- Users can delete their own portfolio items
CREATE POLICY "Users can delete own portfolio"
  ON portfolio_items FOR DELETE
  USING (auth.uid() = profile_id);

-- Admins can view all portfolio items
CREATE POLICY "Admins can view all portfolios"
  ON portfolio_items FOR SELECT
  USING (is_admin());

-- Logged-in members can view public portfolios
CREATE POLICY "Members can view public portfolios"
  ON portfolio_items FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = portfolio_items.profile_id
      AND profiles.is_public = TRUE
      AND profiles.is_verified = TRUE
    )
  );
```

---

### Step 3: Configure Storage Buckets

#### 3.1 - Create Portfolio Storage Bucket

```sql
-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', false)
ON CONFLICT (id) DO NOTHING;
```

#### 3.2 - Add Storage Policies for Portfolio Bucket

```sql
-- Users can upload to their own portfolio folder
CREATE POLICY "Users can upload own portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own portfolio images
CREATE POLICY "Users can view own portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all portfolio images
CREATE POLICY "Admins can view all portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    is_admin()
  );

-- Logged-in members can view public portfolio images
CREATE POLICY "Members can view public portfolio images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'portfolio' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = (storage.foldername(name))[1]
      AND profiles.is_public = TRUE
      AND profiles.is_verified = TRUE
    )
  );

-- Users can delete their own portfolio images
CREATE POLICY "Users can delete own portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Verification Queries

After running all migrations, verify the changes with these queries:

### Check Profiles Table Columns

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('is_public', 'tin_number');
```

**Expected Output:**
- `is_public` | boolean | YES | true
- `tin_number` | text | YES | NULL

### Check Portfolio Items Table

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'portfolio_items'
) AS portfolio_table_exists;
```

**Expected Output:** `true`

### Check Portfolio Storage Bucket

```sql
SELECT id, name, public
FROM storage.buckets
WHERE id = 'portfolio';
```

**Expected Output:**
- id: `portfolio`
- name: `portfolio`
- public: `false`

### Check Document Type Enum

```sql
SELECT unnest(enum_range(NULL::document_type)) AS document_types;
```

**Expected Output:** Should include `tax_compliance` in the list

### Check RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'portfolio_items'
ORDER BY policyname;
```

**Expected Output:** Should show 6 policies for portfolio_items

---

## Rollback Instructions

If you need to rollback these changes:

```sql
-- WARNING: This will delete all portfolio data
-- Make sure you have a backup before running

-- Remove portfolio_items table
DROP TABLE IF EXISTS portfolio_items CASCADE;

-- Remove portfolio storage bucket
DELETE FROM storage.buckets WHERE id = 'portfolio';

-- Remove columns from profiles (optional - data will be lost)
ALTER TABLE profiles DROP COLUMN IF EXISTS is_public;
ALTER TABLE profiles DROP COLUMN IF EXISTS tin_number;

-- Note: Cannot easily remove enum value once added
-- The 'tax_compliance' value will remain in the document_type enum
-- This is safe and won't cause issues
```

---

## Migration Complete

After successfully running all SQL commands:

1. ✅ Profiles table updated with `is_public` and `tin_number`
2. ✅ Portfolio items table created with RLS policies
3. ✅ Portfolio storage bucket configured
4. ✅ Tax compliance document type added
5. ✅ All security policies in place

## Next Steps

1. **Test the vetting wizard** - Complete the full 5-step flow:
   - Step 1: Business Information (with TIN/EIN field)
   - Step 2: Portfolio (5+ images)
   - Step 3: Document Uploads (including W-9)
   - Step 4: Terms of Service
   - Step 5: Review & Submit
2. **Verify data storage** - Check that portfolio images and TIN are saved
3. **Test directory** - Ensure only public profiles are visible
4. **Admin review** - Confirm admins can see all data including W-9 and TIN

## Troubleshooting

### Common Issues

**Error: "permission denied for table portfolio_items"**
- Solution: Run the RLS policies section again

**Error: "relation storage.buckets does not exist"**
- Solution: Ensure you're running this in Supabase, not a local PostgreSQL

**Portfolio images not loading**
- Check: Storage bucket was created
- Check: RLS policies are applied
- Check: Signed URLs are being generated in the application

**TIN field validation errors**
- Expected format: XX-XXXXXXX (9 digits)
- The field accepts text but should be formatted by the application

---

## Support

If you encounter issues:
1. Check the Supabase Dashboard → Logs for detailed error messages
2. Verify all SQL commands ran successfully
3. Check browser console for client-side errors
4. Review RLS policies in Dashboard → Authentication → Policies

---

**Migration Date:** 2025-12-14
**Version:** 1.1 - Portfolio, Privacy & Tax Compliance
**Status:** Ready for Manual Execution
