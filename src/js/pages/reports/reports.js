import { ReportService } from '@services/report.service.js'
import { AccountService } from '@services/account.service.js'
import { LineChart } from '@components/charts/line-chart.js'
import { BarChart } from '@components/charts/bar-chart.js'
import { PieChart } from '@components/charts/pie-chart.js'
import { StatCard } from '@components/cards/stat-card.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { Toast } from '@components/ui/toast.js'
import { formatCurrency, formatDate } from '@core/utils.js'

export async function render(container, params = {}) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Laporan Keuangan</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Analisis pemasukan & pengeluaran</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button class="period-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all bg-white dark:bg-gray-700 shadow-sm" data-period="month">Bulan</button>
            <button class="period-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all" data-period="year">Tahun</button>
            <button class="period-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all" data-period="all">Semua</button>
          </div>
          <input type="date" id="report-start" class="input w-auto text-sm" value="${startDate}" />
          <span class="text-gray-400">-</span>
          <input type="date" id="report-end" class="input w-auto text-sm" value="${endDate}" />
          <button id="apply-filter" class="btn btn-primary btn-sm">Terapkan</button>
          <button id="export-pdf-btn" class="btn btn-secondary btn-sm">📄 PDF</button>
          <button id="export-excel-btn" class="btn btn-secondary btn-sm">📊 Excel</button>
        </div>
      </div>
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

    // Store for export
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
      <div class="text-center py-16">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Gagal Memuat Laporan</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">${error.message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Coba Lagi</button>
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
      <!-- PRINT HEADER -->
      <div class="print-only-header">
        <h1>FinanceOS - Laporan Keuangan</h1>
        <p>Periode: ${periodLabels[period] || periodLabels.custom} | Dicetak: ${formatDate(new Date(), 'full')}</p>
      </div>

      <!-- Control Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Laporan Keuangan</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">${periodLabels[period] || periodLabels.custom}</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button class="period-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}" data-period="month">Bulan</button>
            <button class="period-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === 'year' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}" data-period="year">Tahun</button>
            <button class="period-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}" data-period="all">Semua</button>
          </div>
          <input type="date" id="report-start" class="input w-auto text-sm" value="${startDate}" />
          <span class="text-gray-400">-</span>
          <input type="date" id="report-end" class="input w-auto text-sm" value="${endDate}" />
          <button id="apply-filter" class="btn btn-primary btn-sm">Terapkan</button>
          <button id="export-pdf-btn" class="btn btn-secondary btn-sm">📄 PDF</button>
          <button id="export-excel-btn" class="btn btn-secondary btn-sm">📊 Excel</button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        ${StatCard.render({ title: 'Total Aset', value: totalAssets, icon: '💰', color: 'blue' })}
        ${StatCard.render({ title: 'Pemasukan', value: safeStats.income, icon: '📥', color: 'green' })}
        ${StatCard.render({ title: 'Pengeluaran', value: safeStats.expense, icon: '📤', color: 'red' })}
        ${StatCard.render({ title: 'Laba Bersih', value: safeStats.net, icon: '📊', color: safeStats.net >= 0 ? 'purple' : 'red' })}
        ${StatCard.render({ title: 'Transaksi', value: safeStats.transactionCount, icon: '📋', color: 'indigo', isCurrency: false })}
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Cash Flow Harian</h3>
          <div class="h-72"><canvas id="cashflow-chart"></canvas></div>
        </div>
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pengeluaran per Kategori</h3>
          <div class="h-72"><canvas id="expense-pie-chart"></canvas></div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pemasukan per Kategori</h3>
          <div class="h-72"><canvas id="income-pie-chart"></canvas></div>
        </div>
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Ringkasan Bulanan ${new Date().getFullYear()}</h3>
          <div class="h-72"><canvas id="monthly-bar-chart"></canvas></div>
        </div>
      </div>

      <!-- Accounts Summary -->
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Saldo per Akun</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50">
                <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Akun</th>
                <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              ${(accounts || []).map(a => `
                <tr>
                  <td class="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">${a.name || ''}</td>
                  <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">${typeof a.account_type === 'object' ? (a.account_type?.name || '') : ''}</td>
                  <td class="py-3 px-4 text-sm font-semibold text-right text-gray-900 dark:text-gray-100">${formatCurrency(a.current_balance)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-gray-50 dark:bg-gray-800/50 font-bold">
                <td class="py-3 px-4 text-gray-900 dark:text-gray-100" colspan="2">Total Aset</td>
                <td class="py-3 px-4 text-right text-green-600 dark:text-green-400">${formatCurrency(totalAssets)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Category Summary -->
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">Ringkasan per Kategori</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50">
                <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Pemasukan</th>
                <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Pengeluaran</th>
                <th class="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Selisih</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              ${renderCategorySummary(incomeByCat, expenseByCat)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- PRINT FOOTER -->
      <div class="print-only-footer">
        © ${new Date().getFullYear()} FinanceOS - Generated from FinanceOS App
      </div>
    </div>
  `

  renderCharts(cashflow, expenseByCat, incomeByCat, monthlyStats)
  setupEventListeners(container)
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
    return `<tr><td colspan="4" class="text-center py-8 text-gray-400">Tidak ada data kategori</td></tr>`
  }

  return sorted.map(c => {
    const income = c.income || 0
    const expense = c.expense || 0
    const diff = income - expense

    return `
      <tr>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background:${c.color}"></div>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${c.name}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400 font-medium">${income > 0 ? formatCurrency(income) : '-'}</td>
        <td class="py-3 px-4 text-sm text-right text-red-600 dark:text-red-400 font-medium">${expense > 0 ? formatCurrency(expense) : '-'}</td>
        <td class="py-3 px-4 text-sm text-right font-semibold ${diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${formatCurrency(diff)}</td>
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
    canvas.parentElement.innerHTML = '<p class="text-center text-gray-400 py-16">Belum ada data cash flow</p>'
    return
  }

  LineChart.render(id, {
    labels: data.map(d => formatDate(d.date, 'short')),
    datasets: [
      { 
        label: 'Pemasukan', 
        data: data.map(d => Number(d.income) || 0), 
        borderColor: '#10B981', 
        backgroundColor: 'rgba(16,185,129,0.1)', 
        fill: true 
      },
      { 
        label: 'Pengeluaran', 
        data: data.map(d => Number(d.expense) || 0), 
        borderColor: '#EF4444', 
        backgroundColor: 'rgba(239,68,68,0.1)', 
        fill: true 
      },
    ],
  })
}

function renderPieChart(id, data, emptyMsg = 'Tidak ada data') {
  const canvas = document.getElementById(id)
  if (!canvas) return
  if (!data || data.length === 0) {
    canvas.parentElement.innerHTML = `<p class="text-center text-gray-400 py-16">${emptyMsg}</p>`
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
    canvas.parentElement.innerHTML = '<p class="text-center text-gray-400 py-16">Belum ada data bulanan</p>'
    return
  }

  BarChart.render(id, {
    labels: data.map(m => {
      const d = new Date(m.month)
      return d.toLocaleDateString('id-ID', { month: 'short' })
    }),
    datasets: [
      { label: 'Pemasukan', data: data.map(m => Number(m.total_income) || 0), backgroundColor: '#10B981' },
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
  csv += 'FinanceOS - Laporan Keuangan\n'
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
  link.download = `FinanceOS_Report_${startDate}_to_${endDate}.csv`
  link.click()
  URL.revokeObjectURL(url)
  Toast.success('Excel berhasil di-export!')
}