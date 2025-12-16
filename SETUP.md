# Detailed Setup Guide

This guide will walk you through setting up the Smart Campus Lost & Found System from scratch.

## Prerequisites

Before you begin, make sure you have:
- Node.js version 18 or higher
- npm or yarn package manager
- A web browser
- A Supabase account (free)

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in with GitHub
4. Click "New Project"
5. Fill in the details:
   - **Name**: campus-lost-found (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Plan**: Free tier is sufficient
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

### 2. Get Your Supabase Credentials

1. Once the project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** section
3. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
4. Keep this page open, you'll need these values

### 3. Clone and Install

```bash
git clone <your-repository-url>
cd smart-campus-lost-found
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
touch .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase URL and key.

### 5. Set Up the Database

You need to run the database migrations. There are two ways:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New query**
4. Copy the entire contents of the migration file (see below)
5. Click **Run** to execute
6. Wait for "Success" message

**Migration SQL to Copy:**

```sql
-- Run this entire script in the Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  location_lost text NOT NULL,
  date_lost date NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create found_items table
CREATE TABLE IF NOT EXISTS found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  location_found text NOT NULL,
  date_found date NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id uuid NOT NULL REFERENCES found_items(id) ON DELETE CASCADE,
  match_score integer NOT NULL DEFAULT 0,
  match_reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(lost_item_id, found_item_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  related_item_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);
CREATE INDEX IF NOT EXISTS idx_found_items_user_id ON found_items(user_id);
CREATE INDEX IF NOT EXISTS idx_found_items_category ON found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON found_items(status);
CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item ON matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Lost items policies
CREATE POLICY "Anyone can view lost items" ON lost_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own lost items" ON lost_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lost items" ON lost_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lost items" ON lost_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Found items policies
CREATE POLICY "Anyone can view found items" ON found_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own found items" ON found_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own found items" ON found_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own found items" ON found_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view matches for their items" ON matches FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lost_items WHERE lost_items.id = matches.lost_item_id AND lost_items.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM found_items WHERE found_items.id = matches.found_item_id AND found_items.user_id = auth.uid())
  );
CREATE POLICY "System can insert matches" ON matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update matches for their items" ON matches FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM lost_items WHERE lost_items.id = matches.lost_item_id AND lost_items.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM found_items WHERE found_items.id = matches.found_item_id AND found_items.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM lost_items WHERE lost_items.id = matches.lost_item_id AND lost_items.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM found_items WHERE found_items.id = matches.found_item_id AND found_items.user_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lost_items_updated_at ON lost_items;
CREATE TRIGGER update_lost_items_updated_at BEFORE UPDATE ON lost_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_found_items_updated_at ON found_items;
CREATE TRIGGER update_found_items_updated_at BEFORE UPDATE ON found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
```

After running this SQL, you should see a success message.

#### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

### 6. Set Up Storage Bucket

The storage bucket should be automatically created by the migration. To verify:

1. Go to **Storage** in the Supabase Dashboard
2. You should see an "images" bucket
3. Click on it to verify it's set to public

If it doesn't exist, create it manually:
1. Click "New bucket"
2. Name: `images`
3. Toggle "Public bucket" to ON
4. Click "Create bucket"

### 7. Set Up Storage Policies

If you created the bucket manually, add these policies:

1. Go to Storage > images bucket > Policies
2. Add these policies:

**Policy 1: Upload**
- Name: "Authenticated users can upload images"
- Target roles: authenticated
- Policy: `bucket_id = 'images'`
- Operation: INSERT

**Policy 2: Select**
- Name: "Anyone can view images"
- Target roles: public
- Policy: `bucket_id = 'images'`
- Operation: SELECT

### 8. Deploy Edge Function (Optional but Recommended)

The matching Edge Function is already deployed in the codebase. To deploy it to your Supabase project:

1. Go to **Edge Functions** in Supabase Dashboard
2. Click "New function"
3. Name it: `find-matches`
4. Copy the code from `supabase/functions/find-matches/index.ts`
5. Deploy

Alternatively, if using Supabase CLI:
```bash
npx supabase functions deploy find-matches
```

### 9. Test the Setup

Run the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 10. Create a Test Account

1. Click "Sign Up"
2. Enter your details:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
3. Click "Sign Up"
4. You should be logged in automatically

### 11. Test Functionality

1. **Report a Lost Item**:
   - Click "Report Item"
   - Select "I Lost Something"
   - Fill in the details
   - Upload an image (optional)
   - Submit

2. **Report a Found Item**:
   - Click "Report Item" again
   - Select "I Found Something"
   - Fill in details for a similar item
   - Submit

3. **Check for Matches**:
   - Go to "My Items"
   - You should see both items
   - If they match, you'll see a notification

4. **Search**:
   - Go to "Search Items"
   - Try searching with keywords
   - Filter by category

## Troubleshooting

### Error: "Invalid API key"
- Double-check your `.env` file
- Make sure you copied the correct anon key
- Restart the dev server after changing `.env`

### Error: "relation does not exist"
- The database migrations weren't run
- Go back to Step 5 and run the SQL

### Images not uploading
- Check the storage bucket exists
- Verify storage policies are set up
- Check browser console for errors

### Matching not working
- Make sure the Edge Function is deployed
- Check that items have similar categories/descriptions
- Match threshold is 50% - items need to be reasonably similar

### Login/Signup not working
- Check Supabase Auth is enabled
- Verify your Supabase URL and key in `.env`
- Check browser console for errors

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates optimized files in `dist/`

### Deploy Options

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option 3: Supabase Hosting**
Follow Supabase's hosting documentation.

### Environment Variables in Production

Don't forget to set your environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Next Steps

- Customize the campus locations list
- Add your college logo
- Customize colors and branding
- Add Google Vision API for image matching (see README)
- Set up email notifications
- Add more item categories

## Getting Help

If you run into issues:
1. Check the browser console for errors
2. Check Supabase logs in the Dashboard
3. Review this guide again
4. Check the main README.md
5. Open an issue on GitHub

Happy building! 🚀
