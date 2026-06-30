import { formatCurrency } from '@core/utils.js'

/**
 * Stat Card Component
 * Menampilkan statistik dengan icon dan warna
 */
export const StatCard = {
  /**
   * Render stat card
   * @param {Object} options
   * @param {string} options.title
   * @param {number} options.value
   * @param {string} options.icon - SVG string or emoji
   * @param {string} options.color - 'green', 'red', 'blue', 'purple', 'yellow', 'indigo'
   * @param {boolean} options.isCurrency - Format as currency
   * @param {string} options.subtitle
   * @param {Function} options.onClick
   * @returns {string} HTML
   */
  render(options = {}) {
    const {
      title = '',
      value = 0,
      icon = '',
      color = 'blue',
      isCurrency = true,
      subtitle = '',
      onClick = null,
    } = options

    const colorMap = {
      green: {
        bg: 'bg-green-50 dark:bg-green-950',
        iconBg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-700 dark:text-green-300',
        iconText: 'text-green-600 dark:text-green-400',
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-950',
        iconBg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-700 dark:text-red-300',
        iconText: 'text-red-600 dark:text-red-400',
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950',
        iconBg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-700 dark:text-blue-300',
        iconText: 'text-blue-600 dark:text-blue-400',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950',
        iconBg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-700 dark:text-purple-300',
        iconText: 'text-purple-600 dark:text-purple-400',
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-700 dark:text-yellow-300',
        iconText: 'text-yellow-600 dark:text-yellow-400',
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-950',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900',
        text: 'text-indigo-700 dark:text-indigo-300',
        iconText: 'text-indigo-600 dark:text-indigo-400',
      },
    }

    const c = colorMap[color] || colorMap.blue

    return `
      <div class="card ${c.bg} border-0 p-5 hover:shadow-md transition-all duration-200 cursor-pointer animate-slide-up"
           ${onClick ? `onclick="${onClick}"` : ''}>
        <div class="flex items-center justify-between mb-3">
          <div class="${c.iconBg} w-10 h-10 rounded-xl flex items-center justify-center">
            <span class="text-lg ${c.iconText}">${icon}</span>
          </div>
          ${subtitle ? `<span class="text-xs text-gray-500 dark:text-gray-400">${subtitle}</span>` : ''}
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${title}</p>
        <p class="text-xl md:text-2xl font-bold ${c.text}">
          ${isCurrency ? formatCurrency(value) : value.toLocaleString('id-ID')}
        </p>
      </div>
    `
  },
}