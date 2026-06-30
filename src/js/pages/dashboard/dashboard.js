import { AccountService } from "@services/account.service.js";
import { ReportService } from "@services/report.service.js";
import { TransactionService } from "@services/transaction.service.js";
import { StatCard } from "@components/cards/stat-card.js";
import { AccountCard } from "@components/cards/account-card.js";
import { Skeleton } from "@components/ui/skeleton.js";
import { LineChart } from "@components/charts/line-chart.js";
import { PieChart } from "@components/charts/pie-chart.js";
import {
  formatCurrency,
  formatDate,
  getTransactionColor,
  getTransactionIcon,
  getStatusBadgeClass,
} from "@core/utils.js";

// ==========================================
// ✅ KONFIGURASI CACHE (Ditaruh di top-level scope)
// ==========================================
const CACHE_DURATION = 60000; // 60 detik (dalam milidetik)
let dashboardCache = null;

/**
 * Dashboard Page
 */
export async function render(container, params = {}) {
  // 1. Cek apakah ada data di cache dan apakah masih valid (di bawah 60 detik)
  if (dashboardCache && (Date.now() - dashboardCache.timestamp < CACHE_DURATION)) {
    console.log("⚡ Memuat Dashboard menggunakan data dari Cache");
    
    // Langsung render data dari cache tanpa memicu skeleton loading atau fetch API ulang
    renderContent(container, dashboardCache.data);
    return; // Berhenti di sini
  }

  // 2. Jika cache tidak ada atau sudah kedaluwarsa, jalankan loading & ambil data baru
  container.innerHTML = Skeleton.dashboard();

  try {
    const [
      summary,
      accounts,
      monthlyStats,
      recentTransactions,
      expenseCategories,
    ] = await Promise.all([
      ReportService.getDashboardSummary(),
      AccountService.getAll({ includeInactive: false }),
      ReportService.getMonthlyStats({ year: new Date().getFullYear() }),
      TransactionService.getRecent(5),
      ReportService.getExpenseByCategory(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        new Date().toISOString().split("T")[0],
      ),
    ]);

    const dashboardData = {
      summary,
      accounts,
      monthlyStats,
      recentTransactions,
      expenseCategories,
    };

    // 3. Simpan data yang baru diambil ke dalam cache beserta timestamp saat ini
    dashboardCache = {
      timestamp: Date.now(),
      data: dashboardData
    };

    renderContent(container, dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="text-5xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Gagal Memuat Dashboard</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">${error.message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Coba Lagi</button>
      </div>
    `;
  }
}

function renderContent(
  container,
  { summary, accounts, monthlyStats, recentTransactions, expenseCategories },
) {
  const today = new Date();
  const currentMonth = today.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Ringkasan keuangan ${currentMonth}</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="stat-total-assets"></div>
        <div id="stat-month-income"></div>
        <div id="stat-month-expense"></div>
        <div id="stat-net-profit"></div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Cashflow Chart -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Cash Flow Bulanan</h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">${today.getFullYear()}</span>
          </div>
          <div class="h-72">
            <canvas id="cashflow-chart"></canvas>
          </div>
        </div>

        <!-- Expense by Category -->
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pengeluaran per Kategori</h3>
          <div class="h-72">
            <canvas id="expense-pie-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Accounts & Recent Transactions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Accounts Summary -->
        <div class="lg:col-span-1 card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Akun Saya</h3>
            <a href="/accounts" class="text-xs text-primary-600 hover:text-primary-500 font-medium">Lihat Semua</a>
          </div>
          <div id="accounts-list" class="space-y-3"></div>
          <a href="/accounts" class="btn btn-secondary w-full mt-4 text-sm">
            Kelola Akun
          </a>
        </div>

        <!-- Recent Transactions -->
        <div class="lg:col-span-2 card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Aktivitas Terbaru</h3>
            <a href="/transactions" class="text-xs text-primary-600 hover:text-primary-500 font-medium">Lihat Semua</a>
          </div>
          <div id="recent-transactions" class="divide-y divide-gray-100 dark:divide-gray-800"></div>
          <a href="/transactions/new" class="btn btn-primary w-full mt-4 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Transaksi
          </a>
        </div>
      </div>
    </div>
  `;

  // Render stat cards
  renderStatCards(container, summary);

  // Render accounts
  renderAccounts(container, accounts);

  // Render recent transactions
  renderRecentTransactions(container, recentTransactions);

  // Render charts
  renderCashflowChart(monthlyStats);
  renderExpensePieChart(expenseCategories);
}

function renderStatCards(container, summary) {
  const statTotalAssets = container.querySelector("#stat-total-assets");
  const statMonthIncome = container.querySelector("#stat-month-income");
  const statMonthExpense = container.querySelector("#stat-month-expense");
  const statNetProfit = container.querySelector("#stat-net-profit");

  if (statTotalAssets) {
    statTotalAssets.innerHTML = StatCard.render({
      title: "Total Aset",
      value: summary.totalAssets,
      icon: "💰",
      color: "blue",
      subtitle: "Semua Akun",
    });
  }

  if (statMonthIncome) {
    statMonthIncome.innerHTML = StatCard.render({
      title: "Pemasukan Bulan Ini",
      value: summary.month.income,
      icon: "📥",
      color: "green",
    });
  }

  if (statMonthExpense) {
    statMonthExpense.innerHTML = StatCard.render({
      title: "Pengeluaran Bulan Ini",
      value: summary.month.expense,
      icon: "📤",
      color: "red",
    });
  }

  if (statNetProfit) {
    statNetProfit.innerHTML = StatCard.render({
      title: "Laba Bersih",
      value: summary.month.net,
      icon: "📊",
      color: summary.month.net >= 0 ? "purple" : "red",
    });
  }
}

function renderAccounts(container, accounts) {
  const accountsList = container.querySelector("#accounts-list");
  if (!accountsList) return;

  if (!accounts || accounts.length === 0) {
    accountsList.innerHTML = `
      <div class="text-center py-6">
        <p class="text-gray-400 dark:text-gray-500 text-sm">Belum ada akun</p>
      </div>
    `;
    return;
  }

  // Show max 5 accounts
  const displayAccounts = accounts.slice(0, 5);
  accountsList.innerHTML = displayAccounts
    .map((account) => {
      const iconMap = {
        banknotes: "💵",
        "building-bank": "🏦",
        "device-mobile": "📱",
        "piggy-bank": "🐷",
        "trending-up": "📈",
        briefcase: "💼",
        wallet: "👛",
      };
      const icon =
        typeof account.account_type === "object"
          ? iconMap[account.account_type?.icon] || "💰"
          : "💰";

      return `
      <a href="/accounts/${account.id}" 
         class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
             style="background-color: ${account.color}20; color: ${account.color}">
          ${icon}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">${account.name}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${typeof account.account_type === "object" ? account.account_type?.name : ""}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">${formatCurrency(account.current_balance)}</p>
        </div>
      </a>
    `;
    })
    .join("");

  if (accounts.length > 5) {
    accountsList.insertAdjacentHTML(
      "beforeend",
      `
      <p class="text-center text-xs text-gray-400 dark:text-gray-500">
        +${accounts.length - 5} akun lainnya
      </p>
    `,
    );
  }
}

function renderRecentTransactions(container, transactions) {
  const list = container.querySelector("#recent-transactions");
  if (!list) return;

  if (!transactions || transactions.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8">
        <div class="text-4xl mb-3">📭</div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi</p>
        <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Mulai catat transaksi pertama Anda</p>
      </div>
    `;
    return;
  }

  list.innerHTML = transactions
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
      <div class="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 -mx-2 transition-colors">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
             style="background-color: ${trx.account_color || "#3B82F6"}15">
          ${getTransactionIcon(trx.type)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">${trx.name}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ${trx.account_name || ""} · ${formatDate(trx.transaction_date, "relative")}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold ${amountClass}">${prefix}${formatCurrency(trx.amount)}</p>
          <span class="badge ${getStatusBadgeClass(trx.status)} text-[10px]">${trx.status}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderCashflowChart(monthlyStats) {
  const canvas = document.getElementById("cashflow-chart");
  if (!canvas) {
    console.warn("Canvas #cashflow-chart not ready");
    return;
  }
  const labels = monthlyStats.map((m) => {
    const date = new Date(m.month);
    return date.toLocaleDateString("id-ID", { month: "short" });
  });

  LineChart.render("cashflow-chart", {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: monthlyStats.map((m) => m.total_income),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
      },
      {
        label: "Pengeluaran",
        data: monthlyStats.map((m) => m.total_expense),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
      },
    ],
  });
}

function renderExpensePieChart(expenseCategories) {
  const canvas = document.getElementById("expense-pie-chart");
  if (!canvas) return;

  if (!expenseCategories || expenseCategories.length === 0) {
    const parent = canvas.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-4xl mb-3">📊</div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada data pengeluaran</p>
          </div>
        </div>
      `;
    }
    return;
  }

  PieChart.render("expense-pie-chart", {
    labels: expenseCategories.map((c) => c.name),
    data: expenseCategories.map((c) => c.total),
    colors: expenseCategories.map((c) => c.color),
    type: "doughnut",
  });
}
