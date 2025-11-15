# Quick Start Guide - Fix Runtime Error

## The Error You're Seeing

If you see: **"Error: supabaseUrl is required"**

This means your Supabase environment variables are not configured.

## Quick Fix (3 Steps)

### Step 1: Create `.env.local` file

In your project root directory (`hakathon`), create a file named `.env.local` with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key-here
```

### Step 2: Get Your Supabase Credentials

1. Go to https://app.supabase.com
2. Sign in or create an account
3. Create a new project (or use existing)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## If You Don't Have Supabase Yet

### Option A: Set Up Supabase (Recommended)

1. Visit https://app.supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created (~2 minutes)
5. Get your credentials from Settings → API
6. Add them to `.env.local`

### Option B: Use Mock Mode (For Testing UI Only)

If you just want to test the UI without Supabase, you can temporarily modify the client to use a mock:

```typescript
// lib/supabase/client.ts - TEMPORARY MOCK
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Not configured' } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ data: [], error: null }) }),
    insert: () => ({ data: null, error: { message: 'Not configured' } }),
  }),
} as any;
```

**Note:** This is only for UI testing. Real features won't work.

## Verify It's Working

After adding `.env.local` and restarting:

1. Check the browser console - you should NOT see the supabaseUrl error
2. The app should load without errors
3. You can navigate to pages (though features won't work until you run the database schema)

## Next Steps

Once the error is fixed:

1. Run the database schema from `DATABASE_SCHEMA.sql` in Supabase SQL Editor
2. Test the features
3. See `INTEGRATION_NOTES.md` for detailed setup

## Still Having Issues?

1. **Check file location**: `.env.local` must be in the project root (same folder as `package.json`)
2. **Check file name**: Must be exactly `.env.local` (not `.env.local.txt`)
3. **Restart server**: Environment variables only load on server start
4. **Check values**: Make sure there are no extra spaces or quotes in your `.env.local` file

