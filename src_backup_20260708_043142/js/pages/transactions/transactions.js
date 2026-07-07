import { TransactionService } from "@services/transaction.service.js";
import { CategoryService } from "@services/category.service.js";
import { AccountService } from "@services/account.service.js";
import { Modal } from "@components/ui/modal.js";
import { Toast } from "@components/ui/toast.js";
import { ConfirmDialog } from "@components/ui/confirm-dialog.js";
import { Skeleton } from "@components/ui/skeleton.js";
import { EmptyState } from "@components/ui/empty-state.js";
import {
  formatCurrency,
  formatDate,
  getTransactionColor,
  getTransactionIcon,
  getStatusBadgeClass,
} from "@core/utils.js";

/**
 * Transactions Page - Nexovra Next-Gen Finance
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
              Transaksi
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Kelola semua transaksi keuangan Anda</p>
          </div>
          <a href="/transactions/new" 
             class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Transaksi
          </a>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-4 relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
        <div class="relative flex flex-wrap items-center gap-3">
          <!-- Search -->
          <div class="flex-1 min-w-[200px] relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              id="search-input" 
              class="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-sm"
              placeholder="Cari transaksi..."
            />
          </div>
          
          <!-- Type Filter -->
          <select id="filter-type" 
                  class="px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300">
            <option value="">Semua Tipe</option>
            <option value="income, salary, sale, receivable">📥 Pemasukan</option>
            <option value="expense, purchase, operational, debt">📤 Pengeluaran</option>
            <option value="transfer">↔️ Transfer</option>
          </select>
          
          <!-- Date Filters -->
          <div class="flex items-center gap-2">
            <input type="date" id="filter-start-date" 
                   class="px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" />
            <span class="text-gray-400 dark:text-gray-600 text-sm">s/d</span>
            <input type="date" id="filter-end-date" 
                   class="px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" />
          </div>
          
          <!-- Reset -->
          <button id="reset-filter" 
                  class="inline-flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <!-- Transactions List -->
      <div id="transactions-list">
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
          ${Skeleton.table(8, 6)}
        </div>
      </div>

      <!-- Pagination -->
      <div id="pagination" class="flex items-center justify-between">
        <p id="pagination-info" class="text-sm text-gray-500 dark:text-gray-400"></p>
        <div class="flex gap-2" id="pagination-buttons"></div>
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
  `;

  await loadTransactions(container);
  setupEventListeners(container);
}

let currentFilters = {
  search: "",
  type: "",
  startDate: "",
  endDate: "",
  page: 0,
  limit: 20,
};

async function loadTransactions(container) {
  try {
    const { data, count } = await TransactionService.getAll({
      search: currentFilters.search || null,
      type: currentFilters.type
        ? currentFilters.type.split(",").map((s) => s.trim())
        : null,
      startDate: currentFilters.startDate || null,
      endDate: currentFilters.endDate || null,
      offset: currentFilters.page * currentFilters.limit,
      limit: currentFilters.limit,
    });

    renderTransactions(container, data, count);
  } catch (error) {
    console.error("Failed to load transactions:", error);
    Toast.error("Gagal memuat transaksi");
  }
}

function renderTransactions(container, transactions, totalCount) {
  const list = container.querySelector("#transactions-list");
  const info = container.querySelector("#pagination-info");
  const buttons = container.querySelector("#pagination-buttons");

  // Empty state
  if (!transactions || transactions.length === 0) {
    const hasActiveFilters =
      currentFilters.search ||
      currentFilters.type ||
      currentFilters.startDate ||
      currentFilters.endDate;

    if (hasActiveFilters) {
      // Filter empty result
      list.innerHTML = `
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-12 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
          <div class="relative flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center mb-5 ring-4 ring-amber-100 dark:ring-amber-500/10">
              <svg class="w-12 h-12 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Transaksi Tidak Ditemukan
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Tidak ada transaksi yang sesuai dengan filter yang dipilih.
            </p>
            <button id="clear-filter-empty" 
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filter
            </button>
          </div>
        </div>
      `;

      list.querySelector("#clear-filter-empty")?.addEventListener("click", () => {
        currentFilters = { search: "", type: "", startDate: "", endDate: "", page: 0, limit: 20 };
        const searchInput = container.querySelector("#search-input");
        const typeFilter = container.querySelector("#filter-type");
        const startDate = container.querySelector("#filter-start-date");
        const endDate = container.querySelector("#filter-end-date");
        if (searchInput) searchInput.value = "";
        if (typeFilter) typeFilter.value = "";
        if (startDate) startDate.value = "";
        if (endDate) endDate.value = "";
        loadTransactions(container);
      });
    } else {
      // No transactions at all
      list.innerHTML = `
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
          ${EmptyState.getHTML({
            type: "transactions",
            action: { text: "Tambah Transaksi", href: "/transactions/new" },
          })}
        </div>
      `;
    }

    if (info) info.textContent = "";
    if (buttons) buttons.innerHTML = "";
    return;
  }

  // Transactions table
  list.innerHTML = `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">No Transaksi</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nama</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Akun</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kategori</th>
              <th class="text-right py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="text-center py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
              <th class="text-center py-3.5 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-800/30">
            ${transactions
              .map((trx) => {
                const isNegative = ["expense", "purchase", "operational", "debt", "investment"].includes(trx.type);
                const isTransfer = trx.type === "transfer";
                const amountClass = isTransfer
                  ? "text-blue-500 dark:text-blue-400"
                  : isNegative
                    ? "text-red-500 dark:text-red-400"
                    : "text-teal-600 dark:text-teal-400";
                const prefix = isTransfer ? "↔ " : isNegative ? "- " : "+ ";

                const statusStyles = {
                  completed: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
                  pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                  failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
                };
                const statusClass = statusStyles[trx.status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
                const statusIcon = trx.status === 'completed' ? '✓' : trx.status === 'pending' ? '⏳' : '✗';

                return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <td class="py-3.5 px-4 text-xs font-mono text-gray-400 dark:text-gray-500">
                    ${trx.transaction_number || "-"}
                  </td>
                  <td class="py-3.5 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    ${formatDate(trx.transaction_date)}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                           style="background-color: ${trx.category_color || '#6366f1'}15">
                        ${getTransactionIcon(trx.type)}
                      </div>
                      <div>
                        <span class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          ${trx.name}
                        </span>
                        ${trx.notes ? `<p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[200px]">${trx.notes}</p>` : ""}
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${trx.account_color || "#6366f1"}"></div>
                      <span class="text-sm text-gray-700 dark:text-gray-300">${trx.account_name || "-"}</span>
                    </div>
                    ${isTransfer ? `
                      <div class="flex items-center gap-1.5 mt-1 ml-4">
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${trx.to_account_name || "-"}</span>
                      </div>
                    ` : ""}
                  </td>
                  <td class="py-3.5 px-4 text-sm text-gray-500 dark:text-gray-400">
                    ${trx.category_name ? `
                      <span class="inline-flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full" style="background-color: ${trx.category_color || "#6B7280"}"></div>
                        ${trx.category_name}
                      </span>
                    ` : "-"}
                  </td>
                  <td class="py-3.5 px-4 text-sm font-semibold text-right ${amountClass} whitespace-nowrap">
                    ${prefix}${formatCurrency(trx.amount)}
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusClass}">
                      ${statusIcon} ${trx.status}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <a href="/transactions/${trx.id}/edit" 
                         class="p-2 rounded-xl text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all duration-200"
                         title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button class="delete-trx-btn p-2 rounded-xl text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                              data-id="${trx.id}"
                              data-name="${trx.name}"
                              title="Hapus">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Pagination info
  const totalPages = Math.ceil(totalCount / currentFilters.limit);
  const start = currentFilters.page * currentFilters.limit + 1;
  const end = Math.min((currentFilters.page + 1) * currentFilters.limit, totalCount);

  if (info) {
    info.textContent = totalCount > 0
      ? `Menampilkan ${start}-${end} dari ${totalCount} transaksi`
      : "";
  }

  if (buttons) {
    buttons.innerHTML = `
      <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300" 
              ${currentFilters.page === 0 ? "disabled" : ""} data-page="prev">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Sebelumnya
      </button>
      <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300" 
              ${currentFilters.page >= totalPages - 1 ? "disabled" : ""} data-page="next">
        Selanjutnya
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    `;
  }
}

function setupEventListeners(container) {
  // Search (debounced)
  let searchTimeout;
  const searchInput = container.querySelector("#search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = searchInput.value;
        currentFilters.page = 0;
        loadTransactions(container);
      }, 400);
    });
  }

  // Type filter
  const typeFilter = container.querySelector("#filter-type");
  if (typeFilter) {
    typeFilter.addEventListener("change", () => {
      currentFilters.type = typeFilter.value;
      currentFilters.page = 0;
      loadTransactions(container);
    });
  }

  // Date filters
  const startDate = container.querySelector("#filter-start-date");
  const endDate = container.querySelector("#filter-end-date");
  if (startDate) {
    startDate.addEventListener("change", () => {
      currentFilters.startDate = startDate.value;
      currentFilters.page = 0;
      loadTransactions(container);
    });
  }
  if (endDate) {
    endDate.addEventListener("change", () => {
      currentFilters.endDate = endDate.value;
      currentFilters.page = 0;
      loadTransactions(container);
    });
  }

  // Reset filter
  const resetBtn = container.querySelector("#reset-filter");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      currentFilters = { search: "", type: "", startDate: "", endDate: "", page: 0, limit: 20 };
      if (searchInput) searchInput.value = "";
      if (typeFilter) typeFilter.value = "";
      if (startDate) startDate.value = "";
      if (endDate) endDate.value = "";
      loadTransactions(container);
    });
  }

  // Pagination
  const paginationButtons = container.querySelector("#pagination-buttons");
  if (paginationButtons) {
    paginationButtons.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;

      if (btn.dataset.page === "prev") {
        currentFilters.page = Math.max(0, currentFilters.page - 1);
      } else if (btn.dataset.page === "next") {
        currentFilters.page++;
      }
      loadTransactions(container);
    });
  }

  // Delete transaction (delegated)
  const list = container.querySelector('#transactions-list');
  if (list) {
    list.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.delete-trx-btn');
      if (!deleteBtn) return;

      const id = deleteBtn.dataset.id;
      const name = deleteBtn.dataset.name;

      const confirmed = await ConfirmDialog.delete(`transaksi "${name}"`);
      if (confirmed) {
        try {
          await TransactionService.delete(id);
          Toast.success('✅ Transaksi berhasil dihapus');
          loadTransactions(container);
        } catch (error) {
          Toast.error('❌ Gagal menghapus: ' + error.message);
        }
      }
    });
  }
}