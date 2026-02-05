# Supabase Authentication Plan

This guide walks you through adding Apple Sign-In authentication to Memo using Supabase.

**When done, delete this file:** `rm SUPABASE_AUTH_PLAN.md`

---

## Table of Contents

### Phase 1: Authentication
1. [Part A: Supabase Project Setup](#part-a-supabase-project-setup)
2. [Part B: Apple Developer Setup](#part-b-apple-developer-setup)
3. [Part C: Connect Apple to Supabase](#part-c-connect-apple-to-supabase)
4. [Part D: Code Implementation](#part-d-code-implementation)
5. [Part E: Testing](#part-e-testing)

### Phase 2: Data Sync
6. [Part F: Create Data Tables](#part-f-create-data-tables)
7. [Part G: Sync Service Implementation](#part-g-sync-service-implementation)
8. [Part H: Sync Strategy](#part-h-sync-strategy)
9. [Part I: Code Implementation (Phase 2)](#part-i-code-implementation-phase-2)
10. [Part J: Testing (Phase 2)](#part-j-testing-phase-2)

---

## Part A: Supabase Project Setup

### Step A1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (top right)
3. Sign up with GitHub (recommended) or email

### Step A2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in:
   - **Name**: `memo` (or whatever you like)
   - **Database Password**: Generate a strong one and **save it somewhere safe**
   - **Region**: Choose the closest to you (e.g., `West US` for California)
3. Click **"Create new project"**
4. Wait 1-2 minutes for the project to provision

### Step A3: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon in sidebar)
2. Click **API** under "Project Settings"
3. You'll see two important values:
   - **Project URL**: Something like `https://abcdefg.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

4. Open your `.env` file in the Memo project and update:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step A4: Create the Database Tables

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Copy and paste this entire SQL block:

```sql
-- =====================================================
-- PROFILES TABLE
-- This stores user profile info linked to auth.users
-- =====================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  push_token TEXT,
  timezone TEXT DEFAULT 'UTC',
  notification_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (keeps users' data private)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- AUTO-CREATE PROFILE TRIGGER
-- When a user signs up, automatically create their profile
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATED_AT TRIGGER
-- Automatically updates the updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

4. Click **"Run"** (or press Cmd+Enter)
5. You should see "Success. No rows returned" - that's good!

### Step A5: Verify Tables Created

1. Click **Table Editor** in the sidebar
2. You should see a `profiles` table listed
3. Click on it - it should be empty (no rows yet)

---

## Part B: Apple Developer Setup

> **Prerequisites**: You need an Apple Developer account ($99/year). If you don't have one, you'll need to sign up at [developer.apple.com](https://developer.apple.com).

### Step B1: Enable Sign in with Apple for Your App

1. Go to [developer.apple.com](https://developer.apple.com)
2. Click **"Account"** and sign in
3. Go to **Certificates, Identifiers & Profiles**
4. Click **Identifiers** in the sidebar
5. Find your app's identifier (e.g., `com.yourname.memo`) or create one if needed
6. Click on it to edit
7. Scroll down to **Capabilities** and check **"Sign In with Apple"**
8. Click **Save**

### Step B2: Create a Services ID (for Supabase)

Supabase needs a "Services ID" to handle the OAuth callback.

1. Still in **Identifiers**, click the **+** button to create a new identifier
2. Select **"Services IDs"** and click **Continue**
3. Fill in:
   - **Description**: `Memo Auth Service`
   - **Identifier**: `com.yourname.memo.auth` (add `.auth` to your bundle ID)
4. Click **Continue**, then **Register**

### Step B3: Configure the Services ID

1. Click on the Services ID you just created
2. Check **"Sign In with Apple"**
3. Click **Configure** next to it
4. In the dialog:
   - **Primary App ID**: Select your main app (e.g., `com.yourname.memo`)
   - **Domains**: Add your Supabase project domain:
     - `your-project-id.supabase.co` (without https://)
   - **Return URLs**: Add Supabase callback URL:
     - `https://your-project-id.supabase.co/auth/v1/callback`
5. Click **Next**, then **Done**
6. Click **Continue**, then **Save**

### Step B4: Create a Sign in with Apple Key

1. Go to **Keys** in the sidebar
2. Click the **+** button to create a new key
3. Fill in:
   - **Key Name**: `Memo Sign In Key`
4. Check **"Sign in with Apple"**
5. Click **Configure** next to it
6. Select your **Primary App ID** and click **Save**
7. Click **Continue**, then **Register**
8. **IMPORTANT**: Click **Download** to get the `.p8` file
   - You can only download this ONCE - save it somewhere safe!
   - Note the **Key ID** shown on the page

### Step B5: Find Your Team ID

1. Go back to your Apple Developer account page
2. In the top right, you'll see your **Team ID** (a 10-character string like `ABC1234DEF`)
3. Write this down

---

## Part C: Connect Apple to Supabase

### Step C1: Configure Apple Provider

1. Go to your Supabase dashboard
2. Click **Authentication** in the sidebar
3. Click **Providers**
4. Find **Apple** and click to expand it
5. Toggle **"Enable Sign in with Apple"** ON
6. Fill in the fields:

| Field | Value |
|-------|-------|
| **Services ID** | `com.yourname.memo.auth` (the Services ID from Step B2) |
| **Team ID** | Your 10-character Team ID from Step B5 |
| **Key ID** | The Key ID from Step B4 |
| **Private Key** | Open the `.p8` file in a text editor, copy the ENTIRE contents including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines |

7. Click **Save**

### Step C2: Test the Configuration

1. In Supabase Authentication settings, you can try the "Test" button if available
2. Or just proceed to implementation - we'll test with the real app

---

## Part D: Code Implementation

We'll build this step by step. Ask Claude to help you with each step.

### Step D1: Auth Store

Create `src/stores/authStore.ts` - manages authentication state.

**What it does:**
- Stores the current user session
- Tracks loading and initialization states
- Provides sign-out functionality

### Step D2: Auth Service

Create `src/services/authService.ts` - handles Apple Sign-In logic.

**What it does:**
- Presents the native Apple Sign-In modal
- Exchanges Apple credentials with Supabase
- Handles errors gracefully

### Step D3: Auth Layout

Create `app/(auth)/_layout.tsx` - layout for auth screens.

**What it does:**
- Wraps the login screen
- Configures navigation options

### Step D4: Login Screen

Create `app/(auth)/login.tsx` - the login UI.

**What it does:**
- Shows app branding
- Displays "Sign in with Apple" button
- Shows errors if sign-in fails

### Step D5: Update Root Layout

Modify `app/_layout.tsx` - add auth checking.

**What it does:**
- Checks for existing session on app launch
- Shows login if not authenticated
- Shows main app if authenticated

---

## Part E: Testing

### Test 1: Fresh Launch
- [ ] App shows login screen
- [ ] "Sign in with Apple" button is visible

### Test 2: Sign In
- [ ] Tap button → Apple modal appears
- [ ] Complete sign-in → App shows main tabs
- [ ] Check Supabase dashboard → New user in Authentication → Users
- [ ] Check Supabase dashboard → New row in profiles table

### Test 3: Session Persistence
- [ ] Close app completely (swipe up from app switcher)
- [ ] Reopen app → Should go directly to main tabs (not login)

### Test 4: Sign Out
- [ ] Find sign out button (in settings)
- [ ] Tap it → Should return to login screen

### Test 5: Sign Back In
- [ ] Sign in again → Should work
- [ ] Previous data should still be there (local data)

---

## Troubleshooting

### "Apple Sign-In is not available"
- Make sure you're testing on a real iOS device or iOS Simulator
- Sign in with Apple doesn't work on Android or web

### "Invalid token" error
- Double-check your Services ID matches in both Apple and Supabase
- Verify the private key was copied completely (including BEGIN/END lines)

### Profile not created after sign-in
- Check SQL Editor → verify the trigger exists
- Look at Supabase logs for errors

---

## When You're Done

Delete this file:
```bash
rm SUPABASE_AUTH_PLAN.md
```

---

## Files That Will Be Created/Modified

**New files:**
- `src/stores/authStore.ts`
- `src/stores/authStore.test.ts`
- `src/services/authService.ts`
- `src/services/authService.test.ts`
- `app/(auth)/_layout.tsx`
- `app/(auth)/login.tsx`

**Modified files:**
- `app/_layout.tsx`
- `.env` (your Supabase credentials)

---

# Phase 2: Data Sync (Storage)

After authentication is working, we'll sync your local data to Supabase.

---

## Overview

**Current state:** Your app stores friends and journal entries locally in AsyncStorage.

**Goal:** Sync this data to Supabase so it's:
- Backed up in the cloud
- Available if you reinstall the app
- (Future) Shareable across devices

---

## Part F: Create Data Tables

### Step F1: Create Contacts Table

Run this SQL in Supabase SQL Editor:

```sql
-- =====================================================
-- CONTACTS TABLE (Friends)
-- =====================================================

CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  birthday TEXT,  -- Stored as 'YYYY-MM-DD' or 'MM-DD'
  notes TEXT,
  frequency_days INTEGER DEFAULT 30,
  last_contact_at TEXT,  -- Stored as 'YYYY-MM-DD'
  category TEXT DEFAULT 'friend',  -- 'friend', 'family', 'work', 'partner', 'flirt'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX contacts_user_id_idx ON public.contacts(user_id);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own contacts
CREATE POLICY "Users can CRUD own contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### Step F2: Create Journals Table

```sql
-- =====================================================
-- JOURNALS TABLE
-- =====================================================

CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,  -- Stored as 'YYYY-MM-DD'
  content TEXT,
  mood TEXT,  -- Future: track daily mood
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- Index for faster queries
CREATE INDEX journals_user_id_idx ON public.journals(user_id);
CREATE INDEX journals_date_idx ON public.journals(date);

-- Enable RLS
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Users can only access their own journals
CREATE POLICY "Users can CRUD own journals"
  ON public.journals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### Step F3: Create Catch-Ups Table (Optional)

```sql
-- =====================================================
-- CATCH_UPS TABLE (Track interactions with friends)
-- =====================================================

CREATE TABLE public.catch_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  notes TEXT,
  type TEXT DEFAULT 'general',  -- 'call', 'text', 'in-person', 'general'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX catch_ups_user_id_idx ON public.catch_ups(user_id);
CREATE INDEX catch_ups_contact_id_idx ON public.catch_ups(contact_id);

-- Enable RLS
ALTER TABLE public.catch_ups ENABLE ROW LEVEL SECURITY;

-- Users can only access their own catch-ups
CREATE POLICY "Users can CRUD own catch-ups"
  ON public.catch_ups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Step F4: Verify Tables

1. Go to **Table Editor** in Supabase
2. You should see: `profiles`, `contacts`, `journals`, `catch_ups`
3. All should be empty

---

## Part G: Sync Service Implementation

### Step G1: Create Friends Sync Service

Create `src/services/friendsSyncService.ts`

**What it does:**
- Fetch friends from Supabase on login
- Push local changes to Supabase
- Handle create, update, delete operations
- Deal with offline scenarios

### Step G2: Create Journal Sync Service

Create `src/services/journalSyncService.ts`

**What it does:**
- Fetch journal entries from Supabase
- Push new/edited entries to Supabase
- Handle date-based lookups

### Step G3: Update Stores

Modify existing stores to sync with Supabase:
- `src/stores/friendsStore.ts` - Add sync methods
- `src/stores/journalStore.ts` - Add sync methods

---

## Part H: Sync Strategy

### How It Works

1. **On Login:**
   - Fetch all data from Supabase
   - Merge with any local data
   - Update local store

2. **On Create/Update/Delete:**
   - Update local store immediately (instant UI feedback)
   - Push change to Supabase in background
   - If offline, queue for later sync

3. **On App Launch (Already Logged In):**
   - Load from local storage first (fast)
   - Fetch latest from Supabase (in background)
   - Merge any differences

### Conflict Resolution

If the same item is edited both locally and remotely:
- **Simple approach**: Most recent edit wins (based on `updated_at`)
- **Safe approach**: Keep both versions, let user choose

We'll start with the simple approach.

---

## Part I: Code Implementation (Phase 2)

### Step I1: Friends Sync Service

Create `src/services/friendsSyncService.ts`

```typescript
// Functions to implement:
// - fetchFriends() - Get all friends from Supabase
// - createFriend(friend) - Add friend to Supabase
// - updateFriend(id, updates) - Update friend in Supabase
// - deleteFriend(id) - Delete friend from Supabase
// - syncFriends() - Full sync (merge local + remote)
```

### Step I2: Journal Sync Service

Create `src/services/journalSyncService.ts`

```typescript
// Functions to implement:
// - fetchJournals() - Get all journals from Supabase
// - upsertJournal(entry) - Create or update journal entry
// - deleteJournal(id) - Delete journal entry
// - syncJournals() - Full sync
```

### Step I3: Update Friends Store

Modify `src/stores/friendsStore.ts`:
- Call sync service on mutations
- Add `syncWithServer()` action
- Handle loading states for sync

### Step I4: Update Journal Store

Modify `src/stores/journalStore.ts`:
- Call sync service on mutations
- Add `syncWithServer()` action

### Step I5: Initial Data Migration

On first login, migrate local data to Supabase:
- Check if user has no remote data
- If so, push all local data to Supabase
- Mark migration as complete

---

## Part J: Testing (Phase 2)

### Test 1: Fresh User
- [ ] New user signs up
- [ ] Creates a friend → Shows in Supabase `contacts` table
- [ ] Creates journal entry → Shows in Supabase `journals` table

### Test 2: Existing User with Local Data
- [ ] User with local friends signs in
- [ ] Local friends are pushed to Supabase
- [ ] Data appears in Supabase dashboard

### Test 3: Data Persistence
- [ ] Create friend on phone
- [ ] Delete app and reinstall
- [ ] Sign in → Friends are restored from Supabase

### Test 4: Offline Support
- [ ] Turn off WiFi
- [ ] Create/edit friend → Works locally
- [ ] Turn WiFi back on → Data syncs to Supabase

---

## Files for Phase 2

**New files:**
- `src/services/friendsSyncService.ts`
- `src/services/friendsSyncService.test.ts`
- `src/services/journalSyncService.ts`
- `src/services/journalSyncService.test.ts`

**Modified files:**
- `src/stores/friendsStore.ts`
- `src/stores/journalStore.ts`

---

## Important Notes for Phase 2

### ID Migration

Your local friends have IDs like `1704067200000-abc123`.
Supabase uses UUIDs like `550e8400-e29b-41d4-a716-446655440000`.

**Strategy:**
- Keep a mapping: `{ localId: supabaseId }`
- Or: Generate new UUIDs when pushing to Supabase
- Store the Supabase ID in local storage after sync

### Photo URLs

If you add friend photos:
- Use Supabase Storage for images
- Store the URL in `photo_url` field
- That's a Phase 3 enhancement

---

## Summary

| Phase | What | Status |
|-------|------|--------|
| Phase 1 | Authentication (Apple Sign-In) | Start here |
| Phase 2 | Data Sync (Friends + Journals) | After Phase 1 works |
| Phase 3 | Image Storage (Friend photos) | Future |

---

**When done with everything, delete this file:**
```bash
rm SUPABASE_AUTH_PLAN.md
```
