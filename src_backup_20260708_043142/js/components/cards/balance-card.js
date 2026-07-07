import { formatCurrency } from '@core/utils.js'

/**
 * Balance Card Component
 * Menampilkan saldo dengan label dan icon
 */
export const BalanceCard = {
  /**
   * Render balance card
   * @param {Object} options
   * @param {string} options.label
   * @param {number} options.amount
   * @param {string} options.icon - Emoji
   * @param {string} options.colorClass - Tailwind color class
   * @param {string} options.trend - 'up', 'down', null
   * @param {string} options.trendValue
   * @param {string} options.size - 'sm', 'md', 'lg'
   * @returns {string} HTML
   */
  render(options = {}) {
    const {
      label = 'Saldo',
      amount = 0,
      icon = '💰',
      colorClass = 'from-primary-500 to-primary-600',
      trend = null,
      trendValue = '',
      size = 'md',
    } = options

    const trendHTML = trend ? `
      <span class="inline-flex items-center gap-1 text-xs font-medium
        ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
        ${trend === 'up' ? '↑' : '↓'} ${trendValue}
      </span>
    ` : ''

    const sizeClasses = {
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    }

    return `
      <div class="card ${sizeClasses[size]} bg-gradient-to-br ${colorClass} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">${label}</span>
          <span class="text-2xl">${icon}</span>
        </div>
        <div class="text-xl md:text-2xl font-bold tracking-tight">
          ${formatCurrency(amount)}
        </div>
        ${trendHTML ? `<div class="mt-2">${trendHTML}</div>` : ''}
      </div>
    `
  },
}