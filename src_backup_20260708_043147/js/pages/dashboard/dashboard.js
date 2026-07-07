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
// ✅ KONFIGURASI CACHE
// ==========================================
const CACHE_DURATION = 60000; // 60 detik
let dashboardCache = null;

/**
 * Dashboard Page - Nexovra Next-Gen Design
 * Support Light & Dark Mode
 */
export async function render(container, params = {}) {
  // Cache check
  if (dashboardCache && (Date.now() - dashboardCache.timestamp < CACHE_DURATION)) {
    console.log("⚡ Memuat Dashboard menggunakan data dari Cache");
    renderContent(container, dashboardCache.data);
    return;
  }

  // Modern skeleton loading
  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Header Skeleton -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="h-8 w-48 bg-gray-200 dark:bg-[#1a1a24] rounded-lg animate-pulse"></div>
        <div class="h-4 w-32 bg-gray-200 dark:bg-[#1a1a24] rounded mt-2 animate-pulse"></div>
      </div>

      <!-- Stats Grid Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${Array(4).fill(`
          <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
            <div class="h-4 w-24 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-3"></div>
            <div class="h-8 w-36 bg-gray-300 dark:bg-[#22222d] rounded animate-pulse mb-2"></div>
            <div class="h-3 w-20 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse"></div>
          </div>
        `).join('')}
      </div>

      <!-- Charts Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5">
          <div class="h-5 w-40 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-4"></div>
          <div class="h-72 bg-gray-200 dark:bg-[#1a1a24] rounded-xl animate-pulse"></div>
        </div>
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5">
          <div class="h-5 w-48 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-4"></div>
          <div class="h-72 bg-gray-200 dark:bg-[#1a1a24] rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Bottom Grid Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5">
          <div class="h-5 w-28 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-4"></div>
          ${Array(3).fill(`
            <div class="flex items-center gap-3 py-3">
              <div class="w-10 h-10 bg-gray-200 dark:bg-[#1a1a24] rounded-xl animate-pulse"></div>
              <div class="flex-1">
                <div class="h-4 w-28 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-1"></div>
                <div class="h-3 w-20 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse"></div>
              </div>
              <div class="h-4 w-20 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse"></div>
            </div>
          `).join('')}
        </div>
        <div class="lg:col-span-2 bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5">
          <div class="h-5 w-36 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-4"></div>
          ${Array(4).fill(`
            <div class="flex items-center gap-4 py-3">
              <div class="w-10 h-10 bg-gray-200 dark:bg-[#1a1a24] rounded-xl animate-pulse"></div>
              <div class="flex-1">
                <div class="h-4 w-32 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse mb-1"></div>
                <div class="h-3 w-24 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse"></div>
              </div>
              <div class="h-4 w-24 bg-gray-200 dark:bg-[#1a1a24] rounded animate-pulse"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

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

    dashboardCache = {
      timestamp: Date.now(),
      data: dashboardData
    };

    renderContent(container, dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    container.innerHTML = `
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]"></div>
          <div class="relative">
            <div class="text-7xl mb-6 animate-bounce">⚠️</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">Gagal Memuat Dashboard</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md">${error.message}</p>
            <button onclick="location.reload()" 
                    class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              🔄 Coba Lagi
            </button>
          </div>
        </div>
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

  const hour = today.getHours();
  let greeting = "Selamat Pagi 🌅";
  if (hour >= 12 && hour < 15) greeting = "Selamat Siang ☀️";
  else if (hour >= 15 && hour < 18) greeting = "Selamat Sore 🌤️";
  else if (hour >= 18) greeting = "Selamat Malam 🌙";

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Background Elements -->
      <div class="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/8 rounded-full blur-[150px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/8 rounded-full blur-[150px] -z-10"></div>

      <!-- Page Header with Greeting -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/5 dark:from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">${greeting}</p>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Ringkasan keuangan ${currentMonth}</p>
            </div>
            <div class="hidden sm:flex items-center gap-2">
              <button onclick="window.__app?.router?.navigate('/transactions/new')" 
                      class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
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
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden group">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 dark:via-teal-500/50 to-transparent"></div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-200">Cash Flow Bulanan</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pemasukan & Pengeluaran</p>
            </div>
            <span class="px-3 py-1 bg-gray-100 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-lg text-xs text-gray-500 dark:text-gray-400">${today.getFullYear()}</span>
          </div>
          <div class="h-72">
            <canvas id="cashflow-chart"></canvas>
          </div>
        </div>

        <!-- Expense by Category -->
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden group">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 dark:via-purple-500/50 to-transparent"></div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-200">Pengeluaran per Kategori</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distribusi pengeluaran bulan ini</p>
            </div>
          </div>
          <div class="h-72">
            <canvas id="expense-pie-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Accounts & Recent Transactions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Accounts Summary -->
        <div class="lg:col-span-1 bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-200">Akun Saya</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${accounts?.length || 0} akun terdaftar</p>
            </div>
            <a href="/accounts" 
               class="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium transition-colors flex items-center gap-1 group">
              Semua
              <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div id="accounts-list" class="space-y-2"></div>
          <a href="/accounts" 
             class="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-[#22222f] hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Kelola Akun
          </a>
        </div>

        <!-- Recent Transactions -->
        <div class="lg:col-span-2 bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-200">Aktivitas Terbaru</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">5 transaksi terakhir</p>
            </div>
            <a href="/transactions" 
               class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium transition-colors flex items-center gap-1 group">
              Riwayat
              <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div id="recent-transactions" class="divide-y divide-gray-100 dark:divide-gray-800/50"></div>
          <a href="/transactions/new" 
             class="flex items-center justify-center gap-2 w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Transaksi
          </a>
        </div>
      </div>
    </div>

    <style>
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-out;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .animate-bounce {
        animation: bounce 2s ease-in-out infinite;
      }
    </style>
  `;

  // Render components
  renderStatCards(container, summary);
  renderAccounts(container, accounts);
  renderRecentTransactions(container, recentTransactions);
  renderCashflowChart(monthlyStats);
  renderExpensePieChart(expenseCategories);
}

function renderStatCards(container, summary) {
  const statTotalAssets = container.querySelector("#stat-total-assets");
  const statMonthIncome = container.querySelector("#stat-month-income");
  const statMonthExpense = container.querySelector("#stat-month-expense");
  const statNetProfit = container.querySelector("#stat-net-profit");

  const cardConfigs = [
    {
      element: statTotalAssets,
      config: {
        title: "Total Aset",
        value: summary.totalAssets,
        icon: "💰",
        color: "blue",
        subtitle: "Semua Akun",
        gradient: "from-blue-500/10 to-blue-600/5",
        borderGlow: "via-blue-500/30",
        iconBg: "bg-blue-100 dark:bg-blue-500/10",
        iconText: "text-blue-600 dark:text-blue-400",
      }
    },
    {
      element: statMonthIncome,
      config: {
        title: "Pemasukan",
        value: summary.month.income,
        icon: "📥",
        color: "green",
        subtitle: "Bulan Ini",
        gradient: "from-teal-500/10 to-green-600/5",
        borderGlow: "via-teal-500/30",
        iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
        iconText: "text-emerald-600 dark:text-emerald-400",
      }
    },
    {
      element: statMonthExpense,
      config: {
        title: "Pengeluaran",
        value: summary.month.expense,
        icon: "📤",
        color: "red",
        subtitle: "Bulan Ini",
        gradient: "from-red-500/10 to-red-600/5",
        borderGlow: "via-red-500/30",
        iconBg: "bg-red-100 dark:bg-red-500/10",
        iconText: "text-red-600 dark:text-red-400",
      }
    },
    {
      element: statNetProfit,
      config: {
        title: "Laba Bersih",
        value: summary.month.net,
        icon: "📊",
        color: summary.month.net >= 0 ? "purple" : "red",
        subtitle: summary.month.net >= 0 ? "Profit" : "Loss",
        gradient: summary.month.net >= 0 
          ? "from-purple-500/10 to-indigo-600/5" 
          : "from-red-500/10 to-red-600/5",
        borderGlow: summary.month.net >= 0 ? "via-purple-500/30" : "via-red-500/30",
        iconBg: summary.month.net >= 0 
          ? "bg-purple-100 dark:bg-purple-500/10" 
          : "bg-red-100 dark:bg-red-500/10",
        iconText: summary.month.net >= 0 
          ? "text-purple-600 dark:text-purple-400" 
          : "text-red-600 dark:text-red-400",
      }
    },
  ];

  cardConfigs.forEach(({ element, config }) => {
    if (element) {
      element.innerHTML = renderModernStatCard(config);
    }
  });
}

function renderModernStatCard({ title, value, icon, color, subtitle, gradient, borderGlow, iconBg, iconText }) {
  const trendIcon = value >= 0 ? '📈' : '📉';
  const trendClass = value >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400';
  
  return `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700/50 transition-all duration-300 hover:scale-[1.02]">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent ${borderGlow} to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div class="relative">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg ${iconBg} ${iconText} flex items-center justify-center text-sm shadow-sm">
              ${icon}
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">${title}</span>
          </div>
        </div>
        
        <div class="mb-2">
          <span class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            ${formatCurrency(value)}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 dark:text-gray-500">${subtitle}</span>
          <span class="text-xs ${trendClass} flex items-center gap-1 font-medium">
            ${trendIcon}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderAccounts(container, accounts) {
  const accountsList = container.querySelector("#accounts-list");
  if (!accountsList) return;

  if (!accounts || accounts.length === 0) {
    accountsList.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#1a1a24] rounded-2xl flex items-center justify-center text-2xl">
          💳
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada akun</p>
        <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Tambahkan akun pertama Anda</p>
      </div>
    `;
    return;
  }

  const displayAccounts = accounts.slice(0, 5);
  accountsList.innerHTML = displayAccounts
    .map((account, index) => {
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
         class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1a24] transition-all duration-300 group hover:scale-[1.02]"
         style="animation: fade-in 0.3s ease-out ${index * 0.1}s both">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 relative overflow-hidden shadow-sm"
             style="background: linear-gradient(135deg, ${account.color}20, ${account.color}10)">
          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-white/5"></div>
          <span class="relative">${icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-200 truncate group-hover:text-gray-700 dark:group-hover:text-white transition-colors">${account.name}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">${typeof account.account_type === "object" ? account.account_type?.name : ""}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-200">${formatCurrency(account.current_balance)}</p>
        </div>
      </a>
    `;
    })
    .join("");

  if (accounts.length > 5) {
    accountsList.insertAdjacentHTML(
      "beforeend",
      `
      <div class="text-center py-2">
        <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1a1a24] px-3 py-1 rounded-full">
          +${accounts.length - 5} akun lainnya
        </span>
      </div>
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
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#1a1a24] rounded-2xl flex items-center justify-center text-2xl">
          📭
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi</p>
        <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Mulai catat transaksi pertama Anda</p>
      </div>
    `;
    return;
  }

  list.innerHTML = transactions
    .map((trx, index) => {
      const isNegative = [
        "expense", "purchase", "operational", "debt", "investment",
      ].includes(trx.type);
      const isTransfer = trx.type === "transfer";
      const amountClass = isTransfer
        ? "text-blue-600 dark:text-blue-400"
        : isNegative
          ? "text-red-500 dark:text-red-400"
          : "text-teal-600 dark:text-teal-400";
      const prefix = isTransfer ? "↔ " : isNegative ? "- " : "+ ";
      
      const statusColors = {
        completed: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
        pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
      };
      const statusClass = statusColors[trx.status] || 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';

      return `
      <div class="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1a24] rounded-xl px-3 -mx-3 transition-all duration-300 group"
           style="animation: fade-in 0.3s ease-out ${index * 0.1}s both">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 relative overflow-hidden shadow-sm"
             style="background: linear-gradient(135deg, ${trx.account_color || '#3B82F6'}15, ${trx.account_color || '#3B82F6'}05)">
          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-white/5"></div>
          <span class="relative">${getTransactionIcon(trx.type)}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">${trx.name}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ${trx.account_name || ""} · ${formatDate(trx.transaction_date, "relative")}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold ${amountClass}">${prefix}${formatCurrency(trx.amount)}</p>
          <span class="inline-block px-2 py-0.5 rounded-full text-[10px] border ${statusClass}">
            ${trx.status === 'completed' ? '✓ ' : trx.status === 'pending' ? '⏳ ' : '✗ '}${trx.status}
          </span>
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
        borderColor: "#14B8A6",
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#14B8A6",
        borderWidth: 2,
      },
      {
        label: "Pengeluaran",
        data: monthlyStats.map((m) => m.total_expense),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#EF4444",
        borderWidth: 2,
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
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#1a1a24] rounded-2xl flex items-center justify-center text-2xl">
              📊
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada data pengeluaran</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Data akan muncul setelah ada transaksi</p>
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
    cutout: "65%",
  });
}