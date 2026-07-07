import { supabase } from '@services/supabase.js'

/**
 * Auth Guard
 */
export class AuthGuard {
  constructor(router) {
    this._router = router
    this._setupAuthListener()
  }

  _setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      const currentPath = window.location.pathname
      const isPublicRoute = currentPath === '/login' || currentPath === '/register'

      if (event === 'SIGNED_IN') {
        if (isPublicRoute) {
          this._router.navigate('/', true)
        }
      } else if (event === 'SIGNED_OUT') {
        if (!isPublicRoute) {
          this._router.navigate('/login', true)
        }
      }
    })
  }

  static async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async requireAuth() {
    const isAuth = await AuthGuard.isAuthenticated()
    if (!isAuth) {
      window.__app?.router?.navigate('/login', true)
      throw new Error('Authentication required')
    }
    return AuthGuard.getCurrentUser()
  }
}