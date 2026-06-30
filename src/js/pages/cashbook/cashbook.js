import { TransactionService } from '@services/transaction.service.js'
import { AccountService } from '@services/account.service.js'
import { Toast } from '@components/ui/toast.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { EmptyState } from '@components/ui/empty-state.js'
import { formatCurrency, formatDate } from '@core/utils.js'

/**
 * Cashbook Page - Buku Kas dengan Running Balance
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Buku Kas</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Catatan arus kas dengan saldo berjalan</p>
      </div>

      <!-- Filter Bar -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <select id="cashbook-account" class="input w-auto min-w-[200px]">
            <option value="">Pilih Akun...</option>
          </select>
          <input type="date" id="cashbook-start" class="input w-auto" />
          <input type="date" id="cashbook-end" class="input w-auto" />
          <button id="cashbook-reset" class="btn btn-ghost btn-sm">Reset</button>
        </div>
      </div>

      <!-- Cashbook Content -->
      <div id="cashbook-content">
        <div class="card p-6 text-center">
          <div class="text-6xl mb-4">📖</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pilih Akun</h3>
          <p class="text-gray-500 dark:text-gray-400">Pilih akun untuk melihat buku kas dengan saldo berjalan.</p>
        </div>
      </div>
    </div>
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
        content.innerHTML = `
          <div class="card p-6 text-center">
            <div class="text-6xl mb-4">📖</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pilih Akun</h3>
            <p class="text-gray-500 dark:text-gray-400">Pilih akun untuk melihat buku kas.</p>
          </div>
        `
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
      if (startInput) startInput.value = ''
      if (endInput) endInput.value = ''
      content.innerHTML = `
        <div class="card p-6 text-center">
          <div class="text-6xl mb-4">📖</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pilih Akun</h3>
          <p class="text-gray-500 dark:text-gray-400">Pilih akun untuk melihat buku kas dengan saldo berjalan.</p>
        </div>
      `
    })
  }
}

async function loadCashbook(container, accountId, accounts, filters = {}) {
  const content = container.querySelector('#cashbook-content')
  if (!content) return

  content.innerHTML = Skeleton.table(8, 6)

  try {
    const account = accounts.find(a => a.id === accountId)
    const transactions = await TransactionService.getRunningBalance(accountId, filters)

    renderCashbook(content, account, transactions)
  } catch (error) {
    console.error('Failed to load cashbook:', error)
    content.innerHTML = `
      <div class="text-center py-12">
        <div class="text-5xl mb-4">⚠️</div>
        <p class="text-gray-500">Gagal memuat buku kas: ${error.message}</p>
      </div>
    `
  }
}

function renderCashbook(container, account, transactions) {
  if (!account) {
    container.innerHTML = `<div class="text-center py-8 text-gray-500">Akun tidak ditemukan</div>`
    return
  }

  if (!transactions || transactions.length === 0) {
    container.innerHTML = `
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">${account.name}</h3>
            <p class="text-sm text-gray-500">Saldo Awal: ${formatCurrency(account.initial_balance || 0)}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Saldo Akhir</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">${formatCurrency(account.current_balance)}</p>
          </div>
        </div>
        ${EmptyState.getHTML({
          icon: '📖',
          title: 'Belum Ada Transaksi',
          message: 'Tidak ada transaksi yang tercatat di akun ini untuk periode yang dipilih.',
        })}
      </div>
    `
    return
  }

  const initialBalance = Number(account.initial_balance || 0)
  const lastBalance = transactions[transactions.length - 1]?.running_balance || initialBalance

  container.innerHTML = `
    <div class="card overflow-hidden animate-fade-in">
      <!-- Account Info -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">${account.name}</h3>
            <p class="text-sm text-gray-500">Saldo Awal: ${formatCurrency(initialBalance)}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Saldo Akhir</p>
            <p class="text-xl font-bold ${lastBalance >= 0 ? 'text-green-600' : 'text-red-600'}">
              ${formatCurrency(lastBalance)}
            </p>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase w-12">No</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Keterangan</th>
              <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Masuk</th>
              <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Keluar</th>
              <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Saldo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <!-- Initial Balance Row -->
            <tr class="bg-gray-50 dark:bg-gray-800/30">
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4 text-sm text-gray-500">-</td>
              <td class="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Saldo Awal</td>
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

              return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="py-3 px-4 text-xs text-gray-400 font-mono">${i + 1}</td>
                  <td class="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    ${formatDate(trx.transaction_date)}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span>
                        ${isIncome ? '📥' : isExpense ? '📤' : isTransferIn ? '📥' : isTransferOut ? '📤' : '💳'}
                      </span>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">${trx.name}</p>
                        <p class="text-xs text-gray-400">
                          ${trx.type === 'transfer' 
                            ? (isTransferIn ? `Transfer dari ${trx.account_name}` : `Transfer ke ${trx.to_account_name}`)
                            : trx.category_name || trx.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-sm text-right font-medium ${isIncome || isTransferIn ? 'text-green-600' : 'text-gray-300'}">
                    ${isIncome || isTransferIn ? formatCurrency(amount) : '-'}
                  </td>
                  <td class="py-3 px-4 text-sm text-right font-medium ${isExpense || isTransferOut ? 'text-red-600' : 'text-gray-300'}">
                    ${isExpense || isTransferOut ? formatCurrency(amount) : '-'}
                  </td>
                  <td class="py-3 px-4 text-sm font-bold text-right ${trx.running_balance >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-600'}">
                    ${formatCurrency(trx.running_balance)}
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
              <td class="py-3 px-4" colspan="3">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100">Saldo Akhir</span>
              </td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4"></td>
              <td class="py-3 px-4 text-sm font-bold text-right ${lastBalance >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${formatCurrency(lastBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
}