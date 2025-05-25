import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import{Database} from "../types/supabase";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Create different storage configurations for different platforms
const getStorageConfig = () => {
  if (Platform.OS === 'web') {
    // For web, use localStorage or no storage for SSR compatibility
    return {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: typeof window !== 'undefined',
      persistSession: typeof window !== 'undefined',
      detectSessionInUrl: false,
    }
  } else {
    // For native platforms, use AsyncStorage
    return {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: getStorageConfig(),
})