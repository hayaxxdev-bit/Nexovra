import { TransactionService } from '@services/transaction.service.js'
import { AccountService } from '@services/account.service.js'
import { CategoryService } from '@services/category.service.js'
import { Toast } from '@components/ui/toast.js'
import { formatCurrency, formatDate } from '@utils/format.js';
import { Skeleton } from '@components/ui/skeleton.js'

/**
 * Transaction Form Page - Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  const isEdit = !!params.id
  let transaction = null

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 dark:bg-purple-600/8 rounded-full blur-[150px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/8 rounded-full blur-[150px] -z-10"></div>

      <!-- Back Button -->
      <a href="/transactions" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Transaksi
      </a>

      <!-- Title Section -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${isEdit 
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />'
              }
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ${isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              ${isEdit ? 'Perbarui detail transaksi Anda' : 'Catat pemasukan atau pengeluaran baru'}
            </p>
          </div>
        </div>
      </div>

      <!-- Form Skeleton -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${Array(6).fill('').map(() => `
            <div class="mb-2">
              <div class="skeleton h-4 w-24 rounded-lg mb-2.5"></div>
              <div class="skeleton h-11 w-full rounded-xl"></div>
            </div>
          `).join('')}
        </div>
        <div class="flex gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/50">
          <div class="skeleton h-12 flex-1 rounded-xl"></div>
          <div class="skeleton h-12 flex-1 rounded-xl"></div>
        </div>
      </div>
    </div>
  `

  try {
    const [accounts, categories] = await Promise.all([
      AccountService.getAll({ includeInactive: false }),
      CategoryService.getAll(),
    ])

    if (isEdit) {
      transaction = await TransactionService.getById(params.id)
    }

    renderForm(container, { accounts, categories, transaction, isEdit })
    setupFormEvents(container, { transaction, isEdit })
  } catch (error) {
    console.error('Failed to load form:', error)
    container.innerHTML = `
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]"></div>
          <div class="relative">
            <div class="text-7xl mb-6">⚠️</div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Gagal Memuat Form
            </h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">${error.message}</p>
            <a href="/transactions" 
               class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              Kembali
            </a>
          </div>
        </div>
      </div>
    `
  }
}

function renderForm(container, { accounts, categories, transaction, isEdit }) {
  const selectedCategoryId = transaction?.category_id || ''
  const selectedAccountId = transaction?.account_id || ''

  // Group categories by type
  const grouped = {}
  categories.forEach(cat => {
    if (!grouped[cat.type]) grouped[cat.type] = []
    grouped[cat.type].push(cat)
  })

  const groupLabels = {
    income: '📥 PEMASUKAN',
    salary: '💵 GAJI',
    sale: '💰 PENJUALAN',
    receivable: '📈 PIUTANG',
    expense: '📤 PENGELUARAN',
    purchase: '🛍️ PEMBELIAN',
    operational: '⚙️ OPERASIONAL',
    debt: '📉 HUTANG',
    investment: '💹 INVESTASI',
    transfer: '🔄 TRANSFER',
  }

  const categoryOptionsHTML = Object.entries(grouped).map(([type, cats]) => `
    <optgroup label="${groupLabels[type] || type.toUpperCase()}">
      ${cats.map(c => `
        <option value="${c.id}" data-type="${c.type}" ${selectedCategoryId === c.id ? 'selected' : ''}>
          ${c.name}
        </option>
      `).join('')}
    </optgroup>
  `).join('')

  // Format amount for display
  const displayAmount = transaction?.amount 
    ? new Intl.NumberFormat('id-ID').format(transaction.amount)
    : ''

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <!-- Back Button -->
      <a href="/transactions" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Transaksi
      </a>

      <!-- Title Section -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${isEdit 
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />'
              }
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ${isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              ${isEdit ? 'Perbarui detail transaksi Anda' : 'Catat pemasukan atau pengeluaran baru'}
            </p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <form id="transaction-form" class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        
        <div class="p-6 space-y-6">
          <!-- Grid Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Kategori -->
            <div class="md:col-span-2">
              <label for="trx-category" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kategori <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <select id="trx-category" 
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm" 
                        required>
                  <option value="">Pilih Kategori Transaksi</option>
                  ${categoryOptionsHTML}
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                  <span id="category-type-indicator" class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hidden"></span>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <input type="hidden" id="trx-type" value="${transaction?.type || ''}" />
            </div>

            <!-- Nama Transaksi -->
            <div class="md:col-span-2">
              <label for="trx-name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nama Transaksi <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <input type="text" id="trx-name" 
                       class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-sm" 
                       placeholder="Contoh: Belanja Bulanan, Gaji Februari"
                       value="${transaction?.name || ''}" required />
              </div>
            </div>

            <!-- Nominal -->
            <div>
              <label for="trx-amount" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nominal <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold text-sm">Rp</span>
                <input type="text" id="trx-amount" 
                       class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-lg font-bold" 
                       placeholder="0" value="${displayAmount}" 
                       inputmode="numeric" required autocomplete="off" />
              </div>
              <p id="amount-display" class="text-xs text-gray-400 dark:text-gray-500 mt-1.5 min-h-[16px]"></p>
              <input type="hidden" id="trx-amount-real" value="${transaction?.amount || ''}" />
            </div>

            <!-- Akun -->
            <div>
              <label for="trx-account" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Akun <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <select id="trx-account" 
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm" 
                        required>
                  <option value="">Pilih Akun</option>
                  ${(accounts || []).map(a => `
                    <option value="${a.id}" data-balance="${a.current_balance}" ${selectedAccountId === a.id ? 'selected' : ''}>
                      ${a.name} — ${new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',minimumFractionDigits:0,maximumFractionDigits:0}).format(a.current_balance)}
                    </option>
                  `).join('')}
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                  <span id="account-balance-indicator" class="text-xs text-gray-400 dark:text-gray-500 hidden"></span>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Tanggal -->
            <div>
              <label for="trx-date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tanggal <span class="text-red-400">*</span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input type="date" id="trx-date" 
                       class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-sm" 
                       value="${transaction?.transaction_date || new Date().toISOString().split('T')[0]}" required />
              </div>
            </div>

            <!-- Status -->
            <div>
              <label for="trx-status" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div class="relative">
                <select id="trx-status" 
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm">
                  <option value="completed" ${!transaction || transaction.status === 'completed' ? 'selected' : ''}>✅ Selesai</option>
                  <option value="pending" ${transaction?.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                </select>
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Catatan -->
            <div class="md:col-span-2">
              <label for="trx-notes" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Catatan
              </label>
              <div class="relative">
                <div class="absolute left-4 top-4 text-gray-400 dark:text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <textarea id="trx-notes" 
                          class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 min-h-[100px] resize-none text-sm" 
                          rows="3" 
                          placeholder="Tambahkan catatan opsional...">${transaction?.notes || ''}</textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#0a0a0f]/50 flex items-center justify-end gap-3">
          <a href="/transactions" 
             class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Batal
          </a>
          <button type="submit" 
                  class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span id="submit-text">${isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
            <span id="submit-loading" class="hidden items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
          </button>
        </div>
      </form>
    </div>

    <style>
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.4s ease-out;
      }
      /* Hide number input spinners */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    </style>
  `
}

function setupFormEvents(container, { transaction, isEdit }) {
  const form = container.querySelector('#transaction-form')
  if (!form) return

  const categorySelect = form.querySelector('#trx-category')
  const typeInput = form.querySelector('#trx-type')
  const amountInput = form.querySelector('#trx-amount')
  const amountReal = form.querySelector('#trx-amount-real')
  const amountDisplay = form.querySelector('#amount-display')
  const categoryIndicator = form.querySelector('#category-type-indicator')
  const accountBalanceIndicator = form.querySelector('#account-balance-indicator')
  const submitBtn = form.querySelector('button[type="submit"]')
  const submitText = form.querySelector('#submit-text')
  const submitLoading = form.querySelector('#submit-loading')

  // Format amount input - only allow numbers
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value
    
    // Remove all non-numeric characters except digits
    value = value.replace(/[^0-9]/g, '')
    
    // Update real value
    amountReal.value = value
    
    // Format display with thousand separators
    if (value) {
      const formatted = new Intl.NumberFormat('id-ID').format(parseInt(value))
      amountInput.value = formatted
      amountDisplay.textContent = formatCurrency(parseInt(value))
      amountDisplay.classList.remove('text-gray-400', 'dark:text-gray-500')
      amountDisplay.classList.add('text-teal-600', 'dark:text-teal-400')
    } else {
      amountInput.value = ''
      amountReal.value = ''
      amountDisplay.textContent = ''
      amountDisplay.classList.add('text-gray-400', 'dark:text-gray-500')
      amountDisplay.classList.remove('text-teal-600', 'dark:text-teal-400')
    }
  })

  // Prevent non-numeric input
  amountInput.addEventListener('keydown', (e) => {
    // Allow: backspace, delete, tab, escape, enter, arrow keys
    if ([46, 8, 9, 27, 13, 37, 38, 39, 40].includes(e.keyCode) ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.ctrlKey === true && [65, 67, 86, 88].includes(e.keyCode)) ||
        // Allow: home, end
        (e.keyCode >= 35 && e.keyCode <= 36)) {
      return
    }
    // Block non-numeric keys
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  })

  // Format initial amount
  if (amountInput.value) {
    const cleanValue = amountInput.value.replace(/[^0-9]/g, '')
    amountReal.value = cleanValue
    if (cleanValue) {
      const formatted = new Intl.NumberFormat('id-ID').format(parseInt(cleanValue))
      amountInput.value = formatted
      amountDisplay.textContent = formatCurrency(parseInt(cleanValue))
      amountDisplay.classList.remove('text-gray-400', 'dark:text-gray-500')
      amountDisplay.classList.add('text-teal-600', 'dark:text-teal-400')
    }
  }

  // Auto-set type when category selected
  categorySelect.addEventListener('change', () => {
    const selectedOption = categorySelect.selectedOptions[0]
    const type = selectedOption?.dataset?.type || ''
    typeInput.value = type
    
    // Show type indicator
    if (type && categoryIndicator) {
      const typeLabels = {
        income: '📥 Masuk',
        salary: '💵 Masuk',
        sale: '💰 Masuk',
        receivable: '📈 Masuk',
        expense: '📤 Keluar',
        purchase: '🛍️ Keluar',
        operational: '⚙️ Keluar',
        debt: '📉 Keluar',
        investment: '💹 Keluar',
        transfer: '🔄 Transfer',
      }
      categoryIndicator.textContent = typeLabels[type] || type
      categoryIndicator.classList.remove('hidden')
      
      // Color coding
      const isIncome = ['income', 'salary', 'sale', 'receivable'].includes(type)
      const isTransfer = type === 'transfer'
      categoryIndicator.classList.remove('bg-green-100', 'dark:bg-green-500/20', 'text-green-700', 'dark:text-green-400',
                                        'bg-red-100', 'dark:bg-red-500/20', 'text-red-700', 'dark:text-red-400',
                                        'bg-blue-100', 'dark:bg-blue-500/20', 'text-blue-700', 'dark:text-blue-400')
      
      if (isIncome) {
        categoryIndicator.classList.add('bg-green-100', 'dark:bg-green-500/20', 'text-green-700', 'dark:text-green-400')
      } else if (isTransfer) {
        categoryIndicator.classList.add('bg-blue-100', 'dark:bg-blue-500/20', 'text-blue-700', 'dark:text-blue-400')
      } else {
        categoryIndicator.classList.add('bg-red-100', 'dark:bg-red-500/20', 'text-red-700', 'dark:text-red-400')
      }
    } else if (categoryIndicator) {
      categoryIndicator.classList.add('hidden')
    }
  })

  // Set initial type
  if (categorySelect.value) {
    const selectedOption = categorySelect.selectedOptions[0]
    typeInput.value = selectedOption?.dataset?.type || ''
    categorySelect.dispatchEvent(new Event('change'))
  }

  // Show account balance on select
  const accountSelect = form.querySelector('#trx-account')
  if (accountSelect && accountBalanceIndicator) {
    accountSelect.addEventListener('change', () => {
      const selectedOption = accountSelect.selectedOptions[0]
      const balance = selectedOption?.dataset?.balance
      if (balance) {
        accountBalanceIndicator.textContent = 'Saldo: ' + formatCurrency(parseFloat(balance))
        accountBalanceIndicator.classList.remove('hidden')
      } else {
        accountBalanceIndicator.classList.add('hidden')
      }
    })
    
    // Initial balance display
    if (accountSelect.value) {
      accountSelect.dispatchEvent(new Event('change'))
    }
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const categoryId = categorySelect.value
    const type = typeInput.value
    const name = form.querySelector('#trx-name')?.value?.trim()
    const amount = parseInt(amountReal.value)
    const accountId = form.querySelector('#trx-account')?.value
    const transactionDate = form.querySelector('#trx-date')?.value
    const status = form.querySelector('#trx-status')?.value
    const notes = form.querySelector('#trx-notes')?.value?.trim()

    // Validation
    if (!categoryId || !type) { 
      Toast.warning('Pilih kategori terlebih dahulu')
      categorySelect.focus()
      return 
    }
    if (!name) { 
      Toast.warning('Nama transaksi wajib diisi')
      form.querySelector('#trx-name')?.focus()
      return 
    }
    if (!amount || amount <= 0) { 
      Toast.warning('Nominal harus lebih dari 0')
      amountInput.focus()
      return 
    }
    if (!accountId) { 
      Toast.warning('Pilih akun terlebih dahulu')
      form.querySelector('#trx-account')?.focus()
      return 
    }
    if (!transactionDate) { 
      Toast.warning('Pilih tanggal transaksi')
      form.querySelector('#trx-date')?.focus()
      return 
    }

    const data = {
      type,
      name,
      amount,
      account_id: accountId,
      category_id: categoryId,
      transaction_date: transactionDate,
      status,
      notes,
    }

    // Show loading
    submitBtn.disabled = true
    submitText.classList.add('hidden')
    submitLoading.classList.remove('hidden')
    submitLoading.classList.add('flex')

    try {
      if (isEdit) {
        await TransactionService.update(transaction.id, data)
        Toast.success('✅ Transaksi berhasil diperbarui!')
      } else {
        await TransactionService.create(data)
        Toast.success('🎉 Transaksi berhasil disimpan!')
      }
      window.__app.router.navigate('/transactions')
    } catch (error) {
      Toast.error('❌ Gagal menyimpan: ' + error.message)
      submitBtn.disabled = false
      submitText.classList.remove('hidden')
      submitLoading.classList.add('hidden')
      submitLoading.classList.remove('flex')
    }
  })
}