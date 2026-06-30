import { supabase } from '@services/supabase.js'
// Di bagian atas files yang menggunakan Toast.error
import { handleSupabaseError } from '@services/supabase.js'

/**
 * Report Service - Aggregation & Statistics
 */
export const ReportService = {
  /**
   * Get monthly statistics
   * @param {Object} options
   * @param {number} options.year
   * @returns {Promise<Array>}
   */
  async getMonthlyStats({ year = new Date().getFullYear() } = {}) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_monthly_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('month', `${year}-01-01`)
      .lte('month', `${year}-12-31`)
      .order('month', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * Get dashboard summary
   * @returns {Promise<Object>}
   */
  async getDashboardSummary() {
    const today = new Date().toISOString().split('T')[0]
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0]
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1)
      .toISOString().split('T')[0]

    const [totalAssets, monthStats, yearStats, todayStats, recentTransactions, accountSummary] =
      await Promise.all([
        this._getTotalAssets(),
        this._getStatsForPeriod(firstDayOfMonth, today),
        this._getStatsForPeriod(firstDayOfYear, today),
        this._getStatsForPeriod(today, today),
        this._getRecentTransactions(5),
        this._getAccountSummary(),
      ])

    return {
      totalAssets,
      today: todayStats,
      month: monthStats,
      year: yearStats,
      recentTransactions,
      accountSummary,
    }
  },

  /**
   * Get stats for date range
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Object>}
   */
  async getStatsForRange(startDate, endDate) {
    return this._getStatsForPeriod(startDate, endDate)
  },

  /**
   * Get expense breakdown by category
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  async getExpenseByCategory(startDate, endDate) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_transactions_detail')
      .select('category_name, category_color, amount')
      .eq('user_id', userId)
      .in('type', ['expense', 'purchase', 'operational'])
      .eq('status', 'completed')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .not('category_name', 'is', null)

    if (error) throw error

    const grouped = {}
    data.forEach(trx => {
      const key = trx.category_name
      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          color: trx.category_color || '#6B7280',
          total: 0,
        }
      }
      grouped[key].total += Number(trx.amount)
    })

    return Object.values(grouped).sort((a, b) => b.total - a.total)
  },

  /**
   * Get income breakdown by category
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  async getIncomeByCategory(startDate, endDate) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_transactions_detail')
      .select('category_name, category_color, amount')
      .eq('user_id', userId)
      .in('type', ['income', 'salary', 'sale', 'receivable'])
      .eq('status', 'completed')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .not('category_name', 'is', null)

    if (error) throw error

    const grouped = {}
    data.forEach(trx => {
      const key = trx.category_name
      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          color: trx.category_color || '#10B981',
          total: 0,
        }
      }
      grouped[key].total += Number(trx.amount)
    })

    return Object.values(grouped).sort((a, b) => b.total - a.total)
  },

  /**
   * Get daily cashflow for chart
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  async getDailyCashflow(startDate, endDate) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('transactions')
      .select('transaction_date, type, amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: true })

    if (error) throw error

    const grouped = {}
    data.forEach(trx => {
      const date = trx.transaction_date
      if (!grouped[date]) {
        grouped[date] = { date, income: 0, expense: 0 }
      }

      if (['income', 'salary', 'sale', 'receivable'].includes(trx.type)) {
        grouped[date].income += Number(trx.amount)
      } else if (['expense', 'purchase', 'operational', 'debt', 'investment'].includes(trx.type)) {
        grouped[date].expense += Number(trx.amount)
      }
    })

    return Object.values(grouped)
  },

  // ==================== INTERNAL METHODS ====================

  async _getTotalAssets() {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return 0

    const { data, error } = await supabase
      .from('v_total_assets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('_getTotalAssets error:', error)
      return 0
    }
    return data?.total_assets || 0
  },

  async _getStatsForPeriod(startDate, endDate) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return { income: 0, expense: 0, net: 0, transactionCount: 0 }

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

    if (error) {
      console.warn('_getStatsForPeriod error:', error)
      return { income: 0, expense: 0, net: 0, transactionCount: 0 }
    }

    const incomeTypes = ['income', 'salary', 'sale', 'receivable']
    const expenseTypes = ['expense', 'purchase', 'operational', 'debt', 'investment']

    const income = data
      .filter(t => incomeTypes.includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expense = data
      .filter(t => expenseTypes.includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      income,
      expense,
      net: income - expense,
      transactionCount: data.length,
    }
  },

  async _getRecentTransactions(limit = 5) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_transactions_detail')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('_getRecentTransactions error:', error)
      return []
    }
    return data || []
  },

  async _getAccountSummary() {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_account_summary')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.warn('_getAccountSummary error:', error)
      return []
    }
    return data || []
  },
}