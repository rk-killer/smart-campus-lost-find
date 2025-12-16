import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface LostItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string;
  location_lost: string;
  date_lost: string;
  image_url?: string;
  status: 'pending' | 'matched' | 'closed';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface FoundItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string;
  location_found: string;
  date_found: string;
  image_url?: string;
  status: 'pending' | 'matched' | 'closed';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  match_score: number;
  match_reason: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  lost_items?: LostItem;
  found_items?: FoundItem;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  related_item_id?: string;
  created_at: string;
}
