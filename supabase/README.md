# Supabase Shared Votes Setup (Phase 2 & 3)

This directory contains the database migration and Row-Level Security (RLS) policies for Football Sorter's community voting system.

## Setup Instructions

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/) and create a new project.
2. Choose your preferred region and database password.

### 2. Run Database Migration
1. In the Supabase Dashboard, navigate to **SQL Editor**.
2. Open [`supabase/schema.sql`](./schema.sql) and paste the entire script.
3. Click **Run**.
   - This creates the `votes` table.
   - Sets up performance indices.
   - Enforces the 30-votes-per-minute rate limit trigger (`trg_check_vote_rate_limit`).
   - Configures Row-Level Security (RLS) allowing anonymous users to INSERT, blocking all UPDATE/DELETE, and protecting other users' session IDs.
   - Creates the `community_votes` view.

### 3. Configure Frontend Environment Variables
1. Go to **Project Settings > API** in your Supabase Dashboard.
2. Copy the **Project URL** and the **anon public API key**.
3. Create a `.env.local` file in the repository root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. For GitHub Pages builds, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets or variables under **Settings > Secrets and variables > Actions**.

### 4. Offline & Retry Resilience
- The client-side sync queue in `src/lib/syncQueue.ts` automatically saves votes to `localStorage` first.
- When online, it sends them in idempotent batches to Supabase with client-generated UUIDs (`onConflict: 'id', ignoreDuplicates: true`), ensuring zero duplicate entries on retries.
- If the browser goes offline, votes remain queued and automatically flush when connectivity is restored.
