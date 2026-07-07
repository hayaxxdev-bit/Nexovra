import { supabase } from '@services/supabase.js'

/**
 * Account Service - Multi Wallet Management
 */
export const AccountService = {
  /**
   * Get all accounts for current user
   * @param {Object} options
   * @param {boolean} options.includeInactive
   * @returns {Promise<Array>}
   */
  async getAll({ includeInactive = false } = {}) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    let query = supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(id, name, icon, is_default)
      `)
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * Get account by ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(id, name, icon, is_default)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create new account
   * @param {Object} account
   * @returns {Promise<Object>}
   */
  async create(account) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...account,
        user_id: userId,
        current_balance: account.initial_balance || 0,
      })
      .select(`
        *,
        account_type:account_types(id, name, icon, is_default)
      `)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update account
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        account_type:account_types(id, name, icon, is_default)
      `)
      .single()

    if (error) throw error
    return data
  },

  // ==========================================
  // ✅ PERBAIKAN DI SINI: Fungsi Delete yang Dioptimalkan
  // ==========================================
  async delete(id) {
    // 1. Cek apakah ada transaksi terkait di database
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .or(`account_id.eq.${id},to_account_id.eq.${id}`)

    if (countError) throw countError

    // 2. Jika ada transaksi, lakukan SOFT DELETE (set is_active = false)
    if (count > 0) {
      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      
      // Mengembalikan response agar UI tahu ini soft delete
      return { deleted: false, message: 'Akun memiliki transaksi terkait dan telah dinonaktifkan' }
    }

    // 3. Jika TIDAK ADA transaksi, lakukan HARD DELETE (hapus permanen)
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { deleted: true, message: 'Akun berhasil dihapus secara permanen' }
  },

  /**
   * Get account types (master data - semua user boleh lihat)
   * @returns {Promise<Array>}
   */
  async getAccountTypes() {
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * Get account summary (grouped by type) - HANYA USER INI
   * @returns {Promise<Array>}
   */
  async getSummary() {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_account_summary')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  },

  /**
   * Get total assets - HANYA USER INI
   * @returns {Promise<number>}
   */
  async getTotalAssets() {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return 0

    const { data, error } = await supabase
      .from('v_total_assets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('getTotalAssets error:', error)
      return 0
    }
    return data?.total_assets || 0
  },
}