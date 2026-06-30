import { formatCurrency } from '@core/utils.js'

/**
 * Account Card Component
 * Menampilkan detail akun dengan icon, warna, dan saldo
 */
export const AccountCard = {
  /**
   * Render account card
   * @param {Object} account
   * @param {string} account.id
   * @param {string} account.name
   * @param {string} account.account_type - name from account_types
   * @param {string} account.icon
   * @param {string} account.color
   * @param {number} account.current_balance
   * @param {string} account.description
   * @param {boolean} account.is_active
   * @param {boolean} showActions
   * @returns {string} HTML
   */
  render(account, showActions = true) {
    const {
      id,
      name,
      account_type,
      icon = 'wallet',
      color = '#3B82F6',
      current_balance = 0,
      description = '',
      is_active = true,
    } = account

    const typeName = typeof account_type === 'object' ? account_type?.name : account_type
    const typeIcon = typeof account_type === 'object' ? account_type?.icon : icon

    const iconMap = {
      banknotes: '💵',
      'building-bank': '🏦',
      'device-mobile': '📱',
      'piggy-bank': '🐷',
      'trending-up': '📈',
      briefcase: '💼',
      wallet: '👛',
      cash: '💵',
      bank: '🏦',
      ewallets: '📱',
      savings: '🐷',
      investment: '📈',
    }

    const displayIcon = iconMap[typeIcon] || iconMap[icon] || '💰'

    return `
      <div class="card p-5 hover:shadow-md transition-all duration-200 group animate-slide-up
                  ${!is_active ? 'opacity-60' : ''}">
        <div class="flex items-center gap-4">
          <!-- Icon -->
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
               style="background-color: ${color}20; color: ${color}">
            ${displayIcon}
          </div>
          
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                ${name}
              </h4>
              ${typeName ? `
                <span class="badge text-xs" style="background-color: ${color}15; color: ${color}">
                  ${typeName}
                </span>
              ` : ''}
              ${!is_active ? '<span class="badge badge-danger text-xs">Nonaktif</span>' : ''}
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${formatCurrency(current_balance)}
            </p>
            ${description ? `
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                ${description}
              </p>
            ` : ''}
          </div>

          <!-- Actions -->
          ${showActions ? `
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href="/accounts/${id}" 
                 class="btn btn-ghost btn-sm p-2 rounded-lg"
                 title="Lihat Detail">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `
  },

  /**
   * Render account list
   * @param {Array} accounts
   * @param {Object} options
   * @returns {string} HTML
   */
  renderList(accounts, options = {}) {
    if (!accounts || accounts.length === 0) {
      return `
        <div class="text-center py-12">
          <div class="text-5xl mb-4">🏦</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Belum Ada Akun
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Buat akun pertama Anda untuk mulai mengelola keuangan.
          </p>
          <a href="/accounts" class="btn btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Akun
          </a>
        </div>
      `
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${accounts.map(account => this.render(account, options.showActions)).join('')}
      </div>
    `
  },
}