# Deploying Doodlegram to Production

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password (save it somewhere safe)
4. Wait for the project to finish provisioning (~2 minutes)

## 2. Run the Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Paste the contents of `supabase/migrations/20260212000000_initial_schema.sql`:

```sql
-- Diagrams table
create table diagrams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'general',
  prompt text not null,
  mermaid_syntax text,
  excalidraw_json jsonb not null,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast user lookups
create index idx_diagrams_user_id on diagrams(user_id);
create index idx_diagrams_created_at on diagrams(created_at desc);

-- RLS policies
alter table diagrams enable row level security;

create policy "Users can view own diagrams"
  on diagrams for select using (auth.uid() = user_id);

create policy "Users can insert own diagrams"
  on diagrams for insert with check (auth.uid() = user_id);

create policy "Users can update own diagrams"
  on diagrams for update using (auth.uid() = user_id);

create policy "Users can delete own diagrams"
  on diagrams for delete using (auth.uid() = user_id);

-- Create storage bucket for diagram exports and AI images
insert into storage.buckets (id, name, public)
values ('diagrams', 'diagrams', true);

-- Storage policies
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'diagrams'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view diagram images"
  on storage.objects for select
  using (bucket_id = 'diagrams');

create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'diagrams'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

3. Click **Run** to execute

## 3. Configure Supabase Auth

1. Go to **Authentication** > **Providers** > **Email**
2. Make sure **Enable Email provider** is ON
3. Set **Confirm Email** to OFF (for instant signup without email verification)
4. Go to **URL Configuration**:
   - Set **Site URL** to your production domain (e.g. `https://doodlegram.app`)
   - Add your domain to **Redirect URLs** (e.g. `https://doodlegram.app/**`)

## 4. Get Your Supabase Credentials

1. Go to **Settings** > **API**
2. Copy:
   - **Project URL** → this is your `SUPABASE_URL`
   - **anon / public** key → this is your `SUPABASE_KEY`

## 5. Get API Keys

### Anthropic (Claude)
1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create a new API key
3. This is your `ANTHROPIC_API_KEY`

### fal.ai
1. Go to [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
2. Create a new API key
3. This is your `FAL_KEY`

## 6. Deploy to Vercel

### Option A: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — will create the project)
vercel

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add FAL_KEY
vercel env add NUXT_PUBLIC_APP_URL  # set to https://your-domain.com

# Deploy to production
vercel --prod
```

### Option B: Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `Rmalnoult/doodlegram` GitHub repo
3. Framework Preset: **Nuxt.js**
4. Add environment variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIs...` (anon key) |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` |
| `FAL_KEY` | `your-fal-key` |
| `NUXT_PUBLIC_APP_URL` | `https://your-domain.com` |

5. Click **Deploy**

### Custom Domain

After deploying:
1. Go to your Vercel project **Settings** > **Domains**
2. Add your domain (e.g. `doodlegram.app`)
3. Configure DNS as instructed by Vercel
4. Update `NUXT_PUBLIC_APP_URL` to match
5. Update Supabase **Site URL** and **Redirect URLs** to match

## 7. Alternative: Deploy via Supabase CLI (Optional)

If you prefer to use `supabase link` to push migrations directly instead of the SQL Editor:

```bash
# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to production
supabase db push
```

You can find your project ref in the Supabase Dashboard URL:
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

## Environment Variable Summary

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `SUPABASE_URL` | Yes | Public | Supabase project URL |
| `SUPABASE_KEY` | Yes | Public | Supabase anon/public key |
| `ANTHROPIC_API_KEY` | Yes | Server | Claude API key for diagram generation |
| `FAL_KEY` | Yes | Server | fal.ai key for AI illustration generation |
| `NUXT_PUBLIC_APP_URL` | No | Public | Production URL for canonical/OG tags |

## Verify

After deploying:
1. Visit your production URL
2. Sign up with email/password (should be instant, no email confirmation)
3. Create a diagram — verify Claude agent streams elements
4. Save it — verify it appears on dashboard
5. Export as PNG — verify download works
