# Proclusive - Quick Start Guide

Get Proclusive running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd proclusive
npm install
```

## Step 2: Set Up Supabase (2 min)

### Create Project
1. Go to https://supabase.com and create a new project
2. Wait for the project to finish provisioning (~2 minutes)

### Run Migrations
1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
4. Click "Run"
5. Repeat for `supabase/migrations/20250101000001_rls_policies.sql`

### Get Credentials
1. Go to Project Settings → API
2. Copy "Project URL" (e.g., `https://xxxxx.supabase.co`)
3. Copy "anon/public" key (the public one)

## Step 3: Configure Environment (30 seconds)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Start Dev Server (30 seconds)

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Test the Workflow (2 min)

### Create First User
1. Click "Apply to Join"
2. Sign up with your email and password
3. Complete the vetting wizard:
   - Fill in business information
   - Upload 5 test documents (any PDF or image)
   - Accept Terms of Service
   - Submit application

### Make Yourself Admin
1. Go to http://localhost:3000/setup-admin
2. Enter your email
3. Click "Grant Admin Privileges"

### Review Application
1. Logout and login again
2. You'll be redirected to `/admin/dashboard`
3. Click "Review" on your application
4. Preview documents
5. Click "Verify" on each of the 5 points
6. Select a badge level (e.g., "Compliance")
7. Click "Approve & Assign Badge"

### Done!
You've successfully tested the complete Phase 1 workflow! 🎉

## Troubleshooting

### Build Errors
If you see Tailwind/PostCSS errors:
```bash
npm install @tailwindcss/postcss
```

### Database Errors
Make sure you ran BOTH migration files in order:
1. `20250101000000_initial_schema.sql` (creates tables)
2. `20250101000001_rls_policies.sql` (sets up security)

### Auth Errors
- Make sure your `.env.local` has the correct Supabase URL and anon key
- Restart the dev server after changing `.env.local`

### Storage Errors
The storage bucket is created automatically by the RLS migration. If documents won't upload:
1. Go to Supabase Storage
2. Check that "documents" bucket exists
3. Verify it's set to "Private" (not public)

## What's Next?

Now that Phase 1 is working, you can:

1. **Deploy to Vercel** - Push to GitHub and deploy
2. **Add Real Data** - Use the admin panel to vet real applications
3. **Move to Phase 2** - Build the referral exchange system

See `README.md` for full documentation.
See `PHASE1_COMPLETE.md` for the complete feature checklist.

---

**Need help?** Check the main README.md or review the context files in `/context`
