import { AccountService } from '@services/account.service.js'
import { TransactionService } from '@services/transaction.service.js'
import { Modal } from '@components/ui/modal.js'
import { Toast } from '@components/ui/toast.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { formatCurrency, formatDate, getTransactionColor, getTransactionIcon, getStatusBadgeClass } from '@core/utils.js'

/**
 * Account Detail Page
 */
export async function render(container, params = {}) {
  const accountId = params.id

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Back Button -->
      <a href="/accounts" class="btn btn-ghost btn-sm -ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Akun
      </a>

      <!-- Account Header Skeleton -->
      <div class="card p-6 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="skeleton w-16 h-16 rounded-2xl"></div>
          <div class="flex-1">
            <div class="skeleton h-6 w-48 rounded mb-2"></div>
            <div class="skeleton h-4 w-32 rounded mb-2"></div>
            <div class="skeleton h-8 w-36 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Transactions Skeleton -->
      <div class="card p-6">
        <div class="skeleton h-5 w-40 rounded mb-4"></div>
        ${Skeleton.table(5, 5)}
      </div>
    </div>
  `

  try {
    const account = await AccountService.getById(accountId)
    if (!account) {
      container.innerHTML = `
        <div class="text-center py-16">
          <div class="text-6xl mb-4">🏦</div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Akun Tidak Ditemukan</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Akun yang Anda cari tidak ada atau telah dihapus.</p>
          <a href="/accounts" class="btn btn-primary">Kembali ke Daftar Akun</a>
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
      <div class="text-center py-16">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-lg font-semibold mb-2">Gagal Memuat Data</h2>
        <p class="text-gray-500 mb-4">${error.message}</p>
        <a href="/accounts" class="btn btn-primary">Kembali</a>
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
      <a href="/accounts" class="btn btn-ghost btn-sm -ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Akun
      </a>

      <!-- Account Header -->
      <div class="card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
               style="background-color: ${account.color}20; color: ${account.color}">
            ${typeIcon}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">${account.name}</h2>
              <span class="badge text-xs" style="background-color: ${account.color}15; color: ${account.color}">
                ${typeName}
              </span>
            </div>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${formatCurrency(account.current_balance)}
            </p>
            ${account.description ? `
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${account.description}</p>
            ` : ''}
          </div>
          <div class="flex gap-2">
            <button id="edit-account-btn" class="btn btn-secondary btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button id="delete-account-btn" class="btn btn-danger btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Riwayat Transaksi</h3>
          <a href="/transactions/new" class="btn btn-primary btn-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </a>
        </div>
        
        ${transactions.length === 0 ? `
          <div class="text-center py-12">
            <div class="text-5xl mb-4">📭</div>
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">Belum Ada Transaksi</h4>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">Belum ada transaksi yang tercatat di akun ini.</p>
            <a href="/transactions/new" class="btn btn-primary btn-sm">Tambah Transaksi</a>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No</th>
                  <th class="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal</th>
                  <th class="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
                  <th class="text-left py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kategori</th>
                  <th class="text-right py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah</th>
                  <th class="text-center py-3 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                ${transactions.map((trx, i) => {
                  const isNegative = ['expense', 'purchase', 'operational', 'debt', 'investment'].includes(trx.type)
                  const isTransfer = trx.type === 'transfer'
                  const amountClass = isTransfer ? 'text-blue-600 dark:text-blue-400'
                    : isNegative ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                  const prefix = isTransfer ? '↔ ' : isNegative ? '- ' : '+ '

                  return `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onclick="window.__app.router.navigate('/transactions/${trx.id}/edit')">
                      <td class="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">${trx.transaction_number || '-'}</td>
                      <td class="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">${formatDate(trx.transaction_date)}</td>
                      <td class="py-3 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <div class="flex items-center gap-2">
                          <span>${getTransactionIcon(trx.type)}</span>
                          <span>${trx.name}</span>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">${trx.category_name || '-'}</td>
                      <td class="py-3 px-3 text-sm font-semibold text-right ${amountClass}">
                        ${prefix}${formatCurrency(trx.amount)}
                      </td>
                      <td class="py-3 px-3 text-center">
                        <span class="badge ${getStatusBadgeClass(trx.status)} text-[10px]">${trx.status}</span>
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
  `

  setupEventListeners(container, account)
}

function setupEventListeners(container, account) {
  // Edit button
  const editBtn = container.querySelector('#edit-account-btn')
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      // Import showAccountForm dynamically to avoid circular dependency
      import('@pages/accounts/accounts.js').then(module => {
        // Trigger edit via modal - we'll implement edit in accounts.js
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