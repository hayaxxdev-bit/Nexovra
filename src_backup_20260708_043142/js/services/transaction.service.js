import { supabase } from '@services/supabase.js'
// Di bagian atas files yang menggunakan Toast.error
import { handleSupabaseError } from '@services/supabase.js'

export const TransactionService = {
  async getAll(filters = {}) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return { data: [], count: 0 }

    const {
      type, accountId, categoryId, startDate, endDate,
      status = 'completed', search, limit = 50, offset = 0,
      orderBy = 'transaction_date', ascending = false,
    } = filters

    let query = supabase.from('v_transactions_detail').select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (type) Array.isArray(type) ? query = query.in('type', type) : query = query.eq('type', type)
    if (accountId) query = query.or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (startDate) query = query.gte('transaction_date', startDate)
    if (endDate) query = query.lte('transaction_date', endDate)
    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, error, count } = await query
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, count }
  },

  async getById(id) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    
    const { data, error } = await supabase
      .from('v_transactions_detail')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  },

  async getRecent(limit = 5) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return []

    const { data, error } = await supabase
      .from('v_transactions_detail')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) { console.warn('getRecent error:', error); return [] }
    return data || []
  },

  async create(transaction) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: userId })
      .select().single()

    if (error) throw error
    this._logActivity('create', 'transaction', data.id, `Membuat transaksi: ${data.name}`)
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions').update(updates).eq('id', id).select().single()
    if (error) throw error
    this._logActivity('update', 'transaction', data.id, `Update transaksi: ${data.name}`)
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    this._logActivity('delete', 'transaction', id, 'Menghapus transaksi')
  },

  async transfer({ fromAccountId, toAccountId, amount, name, transactionDate, notes, categoryId }) {
    if (fromAccountId === toAccountId) throw new Error('Akun tidak boleh sama')
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    const transaction = {
      type: 'transfer', name: name || 'Transfer', amount,
      account_id: fromAccountId, to_account_id: toAccountId,
      transaction_date: transactionDate || new Date().toISOString().split('T')[0],
      status: 'completed', notes, category_id: categoryId, user_id: userId,
    }

    const { data, error } = await supabase.from('transactions').insert(transaction).select().single()
    if (error) throw error
    return data
  },

  async getRunningBalance(accountId, filters = {}) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    
    const { startDate, endDate, limit = 100 } = filters
    let query = supabase.from('v_transactions_detail').select('*')
      .eq('user_id', userId)
      .or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`)
      .eq('status', 'completed')
      .order('transaction_date', { ascending: true })
      .order('created_at', { ascending: true })
    if (startDate) query = query.gte('transaction_date', startDate)
    if (endDate) query = query.lte('transaction_date', endDate)

    const { data, error } = await query.limit(limit)
    if (error) throw error

    let balance = 0
    return (data || []).map(trx => {
      if (trx.type === 'transfer') {
        if (trx.account_id === accountId) balance -= Number(trx.amount)
        else if (trx.to_account_id === accountId) balance += Number(trx.amount)
      } else if (trx.account_id === accountId) {
        if (['income', 'salary', 'sale', 'receivable'].includes(trx.type)) balance += Number(trx.amount)
        else balance -= Number(trx.amount)
      }
      return { ...trx, running_balance: balance }
    })
  },

  async _logActivity(action, entityType, entityId, description) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      await supabase.from('activity_logs').insert({
        action, entity_type: entityType, entity_id: entityId,
        description, user_id: userData?.user?.id,
      })
    } catch (error) { console.warn('Failed to log activity:', error) }
  },
}