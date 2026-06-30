import { AuthService } from '@services/auth.service.js'
import { Toast } from '@components/ui/toast.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Modal } from '@components/ui/modal.js'
import { supabase } from '@services/supabase.js'

/**
 * Settings Page
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
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Atur preferensi aplikasi</p>
      </div>

      <!-- Profil -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Profil</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</label>
            <input type="text" id="settings-name" class="input" value="${profile?.full_name || ''}" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" class="input" value="${user?.email || ''}" disabled />
          </div>
          <button id="save-profile" class="btn btn-primary btn-sm">Simpan Profil</button>
        </div>
      </div>

      <!-- Tema -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Tampilan</h3>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p class="text-xs text-gray-500">Ubah tema gelap/terang</p>
          </div>
          <button id="toggle-theme-btn" class="btn btn-secondary btn-sm">
            ${isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      <!-- Backup & Restore -->
      <div class="card p-6">
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Data</h3>
        <p class="text-sm text-gray-500 mb-4">Backup dan restore data keuangan Anda</p>
        <div class="flex flex-wrap gap-3">
          <button id="export-data-btn" class="btn btn-secondary btn-sm">
            📥 Export Data (JSON)
          </button>
          <button id="import-data-btn" class="btn btn-secondary btn-sm">
            📤 Import Data (JSON)
          </button>
          <input type="file" id="import-file-input" class="hidden" accept=".json" />
        </div>
      </div>

      <!-- Logout -->
      <div class="card p-6 border-red-200 dark:border-red-800">
        <h3 class="font-semibold text-red-600 mb-4">Akun</h3>
        <div class="flex flex-wrap gap-3">
          <button id="logout-btn" class="btn btn-danger btn-sm">
            🚪 Keluar dari Aplikasi
          </button>
          <button id="delete-account-btn" class="btn btn-danger btn-sm bg-red-700 hover:bg-red-800">
            ⚠️ Hapus Akun Permanen
          </button>
        </div>
      </div>
    </div>
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
    btn.textContent = 'Menyimpan...'

    try {
      await AuthService.updateProfile({ full_name: name })
      Toast.success('Profil berhasil disimpan!')
    } catch (error) {
      Toast.error('Gagal menyimpan: ' + error.message)
    } finally {
      btn.disabled = false
      btn.textContent = 'Simpan Profil'
    }
  })

  // Toggle theme
  container.querySelector('#toggle-theme-btn')?.addEventListener('click', () => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
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
    e.target.value = '' // Reset
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
    confirmClass: 'btn-danger',
    content: `
      <div class="space-y-4">
        <div class="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p class="text-red-700 dark:text-red-300 text-sm font-medium mb-2">
            ⚠️ Peringatan! Tindakan ini tidak dapat dibatalkan!
          </p>
          <ul class="text-red-600 dark:text-red-400 text-xs space-y-1 list-disc list-inside">
            <li>Semua data keuangan Anda akan dihapus permanen</li>
            <li>Semua akun, transaksi, dan kategori akan hilang</li>
            <li>Data tidak dapat dikembalikan</li>
          </ul>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Untuk mengkonfirmasi, ketik <strong>HAPUS</strong> di bawah ini:
        </p>
        
        <input 
          type="text" 
          id="delete-confirm-input" 
          class="input text-center font-bold text-lg" 
          placeholder="Ketik HAPUS"
          autocomplete="off"
        />

        <p id="delete-error" class="text-red-500 text-sm hidden"></p>
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

      // Proses hapus akun
      await deleteUserAccount()
    },
  })

  // Focus input setelah modal muncul
  setTimeout(() => {
    document.querySelector('#delete-confirm-input')?.focus()
  }, 200)
}

/**
 * Delete user account and all associated data
 */
/**
 * Delete user account and all associated data
 */
async function deleteUserAccount() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Tidak dapat memverifikasi akun')

    // Tutup semua modal
    Modal.close()
    Modal.close()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Tampilkan loading
    Modal.loading('Menghapus akun...')

    // 1. Hapus semua data dari tabel
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

    // 2. Panggil RPC untuk hapus user dari auth.users
    const { error: rpcError } = await supabase.rpc('delete_current_user')
    if (rpcError) {
      console.error('RPC Error:', rpcError)
      throw new Error('Gagal menghapus akun: ' + rpcError.message)
    }

    // 3. FORCE LOGOUT — hapus session dari Supabase
    await supabase.auth.signOut({ scope: 'global' })
    
    // 4. Bersihkan localStorage Supabase
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
    
    // 5. Hapus session storage
    sessionStorage.clear()

    // Tutup loading modal
    Modal.close()
    Modal.close()
    document.querySelectorAll('[id^="modal-"]').forEach(el => el.remove())
    document.body.style.overflow = ''

    // 6. Clear global state
    window.__app.store.setState('auth.user', null)
    window.__app.store.setState('auth.session', null)

    Toast.success('Akun berhasil dihapus')

    // 7. Force redirect ke login (dengan replace agar tidak bisa back)
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

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `FinanceOS_Backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    Toast.success('Data berhasil di-export!')
  } catch (error) {
    console.error('Export error:', error)
    Toast.error('Gagal export: ' + error.message)
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

    const confirmed = await ConfirmDialog.confirm({
      title: 'Import Data',
      message: 'Data yang diimport akan ditambahkan ke data yang sudah ada. Lanjutkan?',
      confirmText: 'Ya, Import',
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

      // Replace user_id with current user
      const cleanRecords = records.map(r => {
        const { id, created_at, updated_at, user_id, ...rest } = r
        return { ...rest, user_id: user.id }
      })

      // Insert in batches
      const batchSize = 50
      for (let i = 0; i < cleanRecords.length; i += batchSize) {
        const batch = cleanRecords.slice(i, i + batchSize)
        const { error } = await supabase.from(table).insert(batch)
        if (error) {
          console.warn(`Import ${table} batch ${i} error:`, error)
        }
      }
    }

    Toast.success('Data berhasil di-import! Refresh halaman untuk melihat perubahan.')
    
    // Reload after 1 second
    setTimeout(() => window.__app.router.navigate('/settings', true), 1000)

  } catch (error) {
    console.error('Import error:', error)
    Toast.error('Gagal import: ' + error.message)
  }
}