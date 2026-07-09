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
 * Fully responsive with mobile-first card layout
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="space-y-4 lg:space-y-6 animate-fade-in">
      <!-- Background Glow Effects -->
      <div class="fixed top-0 right-0 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[128px] -z-10 pointer-events-none"></div>
      <div class="fixed bottom-0 left-0 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-accent-500/5 dark:bg-accent-500/10 rounded-full blur-[128px] -z-10 pointer-events-none"></div>

      <!-- Header Section -->
      <div class="card p-4 sm:p-5 lg:p-6">
        <div class="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div class="space-y-0.5 sm:space-y-1">
            <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Transaksi
            </h1>
            <p class="text-xs sm:text-sm text-surface-500 dark:text-surface-400">
              Kelola semua transaksi keuangan Anda
            </p>
          </div>
          <a href="/transactions/new" 
             class="btn-primary w-full sm:w-auto text-sm lg:text-base"
             data-astro-prefetch>
            <svg class="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Tambah Transaksi</span>
            <span class="sm:hidden">Tambah</span>
          </a>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card p-3 sm:p-4 lg:p-5">
        <div class="flex flex-col lg:flex-row gap-2 sm:gap-3">
          <!-- Search Input -->
          <div class="flex-1 min-w-0 relative">
            <svg class="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500 pointer-events-none" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              id="search-input" 
              class="input pl-9 lg:pl-11 text-sm"
              placeholder="Cari transaksi..."
              autocomplete="off"
            />
          </div>
          
          <!-- Filters Group -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <!-- Type Filter -->
            <select id="filter-type" 
                    class="input text-sm w-full sm:w-auto min-w-[140px] lg:min-w-[160px]">
              <option value="">Semua Tipe</option>
              <option value="income,salary,sale,receivable">📥 Pemasukan</option>
              <option value="expense,purchase,operational,debt">📤 Pengeluaran</option>
              <option value="transfer">↔️ Transfer</option>
            </select>
            
            <!-- Date Range -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <input type="date" id="filter-start-date" 
                     class="input text-sm flex-1 sm:flex-none sm:w-[140px] lg:w-[150px] px-2 sm:px-3" />
              <span class="text-xs sm:text-sm text-surface-400 dark:text-surface-500 hidden sm:inline">s/d</span>
              <span class="text-xs text-surface-400 dark:text-surface-500 sm:hidden">-</span>
              <input type="date" id="filter-end-date" 
                     class="input text-sm flex-1 sm:flex-none sm:w-[140px] lg:w-[150px] px-2 sm:px-3" />
            </div>
          </div>
          
          <!-- Reset Button -->
          <button id="reset-filter" 
                  class="btn-secondary text-sm w-full lg:w-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="hidden sm:inline">Reset Filter</span>
            <span class="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      <!-- Transactions Container -->
      <div id="transactions-list">
        <div class="card">
          ${Skeleton.table(8, 6)}
        </div>
      </div>

      <!-- Pagination -->
      <div id="pagination" class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p id="pagination-info" class="text-xs sm:text-sm text-surface-500 dark:text-surface-400 text-center sm:text-left order-2 sm:order-1"></p>
        <div class="flex gap-2 order-1 sm:order-2" id="pagination-buttons"></div>
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

  // Empty State
  if (!transactions || transactions.length === 0) {
    const hasActiveFilters =
      currentFilters.search ||
      currentFilters.type ||
      currentFilters.startDate ||
      currentFilters.endDate;

    if (hasActiveFilters) {
      // Empty filter results
      list.innerHTML = `
        <div class="card p-8 sm:p-10 lg:p-12">
          <div class="flex flex-col items-center text-center">
            <div class="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-warning-50 dark:bg-warning-500/10 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-4 sm:mb-5 ring-4 ring-warning-100 dark:ring-warning-500/10">
              <svg class="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-warning-500 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gradient mb-1.5 sm:mb-2">
              Transaksi Tidak Ditemukan
            </h3>
            <p class="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mb-4 sm:mb-6 max-w-xs sm:max-w-sm">
              Tidak ada transaksi yang sesuai dengan filter yang dipilih. Coba ubah atau reset filter Anda.
            </p>
            <button id="clear-filter-empty" 
                    class="btn-primary text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filter
            </button>
          </div>
        </div>
      `;

      list.querySelector("#clear-filter-empty")?.addEventListener("click", () => {
        resetFilters(container);
        loadTransactions(container);
      });
    } else {
      // No transactions at all
      list.innerHTML = `
        <div class="card overflow-hidden">
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

  // Render transactions with mobile-first approach
  list.innerHTML = `
    <div class="card overflow-hidden">
      <!-- Mobile Card View (< 1024px) -->
      <div class="lg:hidden divide-y divide-surface-100 dark:divide-surface-800/30">
        ${transactions.map((trx) => renderMobileCard(trx)).join("")}
      </div>
      
      <!-- Desktop Table View (≥ 1024px) -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100 dark:border-surface-800/50 bg-surface-50/50 dark:bg-surface-800/20">
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">No Transaksi</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Tanggal</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Nama</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Akun</th>
              <th class="text-left py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Kategori</th>
              <th class="text-right py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Jumlah</th>
              <th class="text-center py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Status</th>
              <th class="text-center py-3.5 px-4 text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-50 dark:divide-surface-800/30">
            ${transactions.map((trx) => renderDesktopRow(trx)).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Pagination
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
      <button class="btn-secondary text-sm flex-1 sm:flex-none" 
              ${currentFilters.page === 0 ? "disabled" : ""} 
              data-page="prev">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="hidden sm:inline">Sebelumnya</span>
      </button>
      <button class="btn-secondary text-sm flex-1 sm:flex-none" 
              ${currentFilters.page >= totalPages - 1 ? "disabled" : ""} 
              data-page="next">
        <span class="hidden sm:inline">Selanjutnya</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    `;
  }
}

function renderMobileCard(trx) {
  const { amountClass, prefix } = getTransactionAmountStyle(trx);
  const statusBadge = renderStatusBadge(trx.status);

  return `
    <div class="p-3 sm:p-4 hover:bg-surface-50 dark:hover:bg-surface-800/10 transition-all duration-200">
      <!-- Top Row: Icon, Name & Amount -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div class="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-base shrink-0"
               style="background-color: ${trx.category_color || '#6366f1'}15">
            ${getTransactionIcon(trx.type)}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
              ${trx.name}
            </p>
            <p class="text-[10px] sm:text-xs text-surface-400 dark:text-surface-500 font-mono mt-0.5">
              ${trx.transaction_number || "-"}
            </p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-sm font-semibold ${amountClass}">
            ${prefix}${formatCurrency(trx.amount)}
          </p>
          <div class="mt-1">${statusBadge}</div>
        </div>
      </div>
      
      <!-- Details Grid -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
        <div>
          <span class="text-surface-400 dark:text-surface-500 block mb-0.5">Tanggal</span>
          <span class="text-surface-700 dark:text-surface-300 font-medium">
            ${formatDate(trx.transaction_date)}
          </span>
        </div>
        <div>
          <span class="text-surface-400 dark:text-surface-500 block mb-0.5">Akun</span>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full shrink-0" style="background-color: ${trx.account_color || "#6366f1"}"></div>
            <span class="text-surface-700 dark:text-surface-300 font-medium truncate">
              ${trx.account_name || "-"}
            </span>
          </div>
          ${trx.type === "transfer" ? `
            <div class="flex items-center gap-1 mt-0.5 ml-3.5">
              <svg class="w-2.5 h-2.5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span class="text-surface-500 dark:text-surface-400 truncate text-[10px]">
                ${trx.to_account_name || "-"}
              </span>
            </div>
          ` : ""}
        </div>
        <div>
          <span class="text-surface-400 dark:text-surface-500 block mb-0.5">Kategori</span>
          <span class="text-surface-700 dark:text-surface-300 font-medium">
            ${trx.category_name ? `
              <span class="inline-flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${trx.category_color || "#6B7280"}"></div>
                ${trx.category_name}
              </span>
            ` : "-"}
          </span>
        </div>
        ${trx.notes ? `
          <div class="col-span-2">
            <span class="text-surface-400 dark:text-surface-500 block mb-0.5">Catatan</span>
            <span class="text-surface-600 dark:text-surface-400 truncate-2">${trx.notes}</span>
          </div>
        ` : ''}
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center gap-2 pt-2 border-t border-surface-100 dark:border-surface-800/30">
        <a href="/transactions/${trx.id}/edit" 
           class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all duration-200">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </a>
        <button class="delete-trx-btn flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-error-500 dark:text-error-400 bg-error-50 dark:bg-error-500/10 hover:bg-error-100 dark:hover:bg-error-500/20 transition-all duration-200"
                data-id="${trx.id}"
                data-name="${trx.name}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus
        </button>
      </div>
    </div>
  `;
}

function renderDesktopRow(trx) {
  const { amountClass, prefix } = getTransactionAmountStyle(trx);
  const statusBadge = renderStatusBadge(trx.status);

  return `
    <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-all duration-200 group">
      <td class="py-3.5 px-4 text-xs font-mono text-surface-400 dark:text-surface-500">
        ${trx.transaction_number || "-"}
      </td>
      <td class="py-3.5 px-4 text-sm text-surface-600 dark:text-surface-400 whitespace-nowrap">
        ${formatDate(trx.transaction_date)}
      </td>
      <td class="py-3.5 px-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
               style="background-color: ${trx.category_color || '#6366f1'}15">
            ${getTransactionIcon(trx.type)}
          </div>
          <div>
            <span class="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              ${trx.name}
            </span>
            ${trx.notes ? `<p class="text-xs text-surface-400 dark:text-surface-500 mt-0.5 truncate max-w-[200px]">${trx.notes}</p>` : ""}
          </div>
        </div>
      </td>
      <td class="py-3.5 px-4">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${trx.account_color || "#6366f1"}"></div>
          <span class="text-sm text-surface-700 dark:text-surface-300">${trx.account_name || "-"}</span>
        </div>
        ${trx.type === "transfer" ? `
          <div class="flex items-center gap-1.5 mt-1 ml-4">
            <svg class="w-3 h-3 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span class="text-xs text-surface-500 dark:text-surface-400">${trx.to_account_name || "-"}</span>
          </div>
        ` : ""}
      </td>
      <td class="py-3.5 px-4 text-sm text-surface-500 dark:text-surface-400">
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
        ${statusBadge}
      </td>
      <td class="py-3.5 px-4 text-center">
        <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <a href="/transactions/${trx.id}/edit" 
             class="p-2 rounded-xl text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all duration-200"
             title="Edit transaksi">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </a>
          <button class="delete-trx-btn p-2 rounded-xl text-surface-400 hover:text-error-500 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all duration-200"
                  data-id="${trx.id}"
                  data-name="${trx.name}"
                  title="Hapus transaksi">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// Helper Functions
function getTransactionAmountStyle(trx) {
  const isNegative = ["expense", "purchase", "operational", "debt", "investment"].includes(trx.type);
  const isTransfer = trx.type === "transfer";
  
  return {
    amountClass: isTransfer
      ? "text-finance-transfer"
      : isNegative
        ? "text-finance-expense"
        : "text-finance-income",
    prefix: isTransfer ? "↔ " : isNegative ? "- " : "+ "
  };
}

function renderStatusBadge(status) {
  const statusConfig = {
    completed: {
      class: 'badge-success',
      icon: '✓'
    },
    pending: {
      class: 'badge-warning',
      icon: '⏳'
    },
    failed: {
      class: 'badge-error',
      icon: '✗'
    }
  };

  const config = statusConfig[status] || {
    class: 'badge-info',
    icon: '•'
  };

  return `
    <span class="badge ${config.class} text-[10px] sm:text-xs">
      ${config.icon} ${status}
    </span>
  `;
}

function resetFilters(container) {
  currentFilters = { 
    search: "", 
    type: "", 
    startDate: "", 
    endDate: "", 
    page: 0, 
    limit: 20 
  };
  
  const searchInput = container.querySelector("#search-input");
  const typeFilter = container.querySelector("#filter-type");
  const startDate = container.querySelector("#filter-start-date");
  const endDate = container.querySelector("#filter-end-date");
  
  if (searchInput) searchInput.value = "";
  if (typeFilter) typeFilter.value = "";
  if (startDate) startDate.value = "";
  if (endDate) endDate.value = "";
}

function setupEventListeners(container) {
  // Debounced search
  let searchTimeout;
  const searchInput = container.querySelector("#search-input");
  searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = searchInput.value;
      currentFilters.page = 0;
      loadTransactions(container);
    }, 400);
  });

  // Type filter
  container.querySelector("#filter-type")?.addEventListener("change", (e) => {
    currentFilters.type = e.target.value;
    currentFilters.page = 0;
    loadTransactions(container);
  });

  // Date filters
  container.querySelector("#filter-start-date")?.addEventListener("change", (e) => {
    currentFilters.startDate = e.target.value;
    currentFilters.page = 0;
    loadTransactions(container);
  });

  container.querySelector("#filter-end-date")?.addEventListener("change", (e) => {
    currentFilters.endDate = e.target.value;
    currentFilters.page = 0;
    loadTransactions(container);
  });

  // Reset filter
  container.querySelector("#reset-filter")?.addEventListener("click", () => {
    resetFilters(container);
    loadTransactions(container);
  });

  // Pagination
  const paginationButtons = container.querySelector("#pagination-buttons");
  paginationButtons?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.disabled) return;

    if (btn.dataset.page === "prev") {
      currentFilters.page = Math.max(0, currentFilters.page - 1);
    } else if (btn.dataset.page === "next") {
      currentFilters.page++;
    }
    
    loadTransactions(container);
    
    // Smooth scroll to top on mobile
    if (window.innerWidth < 1024) {
      container.querySelector("#transactions-list")?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  });

  // Delete transaction (event delegation)
  const list = container.querySelector('#transactions-list');
  list?.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-trx-btn');
    if (!deleteBtn) return;

    const { id, name } = deleteBtn.dataset;
    const confirmed = await ConfirmDialog.delete(`transaksi "${name}"`);
    
    if (confirmed) {
      try {
        await TransactionService.delete(id);
        Toast.success('✅ Transaksi berhasil dihapus');
        await loadTransactions(container);
      } catch (error) {
        Toast.error(`❌ Gagal menghapus: ${error.message}`);
      }
    }
  });
}