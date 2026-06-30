import { supabase } from '@services/supabase.js'

export const AuthService = {
  async register({ email, password, fullName }) {
    console.log('Register attempt:', { email, fullName })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    console.log('Register response:', { data, error })

    if (error) {
      console.error('Register error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        fullError: JSON.stringify(error, null, 2)
      })
      throw error
    }

    return data
  },

  async login({ email, password }) {
    console.log('Login attempt:', { email })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Login response:', { data, error })

    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getProfile() {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(updates) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }, 
}
// ✅ Fix: Tambahkan interceptor untuk refresh token
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
})