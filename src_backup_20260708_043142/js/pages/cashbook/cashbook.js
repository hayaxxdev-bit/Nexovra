import { TransactionService } from '@services/transaction.service.js'
import { AccountService } from '@services/account.service.js'
import { Toast } from '@components/ui/toast.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { EmptyState } from '@components/ui/empty-state.js'
import { formatCurrency, formatDate } from '@core/utils.js'

/**
 * Cashbook Page - Buku Kas dengan Running Balance
 * Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-96 h-96 bg-emerald-600/5 dark:bg-emerald-600/8 rounded-full blur-[128px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[128px] -z-10"></div>

      <!-- Header -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Buku Kas
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Catatan arus kas dengan saldo berjalan</p>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-4 relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
        <div class="relative flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <select id="cashbook-account" 
                    class="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm">
              <option value="">Pilih Akun...</option>
            </select>
            <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input type="date" id="cashbook-start" 
                     class="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-300" />
            </div>
            <span class="text-gray-400 dark:text-gray-600 text-sm font-medium">s/d</span>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input type="date" id="cashbook-end" 
                     class="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-300" />
            </div>
          </div>
          <button id="cashbook-reset" 
                  class="inline-flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Cashbook Content -->
      <div id="cashbook-content">
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
          <div class="relative flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-5 ring-4 ring-emerald-100 dark:ring-emerald-500/10">
              <svg class="w-12 h-12 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Pilih Akun
            </h3>
            <p class="text-gray-500 dark:text-gray-400 max-w-sm">
              Pilih akun untuk melihat buku kas dengan saldo berjalan.
            </p>
          </div>
        </div>
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

  try {
    const accounts = await AccountService.getAll({ includeInactive: false })
    setupCashbookPage(container, accounts)
  } catch (error) {
    console.error('Failed to load cashbook:', error)
    Toast.error('Gagal memuat data buku kas')
  }
}

function setupCashbookPage(container, accounts) {
  const accountSelect = container.querySelector('#cashbook-account')
  const content = container.querySelector('#cashbook-content')
  const startInput = container.querySelector('#cashbook-start')
  const endInput = container.querySelector('#cashbook-end')

  // Set default dates (current month)
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  if (startInput) startInput.value = firstDay.toISOString().split('T')[0]
  if (endInput) endInput.value = lastDay.toISOString().split('T')[0]

  // Populate account options
  if (accountSelect && accounts.length > 0) {
    accounts.forEach(a => {
      const option = document.createElement('option')
      option.value = a.id
      option.textContent = `${a.name} (${formatCurrency(a.current_balance)})`
      accountSelect.appendChild(option)
    })
  }

  // Account change
  if (accountSelect) {
    accountSelect.addEventListener('change', () => {
      const accountId = accountSelect.value
      if (accountId) {
        loadCashbook(container, accountId, accounts, {
          startDate: startInput?.value || null,
          endDate: endInput?.value || null,
        })
      } else {
        showEmptyState(content)
      }
    })
  }

  // Date filters
  [startInput, endInput].forEach(input => {
    if (input) {
      input.addEventListener('change', () => {
        const accountId = accountSelect?.value
        if (accountId) {
          loadCashbook(container, accountId, accounts, {
            startDate: startInput?.value || null,
            endDate: endInput?.value || null,
          })
        }
      })
    }
  })

  // Reset
  const resetBtn = container.querySelector('#cashbook-reset')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (accountSelect) accountSelect.value = ''
      if (startInput) startInput.value = firstDay.toISOString().split('T')[0]
      if (endInput) endInput.value = lastDay.toISOString().split('T')[0]
      showEmptyState(content)
    })
  }
}

function showEmptyState(content) {
  content.innerHTML = `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      <div class="relative flex flex-col items-center text-center">
        <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-5 ring-4 ring-emerald-100 dark:ring-emerald-500/10">
          <svg class="w-12 h-12 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pilih Akun</h3>
        <p class="text-gray-500 dark:text-gray-400">Pilih akun untuk melihat buku kas dengan saldo berjalan.</p>
      </div>
    </div>
  `
}

async function loadCashbook(container, accountId, accounts, filters = {}) {
  const content = container.querySelector('#cashbook-content')
  if (!content) return

  content.innerHTML = `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
      ${Skeleton.table(8, 6)}
    </div>
  `

  try {
    const account = accounts.find(a => a.id === accountId)
    const transactions = await TransactionService.getRunningBalance(accountId, filters)
    renderCashbook(content, account, transactions)
  } catch (error) {
    console.error('Failed to load cashbook:', error)
    content.innerHTML = `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-12 text-center relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
        <div class="relative">
          <div class="text-5xl mb-4">⚠️</div>
          <p class="text-gray-500 dark:text-gray-400">Gagal memuat buku kas: ${error.message}</p>
        </div>
      </div>
    `
  }
}

// ============================================================
// DATE FORMAT HELPERS
// ============================================================

function formatDay(dateString) {
  const date = new Date(dateString)
  return date.getDate().toString().padStart(2, '0')
}

function formatMonthShort(dateString) {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return months[date.getMonth()]
}

function formatDateFull(dateString) {
  const date = new Date(dateString)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function formatCalendarBadge(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return {
      day: 'Hari ini',
      month: '',
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
    }
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return {
      day: 'Kemarin',
      month: '',
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      color: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: months[date.getMonth()],
    time: `${date.getFullYear()}`,
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  }
}

function renderCashbook(container, account, transactions) {
  if (!account) {
    container.innerHTML = `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-8 text-center text-gray-500">
        Akun tidak ditemukan
      </div>
    `
    return
  }

  if (!transactions || transactions.length === 0) {
    container.innerHTML = `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-500/5 dark:to-teal-500/5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ${account.name}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Saldo Awal: ${formatCurrency(account.initial_balance || 0)}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Saldo Akhir</p>
              <p class="text-xl font-bold text-teal-600 dark:text-teal-400">
                ${formatCurrency(account.current_balance)}
              </p>
            </div>
          </div>
        </div>
        <div class="p-12">
          ${EmptyState.getHTML({
            icon: `<svg class="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
            title: 'Belum Ada Transaksi',
            message: 'Tidak ada transaksi yang tercatat di akun ini untuk periode yang dipilih.',
          })}
        </div>
      </div>
    `
    return
  }

  const initialBalance = Number(account.initial_balance || 0)
  const lastBalance = transactions[transactions.length - 1]?.running_balance || initialBalance

  // Calculate totals
  let totalIn = 0
  let totalOut = 0
  
  transactions.forEach(trx => {
    const incomeTypes = ['income', 'salary', 'sale', 'receivable']
    const expenseTypes = ['expense', 'purchase', 'operational', 'debt', 'investment']
    
    if (trx.type === 'transfer') {
      if (trx.to_account_id === account.id) totalIn += Number(trx.amount)
      else if (trx.account_id === account.id) totalOut += Number(trx.amount)
    } else if (trx.account_id === account.id) {
      if (incomeTypes.includes(trx.type)) totalIn += Number(trx.amount)
      else if (expenseTypes.includes(trx.type)) totalOut += Number(trx.amount)
    }
  })

  container.innerHTML = `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden animate-fade-in">
      <!-- Account Info Header -->
      <div class="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-500/5 dark:to-teal-500/5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ${account.name}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Saldo Awal: ${formatCurrency(initialBalance)}
            </p>
          </div>
          <div class="flex gap-4 sm:gap-8">
            <div class="text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Masuk</p>
              <p class="text-base font-bold text-teal-600 dark:text-teal-400">${formatCurrency(totalIn)}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Keluar</p>
              <p class="text-base font-bold text-red-500 dark:text-red-400">${formatCurrency(totalOut)}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Saldo Akhir</p>
              <p class="text-base font-bold ${lastBalance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}">
                ${formatCurrency(lastBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
              <th class="text-center py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-12">No</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th class="text-right py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Masuk</th>
              <th class="text-right py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Keluar</th>
              <th class="text-right py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saldo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-800/30">
            <!-- Initial Balance Row -->
            <tr class="bg-gray-50/80 dark:bg-gray-800/30">
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Awal</span>
                </div>
              </td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4 text-sm font-bold text-right text-gray-900 dark:text-gray-100">
                ${formatCurrency(initialBalance)}
              </td>
            </tr>

            ${transactions.map((trx, i) => {
              const incomeTypes = ['income', 'salary', 'sale', 'receivable']
              const expenseTypes = ['expense', 'purchase', 'operational', 'debt', 'investment']
              
              let isIncome = false
              let isExpense = false
              let isTransferIn = false
              let isTransferOut = false

              if (trx.type === 'transfer') {
                if (trx.to_account_id === account.id) {
                  isTransferIn = true
                } else if (trx.account_id === account.id) {
                  isTransferOut = true
                }
              } else if (trx.account_id === account.id) {
                if (incomeTypes.includes(trx.type)) isIncome = true
                else if (expenseTypes.includes(trx.type)) isExpense = true
              }

              const amount = Number(trx.amount)
              const isPositive = isIncome || isTransferIn
              const isNegative = isExpense || isTransferOut
              
              // Modern date format
              const calendarBadge = formatCalendarBadge(trx.transaction_date)

              return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td class="py-3 px-4 text-xs text-gray-400 font-mono text-center">${i + 1}</td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <!-- Calendar Badge -->
                      <div class="w-12 h-12 rounded-xl ${calendarBadge.color} border flex flex-col items-center justify-center shrink-0">
                        ${calendarBadge.month ? `
                          <span class="text-sm font-bold leading-none">${calendarBadge.day}</span>
                          <span class="text-[10px] leading-none mt-0.5 font-medium">${calendarBadge.month}</span>
                        ` : `
                          <span class="text-xs font-bold leading-tight text-center px-1">${calendarBadge.day}</span>
                        `}
                      </div>
                      <!-- Date Details -->
                      <div>
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">${formatRelativeTime(trx.transaction_date)}</span>
                        ${calendarBadge.time ? `
                          <span class="text-xs text-gray-400 dark:text-gray-500 block">${calendarBadge.time}</span>
                        ` : `
                          <span class="text-xs text-gray-400 dark:text-gray-500 block">${formatDateFull(trx.transaction_date)}</span>
                        `}
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                           style="background-color: ${isPositive ? 'rgba(20, 184, 166, 0.1)' : isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'}">
                        ${isIncome ? '📥' : isExpense ? '📤' : isTransferIn ? '📥' : isTransferOut ? '📤' : '💳'}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          ${trx.name}
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">
                          ${trx.type === 'transfer' 
                            ? (isTransferIn ? `Transfer dari ${trx.account_name}` : `Transfer ke ${trx.to_account_name}`)
                            : trx.category_name || trx.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-sm text-right font-semibold ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-300 dark:text-gray-600'}">
                    ${isPositive ? formatCurrency(amount) : '-'}
                  </td>
                  <td class="py-3 px-4 text-sm text-right font-semibold ${isNegative ? 'text-red-500 dark:text-red-400' : 'text-gray-300 dark:text-gray-600'}">
                    ${isNegative ? formatCurrency(amount) : '-'}
                  </td>
                  <td class="py-3 px-4 text-sm font-bold text-right ${trx.running_balance >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-500 dark:text-red-400'}">
                    ${formatCurrency(trx.running_balance)}
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40">
              <td class="py-3.5 px-4" colspan="3">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100">Saldo Akhir</span>
              </td>
              <td class="py-3.5 px-4 text-sm font-bold text-right text-teal-600 dark:text-teal-400">
                ${formatCurrency(totalIn)}
              </td>
              <td class="py-3.5 px-4 text-sm font-bold text-right text-red-500 dark:text-red-400">
                ${formatCurrency(totalOut)}
              </td>
              <td class="py-3.5 px-4 text-sm font-bold text-right ${lastBalance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}">
                ${formatCurrency(lastBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
}