import { ReportService } from '@services/report.service.js'
import { AccountService } from '@services/account.service.js'
import { LineChart } from '@components/charts/line-chart.js'
import { BarChart } from '@components/charts/bar-chart.js'
import { PieChart } from '@components/charts/pie-chart.js'
import { StatCard } from '@components/cards/stat-card.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { Toast } from '@components/ui/toast.js'
import { formatCurrency, formatDate } from '@core/utils.js'

/**
 * Reports Page - Nexovra Next-Gen Finance
 */
export async function render(container, params = {}) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Background Glow -->
      <div class="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/8 rounded-full blur-[150px] -z-10"></div>
      <div class="fixed bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/8 rounded-full blur-[150px] -z-10"></div>

      <!-- Header -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 no-print">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Laporan Keuangan
              </h1>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Analisis pemasukan & pengeluaran</p>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <!-- Period Toggle -->
            <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button class="period-btn px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 bg-white dark:bg-gray-700 shadow-sm" data-period="month">Bulan</button>
              <button class="period-btn px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" data-period="year">Tahun</button>
              <button class="period-btn px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" data-period="all">Semua</button>
            </div>
            <!-- Date Inputs -->
            <div class="flex items-center gap-2">
              <input type="date" id="report-start" 
                     class="px-3 py-2 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-xs focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" 
                     value="${startDate}" />
              <span class="text-gray-400 dark:text-gray-600 text-xs">s/d</span>
              <input type="date" id="report-end" 
                     class="px-3 py-2 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-xs focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" 
                     value="${endDate}" />
            </div>
            <button id="apply-filter" 
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              Terapkan
            </button>
            <!-- Export Buttons -->
            <div class="flex items-center gap-1.5">
              <button id="export-pdf-btn" 
                      class="px-3 py-2 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button id="export-excel-btn" 
                      class="px-3 py-2 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton Loading -->
      ${Skeleton.dashboard()}
    </div>
  `

  await loadReport(container, startDate, endDate, 'month')
  setupEventListeners(container)
}

async function loadReport(container, startDate, endDate, period = 'custom') {
  try {
    const [stats, incomeByCat, expenseByCat, cashflow, monthlyStats, accounts] = await Promise.all([
      ReportService.getStatsForRange(startDate, endDate),
      ReportService.getIncomeByCategory(startDate, endDate),
      ReportService.getExpenseByCategory(startDate, endDate),
      ReportService.getDailyCashflow(startDate, endDate),
      ReportService.getMonthlyStats({ year: new Date().getFullYear() }),
      AccountService.getAll({ includeInactive: false }),
    ])

    window.__reportData = { 
      stats, 
      incomeByCat: incomeByCat || [], 
      expenseByCat: expenseByCat || [], 
      cashflow: cashflow || [], 
      monthlyStats: monthlyStats || [], 
      accounts: accounts || [], 
      startDate, 
      endDate 
    }

    renderContent(container, { stats, incomeByCat, expenseByCat, cashflow, monthlyStats, accounts, startDate, endDate, period })
  } catch (error) {
    console.error('Report error:', error)
    container.innerHTML = `
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]"></div>
          <div class="relative">
            <div class="text-7xl mb-6">⚠️</div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Gagal Memuat Laporan
            </h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">${error.message}</p>
            <button onclick="location.reload()" 
                    class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              🔄 Coba Lagi
            </button>
          </div>
        </div>
      </div>
    `
  }
}

function renderContent(container, { stats, incomeByCat, expenseByCat, cashflow, monthlyStats, accounts, startDate, endDate, period }) {
  const periodLabels = { 
    month: 'Bulan Ini', 
    year: 'Tahun Ini', 
    all: 'Semua Waktu', 
    custom: `${formatDate(startDate)} - ${formatDate(endDate)}` 
  }

  const safeStats = {
    income: Number(stats?.income) || 0,
    expense: Number(stats?.expense) || 0,
    net: Number(stats?.net) || 0,
    transactionCount: Number(stats?.transactionCount) || 0,
  }

  const totalAssets = (accounts || []).reduce((sum, a) => sum + Number(a.current_balance || 0), 0)

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Print Header (hidden on screen) -->
      <div class="hidden print:block mb-8">
        <h1 class="text-2xl font-bold">Nexovra - Laporan Keuangan</h1>
        <p class="text-gray-500">Periode: ${periodLabels[period] || periodLabels.custom} | Dicetak: ${formatDate(new Date(), 'full')}</p>
      </div>

      <!-- Control Bar -->
      <div class="relative overflow-hidden bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 no-print">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Laporan Keuangan
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">${periodLabels[period] || periodLabels.custom}</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button class="period-btn px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${period === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}" data-period="month">Bulan</button>
              <button class="period-btn px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${period === 'year' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}" data-period="year">Tahun</button>
              <button class="period-btn px-4 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${period === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}" data-period="all">Semua</button>
            </div>
            <div class="flex items-center gap-2">
              <input type="date" id="report-start" class="px-3 py-2 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-xs focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" value="${startDate}" />
              <span class="text-gray-400 dark:text-gray-600 text-xs">s/d</span>
              <input type="date" id="report-end" class="px-3 py-2 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 text-xs focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300" value="${endDate}" />
            </div>
            <button id="apply-filter" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-medium transition-all duration-300 shadow-lg shadow-purple-500/25">Terapkan</button>
            <div class="flex items-center gap-1.5">
              <button id="export-pdf-btn" class="px-3 py-2 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF
              </button>
              <button id="export-excel-btn" class="px-3 py-2 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        ${renderStatCardHTML('Total Aset', totalAssets, '💰', 'blue')}
        ${renderStatCardHTML('Pemasukan', safeStats.income, '📥', 'green')}
        ${renderStatCardHTML('Pengeluaran', safeStats.expense, '📤', 'red')}
        ${renderStatCardHTML('Laba Bersih', safeStats.net, '📊', safeStats.net >= 0 ? 'purple' : 'red')}
        ${renderStatCardHTML('Transaksi', safeStats.transactionCount, '📋', 'indigo', false)}
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Cash Flow Harian</h3>
          <div class="h-72"><canvas id="cashflow-chart"></canvas></div>
        </div>
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pengeluaran per Kategori</h3>
          <div class="h-72"><canvas id="expense-pie-chart"></canvas></div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pemasukan per Kategori</h3>
          <div class="h-72"><canvas id="income-pie-chart"></canvas></div>
        </div>
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Ringkasan Bulanan ${new Date().getFullYear()}</h3>
          <div class="h-72"><canvas id="monthly-bar-chart"></canvas></div>
        </div>
      </div>

      <!-- Accounts Summary Table -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div class="p-5 border-b border-gray-100 dark:border-gray-800/50">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Saldo per Akun</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/20">
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Akun</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jenis</th>
                <th class="text-right py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800/30">
              ${(accounts || []).map(a => `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                  <td class="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">${a.name || ''}</td>
                  <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">${typeof a.account_type === 'object' ? (a.account_type?.name || '') : ''}</td>
                  <td class="py-3 px-4 text-sm font-semibold text-right text-gray-900 dark:text-gray-100">${formatCurrency(a.current_balance)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-gray-50/80 dark:bg-gray-800/40 font-bold">
                <td class="py-3 px-4 text-gray-900 dark:text-gray-100" colspan="2">Total Aset</td>
                <td class="py-3 px-4 text-right text-teal-600 dark:text-teal-400">${formatCurrency(totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Category Summary Table -->
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div class="p-5 border-b border-gray-100 dark:border-gray-800/50">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Ringkasan per Kategori</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/20">
                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kategori</th>
                <th class="text-right py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pemasukan</th>
                <th class="text-right py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pengeluaran</th>
                <th class="text-right py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Selisih</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800/30">
              ${renderCategorySummary(incomeByCat, expenseByCat)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Print Footer -->
      <div class="hidden print:block text-center text-xs text-gray-400 mt-8">
        © ${new Date().getFullYear()} Nexovra - Generated from Nexovra App
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
  `

  renderCharts(cashflow, expenseByCat, incomeByCat, monthlyStats)
  setupEventListeners(container)
}

function renderStatCardHTML(title, value, icon, color, isCurrency = true) {
  const gradients = {
    blue: 'from-blue-500/10 to-blue-600/5',
    green: 'from-teal-500/10 to-green-600/5',
    red: 'from-red-500/10 to-red-600/5',
    purple: 'from-purple-500/10 to-indigo-600/5',
    indigo: 'from-indigo-500/10 to-blue-600/5',
  }

  const glows = {
    blue: 'via-blue-500/30',
    green: 'via-teal-500/30',
    red: 'via-red-500/30',
    purple: 'via-purple-500/30',
    indigo: 'via-indigo-500/30',
  }

  const iconBgs = {
    blue: 'bg-blue-100 dark:bg-blue-500/10',
    green: 'bg-emerald-100 dark:bg-emerald-500/10',
    red: 'bg-red-100 dark:bg-red-500/10',
    purple: 'bg-purple-100 dark:bg-purple-500/10',
    indigo: 'bg-indigo-100 dark:bg-indigo-500/10',
  }

  const iconTexts = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  }

  return `
    <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700/50 hover:scale-[1.02] transition-all duration-300">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent ${glows[color] || glows.blue} to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-br ${gradients[color] || gradients.blue} opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl ${iconBgs[color] || iconBgs.blue} ${iconTexts[color] || iconTexts.blue} flex items-center justify-center text-lg shadow-sm">
            ${icon}
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">${title}</span>
        </div>
        <p class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          ${isCurrency ? formatCurrency(value) : value}
        </p>
      </div>
    </div>
  `
}

function renderCategorySummary(incomeByCat, expenseByCat) {
  const all = new Map()
  const safeIncome = incomeByCat || []
  const safeExpense = expenseByCat || []

  safeIncome.forEach(c => {
    if (c && c.name) {
      all.set(c.name, { name: c.name, color: c.color || '#6B7280', income: Number(c.total) || 0, expense: 0 })
    }
  })

  safeExpense.forEach(c => {
    if (c && c.name) {
      if (all.has(c.name)) {
        all.get(c.name).expense = Number(c.total) || 0
      } else {
        all.set(c.name, { name: c.name, color: c.color || '#6B7280', income: 0, expense: Number(c.total) || 0 })
      }
    }
  })

  const sorted = [...all.values()].sort((a, b) => (b.income + b.expense) - (a.income + a.expense))

  if (sorted.length === 0) {
    return `<tr><td colspan="4" class="text-center py-12 text-gray-400 dark:text-gray-500">Tidak ada data kategori</td></tr>`
  }

  return sorted.map(c => {
    const income = c.income || 0
    const expense = c.expense || 0
    const diff = income - expense

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full shadow-sm" style="background:${c.color}"></div>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${c.name}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-sm text-right text-teal-600 dark:text-teal-400 font-semibold">${income > 0 ? formatCurrency(income) : '-'}</td>
        <td class="py-3 px-4 text-sm text-right text-red-500 dark:text-red-400 font-semibold">${expense > 0 ? formatCurrency(expense) : '-'}</td>
        <td class="py-3 px-4 text-sm text-right font-bold ${diff >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}">${formatCurrency(diff)}</td>
      </tr>
    `
  }).join('')
}

function renderCharts(cashflow, expenseByCat, incomeByCat, monthlyStats) {
  renderLineChart('cashflow-chart', cashflow)
  renderPieChart('expense-pie-chart', expenseByCat, 'Belum ada pengeluaran')
  renderPieChart('income-pie-chart', incomeByCat, 'Belum ada pemasukan')
  renderBarChart('monthly-bar-chart', monthlyStats)
}

function renderLineChart(id, data) {
  const canvas = document.getElementById(id)
  if (!canvas) return
  if (!data || data.length === 0) {
    canvas.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-gray-400 dark:text-gray-500 text-sm">Belum ada data cash flow</p></div>'
    return
  }

  LineChart.render(id, {
    labels: data.map(d => formatDate(d.date, 'short')),
    datasets: [
      { label: 'Pemasukan', data: data.map(d => Number(d.income) || 0), borderColor: '#14B8A6', backgroundColor: 'rgba(20,184,166,0.1)', fill: true },
      { label: 'Pengeluaran', data: data.map(d => Number(d.expense) || 0), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true },
    ],
  })
}

function renderPieChart(id, data, emptyMsg = 'Tidak ada data') {
  const canvas = document.getElementById(id)
  if (!canvas) return
  if (!data || data.length === 0) {
    canvas.parentElement.innerHTML = `<div class="flex items-center justify-center h-full"><p class="text-gray-400 dark:text-gray-500 text-sm">${emptyMsg}</p></div>`
    return
  }

  PieChart.render(id, { 
    labels: data.map(d => d.name), 
    data: data.map(d => Number(d.total) || 0), 
    colors: data.map(d => d.color || '#6B7280'), 
    type: 'doughnut' 
  })
}

function renderBarChart(id, data) {
  const canvas = document.getElementById(id)
  if (!canvas) return
  if (!data || data.length === 0) {
    canvas.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-gray-400 dark:text-gray-500 text-sm">Belum ada data bulanan</p></div>'
    return
  }

  BarChart.render(id, {
    labels: data.map(m => {
      const d = new Date(m.month)
      return d.toLocaleDateString('id-ID', { month: 'short' })
    }),
    datasets: [
      { label: 'Pemasukan', data: data.map(m => Number(m.total_income) || 0), backgroundColor: '#14B8A6' },
      { label: 'Pengeluaran', data: data.map(m => Number(m.total_expense) || 0), backgroundColor: '#EF4444' },
    ],
  })
}

function setupEventListeners(container) {
  // Period buttons
  container.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period
      const today = new Date()
      let startDate, endDate

      if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
      } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        endDate = today.toISOString().split('T')[0]
      } else if (period === 'all') {
        startDate = '2020-01-01'
        endDate = today.toISOString().split('T')[0]
      }

      loadReport(container, startDate, endDate, period)
    })
  })

  // Apply custom date
  container.querySelector('#apply-filter')?.addEventListener('click', () => {
    const s = container.querySelector('#report-start')?.value
    const e = container.querySelector('#report-end')?.value
    if (s && e) loadReport(container, s, e, 'custom')
  })

  // Export PDF
  container.querySelector('#export-pdf-btn')?.addEventListener('click', () => {
    Toast.info('Membuka dialog print...')
    setTimeout(() => window.print(), 300)
  })

  // Export Excel
  container.querySelector('#export-excel-btn')?.addEventListener('click', exportExcel)
}

