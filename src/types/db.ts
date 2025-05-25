import { Database } from './supabase';
export type Poll=Database['public']['Tables']['Polls']['Row']

export type Vote=Database['public']['Tables']['votes']['Row']
