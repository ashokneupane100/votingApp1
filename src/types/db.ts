import { Database } from './supabase';
export type Poll=Database['public']['Tables']['Polls']['Row']