function exportExcel() {
  const data = window.__reportData
  if (!data) { Toast.warning('Data tidak tersedia'); return }

  const { stats, incomeByCat, expenseByCat, accounts, startDate, endDate } = data

  const safeIncome = Number(stats?.income) || 0
  const safeExpense = Number(stats?.expense) || 0
  const safeNet = Number(stats?.net) || 0
  const safeCount = Number(stats?.transactionCount) || 0
  const safeAccounts = accounts || []
  const safeIncomeCat = incomeByCat || []
  const safeExpenseCat = expenseByCat || []

  let csv = '\uFEFF'
  csv += 'Nexovra - Laporan Keuangan\n'
  csv += `Periode: ${startDate} s/d ${endDate}\n\n`

  csv += 'Ringkasan\n'
  csv += 'Total Pemasukan,Total Pengeluaran,Laba Bersih,Total Transaksi\n'
  csv += `${safeIncome},${safeExpense},${safeNet},${safeCount}\n\n`

  csv += 'Saldo per Akun\n'
  csv += 'Nama Akun,Jenis,Saldo\n'
  safeAccounts.forEach(a => {
    const type = typeof a.account_type === 'object' ? (a.account_type?.name || '') : ''
    csv += `"${a.name || ''}","${type}",${Number(a.current_balance) || 0}\n`
  })

  csv += '\nKategori,Pemasukan,Pengeluaran,Selisih\n'
  const allCat = new Map()
  safeIncomeCat.forEach(c => {
    if (c && c.name) allCat.set(c.name, { income: Number(c.total) || 0, expense: 0 })
  })
  safeExpenseCat.forEach(c => {
    if (c && c.name) {
      if (allCat.has(c.name)) allCat.get(c.name).expense = Number(c.total) || 0
      else allCat.set(c.name, { income: 0, expense: Number(c.total) || 0 })
    }
  })
  allCat.forEach((v, k) => {
    const inc = v.income || 0
    const exp = v.expense || 0
    csv += `"${k}",${inc},${exp},${inc - exp}\n`
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Nexovra_Report_${startDate}_to_${endDate}.csv`
  link.click()
  URL.revokeObjectURL(url)
  Toast.success('✅ Excel berhasil di-export!')
}