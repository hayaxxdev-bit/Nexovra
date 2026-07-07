import { AuthService } from '@services/auth.service.js'
import { Toast } from '@components/ui/toast.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Modal } from '@components/ui/modal.js'
import { supabase } from '@services/supabase.js'

/**
 * Settings Page - Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  let profile = null
  try {
    profile = await AuthService.getProfile()
  } catch (e) {
    console.warn('Failed to load profile')
  }

  const user = window.__app.store.getState('auth.user')
  const isDark = document.documentElement.classList.contains('dark')

  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-96 h-96 bg-purple-600/5 dark:bg-purple-600/8 rounded-full blur-[128px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/8 rounded-full blur-[128px] -z-10"></div>

      <!-- Header -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Pengaturan
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Atur preferensi aplikasi Anda</p>
          </div>
        </div>
      </div>

      <!-- Profile Section -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Profil</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Lengkap</label>
              <input type="text" id="settings-name" 
                     class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-sm" 
                     value="${profile?.full_name || ''}" 
                     placeholder="Masukkan nama lengkap" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" 
                     class="w-full px-4 py-3 bg-gray-100 dark:bg-[#0a0a0f] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm" 
                     value="${user?.email || ''}" disabled />
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Email tidak dapat diubah</p>
            </div>
            <button id="save-profile" 
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Simpan Profil
            </button>
          </div>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Tampilan</h3>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a24] rounded-2xl">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ubah tema gelap/terang sesuai preferensi</p>
            </div>
            <button id="toggle-theme-btn" 
                    class="relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2
                           ${isDark 
                             ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/20' 
                             : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/20'}">
              ${isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      <!-- Data Section -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Data</h3>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Backup dan restore data keuangan Anda dengan aman</p>
          <div class="flex flex-wrap gap-3">
            <button id="export-data-btn" 
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data (JSON)
            </button>
            <button id="import-data-btn" 
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Data (JSON)
            </button>
            <input type="file" id="import-file-input" class="hidden" accept=".json" />
          </div>
        </div>
      </div>

      <!-- Account Section -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-red-200 dark:border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="font-semibold text-red-600 dark:text-red-400">Akun</h3>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Kelola akun Anda. Tindakan ini tidak dapat dibatalkan.</p>
          <div class="flex flex-wrap gap-3">
            <button id="logout-btn" 
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar dari Aplikasi
            </button>
            <button id="delete-account-btn" 
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-600 dark:border-red-500/30 text-white dark:text-red-400 rounded-xl text-sm font-medium transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus Akun Permanen
            </button>
          </div>
        </div>
      </div>

      <!-- App Info -->
      <div class="text-center pb-8">
        <p class="text-xs text-gray-400 dark:text-gray-600">
          Nexovra v1.0.0 • Hayaxxdev-bit
        </p>
      </div>
    </div>

    <style>
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.4s ease-out;
      }
    </style>
  `

  setupEventListeners(container, profile)
}

function setupEventListeners(container, profile) {
  // Save profile
  container.querySelector('#save-profile')?.addEventListener('click', async () => {
    const btn = container.querySelector('#save-profile')
    const name = container.querySelector('#settings-name')?.value?.trim()
    
    if (!name) {
      Toast.warning('Nama tidak boleh kosong')
      return
    }

    btn.disabled = true
    const originalHTML = btn.innerHTML
    btn.innerHTML = `
      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Menyimpan...
    `

    try {
      await AuthService.updateProfile({ full_name: name })
      Toast.success('✅ Profil berhasil disimpan!')
      // Update sidebar & navbar profile
      if (window.__app.sidebar) window.__app.sidebar.updateProfile({ full_name: name })
      if (window.__app.navbar) window.__app.navbar.updateProfile({ full_name: name })
    } catch (error) {
      Toast.error('❌ Gagal menyimpan: ' + error.message)
    } finally {
      btn.disabled = false
      btn.innerHTML = originalHTML
    }
  })

  // Toggle theme
  container.querySelector('#toggle-theme-btn')?.addEventListener('click', () => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    if (isDark) {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    }
    window.__app.events.emit('theme:changed', { theme: isDark ? 'light' : 'dark' })
    window.__app.router.navigate('/settings', true)
  })

  // Logout
  container.querySelector('#logout-btn')?.addEventListener('click', async () => {
    const confirmed = await ConfirmDialog.logout()
    if (confirmed) {
      await AuthService.logout()
      window.__app.router.navigate('/login')
    }
  })

  // Delete account
  container.querySelector('#delete-account-btn')?.addEventListener('click', () => {
    showDeleteAccountModal()
  })

  // Export data
  container.querySelector('#export-data-btn')?.addEventListener('click', async () => {
    await exportUserData()
  })

  // Import data
  container.querySelector('#import-data-btn')?.addEventListener('click', () => {
    container.querySelector('#import-file-input')?.click()
  })

  container.querySelector('#import-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await importUserData(file)
    e.target.value = ''
  })
}

/**
 * Show delete account confirmation modal
 */
