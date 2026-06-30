/**
 * Skeleton Loading Component
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
    return `<div class="skeleton h-4 rounded ${className}"></div>`
  },

  /**
   * Card skeleton
   * @returns {string} HTML
   */
  card() {
    return `
      <div class="card p-6 animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="skeleton h-5 w-24 rounded"></div>
          <div class="skeleton h-8 w-8 rounded-lg"></div>
        </div>
        <div class="skeleton h-8 w-36 rounded mb-3"></div>
        <div class="skeleton h-4 w-20 rounded"></div>
      </div>
    `
  },

  /**
   * Stat card skeleton
   * @returns {string} HTML
   */
  statCard() {
    return `
      <div class="card p-5 animate-pulse">
        <div class="flex items-center gap-3 mb-3">
          <div class="skeleton w-10 h-10 rounded-xl"></div>
          <div class="skeleton h-4 w-20 rounded"></div>
        </div>
        <div class="skeleton h-7 w-32 rounded mb-2"></div>
        <div class="skeleton h-3 w-16 rounded"></div>
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
      `<div class="skeleton h-4 w-full rounded"></div>`
    ).join('')

    const bodyRows = Array(rows).fill('').map(() => {
      const cols = Array(columns).fill('').map(() => 
        `<div class="skeleton h-4 w-full rounded"></div>`
      ).join('')
      return `<div class="grid grid-cols-${columns} gap-4 py-3">${cols}</div>`
    }).join('')

    return `
      <div class="animate-pulse">
        <div class="grid grid-cols-${columns} gap-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
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
      <div class="card p-5 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="skeleton w-12 h-12 rounded-2xl shrink-0"></div>
          <div class="flex-1">
            <div class="skeleton h-5 w-32 rounded mb-2"></div>
            <div class="skeleton h-8 w-28 rounded"></div>
          </div>
          <div class="skeleton h-8 w-8 rounded-lg"></div>
        </div>
      </div>
    `
  },

  /**
   * Dashboard skeleton
   * @returns {string} HTML
   */
  dashboard() {
    return `
      <div class="space-y-6 animate-pulse">
        <!-- Stat cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${Array(4).fill('').map(() => this.statCard()).join('')}
        </div>
        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card p-6">
            <div class="skeleton h-5 w-32 rounded mb-4"></div>
            <div class="skeleton h-64 w-full rounded-xl"></div>
          </div>
          <div class="card p-6">
            <div class="skeleton h-5 w-32 rounded mb-4"></div>
            <div class="skeleton h-64 w-full rounded-xl"></div>
          </div>
        </div>
        <!-- Recent activity -->
        <div class="card p-6">
          <div class="skeleton h-5 w-40 rounded mb-4"></div>
          ${Array(5).fill('').map(() => `
            <div class="flex items-center gap-4 py-3">
              <div class="skeleton w-10 h-10 rounded-xl shrink-0"></div>
              <div class="flex-1">
                <div class="skeleton h-4 w-48 rounded mb-2"></div>
                <div class="skeleton h-3 w-24 rounded"></div>
              </div>
              <div class="skeleton h-5 w-20 rounded"></div>
            </div>
          `).join('')}
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
    return Array(items).fill('').map(() => `
      <div class="flex items-center gap-4 py-4 animate-pulse">
        <div class="skeleton w-8 h-8 rounded-full shrink-0"></div>
        <div class="flex-1">
          <div class="skeleton h-4 w-3/4 rounded mb-2"></div>
          <div class="skeleton h-3 w-1/2 rounded"></div>
        </div>
      </div>
    `).join('')
  },
}