// @services/supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables.\n' +
    'Please create a .env file with:\n' +
    '  VITE_SUPABASE_URL=your-project-url\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    'See .env.example for reference.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'nexovra_auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'nexovra',
      'x-client-info': 'nexovra-app',
      'x-app-version': '1.0.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ============================================================
// Auth Helpers
// ============================================================

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

export const isAuthenticated = async () => {
  const session = await getSession()
  return !!session
}

export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Failed to refresh session:', error)
    return null
  }
}

// ============================================================
// Error Handler
// ============================================================

export function handleSupabaseError(error) {
  if (!error) return 'Terjadi kesalahan tidak diketahui.'

  const message = error.message || ''
  const code = error.code || ''
  const status = error.status || 0

  // Auth errors
  if (message.includes('JWT expired') || message.includes('token')) {
    return '🔒 Sesi telah berakhir. Silakan login kembali.'
  }
  
  if (message.includes('Invalid login credentials')) {
    return '❌ Email atau password salah.'
  }
  
  if (message.includes('Email not confirmed')) {
    return '📧 Email belum dikonfirmasi. Silakan cek inbox Anda.'
  }
  
  if (message.includes('User already registered')) {
    return '👤 Email sudah terdaftar. Silakan login.'
  }

  // OAuth errors
  if (message.includes('provider') || message.includes('oauth')) {
    return '🔑 Gagal login dengan provider. Silakan coba lagi.'
  }

  // Rate limiting
  if (status === 429 || code === '429') {
    return '⚠️ Terlalu banyak permintaan. Silakan tunggu 60 detik dan coba lagi.'
  }

  // Network errors
  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('network')) {
    return '📡 Gagal terhubung ke server. Periksa koneksi internet Anda.'
  }

  // RLS/Policy errors
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

  // Not found
  if (code === 'PGRST116') {
    return '🔍 Data tidak ditemukan.'
  }

  // Timeout
  if (message.includes('timeout') || message.includes('abort')) {
    return '⏱️ Permintaan timeout. Silakan coba lagi.'
  }

  // Storage errors
  if (message.includes('storage') || message.includes('bucket')) {
    return '💾 Gagal mengakses penyimpanan. Silakan coba lagi.'
  }

  // Default error
  return `❌ ${message || 'Terjadi kesalahan. Silakan coba lagi.'}`
}

export const handleError = (error, customMessage = '') => {
  const userMessage = customMessage || handleSupabaseError(error)
  
  console.error('🔴 Supabase Error:', {
    message: error.message,
    code: error.code,
    status: error.status,
    details: error.details,
    hint: error.hint,
    timestamp: new Date().toISOString(),
  })
  
  if (window.__app?.events) {
    window.__app.events.emit('app:error', {
      type: 'supabase',
      error,
      userMessage,
    })
  }
  
  return userMessage
}

// ============================================================
// OAuth Callback Handler
// ============================================================

export const handleOAuthCallback = async () => {
  try {
    // Supabase akan otomatis menangani session dari URL
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    if (session) {
      console.log('✅ OAuth callback success:', session.user.email)
      
      // Simpan session ke store
      if (window.__app?.store) {
        window.__app.store.setState('auth.user', session.user)
        window.__app.store.setState('auth.session', session)
      }
      
      return { session, user: session.user }
    }
    
    return { session: null, user: null }
  } catch (error) {
    console.error('OAuth callback error:', error)
    throw error
  }
}

// ============================================================
// Debug Helpers
// ============================================================

export const debugAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.group('🔐 Nexovra Auth Debug')
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('🔗 Supabase URL:', supabaseUrl)
    console.log('👤 Session:', session ? {
      user: session.user?.email,
      expires: new Date(session.expires_at * 1000).toLocaleString(),
      provider: session.user?.app_metadata?.provider,
    } : 'No active session')
    console.log('❌ Error:', error)
    console.log('💾 Local Storage Keys:', Object.keys(localStorage).filter(k => 
      k.includes('nexovra') || k.includes('sb-') || k.includes('supabase')
    ))
    console.log('🌐 Window Location:', window.location.href)
    console.groupEnd()
    
    return { session, error }
  } catch (e) {
    console.error('Debug auth failed:', e)
    return { session: null, error: e }
  }
}

export const clearAuthData = async () => {
  console.warn('🧹 Clearing all auth data...')
  
  await supabase.auth.signOut()
  
  Object.keys(localStorage).forEach(key => {
    if (key.includes('nexovra') || key.includes('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key)
      console.log(`  Removed: ${key}`)
    }
  })
  
  console.log('✅ Auth data cleared. Please refresh the page.')
  window.location.reload()
}

export const checkConnection = async () => {
  try {
    const start = performance.now()
    const { data, error } = await supabase.from('_prisma_migrations').select('count').limit(0)
    const latency = Math.round(performance.now() - start)
    
    console.log('✅ Supabase connected!', {
      latency: `${latency}ms`,
      url: supabaseUrl,
      error: error || 'none',
    })
    
    return { connected: !error, latency }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return { connected: false, latency: 0, error }
  }
}

// ============================================================
// Global Debug Helpers
// ============================================================

if (typeof window !== 'undefined') {
  window.__nexovra = {
    debugAuth,
    clearAuthData,
    checkConnection,
    getSession,
    getCurrentUser,
    supabase,
  }
}

export default supabase