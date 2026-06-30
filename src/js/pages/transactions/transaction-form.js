import { TransactionService } from '@services/transaction.service.js'
import { AccountService } from '@services/account.service.js'
import { CategoryService } from '@services/category.service.js'
import { Toast } from '@components/ui/toast.js'
import { Skeleton } from '@components/ui/skeleton.js'

export async function render(container, params = {}) {
  const isEdit = !!params.id
  let transaction = null

  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6">
      <a href="/transactions" class="btn btn-ghost btn-sm -ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </a>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ${isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
      </h1>
      <div class="card p-6 animate-pulse">
        ${Array(5).fill('').map(() => `
          <div class="mb-4">
            <div class="skeleton h-4 w-20 rounded mb-2"></div>
            <div class="skeleton h-10 w-full rounded-xl"></div>
          </div>
        `).join('')}
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
      <div class="text-center py-16">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-lg font-semibold mb-2">Gagal Memuat Form</h2>
        <p class="text-gray-500 mb-4">${error.message}</p>
        <a href="/transactions" class="btn btn-primary">Kembali</a>
      </div>
    `
  }
}

function renderForm(container, { accounts, categories, transaction, isEdit }) {
  const selectedCategoryId = transaction?.category_id || ''

  // Group categories by type untuk optgroup
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

  container.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <a href="/transactions" class="btn btn-ghost btn-sm -ml-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </a>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ${isEdit ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
      </h1>

      <form id="transaction-form" class="card p-6 space-y-5">
        
        <!-- Kategori (sekaligus tipe) -->
        <div>
          <label for="trx-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Kategori <span class="text-red-500">*</span>
          </label>
          <select id="trx-category" class="input" required>
            <option value="">Pilih Kategori</option>
            ${categoryOptionsHTML}
          </select>
          <input type="hidden" id="trx-type" value="${transaction?.type || ''}" />
        </div>

        <!-- Nama Transaksi -->
        <div>
          <label for="trx-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nama Transaksi <span class="text-red-500">*</span>
          </label>
          <input type="text" id="trx-name" class="input" 
                 placeholder="Contoh: Belanja Bulanan"
                 value="${transaction?.name || ''}" required />
        </div>

        <!-- Nominal -->
        <div>
          <label for="trx-amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nominal <span class="text-red-500">*</span>
          </label>
          <input type="number" id="trx-amount" class="input text-lg font-bold" 
                 placeholder="0" value="${transaction?.amount || ''}" 
                 step="0.01" min="1" required />
        </div>

        <!-- Akun -->
        <div>
          <label for="trx-account" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Akun <span class="text-red-500">*</span>
          </label>
          <select id="trx-account" class="input" required>
            <option value="">Pilih Akun</option>
            ${(accounts || []).map(a => `
              <option value="${a.id}" ${transaction?.account_id === a.id ? 'selected' : ''}>
                ${a.name} (${new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',minimumFractionDigits:0}).format(a.current_balance)})
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Tanggal & Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="trx-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tanggal <span class="text-red-500">*</span>
            </label>
            <input type="date" id="trx-date" class="input" 
                   value="${transaction?.transaction_date || new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label for="trx-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Status
            </label>
            <select id="trx-status" class="input">
              <option value="completed" ${!transaction || transaction.status === 'completed' ? 'selected' : ''}>✅ Selesai</option>
              <option value="pending" ${transaction?.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
            </select>
          </div>
        </div>

        <!-- Catatan -->
        <div>
          <label for="trx-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Catatan
          </label>
          <textarea id="trx-notes" class="input min-h-[80px]" rows="3" 
                    placeholder="Catatan opsional...">${transaction?.notes || ''}</textarea>
        </div>

        <!-- Submit -->
        <div class="flex gap-3 pt-2">
          <a href="/transactions" class="btn btn-secondary flex-1 text-center">Batal</a>
          <button type="submit" class="btn btn-primary flex-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            ${isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  `
}

function setupFormEvents(container, { transaction, isEdit }) {
  const form = container.querySelector('#transaction-form')
  if (!form) return

  const categorySelect = form.querySelector('#trx-category')
  const typeInput = form.querySelector('#trx-type')

  // Saat kategori dipilih, auto-set tipe
  categorySelect.addEventListener('change', () => {
    const selectedOption = categorySelect.selectedOptions[0]
    const type = selectedOption?.dataset?.type || ''
    typeInput.value = type
  })

  // Set initial type
  if (categorySelect.value) {
    const selectedOption = categorySelect.selectedOptions[0]
    typeInput.value = selectedOption?.dataset?.type || ''
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const categoryId = categorySelect.value
    const type = typeInput.value
    const name = form.querySelector('#trx-name')?.value?.trim()
    const amount = parseFloat(form.querySelector('#trx-amount')?.value)
    const accountId = form.querySelector('#trx-account')?.value
    const transactionDate = form.querySelector('#trx-date')?.value
    const status = form.querySelector('#trx-status')?.value
    const notes = form.querySelector('#trx-notes')?.value?.trim()

    if (!categoryId || !type) { Toast.warning('Pilih kategori'); return }
    if (!name) { Toast.warning('Nama transaksi wajib diisi'); return }
    if (!amount || amount <= 0) { Toast.warning('Nominal harus lebih dari 0'); return }
    if (!accountId) { Toast.warning('Pilih akun'); return }
    if (!transactionDate) { Toast.warning('Pilih tanggal'); return }

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

    try {
      if (isEdit) {
        await TransactionService.update(transaction.id, data)
        Toast.success('Transaksi berhasil diperbarui!')
      } else {
        await TransactionService.create(data)
        Toast.success('Transaksi berhasil disimpan!')
      }
      window.__app.router.navigate('/transactions')
    } catch (error) {
      Toast.error('Gagal menyimpan: ' + error.message)
    }
  })
}