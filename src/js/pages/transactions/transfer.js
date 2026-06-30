import { TransactionService } from '@services/transaction.service.js'
import { AccountService } from '@services/account.service.js'
import { CategoryService } from '@services/category.service.js'
import { Toast } from '@components/ui/toast.js'
import { formatCurrency } from '@core/utils.js'

/**
 * Transfer Page - Transfer Antar Akun
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6">
      <a href="/transactions" class="btn btn-ghost btn-sm -ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </a>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Transfer Antar Akun</h1>
      <p class="text-gray-500 dark:text-gray-400">Pindahkan dana dari satu akun ke akun lainnya.</p>

      <div class="card p-6 animate-pulse">
        ${Array(5).fill('').map(() => `
          <div class="mb-4">
            <div class="skeleton h-4 w-20 rounded mb-2"></div>
            <div class="skeleton h-12 w-full rounded-xl"></div>
          </div>
        `).join('')}
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
          <a href="/transactions" class="btn btn-ghost btn-sm -ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </a>

          <div class="card p-12 text-center">
            <div class="text-6xl mb-4">🏦</div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Minimal 2 Akun Diperlukan</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Anda memerlukan minimal dua akun untuk melakukan transfer antar akun.
            </p>
            <a href="/accounts" class="btn btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Buat Akun Baru
            </a>
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
      <div class="text-center py-16">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-lg font-semibold mb-2">Gagal Memuat</h2>
        <p class="text-gray-500 mb-4">${error.message}</p>
        <a href="/transactions" class="btn btn-primary">Kembali</a>
      </div>
    `
  }
}

function renderTransferForm(container, { accounts, categories }) {
  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <a href="/transactions" class="btn btn-ghost btn-sm -ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </a>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Transfer Antar Akun</h1>
      <p class="text-gray-500 dark:text-gray-400">Pindahkan dana dari satu akun ke akun lainnya.</p>

      <form id="transfer-form" class="card p-6 space-y-5">
        <!-- Akun Asal -->
        <div>
          <label for="from-account" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Akun Asal <span class="text-red-500">*</span>
          </label>
          <select id="from-account" class="input" required>
            <option value="">Pilih Akun Asal</option>
            ${accounts.map(a => `
              <option value="${a.id}">
                ${getAccountEmoji(a)} ${a.name} — ${formatCurrency(a.current_balance)}
              </option>
            `).join('')}
          </select>
          <p id="from-balance-info" class="text-xs text-gray-400 mt-1 hidden"></p>
        </div>

        <!-- Arrow -->
        <div class="flex justify-center">
          <div class="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <!-- Akun Tujuan -->
        <div>
          <label for="to-account" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Akun Tujuan <span class="text-red-500">*</span>
          </label>
          <select id="to-account" class="input" required>
            <option value="">Pilih Akun Tujuan</option>
            ${accounts.map(a => `
              <option value="${a.id}">
                ${getAccountEmoji(a)} ${a.name} — ${formatCurrency(a.current_balance)}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Nominal -->
        <div>
          <label for="transfer-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nominal Transfer <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
            <input 
              type="number" 
              id="transfer-amount" 
              class="input pl-10 text-lg font-bold" 
              placeholder="0"
              step="0.01"
              min="100"
              required
            />
          </div>
          <!-- Quick amount buttons -->
          <div class="flex flex-wrap gap-2 mt-2">
            ${[10000, 50000, 100000, 500000, 1000000].map(amt => `
              <button type="button" class="quick-amount btn btn-ghost btn-sm text-xs" data-amount="${amt}">
                ${formatCurrency(amt)}
              </button>
            `).join('')}
            <button type="button" id="quick-all" class="quick-amount btn btn-ghost btn-sm text-xs">
              Semua Saldo
            </button>
          </div>
        </div>

        <!-- Nama Transfer -->
        <div>
          <label for="transfer-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Deskripsi
          </label>
          <input 
            type="text" 
            id="transfer-name" 
            class="input" 
            placeholder="Contoh: Transfer ke Tabungan"
          />
        </div>

        <!-- Tanggal -->
        <div>
          <label for="transfer-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tanggal
          </label>
          <input 
            type="date" 
            id="transfer-date" 
            class="input" 
            value="${new Date().toISOString().split('T')[0]}"
            required
          />
        </div>

        <!-- Kategori -->
        <div>
          <label for="transfer-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Kategori
          </label>
          <select id="transfer-category" class="input">
            <option value="">Tanpa Kategori</option>
            ${categories.map(c => `
              <option value="${c.id}">${c.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Catatan -->
        <div>
          <label for="transfer-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Catatan
          </label>
          <textarea 
            id="transfer-notes" 
            class="input min-h-[80px]" 
            rows="2"
            placeholder="Catatan opsional..."
          ></textarea>
        </div>

        <!-- Preview -->
        <div id="transfer-preview" class="hidden bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Ringkasan Transfer</h4>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Dari</span>
            <span id="preview-from" class="font-medium text-gray-900 dark:text-gray-100">-</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Ke</span>
            <span id="preview-to" class="font-medium text-gray-900 dark:text-gray-100">-</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Jumlah</span>
            <span id="preview-amount" class="font-bold text-primary-600">-</span>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm">
            <span class="text-gray-500">Saldo Akhir (Asal)</span>
            <span id="preview-from-balance" class="font-medium text-red-600">-</span>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex gap-3 pt-2">
          <a href="/transactions" class="btn btn-secondary flex-1">Batal</a>
          <button type="submit" id="submit-transfer" class="btn btn-primary flex-1" disabled>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer
          </button>
        </div>
      </form>
    </div>
  `
}

function setupTransferEvents(container, accounts) {
  const form = container.querySelector('#transfer-form')
  if (!form) return

  const fromSelect = form.querySelector('#from-account')
  const toSelect = form.querySelector('#to-account')
  const amountInput = form.querySelector('#transfer-amount')
  const submitBtn = form.querySelector('#submit-transfer')

  // Quick amount buttons
  form.querySelectorAll('.quick-amount').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'quick-all') {
        const fromId = fromSelect.value
        const account = accounts.find(a => a.id === fromId)
        if (account) {
          amountInput.value = account.current_balance
          updatePreview()
        }
      } else {
        amountInput.value = btn.dataset.amount
        updatePreview()
      }
    })
  })

  // Validate form on change
  const validateForm = () => {
    const fromId = fromSelect.value
    const toId = toSelect.value
    const amount = parseFloat(amountInput.value)

    const isValid = fromId && toId && fromId !== toId && amount > 0
    submitBtn.disabled = !isValid

    updatePreview()
  }

  fromSelect.addEventListener('change', validateForm)
  toSelect.addEventListener('change', validateForm)
  amountInput.addEventListener('input', validateForm)

  // Update preview
  function updatePreview() {
    const preview = form.querySelector('#transfer-preview')
    const fromId = fromSelect.value
    const toId = toSelect.value
    const amount = parseFloat(amountInput.value) || 0

    if (!fromId || !toId || !amount) {
      preview.classList.add('hidden')
      return
    }

    preview.classList.remove('hidden')

    const fromAccount = accounts.find(a => a.id === fromId)
    const toAccount = accounts.find(a => a.id === toId)

    form.querySelector('#preview-from').textContent = fromAccount?.name || '-'
    form.querySelector('#preview-to').textContent = toAccount?.name || '-'
    form.querySelector('#preview-amount').textContent = formatCurrency(amount)

    if (fromAccount) {
      const remaining = Number(fromAccount.current_balance) - amount
      form.querySelector('#preview-from-balance').textContent = formatCurrency(remaining)
      form.querySelector('#preview-from-balance').className = remaining < 0
        ? 'font-medium text-red-600'
        : 'font-medium text-green-600'
    }
  }

  // Submit transfer
  // Submit transfer
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const fromAccountId = fromSelect.value
    const toAccountId = toSelect.value
    const amount = parseFloat(amountInput.value)
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

    // KONFIRMASI sebelum transfer
    const toAccount = accounts.find(a => a.id === toAccountId)
    const confirmed = await ConfirmDialog.confirm({
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

      Toast.success('Transfer berhasil!')
      window.__app.router.navigate('/transactions')
    } catch (error) {
      Toast.error(handleSupabaseError(error))
      submitBtn.disabled = false
      submitBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Transfer
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