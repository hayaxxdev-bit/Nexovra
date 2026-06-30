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
 * Transactions Page - Daftar & Filter Transaksi
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Transaksi</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Kelola semua transaksi keuangan</p>
        </div>
        <a href="/transactions/new" class="btn btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Transaksi
        </a>
      </div>

      <!-- Filter Bar -->
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <input 
              type="text" 
              id="search-input" 
              class="input" 
              placeholder="Cari transaksi..."
            />
          </div>
          <!-- Type Filter -->
          <select id="filter-type" class="input w-auto">
            <option value="">Semua Tipe</option>
            <option value="income, salary, sale, receivable">Pemasukan</option>
            <option value="expense, purchase, operational, debt">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </select>
          <!-- Date Filter -->
          <input type="date" id="filter-start-date" class="input w-auto" />
          <input type="date" id="filter-end-date" class="input w-auto" />
          <!-- Reset -->
          <button id="reset-filter" class="btn btn-ghost btn-sm">Reset</button>
        </div>
      </div>

      <!-- Transactions List -->
      <div id="transactions-list">
        ${Skeleton.table(8, 6)}
      </div>

      <!-- Pagination -->
      <div id="pagination" class="flex items-center justify-between">
        <p id="pagination-info" class="text-sm text-gray-500"></p>
        <div class="flex gap-2" id="pagination-buttons"></div>
      </div>
    </div>
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

  // Empty state: tidak ada transaksi sama sekali
  if (!transactions || transactions.length === 0) {
    const hasActiveFilters =
      currentFilters.search ||
      currentFilters.type ||
      currentFilters.startDate ||
      currentFilters.endDate;

    if (hasActiveFilters) {
      // Hasil filter kosong
      list.innerHTML = `
        <div class="card p-12 text-center">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Transaksi Tidak Ditemukan</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Tidak ada transaksi yang sesuai dengan filter yang dipilih.
          </p>
          <button id="clear-filter-empty" class="btn btn-primary btn-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Filter
          </button>
        </div>
      `;

      // Event listener untuk reset
      list
        .querySelector("#clear-filter-empty")
        ?.addEventListener("click", () => {
          currentFilters = {
            search: "",
            type: "",
            startDate: "",
            endDate: "",
            page: 0,
            limit: 20,
          };
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
      // Belum ada transaksi
      list.innerHTML = EmptyState.getHTML({
        type: "transactions",
        action: { text: "Tambah Transaksi", href: "/transactions/new" },
      });
    }

    if (info) info.textContent = "";
    if (buttons) buttons.innerHTML = "";
    return;
  }

  list.innerHTML = `
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No Transaksi</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Akun</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kategori</th>
              <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah</th>
              <th class="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th class="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            ${transactions
              .map((trx) => {
                const isNegative = [
                  "expense",
                  "purchase",
                  "operational",
                  "debt",
                  "investment",
                ].includes(trx.type);
                const isTransfer = trx.type === "transfer";
                const amountClass = isTransfer
                  ? "text-blue-600 dark:text-blue-400"
                  : isNegative
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400";
                const prefix = isTransfer ? "↔ " : isNegative ? "- " : "+ ";

                return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td class="py-3 px-4 text-sm font-mono text-gray-500 dark:text-gray-400 text-xs">
                    ${trx.transaction_number || "-"}
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    ${formatDate(trx.transaction_date)}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">${getTransactionIcon(trx.type)}</span>
                      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${trx.name}</span>
                    </div>
                    ${trx.notes ? `<p class="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">${trx.notes}</p>` : ""}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full" style="background-color: ${trx.account_color || "#3B82F6"}"></div>
                      <span class="text-sm text-gray-700 dark:text-gray-300">${trx.account_name || "-"}</span>
                    </div>
                    ${
                      isTransfer
                        ? `
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span class="text-xs text-gray-500">${trx.to_account_name || "-"}</span>
                      </div>
                    `
                        : ""
                    }
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    ${
                      trx.category_name
                        ? `
                      <span class="inline-flex items-center gap-1">
                        <div class="w-2 h-2 rounded-full" style="background-color: ${trx.category_color || "#6B7280"}"></div>
                        ${trx.category_name}
                      </span>
                    `
                        : "-"
                    }
                  </td>
                  <td class="py-3 px-4 text-sm font-semibold text-right ${amountClass} whitespace-nowrap">
                    ${prefix}${formatCurrency(trx.amount)}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="badge ${getStatusBadgeClass(trx.status)} text-[10px]">${trx.status}</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href="/transactions/${trx.id}/edit" 
                         class="btn btn-ghost btn-sm p-1.5 rounded-lg"
                         title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button class="btn btn-ghost btn-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 delete-trx-btn"
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
  const end = Math.min(
    (currentFilters.page + 1) * currentFilters.limit,
    totalCount,
  );

  if (info) {
    info.textContent =
      totalCount > 0
        ? `Menampilkan ${start}-${end} dari ${totalCount} transaksi`
        : "";
  }

  if (buttons) {
    buttons.innerHTML = `
      <button class="btn btn-secondary btn-sm" ${currentFilters.page === 0 ? "disabled" : ""} data-page="prev">
        ← Sebelumnya
      </button>
      <button class="btn btn-secondary btn-sm" ${currentFilters.page >= totalPages - 1 ? "disabled" : ""} data-page="next">
        Selanjutnya →
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
      currentFilters = {
        search: "",
        type: "",
        startDate: "",
        endDate: "",
        page: 0,
        limit: 20,
      };
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

  // Delete transaction (delegated) - SUDAH ADA tapi improve
  const list = container.querySelector('#transactions-list')
  if (list) {
    list.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.delete-trx-btn')
      if (!deleteBtn) return

      const id = deleteBtn.dataset.id
      const name = deleteBtn.dataset.name

      // Konfirmasi sebelum hapus
      const confirmed = await ConfirmDialog.delete(`transaksi "${name}"`)
      if (confirmed) {
        try {
          await TransactionService.delete(id)
          Toast.success('Transaksi berhasil dihapus')
          loadTransactions(container)
        } catch (error) {
          Toast.error(handleSupabaseError(error))
        }
      }
    })
  }
}
