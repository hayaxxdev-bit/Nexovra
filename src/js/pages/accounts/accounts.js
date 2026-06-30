import { AccountService } from '@services/account.service.js'
import { AccountCard } from '@components/cards/account-card.js'
import { Modal } from '@components/ui/modal.js'
import { Toast } from '@components/ui/toast.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { EmptyState } from '@components/ui/empty-state.js'
import { formatCurrency } from '@core/utils.js'

/**
 * Accounts Page - Daftar & Kelola Akun
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Akun Saya</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Kelola semua akun dan wallet Anda</p>
        </div>
        <button id="add-account-btn" type="button" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Akun
        </button>
      </div>

      <!-- Summary Cards -->
      <div id="summary-cards" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        ${Skeleton.statCard()}${Skeleton.statCard()}${Skeleton.statCard()}${Skeleton.statCard()}
      </div>

      <!-- Accounts Grid -->
      <div id="accounts-grid">
        ${Array(4).fill('').map(() => Skeleton.accountCard()).join('')}
      </div>
    </div>
  `

  await loadAccounts(container)
  setupEventListeners(container)
}

async function loadAccounts(container) {
  try {
    const [accounts, summary] = await Promise.all([
      AccountService.getAll({ includeInactive: false }),
      AccountService.getSummary(),
    ])

    renderAccounts(container, accounts)
    renderSummary(container, summary, accounts)
  } catch (error) {
    console.error('Failed to load accounts:', error)
    Toast.error('Gagal memuat data akun: ' + error.message)
  }
}

function renderSummary(container, summary, accounts) {
  const summaryCards = container.querySelector('#summary-cards')
  if (!summaryCards) return

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.current_balance || 0), 0)
  const activeAccounts = accounts.filter(a => a.is_active).length
  const totalAccounts = accounts.length

  const cards = [
    { label: 'Total Aset', value: formatCurrency(totalBalance), icon: '💰', color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' },
    { label: 'Akun Aktif', value: activeAccounts, icon: '✅', color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' },
    { label: 'Total Akun', value: totalAccounts, icon: '🏦', color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800' },
    { label: 'Jenis Akun', value: summary?.length || 0, icon: '📱', color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' },
  ]

  summaryCards.innerHTML = cards.map(card => `
    <div class="card ${card.color} border p-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">${card.icon}</span>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">${card.label}</span>
      </div>
      <p class="text-lg font-bold text-gray-900 dark:text-gray-100">${card.value}</p>
    </div>
  `).join('')
}

function renderAccounts(container, accounts) {
  const grid = container.querySelector('#accounts-grid')
  if (!grid) return

  if (!accounts || accounts.length === 0) {
    grid.innerHTML = EmptyState.getHTML({
      type: 'accounts',
      icon: '🏦',
      title: 'Belum Ada Akun',
      message: 'Buat akun pertama Anda untuk mulai mengelola keuangan.',
      action: { text: 'Tambah Akun', onClick: 'document.getElementById("add-account-btn")?.click()' },
    })
    return
  }

  grid.innerHTML = accounts.map(account => AccountCard.render(account)).join('')
}

function setupEventListeners(container) {
  // Add account button
  const addBtn = container.querySelector('#add-account-btn')
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      showAccountForm(container)
    })
  }

  // Re-attach empty state button jika ada
  const emptyBtn = container.querySelector('[onclick]')
  if (emptyBtn) {
    const fn = emptyBtn.getAttribute('onclick')
    if (fn) {
      emptyBtn.removeAttribute('onclick')
      emptyBtn.addEventListener('click', (e) => {
        e.preventDefault()
        showAccountForm(container)
      })
    }
  }
}

async function showAccountForm(container, account = null) {
  let accountTypes = []
  try {
    accountTypes = await AccountService.getAccountTypes()
  } catch (error) {
    console.warn('Failed to load account types:', error)
    accountTypes = [
      { id: 1, name: 'Cash', icon: 'banknotes' },
      { id: 2, name: 'Bank', icon: 'building-bank' },
      { id: 3, name: 'E-Wallet', icon: 'device-mobile' },
      { id: 4, name: 'Tabungan', icon: 'piggy-bank' },
      { id: 7, name: 'Lainnya', icon: 'wallet' },
    ]
  }

  const isEdit = !!account

  const typeOptions = accountTypes.map(t => `
    <option value="${t.id}" ${account?.account_type_id === t.id || account?.account_type?.id === t.id ? 'selected' : ''}>
      ${getAccountTypeEmoji(t.icon)} ${t.name}
    </option>
  `).join('')

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
  ]

  const currentColor = account?.color || '#3B82F6'

  Modal.show({
    title: isEdit ? 'Edit Akun' : 'Tambah Akun Baru',
    size: 'md',
    confirmText: isEdit ? 'Simpan Perubahan' : 'Buat Akun',
    content: `
      <form id="account-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nama Akun <span class="text-red-500">*</span>
          </label>
          <input type="text" id="account-name" class="input" 
                 placeholder="Contoh: BCA, Dompet Cash, DANA"
                 value="${account?.name || ''}" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Jenis Akun
          </label>
          <select id="account-type" class="input">${typeOptions}</select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            ${isEdit ? 'Saldo Saat Ini' : 'Saldo Awal'}
          </label>
          <input type="number" id="account-balance" class="input" 
                 placeholder="0" value="${account?.initial_balance || account?.current_balance || 0}"
                 step="0.01" ${isEdit ? 'readonly' : ''} />
          ${isEdit ? '<p class="text-xs text-gray-400 mt-1">Saldo tidak dapat diubah langsung.</p>' : ''}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Warna</label>
          <div class="flex flex-wrap gap-2">
            ${colors.map(c => `
              <button type="button" 
                      class="color-option w-8 h-8 rounded-full border-2 transition-all ${currentColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}"
                      style="background-color: ${c}"
                      data-color="${c}">
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="account-color" value="${currentColor}" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan</label>
          <textarea id="account-notes" class="input min-h-[80px]" rows="2" 
                    placeholder="Catatan opsional...">${account?.notes || account?.description || ''}</textarea>
        </div>
      </form>
    `,
    onConfirm: async () => {
      const name = document.querySelector('#account-name')?.value?.trim()
      const typeId = document.querySelector('#account-type')?.value
      const balance = parseFloat(document.querySelector('#account-balance')?.value || '0')
      const color = document.querySelector('#account-color')?.value
      const notes = document.querySelector('#account-notes')?.value?.trim()

      if (!name) {
        Toast.warning('Nama akun wajib diisi')
        throw new Error('Validation failed')
      }

      const data = {
        name,
        account_type_id: parseInt(typeId),
        color,
        notes,
      }

      if (isEdit) {
        await AccountService.update(account.id, data)
        Toast.success('Akun berhasil diperbarui!')
      } else {
        data.initial_balance = balance
        await AccountService.create(data)
        Toast.success('Akun baru berhasil dibuat!')
      }

      await loadAccounts(document.getElementById('content-area'))
    },
  })

  // Setup color picker
  setTimeout(() => {
    document.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color
        document.querySelector('#account-color').value = color
        document.querySelectorAll('.color-option').forEach(b => {
          b.classList.remove('border-gray-900', 'dark:border-white', 'scale-110')
        })
        btn.classList.add('border-gray-900', 'dark:border-white', 'scale-110')
      })
    })
  }, 100)
}

function getAccountTypeEmoji(icon) {
  const map = {
    banknotes: '💵', 'building-bank': '🏦', 'device-mobile': '📱',
    'piggy-bank': '🐷', 'trending-up': '📈', briefcase: '💼', wallet: '👛',
  }
  return map[icon] || '💰'
}