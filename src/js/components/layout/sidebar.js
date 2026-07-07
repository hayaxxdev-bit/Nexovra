import { AuthService } from "@services/auth.service.js";
import { ConfirmDialog } from "@components/ui/confirm-dialog.js";
import { Toast } from "@components/ui/toast.js";
import { supabase } from "@services/supabase.js";

export const Sidebar = {
  _app: null,
  _isOpen: false,
  _quickStatsInterval: null,

  init(appElement) {
    this._app = appElement;
    this._render();
    this._setupEvents();
    this._initQuickStats();
    this._listenForUpdates();
  },

  _render() {
    const sidebar = this._app.querySelector("#sidebar");
    if (!sidebar) return;

    const currentPath = window.location.pathname;

    const menuItems = [
      {
        label: "Dashboard",
        icon: "dashboard",
        href: "/",
        active: currentPath === "/",
      },
      {
        label: "Akun",
        icon: "accounts",
        href: "/accounts",
        active: currentPath.startsWith("/accounts"),
      },
      {
        label: "Transaksi",
        icon: "transactions",
        href: "/transactions",
        active: currentPath.startsWith("/transactions"),
      },
      {
        label: "Transfer",
        icon: "transfer",
        href: "/transfer",
        active: currentPath === "/transfer",
      },
      {
        label: "Buku Kas",
        icon: "cashbook",
        href: "/cashbook",
        active: currentPath === "/cashbook",
      },
      {
        label: "Planner",
        icon: "planner",
        href: "/planner",
        active: currentPath === "/planner",
      },
    ];

    const bottomItems = [
      {
        label: "Laporan",
        icon: "reports",
        href: "/reports",
        active: currentPath === "/reports",
      },
      {
        label: "Pengaturan",
        icon: "settings",
        href: "/settings",
        active: currentPath === "/settings",
      },
    ];

    sidebar.innerHTML = `
      <div class="flex flex-col h-full bg-white dark:bg-[#0a0a0f]">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800/50 shrink-0">
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div class="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
              <span class="text-white font-bold text-xl tracking-tight">N</span>
            </div>
          </div>
          <div class="min-w-0">
            <h1 class="font-bold text-gray-900 dark:text-white text-lg leading-tight tracking-tight">Nexo</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-tight">Manajemen Keuangan</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          <!-- Main Menu Section -->
          <div>
            <p class="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menu Utama</p>
            <div class="space-y-1">
              ${menuItems.map((item) => this._getMenuItemHTML(item)).join("")}
            </div>
          </div>

          <!-- Divider -->
          <div class="mx-3 border-t border-gray-100 dark:border-gray-800/50"></div>

          <!-- Other Menu Section -->
          <div>
            <p class="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lainnya</p>
            <div class="space-y-1">
              ${bottomItems.map((item) => this._getMenuItemHTML(item)).join("")}
            </div>
          </div>

          <!-- ✅ Quick Stats Card - Dinamis -->
          <div class="mx-2 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/5 dark:to-indigo-500/5 rounded-2xl border border-purple-100 dark:border-purple-500/10 hidden lg:block">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-lg">⚡</span>
                <p class="text-xs font-semibold text-purple-700 dark:text-purple-300">Quick Stats</p>
              </div>
              <!-- Loading indicator -->
              <div id="quick-stats-loader" class="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin hidden"></div>
            </div>
            <div id="quick-stats-content" class="space-y-2">
              <!-- Loading skeleton -->
              <div class="animate-pulse space-y-2">
                <div class="flex justify-between items-center">
                  <div class="h-3 bg-purple-200 dark:bg-purple-500/20 rounded w-20"></div>
                  <div class="h-3 bg-purple-200 dark:bg-purple-500/20 rounded w-24"></div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="h-3 bg-purple-200 dark:bg-purple-500/20 rounded w-16"></div>
                  <div class="h-3 bg-purple-200 dark:bg-purple-500/20 rounded w-20"></div>
                </div>
                <div class="flex justify-between items-center">
                  <div class="h-3 bg-purple-200 dark:bg-purple-500/20 rounded w-14"></div>
                  <div class="h-3 bg-purple-200 dark:bg-purple-500/20 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <!-- User Profile Footer -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-800/50">
          <div id="sidebar-profile" class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-gray-700/50">
            <div class="relative">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-all duration-300">
                <span id="profile-avatar">U</span>
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-500 rounded-full border-2 border-white dark:border-[#0a0a0f]"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p id="profile-name" class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Loading...</p>
              <p id="profile-email" class="text-xs text-gray-500 dark:text-gray-400 truncate">...</p>
            </div>
            <button id="sidebar-logout" class="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100" title="Keluar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          <!-- Version -->
          <p class="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-3 hidden lg:block">
            Nexovra v1.0.0
          </p>
        </div>
      </div>
    `;
  },

  _getMenuItemHTML(item) {
    const iconSVGs = {
      dashboard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
      accounts: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>`,
      transactions: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4V2m0 0v2m0-2h10M7 4h10m0 0v2m0-2v2M4 7h16M4 7v10a3 3 0 003 3h10a3 3 0 003-3V7H4z" /></svg>`,
      transfer: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>`,
      cashbook: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
      reports: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
      settings: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
      planner: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>`,
    };

    const isActive = item.active;
    const baseClasses =
      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden";

    const activeClasses = isActive
      ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium shadow-sm"
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200";

    return `
      <a href="${item.href}" class="${baseClasses} ${activeClasses}">
        ${
          isActive
            ? `
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-r-full"></div>
        `
            : ""
        }
        <span class="shrink-0 relative ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"} transition-colors">
          ${iconSVGs[item.icon] || '<span class="text-lg">📄</span>'}
        </span>
        <span class="text-sm flex-1">${item.label}</span>
        ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>' : ""}
      </a>
    `;
  },

  _setupEvents() {
    const logoutBtn = this._app.querySelector("#sidebar-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await ConfirmDialog.logout();
        if (confirmed) {
          try {
            await AuthService.logout();
            Toast.success("Berhasil keluar");
            window.__app.router.navigate("/login");
          } catch (error) {
            Toast.error("Gagal keluar: " + error.message);
          }
        }
      });
    }

    const overlay = this._app.querySelector("#sidebar-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => this._toggleMobile());
    }

    // Profile click to navigate to settings
    const profileEl = this._app.querySelector("#sidebar-profile");
    if (profileEl) {
      profileEl.addEventListener("click", (e) => {
        if (e.target.closest("#sidebar-logout")) return;
        window.__app?.router?.navigate("/settings");
      });
    }
  },

  /**
   * ✅ Initialize Quick Stats - Auto update
   */
  _initQuickStats() {
    // Load initial data
    this._fetchQuickStats();

    // Set interval untuk auto-refresh setiap 30 detik
    this._quickStatsInterval = setInterval(() => {
      this._fetchQuickStats();
    }, 30000); // 30 detik
  },

  /**
   * ✅ Listen for real-time updates
   */
  _listenForUpdates() {
    // Listen for transaction changes
    window.__app?.events?.on("transaction:created", () => {
      this._fetchQuickStats();
    });

    window.__app?.events?.on("transaction:updated", () => {
      this._fetchQuickStats();
    });

    window.__app?.events?.on("transaction:deleted", () => {
      this._fetchQuickStats();
    });

    // Listen for account changes
    window.__app?.events?.on("account:updated", () => {
      this._fetchQuickStats();
    });

    // Listen for route changes (refresh stats when navigating)
    window.__app?.events?.on("route:changed", () => {
      this._fetchQuickStats();
    });
  },

  /**
   * ✅ Fetch Quick Stats dari database
   */
  // src/js/components/layout/sidebar.js

  async _fetchQuickStats() {
    const statsContent = this._app?.querySelector("#quick-stats-content");
    const loader = this._app?.querySelector("#quick-stats-loader");

    if (!statsContent) return;
    if (loader) loader.classList.remove("hidden");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const firstDayStr = formatDate(firstDayOfMonth);
      const todayStr = formatDate(today);
      const tomorrowStr = formatDate(tomorrow);

      // ==========================================
      // ✅ Get Total Assets - PAKAI current_balance
      // ==========================================
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("current_balance") // ✅ Kolom yang benar
        .eq("user_id", user.id);

      if (accountsError) throw accountsError;

      const totalAssets =
        accounts?.reduce(
          (sum, acc) => sum + (Number(acc.current_balance) || 0),
          0,
        ) || 0;

      // ==========================================
      // ✅ Get Monthly Income
      // ==========================================
      const { data: monthlyIncome, error: incomeError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "income")
        .gte("transaction_date", firstDayStr)
        .lte("transaction_date", tomorrowStr);

      if (incomeError) throw incomeError;

      const totalMonthlyIncome =
        monthlyIncome?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) ||
        0;

      // ==========================================
      // ✅ Get Monthly Expense
      // ==========================================
      const { data: monthlyExpense, error: expenseError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("transaction_date", firstDayStr)
        .lte("transaction_date", tomorrowStr);

      if (expenseError) throw expenseError;

      const totalMonthlyExpense =
        monthlyExpense?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) ||
        0;

      // ==========================================
      // ✅ Get Today's Transaction Count
      // ==========================================
      const { count: todayTransactions, error: countError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("transaction_date", todayStr)
        .lte("transaction_date", tomorrowStr);

      if (countError) throw countError;

      // ==========================================
      // ✅ Update UI
      // ==========================================
      this._updateQuickStatsUI({
        totalAssets,
        totalMonthlyIncome,
        totalMonthlyExpense,
        todayTransactions: todayTransactions || 0,
        balance: totalMonthlyIncome - totalMonthlyExpense,
      });
    } catch (error) {
      console.error("❌ Quick stats error:", error);
      this._updateQuickStatsUI({
        totalAssets: 0,
        totalMonthlyIncome: 0,
        totalMonthlyExpense: 0,
        todayTransactions: 0,
        balance: 0,
        error: true,
        errorMessage: error.message,
      });
    } finally {
      if (loader) loader.classList.add("hidden");
    }
  },

  _updateQuickStatsUI(stats) {
    const statsContent = this._app?.querySelector("#quick-stats-content");
    if (!statsContent) return;

    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined || isNaN(amount)) {
        return "Rp 0";
      }
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const compactCurrency = (amount) => {
      if (Math.abs(amount) >= 1000000000) {
        return `Rp ${(amount / 1000000000).toFixed(1)}M`;
      } else if (Math.abs(amount) >= 1000000) {
        return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
      }
      return formatCurrency(amount);
    };

    if (stats.error) {
      statsContent.innerHTML = `
      <div class="text-center py-2">
        <p class="text-xs text-gray-400 dark:text-gray-500">
          ${stats.errorMessage || "Gagal memuat stats"}
        </p>
        <button onclick="window.__app.sidebar._fetchQuickStats()" 
                class="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1">
          Coba lagi
        </button>
      </div>
    `;
      return;
    }

    const balanceColor =
      stats.balance >= 0
        ? "text-teal-600 dark:text-teal-400"
        : "text-red-600 dark:text-red-400";

    statsContent.innerHTML = `
    <div class="flex justify-between items-center">
      <span class="text-xs text-gray-600 dark:text-gray-400">Total Aset</span>
      <span class="text-xs font-semibold text-gray-900 dark:text-gray-100">${compactCurrency(stats.totalAssets)}</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-xs text-gray-600 dark:text-gray-400">Pemasukan</span>
      <span class="text-xs font-semibold text-teal-600 dark:text-teal-400">${compactCurrency(stats.totalMonthlyIncome)}</span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-xs text-gray-600 dark:text-gray-400">Pengeluaran</span>
      <span class="text-xs font-semibold text-red-600 dark:text-red-400">${compactCurrency(stats.totalMonthlyExpense)}</span>
    </div>
    <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-600 dark:text-gray-400">Saldo Bulan Ini</span>
        <span class="text-xs font-bold ${balanceColor}">${compactCurrency(stats.balance)}</span>
      </div>
    </div>
    <div class="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 mt-1">
      <span>Transaksi Hari Ini</span>
      <span class="font-medium">${stats.todayTransactions} tx</span>
    </div>
  `;
  },

  /**
   * ✅ Update Quick Stats UI
   */
  _updateQuickStatsUI(stats) {
    const statsContent = this._app?.querySelector("#quick-stats-content");
    if (!statsContent) return;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const compactCurrency = (amount) => {
      if (amount >= 1000000000) {
        return `Rp ${(amount / 1000000000).toFixed(1)}M`;
      } else if (amount >= 1000000) {
        return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
      }
      return formatCurrency(amount);
    };

    if (stats.error) {
      statsContent.innerHTML = `
        <div class="text-center py-2">
          <p class="text-xs text-gray-400 dark:text-gray-500">Gagal memuat stats</p>
          <button onclick="window.__app.sidebar._fetchQuickStats()" 
                  class="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1">
            Coba lagi
          </button>
        </div>
      `;
      return;
    }

    const balanceColor =
      stats.balance >= 0
        ? "text-teal-600 dark:text-teal-400"
        : "text-red-600 dark:text-red-400";

    statsContent.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-600 dark:text-gray-400">Total Aset</span>
        <span class="text-xs font-semibold text-gray-900 dark:text-gray-100">${compactCurrency(stats.totalAssets)}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-600 dark:text-gray-400">Pemasukan</span>
        <span class="text-xs font-semibold text-teal-600 dark:text-teal-400">${compactCurrency(stats.totalMonthlyIncome)}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-600 dark:text-gray-400">Pengeluaran</span>
        <span class="text-xs font-semibold text-red-600 dark:text-red-400">${compactCurrency(stats.totalMonthlyExpense)}</span>
      </div>
      <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-600 dark:text-gray-400">Saldo Bulan Ini</span>
          <span class="text-xs font-bold ${balanceColor}">${compactCurrency(stats.balance)}</span>
        </div>
      </div>
      <div class="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 mt-1">
        <span>Transaksi Hari Ini</span>
        <span class="font-medium">${stats.todayTransactions} tx</span>
      </div>
    `;
  },

  updateProfile(profile) {
    const nameEl = this._app?.querySelector("#profile-name");
    const emailEl = this._app?.querySelector("#profile-email");
    const avatarEl = this._app?.querySelector("#profile-avatar");

    if (nameEl && profile?.full_name) nameEl.textContent = profile.full_name;
    if (emailEl) {
      const user = window.__app?.store?.getState("auth.user");
      emailEl.textContent = user?.email || "";
    }
    if (avatarEl && profile?.full_name) {
      const initials = profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      avatarEl.textContent = initials;
    }
  },

  /**
   * Toggle mobile sidebar
   */
  _toggleMobile() {
    const sidebar = this._app.querySelector("#sidebar");
    const overlay = this._app.querySelector("#sidebar-overlay");

    this._isOpen = !this._isOpen;

    if (this._isOpen) {
      sidebar?.classList.remove("hidden");
      sidebar?.classList.add(
        "fixed",
        "inset-y-0",
        "left-0",
        "z-50",
        "w-[280px]",
        "shadow-2xl",
      );
      overlay?.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    } else {
      sidebar?.classList.add("hidden");
      sidebar?.classList.remove(
        "fixed",
        "inset-y-0",
        "left-0",
        "z-50",
        "w-[280px]",
        "shadow-2xl",
      );
      overlay?.classList.add("hidden");
      document.body.style.overflow = "";
    }
  },

  /**
   * Open mobile sidebar
   */
  openMobile() {
    this._isOpen = false;
    this._toggleMobile();
  },

  /**
   * Close mobile sidebar
   */
  closeMobile() {
    if (this._isOpen) {
      this._isOpen = true;
      this._toggleMobile();
    }
  },

  /**
   * ✅ Cleanup
   */
  destroy() {
    if (this._quickStatsInterval) {
      clearInterval(this._quickStatsInterval);
      this._quickStatsInterval = null;
    }
  },
};
