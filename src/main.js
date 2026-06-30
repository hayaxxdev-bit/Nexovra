import '@css/main.css'
import '@css/themes.css'

// Import Chart.js dan assign ke global window
// import Chart from 'chart.js/auto'
// window.Chart = Chart
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
window.Chart = Chart

import { Router } from '@core/router.js'
import { Store } from '@core/store.js'
import { AuthGuard } from '@core/auth.js'
import { EventBus } from '@core/events.js'
import { supabase } from '@services/supabase.js'
// ============================================================
// Global instances
// ============================================================
window.__app = {
  store: new Store(),
  events: new EventBus(),
  router: null,
  supabase,
}

// ============================================================
// Initialize app
// ============================================================
async function bootstrap() {
  const app = document.getElementById('app')
  if (!app) {
    console.error('App container not found')
    return
  }

  // Initialize router
  const router = new Router(app)
  window.__app.router = router

  // Initialize auth guard
  const authGuard = new AuthGuard(router)

  // Define routes
  // Di bagian router.addRoute, tambahkan:

router
  .addRoute('/login', () => import('@pages/auth/login.js'), { public: true })
  .addRoute('/register', () => import('@pages/auth/register.js'), { public: true })
  .addRoute('/', () => import('@pages/dashboard/dashboard.js'), { protected: true })
  .addRoute('/accounts', () => import('@pages/accounts/accounts.js'), { protected: true })
  .addRoute('/accounts/:id', () => import('@pages/accounts/account-detail.js'), { protected: true })
  .addRoute('/transactions', () => import('@pages/transactions/transactions.js'), { protected: true })
  .addRoute('/transactions/new', () => import('@pages/transactions/transaction-form.js'), { protected: true })
  .addRoute('/transactions/:id/edit', () => import('@pages/transactions/transaction-form.js'), { protected: true })
  .addRoute('/transfer', () => import('@pages/transactions/transfer.js'), { protected: true })
  .addRoute('/cashbook', () => import('@pages/cashbook/cashbook.js'), { protected: true })
  // ⬇️ TAMBAHKAN INI
  .addRoute('/reports', () => import('@pages/reports/reports.js'), { protected: true })
  .addRoute('/settings', () => import('@pages/settings/settings.js'), { protected: true })
  // Set fallback
  router.setFallback('/')

  // Check session before routing
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      window.__app.store.setState('auth.user', session.user)
      window.__app.store.setState('auth.session', session)
    }
  } catch (error) {
    console.error('Session check failed:', error)
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      window.__app.store.setState('auth.user', session.user)
      window.__app.store.setState('auth.session', session)
      window.__app.events.emit('auth:signedIn', session.user)
    } else if (event === 'SIGNED_OUT') {
      window.__app.store.setState('auth.user', null)
      window.__app.store.setState('auth.session', null)
      window.__app.events.emit('auth:signedOut')
    }
  })

  // Initialize router (handle current URL)
  await router.init()
}

window.addEventListener('offline', () => Toast.warning('Koneksi terputus'))
window.addEventListener('online', () => Toast.success('Koneksi kembali'))
// Start app
bootstrap().catch(console.error)