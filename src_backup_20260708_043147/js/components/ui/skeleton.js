/**
 * Skeleton Loading Component - Nexovra Next-Gen
 * Usage:
 *   Skeleton.card()      - Single card skeleton
 *   Skeleton.table(5)    - Table with 5 rows
 *   Skeleton.dashboard() - Dashboard layout skeleton
 */
export const Skeleton = {
  /**
   * Single line skeleton
   * @param {string} className - Additional classes
   * @returns {string} HTML
   */
  line(className = '') {
    return `<div class="skeleton h-4 rounded-lg ${className}"></div>`
  },

  /**
   * Card skeleton
   * @returns {string} HTML
   */
  card() {
    return `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="flex items-center justify-between mb-4">
          <div class="skeleton h-5 w-24 rounded-lg"></div>
          <div class="skeleton h-8 w-8 rounded-xl"></div>
        </div>
        <div class="skeleton h-8 w-36 rounded-lg mb-3"></div>
        <div class="skeleton h-4 w-20 rounded-lg"></div>
      </div>
    `
  },

  /**
   * Stat card skeleton
   * @returns {string} HTML
   */
  statCard() {
    return `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 animate-pulse relative overflow-hidden group">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="flex items-center justify-between mb-3">
          <div class="skeleton h-4 w-20 rounded-lg"></div>
          <div class="skeleton w-10 h-10 rounded-xl"></div>
        </div>
        <div class="skeleton h-8 w-36 rounded-lg mb-2"></div>
        <div class="flex items-center justify-between">
          <div class="skeleton h-3 w-16 rounded-lg"></div>
          <div class="skeleton h-3 w-12 rounded-lg"></div>
        </div>
      </div>
    `
  },

  /**
   * Table skeleton
   * @param {number} rows
   * @param {number} columns
   * @returns {string} HTML
   */
  table(rows = 5, columns = 5) {
    const headerCols = Array(columns).fill('').map(() => 
      `<div class="skeleton h-4 w-full rounded-lg"></div>`
    ).join('')

    const bodyRows = Array(rows).fill('').map((_, index) => {
      const cols = Array(columns).fill('').map(() => 
        `<div class="skeleton h-4 w-full rounded-lg"></div>`
      ).join('')
      return `
        <div class="grid grid-cols-${columns} gap-4 py-3.5 border-b border-gray-100 dark:border-gray-800/30 last:border-0">
          ${cols}
        </div>
      `
    }).join('')

    return `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="grid grid-cols-${columns} gap-4 py-3 border-b border-gray-200 dark:border-gray-700/50 mb-2">
          ${headerCols}
        </div>
        ${bodyRows}
      </div>
    `
  },

  /**
   * Account card skeleton
   * @returns {string} HTML
   */
  accountCard() {
    return `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        <div class="flex items-center gap-4">
          <div class="skeleton w-12 h-12 rounded-2xl shrink-0"></div>
          <div class="flex-1">
            <div class="skeleton h-5 w-32 rounded-lg mb-2"></div>
            <div class="skeleton h-8 w-28 rounded-lg"></div>
          </div>
          <div class="skeleton h-8 w-8 rounded-xl"></div>
        </div>
      </div>
    `
  },

  /**
   * Form skeleton
   * @returns {string} HTML
   */
  form() {
    return `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-5 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        ${Array(4).fill('').map(() => `
          <div>
            <div class="skeleton h-4 w-24 rounded-lg mb-2"></div>
            <div class="skeleton h-11 w-full rounded-xl"></div>
          </div>
        `).join('')}
        <div class="skeleton h-12 w-full rounded-xl mt-6"></div>
      </div>
    `
  },

  /**
   * Dashboard skeleton
   * @returns {string} HTML
   */
  dashboard() {
    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header Skeleton -->
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent"></div>
          <div class="skeleton h-8 w-48 rounded-lg mb-2"></div>
          <div class="skeleton h-4 w-32 rounded-lg"></div>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${Array(4).fill('').map(() => this.statCard()).join('')}
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-300 dark:via-teal-700 to-transparent"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="skeleton h-5 w-40 rounded-lg"></div>
              <div class="skeleton h-6 w-16 rounded-lg"></div>
            </div>
            <div class="skeleton h-72 w-full rounded-xl"></div>
          </div>
          <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent"></div>
            <div class="skeleton h-5 w-48 rounded-lg mb-4"></div>
            <div class="skeleton h-72 w-full rounded-xl"></div>
          </div>
        </div>

        <!-- Bottom Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Accounts Skeleton -->
          <div class="lg:col-span-1 bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-300 dark:via-teal-700 to-transparent"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="skeleton h-5 w-28 rounded-lg"></div>
              <div class="skeleton h-4 w-12 rounded-lg"></div>
            </div>
            ${Array(3).fill('').map(() => `
              <div class="flex items-center gap-3 py-3">
                <div class="skeleton w-10 h-10 rounded-xl shrink-0"></div>
                <div class="flex-1">
                  <div class="skeleton h-4 w-32 rounded-lg mb-1.5"></div>
                  <div class="skeleton h-3 w-20 rounded-lg"></div>
                </div>
                <div class="skeleton h-4 w-24 rounded-lg"></div>
              </div>
            `).join('')}
            <div class="skeleton h-11 w-full rounded-xl mt-4"></div>
          </div>

          <!-- Transactions Skeleton -->
          <div class="lg:col-span-2 bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent"></div>
            <div class="flex items-center justify-between mb-4">
              <div class="skeleton h-5 w-36 rounded-lg"></div>
              <div class="skeleton h-4 w-16 rounded-lg"></div>
            </div>
            ${Array(5).fill('').map(() => `
              <div class="flex items-center gap-4 py-3.5 border-b border-gray-100 dark:border-gray-800/30 last:border-0">
                <div class="skeleton w-10 h-10 rounded-xl shrink-0"></div>
                <div class="flex-1">
                  <div class="skeleton h-4 w-48 rounded-lg mb-1.5"></div>
                  <div class="skeleton h-3 w-28 rounded-lg"></div>
                </div>
                <div class="text-right">
                  <div class="skeleton h-4 w-24 rounded-lg mb-1.5"></div>
                  <div class="skeleton h-3 w-16 rounded-full"></div>
                </div>
              </div>
            `).join('')}
            <div class="skeleton h-12 w-full rounded-xl mt-4"></div>
          </div>
        </div>
      </div>
    `
  },

  /**
   * List skeleton
   * @param {number} items
   * @returns {string} HTML
   */
  list(items = 5) {
    return `
      <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-4 animate-pulse relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        ${Array(items).fill('').map((_, index) => `
          <div class="flex items-center gap-4 py-3.5 ${index < items - 1 ? 'border-b border-gray-100 dark:border-gray-800/30' : ''}">
            <div class="skeleton w-10 h-10 rounded-xl shrink-0"></div>
            <div class="flex-1">
              <div class="skeleton h-4 w-3/4 rounded-lg mb-1.5"></div>
              <div class="skeleton h-3 w-1/2 rounded-lg"></div>
            </div>
            <div class="skeleton h-4 w-20 rounded-lg"></div>
          </div>
        `).join('')}
      </div>
    `
  },

  /**
   * Detail page skeleton
   * @returns {string} HTML
   */
  detail() {
    return `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          <div class="flex items-center gap-4">
            <div class="skeleton w-16 h-16 rounded-2xl shrink-0"></div>
            <div>
              <div class="skeleton h-7 w-48 rounded-lg mb-2"></div>
              <div class="skeleton h-4 w-32 rounded-lg"></div>
            </div>
          </div>
        </div>

        <!-- Content Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${Array(2).fill('').map(() => `
            <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 animate-pulse relative overflow-hidden">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
              <div class="skeleton h-5 w-32 rounded-lg mb-4"></div>
              ${Array(4).fill('').map(() => `
                <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800/30 last:border-0">
                  <div class="skeleton h-4 w-24 rounded-lg"></div>
                  <div class="skeleton h-4 w-32 rounded-lg"></div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `
  },

  /**
   * Full page skeleton (customizable)
   * @param {string} type - 'dashboard' | 'table' | 'detail' | 'form' | 'list'
   * @returns {string} HTML
   */
  page(type = 'dashboard') {
    switch (type) {
      case 'table': return this.table()
      case 'detail': return this.detail()
      case 'form': return this.form()
      case 'list': return this.list()
      default: return this.dashboard()
    }
  }
}