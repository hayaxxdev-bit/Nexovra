import { AuthService } from '@services/auth.service.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Toast } from '@components/ui/toast.js'

/**
 * App Shell - Main Layout Wrapper
 * Menyediakan struktur: Sidebar | Navbar | Content Area
 * Tema: Next-Gen Finance Nexovra
 */
export const AppShell = {
  /**
   * Get shell HTML structure
   * @returns {string}
   */
  getShellHTML() {
    return `
      <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300">
        <!-- Background Decorative Elements -->
        <div class="fixed inset-0 pointer-events-none z-0">
          <!-- Grid Pattern -->
          <div class="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-50"></div>
          <!-- Glow Orbs -->
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[150px]"></div>
          <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[150px]"></div>
        </div>

        <!-- Sidebar (Desktop) -->
        <aside id="sidebar" 
               class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-[280px] bg-white dark:bg-[#0a0a0f] border-r border-gray-200 dark:border-gray-800/50 transition-all duration-300 shadow-xl shadow-gray-200/50 dark:shadow-black/20">
          <!-- Sidebar content will be injected by sidebar.js -->
        </aside>

        <!-- Mobile Sidebar Overlay -->
        <div id="sidebar-overlay" 
             class="hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
             aria-hidden="true">
        </div>

        <!-- Main Content Area -->
        <div class="flex flex-col flex-1 lg:pl-[280px] min-h-screen relative z-10">
          <!-- Navbar -->
          <header id="navbar" 
                  class="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 flex items-center px-4 lg:px-6 transition-all duration-300">
            <!-- Top Glow Line -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            <!-- Navbar content will be injected by navbar.js -->
          </header>

          <!-- Content Area -->
          <main id="content-area" 
                class="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <!-- Page Transition Wrapper -->
            <div id="page-transition" class="animate-fade-in">
              <!-- Page content injected here -->
            </div>
          </main>

          <!-- Footer (Optional) -->
          <footer class="hidden lg:block px-6 py-4 border-t border-gray-200 dark:border-gray-800/50 bg-white/50 dark:bg-[#0a0a0f]/50 backdrop-blur-xl">
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-400 dark:text-gray-600">
                &copy; ${new Date().getFullYear()} Nexovra by Hayaxxdev-bit
              </p>
              <div class="flex items-center gap-4">
                <a href="/help" class="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                  Bantuan
                </a>
                <a href="/privacy" class="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                  Privasi
                </a>
                <a href="/terms" class="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                  Ketentuan
                </a>
                <span class="text-xs text-gray-300 dark:text-gray-700">•</span>
                <span class="text-xs text-gray-400 dark:text-gray-600">
                  v1.0.0
                </span>
              </div>
            </div>
          </footer>
        </div>

        <!-- Quick Action FAB (Mobile) -->
        <button id="fab-add-transaction" 
                class="lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 active:scale-95 transition-all duration-300 z-30 flex items-center justify-center"
                aria-label="Tambah Transaksi">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <!-- Toast Container -->
        <div id="toast-container" 
             class="fixed top-20 right-4 z-50 space-y-3 w-[380px] max-w-[calc(100vw-2rem)]">
        </div>

        <!-- Modal Container -->
        <div id="modal-container"></div>
      </div>

      <style>
        /* Background Grid Patterns */
        .bg-grid-light {
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        .bg-grid-dark {
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        /* Custom Scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          border-radius: 3px;
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
        }

        .dark .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
          background-color: #374151;
        }

        /* Page Transition */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        /* FAB Pulse Animation */
        @keyframes fab-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(168, 85, 247, 0);
          }
        }

        #fab-add-transaction {
          animation: fab-pulse 2s ease-in-out infinite;
        }

        #fab-add-transaction:hover {
          animation: none;
        }
      </style>
    `
  },

  /**
   * Initialize layout (sidebar + navbar)
   * @param {HTMLElement} appElement
   * @param {Object} params - Route params
   */
  async initializeLayout(appElement, params = {}) {
    // Initialize Sidebar
    const sidebarModule = await import('@components/layout/sidebar.js')
    sidebarModule.Sidebar.init(appElement)
    window.__app.sidebar = sidebarModule.Sidebar

    // Initialize Navbar
    const navbarModule = await import('@components/layout/navbar.js')
    navbarModule.Navbar.init(appElement)
    window.__app.navbar = navbarModule.Navbar

    // Setup FAB button
    this._setupFAB(appElement)

    // Setup keyboard shortcuts
    this._setupKeyboardShortcuts(appElement)

    // Setup resize handler for responsive behavior
    this._setupResizeHandler()

    // Load user profile
    await this._loadProfile(appElement)

    // Apply saved theme
    this._applyTheme()
  },

  /**
   * Setup Floating Action Button (Mobile)
   */
  _setupFAB(appElement) {
    const fab = appElement.querySelector('#fab-add-transaction')
    if (!fab) return

    fab.addEventListener('click', () => {
      window.__app?.router?.navigate('/transactions/new')
    })

    // Hide FAB on specific pages
    const hideOnPages = ['/transactions/new', '/login', '/register']
    const currentPath = window.location.pathname
    
    if (hideOnPages.some(path => currentPath.startsWith(path))) {
      fab.classList.add('hidden')
    }

    // Listen for route changes
    window.__app?.events?.on('route:changed', ({ path }) => {
      if (hideOnPages.some(p => path.startsWith(p))) {
        fab.classList.add('hidden')
      } else {
        fab.classList.remove('hidden')
      }
    })
  },

  /**
   * Setup Keyboard Shortcuts
   */
  _setupKeyboardShortcuts(appElement) {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + B - Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        const sidebar = appElement.querySelector('#sidebar')
        if (sidebar && window.innerWidth < 1024) {
          window.__app?.sidebar?.openMobile()
        }
      }

      // Ctrl/Cmd + N - New Transaction
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        window.__app?.router?.navigate('/transactions/new')
      }

      // Ctrl/Cmd + H - Home/Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        window.__app?.router?.navigate('/')
      }
    })
  },

  /**
   * Handle window resize
   */
  _setupResizeHandler() {
    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        // Close mobile sidebar on desktop
        if (window.innerWidth >= 1024) {
          window.__app?.sidebar?.closeMobile()
        }
      }, 250)
    })
  },

  /**
   * Load user profile
   */
  async _loadProfile(appElement) {
    try {
      const profile = await AuthService.getProfile()
      
      // Save to store
      window.__app.store.setState('profile', profile)
      
      // Update UI components
      if (window.__app.sidebar) {
        window.__app.sidebar.updateProfile(profile)
      }
      if (window.__app.navbar) {
        window.__app.navbar.updateProfile(profile)
      }

      return profile
    } catch (error) {
      console.warn('Failed to load profile:', error)
      
      // Force logout if auth error
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('does not exist') ||
          error?.message?.includes('token')) {
        await AuthService.logout()
        window.__app.router.navigate('/login', true)
        return null
      }

      // Show error toast for other errors
      if (!error?.message?.includes('Failed to fetch')) {
        Toast.error('Gagal memuat profil')
      }
      
      return null
    }
  },

  /**
   * Apply saved theme from localStorage
   */
  _applyTheme() {
    const savedTheme = localStorage.getItem('theme')
    const html = document.documentElement

    if (savedTheme === 'light') {
      html.classList.remove('dark')
      html.classList.add('light')
      html.setAttribute('data-theme', 'light')
    } else if (savedTheme === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
      html.setAttribute('data-theme', 'dark')
    } else {
      // Default: dark mode
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    }
  },

  /**
   * Toggle sidebar collapsed state (desktop)
   */
  toggleSidebar() {
    const sidebar = document.querySelector('#sidebar')
    const mainContent = document.querySelector('.lg\\:pl-\\[280px\\]')
    
    if (sidebar && mainContent) {
      sidebar.classList.toggle('w-[280px]')
      sidebar.classList.toggle('w-[80px]')
      mainContent.classList.toggle('lg:pl-[280px]')
      mainContent.classList.toggle('lg:pl-[80px]')
    }
  },

  /**
   * Show loading state for the entire app
   */
  showGlobalLoading() {
    const loader = document.createElement('div')
    loader.id = 'global-loader'
    loader.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div class="relative">
          <div class="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-500/20 border-t-purple-600 dark:border-t-purple-400 animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-bold text-purple-600 dark:text-purple-400">N</span>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(loader)
  },

  /**
   * Hide global loading
   */
  hideGlobalLoading() {
    const loader = document.getElementById('global-loader')
    if (loader) {
      loader.style.opacity = '0'
      loader.style.transition = 'opacity 0.3s ease'
      setTimeout(() => loader.remove(), 300)
    }
  },

  /**
   * Show maintenance mode
   */
  showMaintenance() {
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
          <div class="text-center">
            <div class="text-7xl mb-6">🔧</div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-4">
              Dalam Pemeliharaan
            </h1>
            <p class="text-gray-400 mb-6 max-w-md">
              Kami sedang melakukan pemeliharaan sistem. Silakan kembali beberapa saat lagi.
            </p>
            <div class="w-48 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse" style="width: 75%"></div>
            </div>
          </div>
        </div>
      `
    }
  }
}