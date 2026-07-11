// @services/auth.service.js

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
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    })

    if (error) {
      console.error('Register error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
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

    if (error) throw error
    return data
  },

  async loginWithGoogle() {
    try {
      // Gunakan URL absolut yang sama dengan yang didaftarkan di Supabase Dashboard
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('Google OAuth redirect to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      // Supabase akan redirect ke Google
      // Tidak perlu return data karena akan redirect
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Gagal login dengan Google. Silakan coba lagi.');
    }
  },

  async loginWithGithub() {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('GitHub OAuth redirect to:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('GitHub login error:', error);
      throw new Error('Gagal login dengan GitHub. Silakan coba lagi.');
    }
  },

  async handleOAuthCallback() {
    try {
      // Ambil session dari URL (Supabase sudah handle otomatis)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        console.log('✅ OAuth login successful:', session.user.email);
        
        // Simpan ke store
        if (window.__app?.store) {
          window.__app.store.setState('auth.user', session.user);
          window.__app.store.setState('auth.session', session);
        }
        
        // Buat/update profile jika perlu
        try {
          await this.createProfile(session.user);
        } catch (profileError) {
          console.warn('Profile creation skipped:', profileError);
        }
        
        return { session, user: session.user };
      }
      
      return null;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear all stored session data
    localStorage.removeItem('nexovra_remembered_email')
    
    // Clear Supabase-related storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('nexovra')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear store
    if (window.__app?.store) {
      window.__app.store.setState('auth.user', null)
      window.__app.store.setState('auth.session', null)
    }
  },

  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    })

    if (error) throw error
    return data
  },

  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
    return data
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

    if (error) {
      if (error.code === 'PGRST116') {
        return this.createProfile(user)
      }
      throw error
    }
    return data
  },

  async createProfile(user) {
    if (!user || !user.id) {
      console.warn('Cannot create profile: No user data');
      return null;
    }

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      created_at: new Date().toISOString(),
    };

    console.log('Creating profile:', profileData);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.warn('Profile creation/upsert error:', error);
      return null;
    }
    return data
  },

  async updateProfile(updates) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async resendConfirmationEmail(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    })

    if (error) throw error
    return data
  },
}

// Setup auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  // console.log('🔐 Auth state changed:', event, session?.user?.email);
  
  switch (event) {
    case 'TOKEN_REFRESHED':
      console.log('🔑 Token refreshed successfully')
      break
    case 'SIGNED_IN':
      console.log('✅ User signed in:', session?.user?.email)
      // Update store jika ada
      if (window.__app?.store && session) {
        window.__app.store.setState('auth.user', session.user)
        window.__app.store.setState('auth.session', session)
      }
      break
    case 'SIGNED_OUT':
      console.log('👋 User signed out')
      if (window.__app?.store) {
        window.__app.store.setState('auth.user', null)
        window.__app.store.setState('auth.session', null)
      }
      break
    case 'USER_UPDATED':
      console.log('👤 User updated')
      break
    case 'PASSWORD_RECOVERY':
      console.log('🔐 Password recovery event')
      break
  }
})