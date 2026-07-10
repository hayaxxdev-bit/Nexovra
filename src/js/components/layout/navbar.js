import { Sidebar } from '@components/layout/sidebar.js'

export const Navbar = {
  _app: null,

  init(appElement) {
    this._app = appElement
    this._render()
    this._setupEvents()
  },

  _render() {
    const navbar = this._app.querySelector('#navbar')
    if (!navbar) return

    const currentPath = window.location.pathname

    const pageTitles = {
      '/': 'Dashboard',
      '/accounts': 'Akun',
      '/transactions': 'Transaksi',
      '/transactions/new': 'Tambah Transaksi',
      '/transfer': 'Transfer',
      '/cashbook': 'Buku Kas',
      '/reports': 'Laporan',
      '/settings': 'Pengaturan',
    }

    let title = 'Dashboard'
    for (const [path, pageTitle] of Object.entries(pageTitles)) {
      if (currentPath.startsWith(path)) {
        title = pageTitle
        break
      }
    }

    if (currentPath.match(/^\/accounts\/.+/)) title = 'Detail Akun'
    else if (currentPath.match(/^\/transactions\/.+\/edit$/)) title = 'Edit Transaksi'

    // Breadcrumb for nested pages
    let breadcrumb = ''
    if (currentPath.match(/^\/accounts\/.+/)) {
      breadcrumb = `
        <div class="flex items-center gap-2 text-sm">
          <a href="/accounts" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Akun</a>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-gray-600 dark:text-gray-300">Detail</span>
        </div>
      `
    }

    navbar.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <!-- Left Section -->
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle -->
          <button id="mobile-menu-btn" 
                  class="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  aria-label="Toggle menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Page Title & Breadcrumb -->
          <div class="flex flex-col">
            ${breadcrumb}
            <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ${title}
            </h1>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Quick Actions -->
          <div class="hidden sm:flex items-center gap-2">
            <!-- Search Button -->
            <button id="search-btn" 
                    class="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    title="Cari (Ctrl+K)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <!-- Notifications -->
            <button id="notif-btn" 
                    class="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    title="Notifikasi">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
          </div>

          <!-- New Transaction Button -->
          <a href="/transactions/new" 
             class="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden lg:inline">Transaksi Baru</span>
            <span class="lg:hidden">Baru</span>
          </a>

          <!-- Divider -->
          <div class="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700/50"></div>

          <!-- Theme Toggle -->
          <button id="theme-toggle" 
                  class="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                  title="Ganti tema">
            <!-- Sun Icon (shown in dark mode) -->
            <svg id="theme-icon-sun" 
                 class="w-5 h-5 transition-all duration-500 transform"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon Icon (shown in light mode) -->
            <svg id="theme-icon-moon" 
                 class="w-5 h-5 transition-all duration-500 transform hidden"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <!-- Hover glow effect -->
            <span class="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></span>
          </button>

          <!-- User Menu -->
          <div class="relative" id="user-menu-container">
            <button id="user-menu-btn" 
                    class="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700/50"
                    aria-label="User menu">
              <!-- Avatar -->
              <div id="navbar-avatar" 
                   class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-all duration-300">
                U
              </div>
              <!-- Username -->
              <span id="navbar-username" 
                    class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                User
              </span>
              <!-- Chevron -->
              <svg class="hidden md:block w-4 h-4 text-gray-400 transition-transform duration-300" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu (Hidden by default, shown on click) -->
            <div id="user-dropdown" 
                 class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-[#12121a] backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl py-2 z-50 animate-scale">
              <!-- User Info -->
              <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p id="dropdown-name" class="text-sm font-semibold text-gray-900 dark:text-gray-100">User</p>
                <p id="dropdown-email" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">user@email.com</p>
              </div>
              <!-- Menu Items -->
              <a href="/settings" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pengaturan
              </a>
              <a href="/help" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bantuan
              </a>
              <div class="border-t border-gray-100 dark:border-gray-800 my-1"></div>
              <button id="logout-btn" class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Bottom Bar -->
      <div class="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#12121a] border-t border-gray-200 dark:border-gray-800/50 backdrop-blur-xl z-40">
        <div class="flex items-center justify-around py-2 px-4">
          <a href="/transactions/new" class="flex-1">
            <button class="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Transaksi Baru
            </button>
          </a>
        </div>
      </div>
    `

    // Initialize theme icon
    this._updateThemeIcon()
  },

  _setupEvents() {
    // Mobile menu toggle
    const mobileBtn = this._app.querySelector('#mobile-menu-btn')
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        Sidebar.openMobile()
        // Animate hamburger to X
        mobileBtn.classList.toggle('active')
      })
    }

    // Theme toggle
    const themeBtn = this._app.querySelector('#theme-toggle')
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this._toggleTheme())
    }

    // User menu dropdown
    const userMenuBtn = this._app.querySelector('#user-menu-btn')
    const userDropdown = this._app.querySelector('#user-dropdown')
    
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        userDropdown.classList.toggle('hidden')
        // Animate chevron
        const chevron = userMenuBtn.querySelector('svg:last-child')
        if (chevron) {
          chevron.style.transform = userDropdown.classList.contains('hidden') 
            ? 'rotate(0deg)' 
            : 'rotate(180deg)'
        }
      })

      // Close dropdown on outside click
      document.addEventListener('click', () => {
        userDropdown.classList.add('hidden')
        const chevron = userMenuBtn.querySelector('svg:last-child')
        if (chevron) chevron.style.transform = 'rotate(0deg)'
      })
    }

    // Search button
    const searchBtn = this._app.querySelector('#search-btn')
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        // Implement search modal or command palette
        console.log('Search clicked')
      })
    }

    // Logout button
    const logoutBtn = this._app.querySelector('#logout-btn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Dispatch logout event
        window.__app?.events?.emit('auth:logout')
      })
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        console.log('Command palette opened')
      }
      // Escape to close dropdown
      if (e.key === 'Escape' && userDropdown) {
        userDropdown.classList.add('hidden')
      }
    })
  },

  updateProfile(profile) {
    const usernameEl = this._app.querySelector('#navbar-username')
    const avatarEl = this._app.querySelector('#navbar-avatar')
    const dropdownName = this._app.querySelector('#dropdown-name')
    const dropdownEmail = this._app.querySelector('#dropdown-email')

    if (profile?.full_name) {
      const initials = profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

      if (usernameEl) usernameEl.textContent = profile.full_name
      if (avatarEl) avatarEl.textContent = initials
      if (dropdownName) dropdownName.textContent = profile.full_name
    }

    if (profile?.email && dropdownEmail) {
      dropdownEmail.textContent = profile.email
    }
  },

  _toggleTheme() {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    
    if (isDark) {
      html.classList.remove('dark')
      html.classList.add('light')
      html.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      html.classList.remove('light')
      html.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    }

    this._updateThemeIcon()
    
    // Emit theme change event
    window.__app?.events?.emit('theme:changed', { 
      theme: isDark ? 'light' : 'dark' 
    })
  },

  _updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark')
    const sunIcon = this._app?.querySelector('#theme-icon-sun')
    const moonIcon = this._app?.querySelector('#theme-icon-moon')

    if (isDark) {
      // Dark mode = show sun icon (click to switch to light)
      sunIcon?.classList.remove('hidden')
      moonIcon?.classList.add('hidden')
    } else {
      // Light mode = show moon icon (click to switch to dark)
      sunIcon?.classList.add('hidden')
      moonIcon?.classList.remove('hidden')
    }
  },

  /**
   * Update page title dynamically
   */
  updateTitle(title) {
    const titleEl = this._app?.querySelector('h1')
    if (titleEl) {
      titleEl.textContent = title
    }
  },

  /**
   * Show notification badge
   */
  setNotificationCount(count) {
    const badge = this._app?.querySelector('#notif-btn span')
    if (badge) {
      if (count > 0) {
        badge.classList.remove('hidden')
        badge.textContent = count > 99 ? '99+' : count
      } else {
        badge.classList.add('hidden')
      }
    }
  }
}