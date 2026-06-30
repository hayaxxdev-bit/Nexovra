/**
 * Format currency (IDR)
 */
export function formatCurrency(amount, currency = 'IDR') {
  if (amount === null || amount === undefined) return '-'
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

/**
 * Format date
 */
export function formatDate(date, format = 'short') {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  if (format === 'relative') {
    return getRelativeTime(d)
  }

  const options = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }

  return d.toLocaleDateString('id-ID', options[format] || options.short)
}

export function formatDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRelativeTime(date) {
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
  return `${Math.floor(days / 365)} tahun lalu`
}

export function generateId() {
  return 'id-' + Math.random().toString(36).substring(2, 11)
}

export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getTransactionColor(type) {
  const colors = {
    income: 'text-green-600 dark:text-green-400',
    expense: 'text-red-600 dark:text-red-400',
    transfer: 'text-blue-600 dark:text-blue-400',
    debt: 'text-orange-600 dark:text-orange-400',
    receivable: 'text-emerald-600 dark:text-emerald-400',
    investment: 'text-indigo-600 dark:text-indigo-400',
    salary: 'text-green-600 dark:text-green-400',
    purchase: 'text-red-600 dark:text-red-400',
    sale: 'text-green-600 dark:text-green-400',
    operational: 'text-red-600 dark:text-red-400',
  }
  return colors[type] || 'text-gray-600 dark:text-gray-400'
}

export function getTransactionIcon(type) {
  const icons = {
    income: '📥', expense: '📤', transfer: '🔄', debt: '📉',
    receivable: '📈', investment: '💹', salary: '💵',
    purchase: '🛒', sale: '💰', operational: '⚙️',
  }
  return icons[type] || '💳'
}

export function getStatusBadgeClass(status) {
  const classes = {
    completed: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-danger',
    failed: 'badge-danger',
  }
  return classes[status] || 'badge-info'
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

export function setButtonLoading(btn, isLoading) {
  btn.disabled = isLoading
  btn.innerHTML = isLoading 
    ? '<svg class="animate-spin w-4 h-4">...</svg> Memproses...'
    : btn.dataset.originalText || btn.textContent
}