import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'See .env.example for reference.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'financeos',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
})

/**
 * Handle Supabase errors with user-friendly messages
 */
export function handleSupabaseError(error) {
  if (!error) return 'Terjadi kesalahan tidak diketahui'

  const message = error.message || ''
  const code = error.code || ''

  // Rate limiting
  if (error.status === 429 || code === '429') {
    return '⚠️ Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.'
  }

  // Auth errors
  if (message.includes('JWT expired') || message.includes('token')) {
    return '🔒 Sesi telah berakhir. Silakan login kembali.'
  }

  // Network errors
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return '📡 Gagal terhubung ke server. Periksa koneksi internet Anda.'
  }

  // RLS errors
  if (code === '42501' || code === 'PGRST301') {
    return '🔐 Anda tidak memiliki izin untuk melakukan aksi ini.'
  }

  // Duplicate key
  if (code === '23505') {
    return '📋 Data sudah ada. Tidak dapat membuat duplikat.'
  }

  // Foreign key violation
  if (code === '23503') {
    return '🔗 Data terkait tidak ditemukan.'
  }

  // Timeout
  if (message.includes('timeout') || message.includes('abort')) {
    return '⏱️ Permintaan timeout. Silakan coba lagi.'
  }

  // Default
  return `❌ ${message || 'Terjadi kesalahan. Silakan coba lagi.'}`
}

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export default supabase