import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Key dari Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASESUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Buat dan ekspor client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
