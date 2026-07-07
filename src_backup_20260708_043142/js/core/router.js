import { supabase } from '@services/supabase.js'

/**
 * Simple SPA Router - Nexovra Next-Gen
 * dengan Error Handling Terintegrasi
 */
export class Router {
  constructor(appElement) {
    this._app = appElement
    this._routes = new Map()
    this._fallback = '/login'
    this._currentRoute = null
    this._currentComponent = null
    this._layoutComponent = null
    this._isInitialized = false
    this._errorPages = new Map()
    this._handlePopState = this._handlePopStateHandler.bind(this)
    
    window.addEventListener('popstate', this._handlePopState)
  }

  /**
   * Add route
   * @param {string} path - Route path with optional params (:id)
   * @param {Function} loader - Async function that returns page module
   * @param {Object} options - { public, protected }
   * @returns {Router}
   */
  addRoute(path, loader, options = {}) {
    this._routes.set(path, { 
      loader, 
      options, 
      pattern: this._pathToRegex(path) 
    })
    return this
  }

  /**
   * Set fallback route
   * @param {string} path
   * @returns {Router}
   */
  setFallback(path) {
    this._fallback = path
    return this
  }

  /**
   * Initialize router
   */
  async init() {
    if (this._isInitialized) return
    
    // Load error pages
    await this._loadErrorPages()
    
    // Handle clicks on internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return
      if (link.hasAttribute('data-no-router')) return
      if (e.ctrlKey || e.metaKey) return

      e.preventDefault()
      this.navigate(href)
    })

    this._isInitialized = true
    
    // Handle current URL
    await this._handleRoute(window.location.pathname)
  }

  /**
   * Load error pages
   */
  async _loadErrorPages() {
    try {
      const ErrorPage = (await import('@pages/errors/error.js')).default
      const NotFoundPage = (await import('@pages/errors/404.js')).default
      const MaintenancePage = (await import('@pages/errors/maintenance.js')).default
      
      this._errorPages.set('error', ErrorPage)
      this._errorPages.set('404', NotFoundPage)
      this._errorPages.set('maintenance', MaintenancePage)
    } catch (error) {
      console.error('Failed to load error pages:', error)
    }
  }

  /**
   * Navigate to path
   * @param {string} path
   * @param {boolean} replace - Replace history entry
   */
  async navigate(path, replace = false) {
    if (replace) {
      window.history.replaceState(null, '', path)
    } else {
      window.history.pushState(null, '', path)
    }
    await this._handleRoute(path)
  }

  /**
   * Handle popstate event
   */
  _handlePopStateHandler() {
    this._handleRoute(window.location.pathname)
  }

  /**
   * Handle route matching and rendering
   * @param {string} pathname
   */
  async _handleRoute(pathname) {
    // Cek maintenance mode
    if (this._isMaintenanceMode() && !pathname.startsWith('/maintenance')) {
      return this._renderErrorPage('maintenance')
    }

    // Find matching route
    let matchedRoute = null
    let matchedParams = {}

    for (const [path, route] of this._routes) {
      const match = pathname.match(route.pattern)
      if (match) {
        matchedRoute = route
        const paramNames = [...path.matchAll(/:(\w+)/g)].map(m => m[1])
        paramNames.forEach((name, i) => {
          matchedParams[name] = match[i + 1]
        })
        break
      }
    }

    // Handle 404 - No route found
    if (!matchedRoute) {
      // Cek apakah ini halaman error
      if (pathname === '/404') {
        return this._renderErrorPage('404')
      }
      
      // Redirect ke 404 atau fallback
      if (this._fallback === '/404') {
        return this.navigate('/404', true)
      }
      return this.navigate(this._fallback, true)
    }

    // Check auth for protected routes
    if (matchedRoute.options.protected) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // Jika ada error atau session tidak valid → force ke login
        if (error || !session) {
          // Bersihkan storage yang corrupt
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key)
            }
          })
          
          // Emit auth error event
          window.__app?.events?.emit('auth:error', { 
            message: 'Session tidak valid',
            redirectTo: '/login'
          })
          
          return this.navigate('/login', true)
        }
      } catch (authError) {
        console.error('Auth check failed:', authError)
        return this._renderErrorPage('error', {
          code: '500',
          title: 'Auth Service Error',
          message: 'Gagal memverifikasi autentikasi. Silakan coba lagi.',
          showRetry: true
        })
      }
    }

    // Check if already on public route but authenticated
    if (matchedRoute.options.public && pathname !== '/register') {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          return this.navigate('/', true)
        }
      } catch (error) {
        // Silent fail - biarkan user tetap di halaman public
        console.warn('Session check failed on public route:', error)
      }
    }

    // Update current route
    this._currentRoute = { path: pathname, params: matchedParams }
    
    // Emit route change event
    window.__app?.events?.emit('route:changed', { 
      path: pathname, 
      params: matchedParams,
      route: matchedRoute.options 
    })
    
    // Close mobile sidebar on navigation
    if (window.__app?.sidebar) {
      window.__app.sidebar.closeMobile()
    }
    
    // Render the page
    await this._render(matchedRoute.loader, matchedParams)
  }

  /**
   * Check maintenance mode
   * @returns {boolean}
   */
  _isMaintenanceMode() {
    // Bisa diambil dari environment variable atau config
    return window.__app?.store?.getState('system.maintenance') || false
  }

  /**
   * Render error page
   * @param {string} type - Error type ('404', 'error', 'maintenance')
   * @param {Object} errorData - Error data
   */
  async _renderErrorPage(type, errorData = {}) {
    const appElement = this._app
    if (!appElement) return

    const ErrorPageClass = this._errorPages.get(type)
    
    if (ErrorPageClass) {
      try {
        const errorPage = new ErrorPageClass(appElement, errorData)
        await errorPage.render()
        this._currentComponent = errorPage
      } catch (error) {
        console.error(`Failed to render ${type} page:`, error)
        // Fallback to basic error display
        appElement.innerHTML = this._getFallbackErrorHTML(type, errorData)
      }
    } else {
      // Jika error page belum loaded, tampilkan fallback
      appElement.innerHTML = this._getFallbackErrorHTML(type, errorData)
    }

    // Emit error event
    window.__app?.events?.emit('route:error', { 
      type, 
      error: errorData,
      path: window.location.pathname 
    })
  }

  /**
   * Render page
   * @param {Function} loader
   * @param {Object} params
   */
  async _render(loader, params = {}) {
    const appElement = this._app
    if (!appElement) return
    
    // Show loading state
    appElement.innerHTML = this._getLoadingHTML()

    try {
      // Load page module dengan timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Page load timeout')), 10000)
      })
      
      const module = await Promise.race([loader(), timeoutPromise])
      this._currentComponent = module

      const currentPath = window.location.pathname
      const isPublic = currentPath === '/login' || currentPath === '/register'

      if (isPublic) {
        // Public pages - render directly without layout
        appElement.innerHTML = ''
        if (module && typeof module.render === 'function') {
          await module.render(appElement, params)
        }
      } else {
        // Protected pages - render with layout shell
        // Lazy load layout if not loaded yet
        if (!this._layoutComponent) {
          try {
            const layoutModule = await import('@components/layout/app-shell.js')
            this._layoutComponent = layoutModule.AppShell
          } catch (error) {
            throw new Error('Failed to load layout')
          }
        }

        if (this._layoutComponent && typeof this._layoutComponent.getShellHTML === 'function') {
          // Set shell HTML
          appElement.innerHTML = this._layoutComponent.getShellHTML()
          
          // Get content area
          const contentArea = appElement.querySelector('#content-area')
          
          // Initialize layout (sidebar, navbar, etc.)
          if (typeof this._layoutComponent.initializeLayout === 'function') {
            await this._layoutComponent.initializeLayout(appElement, params)
          }
          
          // Render page content into content area
          if (contentArea && module && typeof module.render === 'function') {
            // Wrap in transition wrapper if available
            const transitionWrapper = contentArea.querySelector('#page-transition')
            const targetElement = transitionWrapper || contentArea
            
            // Clear previous content
            targetElement.innerHTML = ''
            
            // Render new content dengan error boundary
            try {
              await module.render(targetElement, params)
            } catch (renderError) {
              console.error('Page render error:', renderError)
              targetElement.innerHTML = this._getComponentErrorHTML(renderError)
            }
          }
        }
      }

      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Failed to render route:', error)
      
      // Tampilkan error page yang sesuai
      await this._renderErrorPage('error', {
        code: error.message?.includes('timeout') ? '408' : '500',
        title: error.message?.includes('timeout') ? 'Timeout' : 'Gagal Memuat Halaman',
        message: error.message || 'Terjadi kesalahan saat memuat halaman',
        details: error.stack,
        showRetry: true
      })
    }
  }

  /**
   * Reload current route
   */
  async reload() {
    const currentPath = this.getCurrentPath()
    await this._handleRoute(currentPath)
  }

  /**
   * Get current route params
   * @returns {Object}
   */
  getParams() {
    return this._currentRoute?.params || {}
  }

  /**
   * Get current path
   * @returns {string}
   */
  getCurrentPath() {
    return this._currentRoute?.path || window.location.pathname
  }

  /**
   * Check if current route is protected
   * @returns {boolean}
   */
  isProtectedRoute() {
    const currentPath = this.getCurrentPath()
    for (const [path, route] of this._routes) {
      if (currentPath.match(route.pattern)) {
        return route.options.protected || false
      }
    }
    return false
  }

  /**
   * Convert path to regex pattern
   * @param {string} path
   * @returns {RegExp}
   */
  _pathToRegex(path) {
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '([^\\/]+)')
    return new RegExp(`^${pattern}$`)
  }

  /**
   * Get loading HTML with Nexovra styling
   * @returns {string}
   */
  _getLoadingHTML() {
    return `
      <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-[#0a0a0f] transition-colors duration-300">
        <div class="flex flex-col items-center gap-6 animate-fade-in">
          <!-- Animated Logo -->
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <span class="text-white font-bold text-2xl animate-pulse">N</span>
            </div>
            <div class="absolute -inset-4 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-3xl blur-xl animate-pulse"></div>
          </div>
          
          <!-- Loading Spinner -->
          <div class="relative">
            <div class="w-10 h-10 border-4 border-primary-200 dark:border-primary-500/20 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          </div>
          
          <!-- Loading Text -->
          <div class="text-center">
            <p class="text-surface-500 dark:text-surface-400 text-sm font-medium">
              Memuat Nexovra...
            </p>
            <p class="text-surface-400 dark:text-surface-500 text-xs mt-1">
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Get component error HTML
   * @param {Error} error
   * @returns {string}
   */
  _getComponentErrorHTML(error) {
    return `
      <div class="card p-6 border-error-200 dark:border-error-800">
        <div class="text-center">
          <span class="text-4xl mb-3 block">⚠️</span>
          <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Komponen Gagal Dimuat
          </h3>
          <p class="text-sm text-surface-600 dark:text-surface-400 mb-4">
            ${error.message || 'Terjadi kesalahan saat memuat komponen'}
          </p>
          <button onclick="window.location.reload()" 
                  class="btn-primary text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Muat Ulang Komponen
          </button>
        </div>
      </div>
    `
  }

  /**
   * Get fallback error HTML (saat error pages belum loaded)
   * @param {string} type
   * @param {Object} errorData
   * @returns {string}
   */
  _getFallbackErrorHTML(type, errorData = {}) {
    const errorConfigs = {
      '404': {
        icon: '🔍',
        title: 'Halaman Tidak Ditemukan',
        message: 'Maaf, halaman yang Anda cari tidak tersedia.'
      },
      'error': {
        icon: '💥',
        title: errorData.title || 'Terjadi Kesalahan',
        message: errorData.message || 'Terjadi kesalahan yang tidak terduga.'
      },
      'maintenance': {
        icon: '🔧',
        title: 'Dalam Pemeliharaan',
        message: 'Kami sedang melakukan pemeliharaan sistem.'
      }
    }

    const config = errorConfigs[type] || errorConfigs['error']

    return `
      <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-[#0a0a0f] p-4">
        <div class="text-center max-w-md animate-slide-up">
          <div class="text-7xl mb-6">${config.icon}</div>
          <h2 class="text-2xl font-bold text-gradient mb-3">${config.title}</h2>
          <p class="text-surface-600 dark:text-surface-400 mb-8">${config.message}</p>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            ${type === 'error' ? `
              <button onclick="window.location.reload()" 
                      class="btn-primary">
                🔄 Coba Lagi
              </button>
            ` : ''}
            <a href="/" class="btn-secondary">
              🏠 Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Destroy router
   */
  destroy() {
    window.removeEventListener('popstate', this._handlePopState)
    this._routes.clear()
    this._errorPages.clear()
    this._currentRoute = null
    this._currentComponent = null
    this._layoutComponent = null
    this._isInitialized = false
  }
}