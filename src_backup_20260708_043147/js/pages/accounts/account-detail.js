import { AccountService } from '@services/account.service.js'
import { TransactionService } from '@services/transaction.service.js'
import { Modal } from '@components/ui/modal.js'
import { Toast } from '@components/ui/toast.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { formatCurrency, formatDate, getTransactionColor, getTransactionIcon, getStatusBadgeClass } from '@core/utils.js'

/**
 * Account Detail Page - Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  const accountId = params.id

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-96 h-96 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[128px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[128px] -z-10"></div>

      <!-- Back Button -->
      <a href="/accounts" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Akun
      </a>

      <!-- Account Header Skeleton -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="skeleton w-20 h-20 rounded-2xl shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-6 w-48 rounded-lg"></div>
            <div class="skeleton h-4 w-32 rounded-lg"></div>
            <div class="skeleton h-8 w-40 rounded-lg"></div>
          </div>
          <div class="flex gap-2">
            <div class="skeleton h-9 w-20 rounded-xl"></div>
            <div class="skeleton h-9 w-10 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Transactions Skeleton -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="flex items-center justify-between mb-4">
          <div class="skeleton h-5 w-40 rounded-lg"></div>
          <div class="skeleton h-9 w-24 rounded-xl"></div>
        </div>
        ${Skeleton.table(5, 5)}
      </div>
    </div>
  `

  try {
    const account = await AccountService.getById(accountId)
    if (!account) {
      container.innerHTML = `
        <div class="min-h-[60vh] flex items-center justify-center">
          <div class="text-center relative">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]"></div>
            <div class="relative">
              <div class="w-24 h-24 mx-auto mb-6 bg-amber-100 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center ring-4 ring-amber-200 dark:ring-amber-500/20">
                <svg class="w-12 h-12 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Akun Tidak Ditemukan
              </h2>
              <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                Akun yang Anda cari tidak ada atau telah dihapus.
              </p>
              <a href="/accounts" 
                 class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Daftar Akun
              </a>
            </div>
          </div>
        </div>
      `
      return
    }

    const transactions = await TransactionService.getAll({
      accountId,
      limit: 20,
    })

    renderAccountDetail(container, account, transactions.data)
  } catch (error) {
    console.error('Failed to load account detail:', error)
    container.innerHTML = `
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]"></div>
          <div class="relative">
            <div class="text-7xl mb-6">⚠️</div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Gagal Memuat Data
            </h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">${error.message}</p>
            <a href="/accounts" 
               class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              Kembali
            </a>
          </div>
        </div>
      </div>
    `
  }
}

function renderAccountDetail(container, account, transactions) {
  const iconMap = {
    banknotes: '💵', 'building-bank': '🏦', 'device-mobile': '📱',
    'piggy-bank': '🐷', 'trending-up': '📈', briefcase: '💼', wallet: '👛',
  }
  const typeIcon = typeof account.account_type === 'object'
    ? (iconMap[account.account_type?.icon] || '💰')
    : '💰'
  const typeName = typeof account.account_type === 'object' ? account.account_type?.name : ''

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Back Button -->
      <a href="/accounts" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Akun
      </a>

      <!-- Account Header Card -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/5 to-transparent rounded-full blur-3xl"></div>
        
        <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <!-- Account Icon -->
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 relative shadow-lg"
               style="background: linear-gradient(135deg, ${account.color}20, ${account.color}10)">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 rounded-2xl"></div>
            <span class="relative">${typeIcon}</span>
          </div>
          
          <!-- Account Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ${account.name}
              </h2>
              <span class="px-3 py-1 rounded-full text-xs font-medium border"
                    style="background-color: ${account.color}15; color: ${account.color}; border-color: ${account.color}30">
                ${typeName}
              </span>
            </div>
            <p class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ${formatCurrency(account.current_balance)}
            </p>
            ${account.description ? `
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                ${account.description}
              </p>
            ` : ''}
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-2 shrink-0">
            <button id="edit-account-btn" 
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button id="delete-account-btn" 
                    class="inline-flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions List Card -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
        
        <div class="relative">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Riwayat Transaksi
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ${transactions.length} transaksi tercatat
              </p>
            </div>
            <a href="/transactions/new" 
               class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah
            </a>
          </div>
          
          ${transactions.length === 0 ? `
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-24 h-24 bg-purple-50 dark:bg-purple-500/10 rounded-3xl flex items-center justify-center mb-5 ring-4 ring-purple-100 dark:ring-purple-500/10">
                <svg class="w-12 h-12 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Belum Ada Transaksi</h4>
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
                Belum ada transaksi yang tercatat di akun ini. Mulai catat transaksi pertama Anda.
              </p>
              <a href="/transactions/new" 
                 class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Transaksi
              </a>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800/50">
                    <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">No</th>
                    <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nama</th>
                    <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th class="text-right py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800/30">
                  ${transactions.map((trx, i) => {
                    const isNegative = ['expense', 'purchase', 'operational', 'debt', 'investment'].includes(trx.type)
                    const isTransfer = trx.type === 'transfer'
                    const amountClass = isTransfer 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isNegative 
                        ? 'text-red-500 dark:text-red-400' 
                        : 'text-teal-600 dark:text-teal-400'
                    const prefix = isTransfer ? '↔ ' : isNegative ? '- ' : '+ '
                    
                    const statusStyles = {
                      completed: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
                      pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                      failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
                    }
                    const statusClass = statusStyles[trx.status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20'
                    const statusIcon = trx.status === 'completed' ? '✓' : trx.status === 'pending' ? '⏳' : '✗'

                    return `
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer group"
                          onclick="window.__app.router.navigate('/transactions/${trx.id}/edit')">
                        <td class="py-3.5 px-4 text-sm text-gray-400 dark:text-gray-500 font-mono">
                          ${trx.transaction_number || '-'}
                        </td>
                        <td class="py-3.5 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          ${formatDate(trx.transaction_date)}
                        </td>
                        <td class="py-3.5 px-4">
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                                 style="background-color: ${trx.category_color || account.color}15">
                              ${getTransactionIcon(trx.type)}
                            </div>
                            <span class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              ${trx.name}
                            </span>
                          </div>
                        </td>
                        <td class="py-3.5 px-4 text-sm text-gray-500 dark:text-gray-400">
                          ${trx.category_name || '-'}
                        </td>
                        <td class="py-3.5 px-4 text-sm font-semibold text-right ${amountClass} whitespace-nowrap">
                          ${prefix}${formatCurrency(trx.amount)}
                        </td>
                        <td class="py-3.5 px-4 text-center">
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusClass}">
                            ${statusIcon} ${trx.status}
                          </span>
                        </td>
                      </tr>
                    `
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
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

  setupEventListeners(container, account)
}

function setupEventListeners(container, account) {
  // Edit button
  const editBtn = container.querySelector('#edit-account-btn')
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      import('@pages/accounts/accounts.js').then(module => {
        Toast.info('Fitur edit akan segera hadir')
      })
    })
  }

  // Delete button
  const deleteBtn = container.querySelector('#delete-account-btn')
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await ConfirmDialog.delete(`akun "${account.name}"`)
      if (confirmed) {
        try {
          const result = await AccountService.delete(account.id)
          if (result.deleted) {
            Toast.success(result.message)
          } else {
            Toast.info(result.message)
          }
          window.__app.router.navigate('/accounts')
        } catch (error) {
          Toast.error('Gagal menghapus akun: ' + error.message)
        }
      }
    })
  }
}