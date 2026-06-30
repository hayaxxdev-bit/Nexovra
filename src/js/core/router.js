import { supabase } from '@services/supabase.js'

/**
 * Simple SPA Router
 */
export class Router {
  constructor(appElement) {
    this._app = appElement
    this._routes = new Map()
    this._fallback = '/login'
    this._currentRoute = null
    this._currentComponent = null
    this._layoutComponent = null
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

    // Handle current URL
    await this._handleRoute(window.location.pathname)
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

    if (!matchedRoute) {
      return this.navigate(this._fallback, true)
    }

    // Check auth for protected routes
    if (matchedRoute.options.protected) {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // Jika ada error atau session tidak valid → force ke login
      if (error || !session) {
        // Bersihkan storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
        return this.navigate('/login', true)
      }
    }

    // If no route found, redirect to fallback
    if (!matchedRoute) {
      return this.navigate(this._fallback, true)
    }

    // Check auth for protected routes
    if (matchedRoute.options.protected) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return this.navigate('/login', true)
      }
    }

    // Check if already on public route but authenticated
    if (matchedRoute.options.public && pathname !== '/register') {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        return this.navigate('/', true)
      }
    }

    this._currentRoute = { path: pathname, params: matchedParams }
    
    // Close mobile sidebar on navigation
    if (window.__app?.sidebar) {
      window.__app.sidebar.closeMobile()
    }
    
    await this._render(matchedRoute.loader, matchedParams)
  }

  /**
   * Render page
   * @param {Function} loader
   * @param {Object} params
   */
  async _render(loader, params = {}) {
    const appElement = this._app
    if (!appElement) return
    
    appElement.innerHTML = this._getLoadingHTML()

    try {
      const module = await loader()
      this._currentComponent = module

      const currentPath = window.location.pathname
      const isPublic = currentPath === '/login' || currentPath === '/register'

      if (isPublic) {
        appElement.innerHTML = ''
        if (module && typeof module.render === 'function') {
          await module.render(appElement, params)
        }
      } else {
        // Lazy load layout
        if (!this._layoutComponent) {
          const layoutModule = await import('@components/layout/app-shell.js')
          this._layoutComponent = layoutModule.AppShell
        }

        if (this._layoutComponent && typeof this._layoutComponent.getShellHTML === 'function') {
          appElement.innerHTML = this._layoutComponent.getShellHTML()
          const contentArea = appElement.querySelector('#content-area')
          if (contentArea) {
            await this._layoutComponent.initializeLayout(appElement, params)
            if (module && typeof module.render === 'function') {
              await module.render(contentArea, params)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to render route:', error)
      appElement.innerHTML = this._getErrorHTML(error)
    }
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

  _getLoadingHTML() {
    return `
      <div class="flex items-center justify-center min-h-screen">
        <div class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Memuat...</p>
        </div>
      </div>
    `
  }

  // ==========================================
  // ✅ PERBAIKAN DI SINI: Ditambahkan Tombol "Coba Lagi"
  // ==========================================
  _getErrorHTML(error) {
    return `
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="text-center max-w-sm">
          <div class="text-6xl mb-4">😵</div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Terjadi Kesalahan</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 break-words">${error.message || 'Gagal memuat halaman.'}</p>
          
          <div class="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onclick="window.location.reload()" 
              class="btn btn-primary px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              🔄 Coba Lagi
            </button>
            <a 
              href="/" 
              class="btn btn-secondary px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    `
  }
}