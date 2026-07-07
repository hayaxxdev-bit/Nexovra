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
 * Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-96 h-96 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[128px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[128px] -z-10"></div>

      <!-- Header -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Akun Saya
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Kelola semua akun dan wallet Anda</p>
          </div>
          <button id="add-account-btn" type="button" 
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Akun
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div id="summary-cards" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${Array(4).fill('').map(() => `
          <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 animate-pulse relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
            <div class="flex items-center gap-2 mb-3">
              <div class="skeleton w-8 h-8 rounded-xl"></div>
              <div class="skeleton h-3 w-16 rounded-lg"></div>
            </div>
            <div class="skeleton h-7 w-28 rounded-lg mb-2"></div>
          </div>
        `).join('')}
      </div>

      <!-- Accounts Grid -->
      <div id="accounts-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${Array(6).fill('').map(() => Skeleton.accountCard()).join('')}
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
    { 
      label: 'Total Aset', 
      value: formatCurrency(totalBalance), 
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      color: 'blue',
      gradient: 'from-blue-500/10 to-blue-600/5',
      borderGlow: 'via-blue-500/30',
      iconBg: 'bg-blue-100 dark:bg-blue-500/10',
      iconText: 'text-blue-600 dark:text-blue-400',
    },
    { 
      label: 'Akun Aktif', 
      value: activeAccounts, 
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      color: 'green',
      gradient: 'from-teal-500/10 to-green-600/5',
      borderGlow: 'via-teal-500/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/10',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    { 
      label: 'Total Akun', 
      value: totalAccounts, 
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`,
      color: 'purple',
      gradient: 'from-purple-500/10 to-indigo-600/5',
      borderGlow: 'via-purple-500/30',
      iconBg: 'bg-purple-100 dark:bg-purple-500/10',
      iconText: 'text-purple-600 dark:text-purple-400',
    },
    { 
      label: 'Jenis Akun', 
      value: summary?.length || 0, 
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`,
      color: 'amber',
      gradient: 'from-amber-500/10 to-yellow-600/5',
      borderGlow: 'via-amber-500/30',
      iconBg: 'bg-amber-100 dark:bg-amber-500/10',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
  ]

  summaryCards.innerHTML = cards.map(card => `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700/50 hover:scale-[1.02] transition-all duration-300">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent ${card.borderGlow} to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl ${card.iconBg} ${card.iconText} flex items-center justify-center shadow-sm">
            ${card.icon}
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">${card.label}</span>
        </div>
        <p class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          ${card.value}
        </p>
      </div>
    </div>
  `).join('')
}

function renderAccounts(container, accounts) {
  const grid = container.querySelector('#accounts-grid')
  if (!grid) return

if (!accounts || accounts.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full flex items-center justify-center min-h-[400px]">
        ${EmptyState.getHTML({
          type: 'accounts',
          icon: `<svg class="w-20 h-20 text-purple-500 dark:text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`,
          title: 'Belum Ada Akun',
          message: 'Buat akun pertama Anda untuk mulai mengelola keuangan dengan Nexovra.',
          action: { text: 'Tambah Akun', onClick: 'document.getElementById("add-account-btn")?.click()' },
        })}
      </div>
    `
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

  // Re-attach empty state button
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
    '#a855f7', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444',
    '#ec4899', '#06b6d4', '#f97316', '#10b981', '#8b5cf6',
  ]

  const currentColor = account?.color || '#a855f7'

  Modal.show({
    title: isEdit ? 'Edit Akun' : 'Tambah Akun Baru',
    size: 'md',
    confirmText: isEdit ? 'Simpan Perubahan' : 'Buat Akun',
    content: `
      <form id="account-form" class="space-y-5">
        <!-- Account Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Akun <span class="text-red-400">*</span>
          </label>
          <input type="text" id="account-name" 
                 class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" 
                 placeholder="Contoh: BCA, Dompet Cash, DANA"
                 value="${account?.name || ''}" required />
        </div>

        <!-- Account Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jenis Akun
          </label>
          <select id="account-type" 
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300">
            ${typeOptions}
          </select>
        </div>

        <!-- Balance -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${isEdit ? 'Saldo Saat Ini' : 'Saldo Awal'}
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">Rp</span>
            <input type="number" id="account-balance" 
                   class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" 
                   placeholder="0" value="${account?.initial_balance || account?.current_balance || 0}"
                   step="0.01" ${isEdit ? 'readonly' : ''} />
          </div>
          ${isEdit ? '<p class="text-xs text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Saldo tidak dapat diubah langsung.</p>' : ''}
        </div>

        <!-- Color Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Warna Akun
          </label>
          <div class="flex flex-wrap gap-3">
            ${colors.map(c => `
              <button type="button" 
                      class="color-option w-10 h-10 rounded-xl border-2 transition-all duration-200 relative ${currentColor === c ? 'border-gray-900 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:shadow-md'}"
                      style="background-color: ${c}"
                      data-color="${c}">
                ${currentColor === c ? '<svg class="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>' : ''}
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="account-color" value="${currentColor}" />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catatan
          </label>
          <textarea id="account-notes" 
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 min-h-[80px] resize-none" 
                    rows="2" 
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
        Toast.success('✅ Akun berhasil diperbarui!')
      } else {
        data.initial_balance = balance
        await AccountService.create(data)
        Toast.success('🎉 Akun baru berhasil dibuat!')
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
        
        // Reset all buttons
        document.querySelectorAll('.color-option').forEach(b => {
          b.classList.remove('border-gray-900', 'dark:border-white', 'scale-110', 'shadow-lg')
          const checkIcon = b.querySelector('svg')
          if (checkIcon) checkIcon.remove()
        })
        
        // Set active button
        btn.classList.add('border-gray-900', 'dark:border-white', 'scale-110', 'shadow-lg')
        btn.insertAdjacentHTML('beforeend', 
          '<svg class="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>'
        )
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