function showDeleteAccountModal() {
  Modal.show({
    title: '⚠️ Hapus Akun Permanen',
    size: 'md',
    confirmText: 'Ya, Hapus Akun Saya',
    confirmClass: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25',
    content: `
      <div class="space-y-5">
        <div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p class="text-red-700 dark:text-red-300 text-sm font-semibold mb-2">
                Peringatan! Tindakan ini tidak dapat dibatalkan!
              </p>
              <ul class="text-red-600 dark:text-red-400 text-xs space-y-1.5 list-disc list-inside">
                <li>Semua data keuangan Anda akan dihapus permanen</li>
                <li>Semua akun, transaksi, dan kategori akan hilang</li>
                <li>Data tidak dapat dikembalikan setelah dihapus</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Untuk mengkonfirmasi, ketik <strong class="text-red-600 dark:text-red-400">HAPUS</strong> di bawah ini:
          </p>
          <input 
            type="text" 
            id="delete-confirm-input" 
            class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-center font-bold text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-300" 
            placeholder="Ketik HAPUS"
            autocomplete="off"
          />
          <p id="delete-error" class="text-red-500 text-xs mt-2 hidden"></p>
        </div>
      </div>
    `,
    onConfirm: async () => {
      const input = document.querySelector('#delete-confirm-input')
      const errorEl = document.querySelector('#delete-error')
      
      if (!input || input.value.trim() !== 'HAPUS') {
        if (errorEl) {
          errorEl.textContent = 'Ketik HAPUS (huruf besar semua) untuk mengkonfirmasi'
          errorEl.classList.remove('hidden')
        }
        throw new Error('Konfirmasi tidak valid')
      }

      await deleteUserAccount()
    },
  })

  setTimeout(() => {
    document.querySelector('#delete-confirm-input')?.focus()
  }, 200)
}

/**
 * Delete user account and all associated data
 */
async function deleteUserAccount() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Tidak dapat memverifikasi akun')

    Modal.close()
    Modal.close()
    await new Promise(resolve => setTimeout(resolve, 100))

    Modal.loading('Menghapus akun...')

    const tables = [
      'activity_logs', 'reminders', 'attachments',
      'transaction_details', 'transactions', 'todos',
      'daily_notes', 'journals', 'categories',
      'accounts', 'settings', 'profiles',
    ]

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', user.id)
      if (error) console.warn(`Gagal hapus ${table}:`, error)
    }

    const { error: rpcError } = await supabase.rpc('delete_current_user')
    if (rpcError) {
      console.error('RPC Error:', rpcError)
      throw new Error('Gagal menghapus akun: ' + rpcError.message)
    }

    await supabase.auth.signOut({ scope: 'global' })
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
    
    sessionStorage.clear()

    Modal.close()
    Modal.close()
    document.querySelectorAll('[id^="modal-"]').forEach(el => el.remove())
    document.body.style.overflow = ''

    window.__app.store.setState('auth.user', null)
    window.__app.store.setState('auth.session', null)

    Toast.success('Akun berhasil dihapus')

    setTimeout(() => {
      window.location.replace('/login')
    }, 800)

  } catch (error) {
    Modal.close()
    Modal.close()
    document.querySelectorAll('[id^="modal-"]').forEach(el => el.remove())
    document.body.style.overflow = ''
    
    console.error('Delete account error:', error)
    Toast.error('Gagal menghapus akun: ' + error.message)
  }
}

/**
 * Export all user data as JSON
 */
async function exportUserData() {
  try {
    Toast.info('Mengexport data...')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User tidak ditemukan')

    const tables = ['accounts', 'categories', 'transactions', 'journals', 'daily_notes', 'todos']
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userEmail: user.email,
      data: {},
    }

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', user.id)
      if (!error) {
        exportData.data[table] = data
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Nexovra_Backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    Toast.success('✅ Data berhasil di-export!')
  } catch (error) {
    console.error('Export error:', error)
    Toast.error('❌ Gagal export: ' + error.message)
  }
}

/**
 * Import user data from JSON file
 */
async function importUserData(file) {
  try {
    const text = await file.text()
    const importData = JSON.parse(text)

    if (!importData.data) {
      throw new Error('Format file tidak valid')
    }

    const confirmed = await ConfirmDialog.custom({
      title: 'Import Data',
      message: 'Data yang diimport akan ditambahkan ke data yang sudah ada. Lanjutkan?',
      confirmText: 'Ya, Import',
      cancelText: 'Batal',
      variant: 'warning',
    })

    if (!confirmed) return

    Toast.info('Mengimport data...')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User tidak ditemukan')

    const tableOrder = ['categories', 'accounts', 'transactions']

    for (const table of tableOrder) {
      const records = importData.data[table]
      if (!records || records.length === 0) continue

      const cleanRecords = records.map(r => {
        const { id, created_at, updated_at, user_id, ...rest } = r
        return { ...rest, user_id: user.id }
      })

      const batchSize = 50
      for (let i = 0; i < cleanRecords.length; i += batchSize) {
        const batch = cleanRecords.slice(i, i + batchSize)
        const { error } = await supabase.from(table).insert(batch)
        if (error) {
          console.warn(`Import ${table} batch ${i} error:`, error)
        }
      }
    }

    Toast.success('✅ Data berhasil di-import! Refresh halaman untuk melihat perubahan.')
    
    setTimeout(() => window.__app.router.navigate('/settings', true), 1000)

  } catch (error) {
    console.error('Import error:', error)
    Toast.error('❌ Gagal import: ' + error.message)
  }
}