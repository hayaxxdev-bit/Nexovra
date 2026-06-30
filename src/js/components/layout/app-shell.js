import { AuthService } from '@services/auth.service.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Toast } from '@components/ui/toast.js'

/**
 * App Shell - Main Layout Wrapper
 * Menyediakan struktur: Sidebar | Navbar | Content Area
 */
export const AppShell = {
  /**
   * Get shell HTML structure
   * @returns {string}
   */
  getShellHTML() {
    return `
      <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <!-- Sidebar -->
        <aside id="sidebar" class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-[260px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300">
          <!-- Sidebar content will be injected by sidebar.js -->
        </aside>

        <!-- Mobile sidebar overlay -->
        <div id="sidebar-overlay" class="hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"></div>

        <!-- Main Content -->
        <div class="flex flex-col flex-1 lg:pl-[260px]">
          <!-- Navbar -->
          <header id="navbar" class="sticky top-0 z-20 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 flex items-center px-4 lg:px-6">
            <!-- Navbar content will be injected by navbar.js -->
          </header>

          <!-- Content Area -->
          <main id="content-area" class="flex-1 overflow-y-auto p-4 lg:p-6">
            <!-- Page content injected here -->
          </main>
        </div>
      </div>
    `
  },

  /**
   * Initialize layout (sidebar + navbar)
   * @param {HTMLElement} appElement
   * @param {Object} params - Route params
   */
  async initializeLayout(appElement, params = {}) {
    const sidebarModule = await import('@components/layout/sidebar.js')
    sidebarModule.Sidebar.init(appElement)
    window.__app.sidebar = sidebarModule.Sidebar

    const navbarModule = await import('@components/layout/navbar.js')
    navbarModule.Navbar.init(appElement)

    try {
      const profile = await AuthService.getProfile()
      window.__app.store.setState('profile', profile)
      sidebarModule.Sidebar.updateProfile(profile)
      navbarModule.Navbar.updateProfile(profile)
    } catch (error) {
      console.warn('Failed to load profile:', error)
      
      // Jika error karena user tidak ada → force logout
      if (error?.message?.includes('JWT') || error?.message?.includes('does not exist')) {
        const { AuthService } = await import('@services/auth.service.js')
        await AuthService.logout()
        window.__app.router.navigate('/login', true)
        return
      }
    }
  },
}