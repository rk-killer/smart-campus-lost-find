/*
  # Smart Campus Lost & Found System - Database Schema

  ## Overview
  Creates the complete database schema for a campus lost and found system with authentication,
  item management, matching, and notifications.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone_number` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. lost_items
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `item_name` (text)
  - `category` (text) - e.g., electronics, clothing, documents, accessories, other
  - `description` (text)
  - `location_lost` (text)
  - `date_lost` (date)
  - `image_url` (text, optional)
  - `status` (text) - pending, matched, closed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. found_items
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `item_name` (text)
  - `category` (text)
  - `description` (text)
  - `location_found` (text)
  - `date_found` (date)
  - `image_url` (text, optional)
  - `status` (text) - pending, matched, closed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. matches
  - `id` (uuid, primary key)
  - `lost_item_id` (uuid, references lost_items)
  - `found_item_id` (uuid, references found_items)
  - `match_score` (integer) - similarity score (0-100)
  - `match_reason` (text) - explanation of why items match
  - `status` (text) - pending, confirmed, rejected
  - `created_at` (timestamptz)

  ### 5. notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `message` (text)
  - `type` (text) - match_found, item_claimed, etc.
  - `read` (boolean)
  - `related_item_id` (uuid, optional)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only read/write their own data
  - All users can view lost and found items (public search)
  - Only item owners can update their items
  - Matches are visible to both lost and found item owners
*/

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);
CREATE INDEX IF NOT EXISTS idx_found_items_user_id ON found_items(user_id);
CREATE INDEX IF NOT EXISTS idx_found_items_category ON found_items(category);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON found_items(status);
CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item ON matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Lost items policies
CREATE POLICY "Anyone can view lost items"
  ON lost_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own lost items"
  ON lost_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost items"
  ON lost_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost items"
  ON lost_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Found items policies
CREATE POLICY "Anyone can view found items"
  ON found_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own found items"
  ON found_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own found items"
  ON found_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own found items"
  ON found_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view matches for their items"
  ON matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lost_items WHERE lost_items.id = matches.lost_item_id AND lost_items.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM found_items WHERE found_items.id = matches.found_item_id AND found_items.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update matches for their items"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lost_items WHERE lost_items.id = matches.lost_item_id AND lost_items.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM found_items WHERE found_items.id = matches.found_item_id AND found_items.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lost_items WHERE lost_items.id = matches.lost_item_id AND lost_items.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM found_items WHERE found_items.id = matches.found_item_id AND found_items.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lost_items_updated_at ON lost_items;
CREATE TRIGGER update_lost_items_updated_at
    BEFORE UPDATE ON lost_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_found_items_updated_at ON found_items;
CREATE TRIGGER update_found_items_updated_at
    BEFORE UPDATE ON found_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
