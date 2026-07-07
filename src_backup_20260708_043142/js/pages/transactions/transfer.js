import { TransactionService } from '@services/transaction.service.js'
import { AccountService } from '@services/account.service.js'
import { CategoryService } from '@services/category.service.js'
import { Toast } from '@components/ui/toast.js'
import { ConfirmDialog } from '@components/ui/confirm-dialog.js'
import { formatCurrency } from '@core/utils.js'

/**
 * Transfer Page - Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/8 rounded-full blur-[128px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/8 rounded-full blur-[128px] -z-10"></div>

      <!-- Back Button -->
      <a href="/transactions" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </a>

      <!-- Header -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Transfer Antar Akun
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Pindahkan dana dari satu akun ke akun lainnya</p>
          </div>
        </div>
      </div>

      <!-- Form Skeleton -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        ${Array(5).fill('').map(() => `
          <div class="mb-5">
            <div class="skeleton h-4 w-24 rounded-lg mb-2.5"></div>
            <div class="skeleton h-12 w-full rounded-xl"></div>
          </div>
        `).join('')}
        <div class="flex gap-3 pt-2">
          <div class="skeleton h-12 flex-1 rounded-xl"></div>
          <div class="skeleton h-12 flex-1 rounded-xl"></div>
        </div>
      </div>
    </div>
  `

  try {
    const [accounts, categories] = await Promise.all([
      AccountService.getAll({ includeInactive: false }),
      CategoryService.getAll({ type: 'transfer' }),
    ])

    if (accounts.length < 2) {
      container.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <a href="/transactions" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
            <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </a>

          <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
            <div class="relative flex flex-col items-center text-center">
              <div class="w-24 h-24 bg-amber-100 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center mb-5 ring-4 ring-amber-200 dark:ring-amber-500/20">
                <svg class="w-12 h-12 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Minimal 2 Akun Diperlukan
              </h2>
              <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Anda memerlukan minimal dua akun untuk melakukan transfer antar akun.
              </p>
              <a href="/accounts" 
                 class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Buat Akun Baru
              </a>
            </div>
          </div>
        </div>
      `
      return
    }

    renderTransferForm(container, { accounts, categories })
    setupTransferEvents(container, accounts)
  } catch (error) {
    console.error('Failed to load transfer page:', error)
    container.innerHTML = `
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]"></div>
          <div class="relative">
            <div class="text-7xl mb-6">⚠️</div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Gagal Memuat
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

function renderTransferForm(container, { accounts, categories }) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <!-- Back Button -->
      <a href="/transactions" class="inline-flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 -ml-2 text-sm font-medium group">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </a>

      <!-- Header -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Transfer Antar Akun
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Pindahkan dana dari satu akun ke akun lainnya</p>
          </div>
        </div>
      </div>

      <!-- Transfer Form -->
      <form id="transfer-form" class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
        
        <div class="p-6 space-y-5">
          <!-- Akun Asal -->
          <div>
            <label for="from-account" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Akun Asal <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <select id="from-account" 
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm" 
                      required>
                <option value="">Pilih Akun Asal</option>
                ${accounts.map(a => `
                  <option value="${a.id}">
                    ${getAccountEmoji(a)} ${a.name} — ${formatCurrency(a.current_balance)}
                  </option>
                `).join('')}
              </select>
              <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p id="from-balance-info" class="text-xs text-gray-400 dark:text-gray-500 mt-1.5 hidden"></p>
          </div>

          <!-- Arrow Divider -->
          <div class="flex justify-center py-1">
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-500/10">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          <!-- Akun Tujuan -->
          <div>
            <label for="to-account" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Akun Tujuan <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <select id="to-account" 
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm" 
                      required>
                <option value="">Pilih Akun Tujuan</option>
                ${accounts.map(a => `
                  <option value="${a.id}">
                    ${getAccountEmoji(a)} ${a.name} — ${formatCurrency(a.current_balance)}
                  </option>
                `).join('')}
              </select>
              <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Nominal Transfer -->
          <div>
            <label for="transfer-amount" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nominal Transfer <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold text-sm">Rp</span>
              <input type="text" id="transfer-amount" 
                     class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-lg font-bold" 
                     placeholder="0" inputmode="numeric" required autocomplete="off" />
            </div>
            <input type="hidden" id="transfer-amount-real" value="" />
            <p id="amount-display" class="text-xs text-gray-400 dark:text-gray-500 mt-1.5 min-h-[16px]"></p>
            
            <!-- Quick Amount Buttons -->
            <div class="flex flex-wrap gap-2 mt-3">
              ${[10000, 50000, 100000, 500000, 1000000].map(amt => `
                <button type="button" 
                        class="quick-amount px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
                        data-amount="${amt}">
                  ${formatCurrency(amt)}
                </button>
              `).join('')}
              <button type="button" id="quick-all" 
                      class="quick-amount px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-200 border border-blue-200 dark:border-blue-500/20">
                Semua Saldo
              </button>
            </div>
          </div>

          <!-- Deskripsi & Tanggal -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="transfer-name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi
              </label>
              <input type="text" id="transfer-name" 
                     class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-sm" 
                     placeholder="Contoh: Transfer ke Tabungan" />
            </div>
            <div>
              <label for="transfer-date" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tanggal
              </label>
              <input type="date" id="transfer-date" 
                     class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-sm" 
                     value="${new Date().toISOString().split('T')[0]}" required />
            </div>
          </div>

          <!-- Kategori & Catatan -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="transfer-category" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <div class="relative">
                <select id="transfer-category" 
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 appearance-none cursor-pointer text-sm">
                  <option value="">Tanpa Kategori</option>
                  ${categories.map(c => `
                    <option value="${c.id}">${c.name}</option>
                  `).join('')}
                </select>
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label for="transfer-notes" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Catatan
              </label>
              <input type="text" id="transfer-notes" 
                     class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 text-sm" 
                     placeholder="Catatan opsional..." />
            </div>
          </div>

          <!-- Preview Card -->
          <div id="transfer-preview" class="hidden bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-5 space-y-3 border border-gray-200 dark:border-gray-700/30">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ringkasan Transfer
            </h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Dari Akun</span>
                <span id="preview-from" class="font-medium text-gray-900 dark:text-gray-100">-</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Ke Akun</span>
                <span id="preview-to" class="font-medium text-gray-900 dark:text-gray-100">-</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Jumlah Transfer</span>
                <span id="preview-amount" class="font-bold text-blue-600 dark:text-blue-400">-</span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm">
                <span class="text-gray-500">Saldo Akhir (Asal)</span>
                <span id="preview-from-balance" class="font-medium">-</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#0a0a0f]/50 flex items-center justify-end gap-3">
          <a href="/transactions" 
             class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
            Batal
          </a>
          <button type="submit" id="submit-transfer" 
                  class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                  disabled>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer Sekarang
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
    </style>
  `
}

function setupTransferEvents(container, accounts) {
  const form = container.querySelector('#transfer-form')
  if (!form) return

  const fromSelect = form.querySelector('#from-account')
  const toSelect = form.querySelector('#to-account')
  const amountInput = form.querySelector('#transfer-amount')
  const amountReal = form.querySelector('#transfer-amount-real')
  const amountDisplay = form.querySelector('#amount-display')
  const submitBtn = form.querySelector('#submit-transfer')
  const fromBalanceInfo = form.querySelector('#from-balance-info')

  // Format amount input - only numbers
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value
    value = value.replace(/[^0-9]/g, '')
    amountReal.value = value
    
    if (value) {
      amountInput.value = new Intl.NumberFormat('id-ID').format(parseInt(value))
      amountDisplay.textContent = formatCurrency(parseInt(value))
      amountDisplay.classList.remove('text-gray-400', 'dark:text-gray-500')
      amountDisplay.classList.add('text-blue-600', 'dark:text-blue-400')
    } else {
      amountInput.value = ''
      amountReal.value = ''
      amountDisplay.textContent = ''
      amountDisplay.classList.add('text-gray-400', 'dark:text-gray-500')
      amountDisplay.classList.remove('text-blue-600', 'dark:text-blue-400')
    }
    
    validateForm()
  })

  amountInput.addEventListener('keydown', (e) => {
    if ([46, 8, 9, 27, 13, 37, 38, 39, 40].includes(e.keyCode) ||
        (e.ctrlKey === true && [65, 67, 86, 88].includes(e.keyCode)) ||
        (e.keyCode >= 35 && e.keyCode <= 36)) {
      return
    }
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  })

  // Quick amount buttons
  form.querySelectorAll('.quick-amount').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'quick-all') {
        const fromId = fromSelect.value
        const account = accounts.find(a => a.id === fromId)
        if (account) {
          amountInput.value = new Intl.NumberFormat('id-ID').format(account.current_balance)
          amountReal.value = account.current_balance
          amountDisplay.textContent = formatCurrency(account.current_balance)
          amountDisplay.classList.remove('text-gray-400', 'dark:text-gray-500')
          amountDisplay.classList.add('text-blue-600', 'dark:text-blue-400')
          validateForm()
        }
      } else {
        amountInput.value = new Intl.NumberFormat('id-ID').format(parseInt(btn.dataset.amount))
        amountReal.value = btn.dataset.amount
        amountDisplay.textContent = formatCurrency(parseInt(btn.dataset.amount))
        amountDisplay.classList.remove('text-gray-400', 'dark:text-gray-500')
        amountDisplay.classList.add('text-blue-600', 'dark:text-blue-400')
        validateForm()
      }
    })
  })

  // Show balance info on account select
  fromSelect.addEventListener('change', () => {
    const fromId = fromSelect.value
    const account = accounts.find(a => a.id === fromId)
    if (account && fromBalanceInfo) {
      fromBalanceInfo.textContent = `Saldo tersedia: ${formatCurrency(account.current_balance)}`
      fromBalanceInfo.classList.remove('hidden')
    } else if (fromBalanceInfo) {
      fromBalanceInfo.classList.add('hidden')
    }
    validateForm()
  })

  toSelect.addEventListener('change', validateForm)

  // Validate form
  function validateForm() {
    const fromId = fromSelect.value
    const toId = toSelect.value
    const amount = parseInt(amountReal.value) || 0

    const isValid = fromId && toId && fromId !== toId && amount > 0
    submitBtn.disabled = !isValid

    updatePreview()
  }

  // Update preview
  function updatePreview() {
    const preview = form.querySelector('#transfer-preview')
    const fromId = fromSelect.value
    const toId = toSelect.value
    const amount = parseInt(amountReal.value) || 0

    if (!fromId || !toId || !amount) {
      preview.classList.add('hidden')
      return
    }

    preview.classList.remove('hidden')

    const fromAccount = accounts.find(a => a.id === fromId)
    const toAccount = accounts.find(a => a.id === toId)

    form.querySelector('#preview-from').textContent = `${getAccountEmoji(fromAccount)} ${fromAccount?.name || '-'}`
    form.querySelector('#preview-to').textContent = `${getAccountEmoji(toAccount)} ${toAccount?.name || '-'}`
    form.querySelector('#preview-amount').textContent = formatCurrency(amount)

    if (fromAccount) {
      const remaining = Number(fromAccount.current_balance) - amount
      form.querySelector('#preview-from-balance').textContent = formatCurrency(remaining)
      form.querySelector('#preview-from-balance').className = remaining < 0
        ? 'font-medium text-red-500'
        : 'font-medium text-teal-600 dark:text-teal-400'
    }
  }

  // Submit transfer
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const fromAccountId = fromSelect.value
    const toAccountId = toSelect.value
    const amount = parseInt(amountReal.value)
    const name = form.querySelector('#transfer-name')?.value?.trim() || 'Transfer Antar Akun'
    const transactionDate = form.querySelector('#transfer-date')?.value
    const notes = form.querySelector('#transfer-notes')?.value?.trim()
    const categoryId = form.querySelector('#transfer-category')?.value || null

    if (fromAccountId === toAccountId) {
      Toast.warning('Akun asal dan tujuan tidak boleh sama')
      return
    }

    if (!amount || amount <= 0) {
      Toast.warning('Nominal harus lebih dari 0')
      return
    }

    const fromAccount = accounts.find(a => a.id === fromAccountId)
    if (fromAccount && Number(fromAccount.current_balance) < amount) {
      Toast.error(`Saldo tidak mencukupi. Saldo ${fromAccount.name}: ${formatCurrency(fromAccount.current_balance)}`)
      return
    }

    const toAccount = accounts.find(a => a.id === toAccountId)
    const confirmed = await ConfirmDialog.custom({
      title: 'Konfirmasi Transfer',
      message: `Transfer sebesar ${formatCurrency(amount)} dari ${fromAccount?.name || '...'} ke ${toAccount?.name || '...'}?`,
      confirmText: 'Ya, Transfer',
      cancelText: 'Batal',
      variant: 'info',
    })

    if (!confirmed) return

    try {
      submitBtn.disabled = true
      submitBtn.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Memproses...
      `

      await TransactionService.transfer({
        fromAccountId,
        toAccountId,
        amount,
        name,
        transactionDate,
        notes,
        categoryId,
      })

      Toast.success('✅ Transfer berhasil!')
      window.__app.router.navigate('/transactions')
    } catch (error) {
      Toast.error('❌ Gagal transfer: ' + error.message)
      submitBtn.disabled = false
      submitBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Transfer Sekarang
      `
    }
  })
}

function getAccountEmoji(account) {
  const typeIcon = typeof account.account_type === 'object' ? account.account_type?.icon : ''
  const map = {
    banknotes: '💵', 'building-bank': '🏦', 'device-mobile': '📱',
    'piggy-bank': '🐷', 'trending-up': '📈', briefcase: '💼', wallet: '👛',
  }
  return map[typeIcon] || map[account.icon] || '💰'
}