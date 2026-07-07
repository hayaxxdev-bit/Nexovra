/**
 * Empty State Component - Nexovra Next-Gen
 * Usage:
 *   EmptyState.show({ type: 'transactions', message: 'Belum ada transaksi' })
 *   EmptyState.render('#container', { type: 'accounts' })
 */
export const EmptyState = {
  /**
   * Get empty state HTML
   * @param {Object} options
   * @param {string} options.type - 'transactions', 'accounts', 'search', 'default', 'cashbook'
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

    // Next-Gen Icon SVGs
    const iconSVGs = {
      transactions: `
        <div class="relative">
          <div class="w-24 h-24 bg-purple-50 dark:bg-purple-500/10 rounded-3xl flex items-center justify-center mb-2 ring-4 ring-purple-100 dark:ring-purple-500/10">
            <svg class="w-12 h-12 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div class="absolute -top-2 -right-2 w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      `,
      accounts: `
        <div class="relative">
          <div class="w-24 h-24 bg-teal-50 dark:bg-teal-500/10 rounded-3xl flex items-center justify-center mb-2 ring-4 ring-teal-100 dark:ring-teal-500/10">
            <svg class="w-12 h-12 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      `,
      search: `
        <div class="relative">
          <div class="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center mb-2 ring-4 ring-amber-100 dark:ring-amber-500/10">
            <svg class="w-12 h-12 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div class="absolute -top-2 -right-2 w-8 h-8 bg-red-400 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      `,
      cashbook: `
        <div class="relative">
          <div class="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mb-2 ring-4 ring-blue-100 dark:ring-blue-500/10">
            <svg class="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      `,
      default: `
        <div class="relative">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-2 ring-4 ring-gray-200 dark:ring-gray-700">
            <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>
      `,
    }

const defaults = {
      transactions: {
        icon: `<div class="flex justify-center w-full">${iconSVGs.transactions}</div>`,
        title: 'Belum Ada Transaksi',
        message: 'Mulai catat pemasukan atau pengeluaran pertama Anda untuk melacak keuangan dengan lebih baik.',
        action: { text: 'Tambah Transaksi', href: '/transactions/new' },
        bgGlow: 'bg-purple-500/5',
        borderGlow: 'via-purple-500/30',
      },
      accounts: {
        icon: iconSVGs.accounts,
        title: 'Belum Ada Akun',
        message: 'Buat akun pertama Anda untuk mulai mengelola keuangan secara terorganisir.',
        action: { text: 'Tambah Akun', href: '/accounts' },
        bgGlow: 'bg-teal-500/5',
        borderGlow: 'via-teal-500/30',
      },
      search: {
        icon: iconSVGs.search,
        title: 'Data Tidak Ditemukan',
        message: 'Coba gunakan kata kunci yang berbeda atau periksa filter yang diterapkan.',
        action: null,
        bgGlow: 'bg-amber-500/5',
        borderGlow: 'via-amber-500/30',
      },
      cashbook: {
        icon: iconSVGs.cashbook,
        title: 'Buku Kas Kosong',
        message: 'Belum ada transaksi yang tercatat di buku kas bulan ini.',
        action: null,
        bgGlow: 'bg-blue-500/5',
        borderGlow: 'via-blue-500/30',
      },
      default: {
        icon: iconSVGs.default,
        title: 'Tidak Ada Data',
        message: 'Data masih kosong. Mulai dengan menambahkan data baru.',
        action: null,
        bgGlow: 'bg-gray-500/5',
        borderGlow: 'via-gray-500/30',
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
      <div class="relative flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <!-- Background Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${config.bgGlow} rounded-full blur-[100px]"></div>
        
        <!-- Content -->
        <div class="relative z-10">
          <!-- Icon Container -->
          <div class="mb-8 animate-float">
            ${finalIcon}
          </div>
          
          <!-- Title -->
          <h3 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            ${finalTitle}
          </h3>
          
          <!-- Message -->
          <p class="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
            ${finalMessage}
          </p>
          
          <!-- Action Button -->
          ${finalAction ? `
            ${finalAction.href ? `
              <a href="${finalAction.href}" 
                 class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-100"
                 data-no-router>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                ${finalAction.text}
              </a>
            ` : `
              <button class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-100"
                      onclick="${finalAction.onClick}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                ${finalAction.text}
              </button>
            `}
          ` : ''}
        </div>
      </div>

      <style>
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      </style>
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

  /**
   * Quick presets
   */
  transactions(message) {
    return this.getHTML({ 
      type: 'transactions', 
      message: message || 'Mulai catat pemasukan atau pengeluaran pertama Anda.' 
    })
  },

  accounts(message) {
    return this.getHTML({ 
      type: 'accounts', 
      message: message || 'Buat akun pertama Anda untuk mulai mengelola keuangan.' 
    })
  },

  search(message) {
    return this.getHTML({ 
      type: 'search', 
      message: message || 'Coba gunakan kata kunci yang berbeda.' 
    })
  },

  cashbook(message) {
    return this.getHTML({ 
      type: 'cashbook', 
      message: message || 'Belum ada transaksi yang tercatat di buku kas.' 
    })
  },
}