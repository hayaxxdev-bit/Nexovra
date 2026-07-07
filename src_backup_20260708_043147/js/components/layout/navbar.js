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

  navbar.innerHTML = `
    <button id="mobile-menu-btn" class="lg:hidden btn btn-ghost btn-sm p-2 mr-2 -ml-1" aria-label="Buka menu">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <div class="flex-1 min-w-0">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">${title}</h2>
    </div>
    <div class="flex items-center gap-2">
      <a href="/transactions/new" class="btn btn-primary btn-sm inline-flex" aria-label="Tambah transaksi">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden md:inline">Transaksi</span>
      </a>
      <button id="theme-toggle" class="btn btn-ghost btn-sm p-2 rounded-lg" title="Toggle tema">
        <svg id="theme-icon-light" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg id="theme-icon-dark" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      <div class="relative" id="user-menu-container">
        <button id="user-menu-btn" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div id="navbar-avatar" class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium text-xs shrink-0">U</div>
          <span id="navbar-username" class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">User</span>
        </button>
      </div>
    </div>
  `
  // Catatan: listener tombol hamburger TIDAK dipasang di sini lagi,
  // cukup sekali di _setupEvents()
},

_setupEvents() {
  const mobileBtn = this._app.querySelector('#mobile-menu-btn')
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => Sidebar.openMobile())
  }

  const themeBtn = this._app.querySelector('#theme-toggle')
  if (themeBtn) {
    themeBtn.addEventListener('click', () => this._toggleTheme())
    this._updateThemeIcon()
  }
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