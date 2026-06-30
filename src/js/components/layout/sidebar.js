import { AuthService } from '@services/auth.service.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Toast } from '@components/ui/toast.js'

export const Sidebar = {
  _app: null,
  _isOpen: false,

  init(appElement) {
    this._app = appElement
    this._render()
    this._setupEvents()
  },

  _render() {
    const sidebar = this._app.querySelector('#sidebar')
    if (!sidebar) return

    const currentPath = window.location.pathname

    const menuItems = [
      { label: 'Dashboard', icon: 'dashboard', href: '/', active: currentPath === '/' },
      { label: 'Akun', icon: 'accounts', href: '/accounts', active: currentPath.startsWith('/accounts') },
      { label: 'Transaksi', icon: 'transactions', href: '/transactions', active: currentPath.startsWith('/transactions') },
      { label: 'Transfer', icon: 'transfer', href: '/transfer', active: currentPath === '/transfer' },
      { label: 'Buku Kas', icon: 'cashbook', href: '/cashbook', active: currentPath === '/cashbook' },
    ]

    const bottomItems = [
      { label: 'Laporan', icon: 'reports', href: '/reports', active: currentPath === '/reports' },
      { label: 'Pengaturan', icon: 'settings', href: '/settings', active: currentPath === '/settings' },
    ]

    sidebar.innerHTML = `
      <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800 h-16 shrink-0">
        <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <span class="text-white font-bold text-lg">Nexovra</span>
        </div>
        <div>
          <h1 class="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">Nexovra</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 leading-tight">Manajemen Keuangan</p>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Menu Utama</p>
        ${menuItems.map(item => this._getMenuItemHTML(item)).join('')}
        <div class="my-4 border-t border-gray-200 dark:border-gray-800"></div>
        <p class="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Lainnya</p>
        ${bottomItems.map(item => this._getMenuItemHTML(item)).join('')}
      </nav>
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <div id="sidebar-profile" class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium text-sm shrink-0">U</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Loading...</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">...</p>
          </div>
          <button id="sidebar-logout" class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Keluar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    `
  },

  _getMenuItemHTML(item) {
    const iconSVGs = {
      dashboard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
      accounts: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>`,
      transactions: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4V2m0 0v2m0-2h10M7 4h10m0 0v2m0-2v2M4 7h16M4 7v10a3 3 0 003 3h10a3 3 0 003-3V7H4z" /></svg>`,
      transfer: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>`,
      cashbook: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
      reports: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
      settings: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    }

    const isActive = item.active

    return `
      <a href="${item.href}" 
         class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }">
        <span class="shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}">${iconSVGs[item.icon] || '📄'}</span>
        <span class="text-sm">${item.label}</span>
        ${isActive ? '<span class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></span>' : ''}
      </a>
    `
  },

  _setupEvents() {
    const logoutBtn = this._app.querySelector('#sidebar-logout')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const confirmed = await ConfirmDialog.logout()
        if (confirmed) {
          try {
            await AuthService.logout()
            Toast.success('Berhasil keluar')
            window.__app.router.navigate('/login')
          } catch (error) {
            Toast.error('Gagal keluar: ' + error.message)
          }
        }
      })
    }

    const overlay = this._app.querySelector('#sidebar-overlay')
    if (overlay) {
      overlay.addEventListener('click', () => this._toggleMobile())
    }
  },

  updateProfile(profile) {
    const profileEl = this._app.querySelector('#sidebar-profile')
    if (!profileEl) return

    const nameEl = profileEl.querySelector('p')
    const emailEl = profileEl.querySelectorAll('p')[1]
    const avatarEl = profileEl.querySelector('.rounded-full')

    if (nameEl && profile?.full_name) nameEl.textContent = profile.full_name
    if (emailEl) {
      const user = window.__app.store.getState('auth.user')
      emailEl.textContent = user?.email || ''
    }
    if (avatarEl && profile?.full_name) {
      const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      avatarEl.textContent = initials
    }
  },

    /**
   * Toggle mobile sidebar
   */
  _toggleMobile() {
    const sidebar = this._app.querySelector('#sidebar')
    const overlay = this._app.querySelector('#sidebar-overlay')
    
    this._isOpen = !this._isOpen
    
    if (this._isOpen) {
      // Show sidebar
      sidebar?.classList.remove('hidden')
      sidebar?.classList.add('fixed', 'inset-y-0', 'left-0', 'z-50', 'w-[280px]', 'shadow-2xl')
      overlay?.classList.remove('hidden')
      document.body.style.overflow = 'hidden'
    } else {
      // Hide sidebar
      sidebar?.classList.add('hidden')
      sidebar?.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-50', 'w-[280px]', 'shadow-2xl')
      overlay?.classList.add('hidden')
      document.body.style.overflow = ''
    }
  },

  /**
   * Open mobile sidebar (called from navbar hamburger)
   */
  openMobile() {
    this._isOpen = false // Reset dulu biar toggle jadi true
    this._toggleMobile()
  },

  /**
   * Close sidebar when route changes (mobile)
   */
  closeMobile() {
    if (this._isOpen) {
      this._isOpen = true
      this._toggleMobile()
    }
  },
}