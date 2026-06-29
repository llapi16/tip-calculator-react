// Import the function that creates a Supabase connection
import { createClient } from '@supabase/supabase-js'

// Pull in your URL and key from the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create and export the connection so any file in your app can use it
export const supabase = createClient(supabaseUrl, supabaseAnonKey)