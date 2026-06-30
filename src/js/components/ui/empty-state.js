/**
 * Empty State Component
 * Usage:
 *   EmptyState.show({ type: 'transactions', message: 'Belum ada transaksi' })
 */
export const EmptyState = {
  /**
   * Get empty state HTML
   * @param {Object} options
   * @param {string} options.type - 'transactions', 'accounts', 'search', 'default'
   * @param {string} options.title
   * @param {string} options.message
   * @param {string} options.icon - Emoji or SVG
   * @param {Object} options.action - { text: string, onClick: string (function name), href: string }
   * @returns {string} HTML
   */
  getHTML(options = {}) {
    const {
      type = 'default',
      title = '',
      message = '',
      icon = '',
      action = null,
    } = options

    const defaults = {
      transactions: {
        icon: '📊',
        title: 'Belum Ada Transaksi',
        message: 'Mulai catat pemasukan atau pengeluaran pertama Anda.',
        action: { text: 'Tambah Transaksi', href: '/transactions/new' },
      },
      accounts: {
        icon: '🏦',
        title: 'Belum Ada Akun',
        message: 'Buat akun pertama Anda untuk mulai mengelola keuangan.',
        action: { text: 'Tambah Akun', href: '/accounts' },
      },
      search: {
        icon: '🔍',
        title: 'Data Tidak Ditemukan',
        message: 'Coba gunakan kata kunci yang berbeda.',
        action: null,
      },
      cashbook: {
        icon: '📖',
        title: 'Buku Kas Kosong',
        message: 'Belum ada transaksi yang tercatat di buku kas.',
        action: null,
      },
      default: {
        icon: '📭',
        title: 'Tidak Ada Data',
        message: 'Data masih kosong.',
        action: null,
      },
    }

    const config = { ...defaults[type] || defaults.default, ...options }
    if (!icon && config.icon) config.icon = config.icon
    if (!title && config.title) config.title = config.title
    if (!message && config.message) config.message = config.message
    if (!action && config.action) config.action = config.action

    const finalIcon = icon || config.icon
    const finalTitle = title || config.title
    const finalMessage = message || config.message
    const finalAction = action || config.action

    return `
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <div class="text-6xl mb-6">${finalIcon}</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          ${finalTitle}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          ${finalMessage}
        </p>
        ${finalAction ? `
          ${finalAction.href ? `
            <a href="${finalAction.href}" class="btn btn-primary" data-no-router>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              ${finalAction.text}
            </a>
          ` : `
            <button class="btn btn-primary" onclick="${finalAction.onClick}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              ${finalAction.text}
            </button>
          `}
        ` : ''}
      </div>
    `
  },

  /**
   * Render empty state to container
   * @param {HTMLElement|string} container
   * @param {Object} options
   */
  render(container, options = {}) {
    const el = typeof container === 'string' 
      ? document.querySelector(container) 
      : container
    
    if (el) {
      el.innerHTML = this.getHTML(options)
    }
  },
}