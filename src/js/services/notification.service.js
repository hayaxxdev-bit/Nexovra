// @services/notification.service.js

import { supabase } from '@services/supabase.js'

export const NotificationService = {
  _listeners: [],
  _unsubscribe: null,
  _isSubscribed: false,
  _pollingInterval: null,
  _useRealtime: true,

  // ============================================================
  // Subscription Methods
  // ============================================================

  /**
   * Subscribe to real-time notifications
   */
  async subscribe(userId) {
    if (!userId) {
      console.warn('No user ID provided for notification subscription')
      return null
    }

    this.unsubscribe()

    if (typeof WebSocket === 'undefined' || !this._useRealtime) {
      console.warn('⚠️ WebSocket not available, using polling')
      return this._setupPolling(userId)
    }

    console.log('🔔 Subscribing to notifications for user:', userId)

    try {
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('🔔 New notification:', payload.new)
            this._notifyListeners(payload.new)
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Notification subscription successful')
            this._isSubscribed = true
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Notification subscription error:', err)
            this._isSubscribed = false
            this._setupPolling(userId)
          }
        })

      this._unsubscribe = () => {
        try {
          supabase.removeChannel(channel)
          this._isSubscribed = false
          if (this._pollingInterval) {
            clearInterval(this._pollingInterval)
            this._pollingInterval = null
          }
        } catch (e) {
          console.warn('Error removing channel:', e)
        }
      }

      return channel
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      return this._setupPolling(userId)
    }
  },

  /**
   * Fallback: Polling for notifications
   */
  _setupPolling(userId) {
    console.log('📡 Using polling for notifications')
    
    this._fetchNotifications(userId)
    
    this._pollingInterval = setInterval(() => {
      this._fetchNotifications(userId)
    }, 30000)

    this._unsubscribe = () => {
      if (this._pollingInterval) {
        clearInterval(this._pollingInterval)
        this._pollingInterval = null
      }
    }

    return null
  },

  async _fetchNotifications(userId) {
    try {
      const notifications = await this.getNotifications(userId, { limit: 10 })
      const unread = notifications.filter(n => !n.is_read)
      if (unread.length > 0) {
        unread.forEach(n => this._notifyListeners(n))
      }
    } catch (error) {
      // Silent fail untuk polling
    }
  },

  /**
   * Unsubscribe from notifications
   */
  unsubscribe() {
    if (this._unsubscribe) {
      try {
        this._unsubscribe()
      } catch (e) {
        console.warn('Error during unsubscribe:', e)
      }
      this._unsubscribe = null
    }
    this._isSubscribed = false
  },

  // ============================================================
  // Listener Methods
  // ============================================================

  /**
   * Add listener for new notifications
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this._listeners.push(callback)
      console.log(`📋 Listener added (total: ${this._listeners.length})`)
    }
  },

  /**
   * Remove listener
   */
  removeListener(callback) {
    this._listeners = this._listeners.filter(cb => cb !== callback)
    console.log(`📋 Listener removed (total: ${this._listeners.length})`)
  },

  /**
   * Notify all listeners
   */
  _notifyListeners(notification) {
    this._listeners.forEach(callback => {
      try {
        callback(notification)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })
  },

  // ============================================================
  // CRUD Methods
  // ============================================================

  /**
   * Get all notifications for user
   */
  async getNotifications(userId, options = {}) {
    if (!userId) {
      console.warn('No userId provided to getNotifications')
      return []
    }

    try {
      const { limit = 50, unreadOnly = false, offset = 0 } = options

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getNotifications:', error)
      return []
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    if (!notificationId) return null

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return null
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    if (!userId) return []

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error marking all as read:', error)
      return []
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    if (!notificationId) return false

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  },

  /**
   * Create notification (for system use)
   */
  async createNotification({ userId, title, message, type = 'info', link = null, metadata = {} }) {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          link,
          metadata,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    if (!userId) return 0

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      return 0
    }
  },

  /**
   * Cleanup old notifications
   */
  async cleanupOldNotifications(userId, days = 30) {
    if (!userId) return false

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString())

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error cleaning up notifications:', error)
      return false
    }
  },

  // ============================================================
  // Special Notification Types
  // ============================================================

  /**
   * Create monthly financial report notification
   */
  async createMonthlyReportNotification(userId, reportData) {
    if (!userId) return null

    const { month, year, totalIncome, totalExpense, balance, savingsRate } = reportData
    
    const title = `📊 Laporan Keuangan ${this._getMonthName(month)} ${year}`
    
    let message = `Pemasukan: Rp ${this._formatCurrency(totalIncome)}, `
    message += `Pengeluaran: Rp ${this._formatCurrency(totalExpense)}, `
    message += `Saldo: Rp ${this._formatCurrency(balance)}`
    
    if (savingsRate !== undefined) {
      message += `, Tabungan: ${savingsRate}%`
    }

    const metadata = {
      type: 'monthly_report',
      month,
      year,
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      reportUrl: `/reports?month=${month}&year=${year}`
    }

    return this.createNotification({
      userId,
      title,
      message,
      type: 'success',
      link: '/reports',
      metadata
    })
  },

  /**
   * Create APK update notification for mobile
   */
  async createApkUpdateNotification(userId, updateData) {
    if (!userId) return null

    const { 
      version, 
      downloadUrl, 
      releaseNotes, 
      isRequired = false,
      fileSize 
    } = updateData

    const title = `📱 Update Aplikasi v${version} Tersedia!`
    
    let message = `Versi baru ${version} siap diunduh.`
    if (releaseNotes) {
      message += ` ${releaseNotes.substring(0, 100)}${releaseNotes.length > 100 ? '...' : ''}`
    }
    if (fileSize) {
      message += ` (${this._formatFileSize(fileSize)})`
    }
    if (isRequired) {
      message += ' ⚠️ Update wajib untuk melanjutkan!'
    }

    const metadata = {
      type: 'apk_update',
      version,
      downloadUrl,
      releaseNotes,
      isRequired,
      fileSize,
      platform: 'android'
    }

    return this.createNotification({
      userId,
      title,
      message,
      type: isRequired ? 'error' : 'info',
      link: downloadUrl || '/settings',
      metadata
    })
  },

  // ============================================================
  // Bulk Operations
  // ============================================================

  /**
   * Check and send monthly reports for all users
   * (Run this via cron job or scheduled task)
   */
  async sendMonthlyReportsToAllUsers() {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('is_active', true)

      if (error) throw error

      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()
      const lastMonth = month === 0 ? 11 : month - 1
      const lastMonthYear = month === 0 ? year - 1 : year

      console.log(`📊 Sending monthly reports for ${users.length} users...`)

      let sent = 0
      let failed = 0

      for (const user of users) {
        try {
          const summary = await this._getUserMonthlySummary(user.id, lastMonth, lastMonthYear)
          
          if (summary) {
            await this.createMonthlyReportNotification(user.id, {
              month: lastMonth,
              year: lastMonthYear,
              ...summary
            })
            sent++
          }
        } catch (error) {
          console.error(`Failed to send report for user ${user.id}:`, error)
          failed++
        }
      }

      console.log(`✅ Monthly reports sent: ${sent} success, ${failed} failed`)
      return { sent, failed, total: users.length }

    } catch (error) {
      console.error('Error sending monthly reports:', error)
      throw error
    }
  },

  /**
   * Get user's monthly financial summary
   */
  async _getUserMonthlySummary(userId, month, year) {
    try {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type, category')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) throw error

      if (!transactions || transactions.length === 0) {
        return null
      }

      let totalIncome = 0
      let totalExpense = 0

      transactions.forEach(t => {
        if (t.type === 'income') {
          totalIncome += Number(t.amount)
        } else {
          totalExpense += Number(t.amount)
        }
      })

      const balance = totalIncome - totalExpense
      const savingsRate = totalIncome > 0 
        ? Math.round((totalIncome - totalExpense) / totalIncome * 100) 
        : 0

      return {
        totalIncome,
        totalExpense,
        balance,
        savingsRate
      }

    } catch (error) {
      console.error('Error getting user monthly summary:', error)
      return null
    }
  },

  /**
   * Check and send APK update notifications
   */
  async checkAndSendApkUpdates(userId, currentVersion) {
    if (!userId) return null

    try {
      const { data: latestVersion, error } = await supabase
        .from('app_versions')
        .select('*')
        .eq('platform', 'android')
        .eq('is_active', true)
        .order('version_code', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        return this._sendMockApkUpdate(userId, currentVersion)
      }

      if (this._compareVersions(currentVersion, latestVersion.version_code) < 0) {
        return this.createApkUpdateNotification(userId, {
          version: latestVersion.version_name || latestVersion.version_code,
          downloadUrl: latestVersion.download_url || 'https://nexovra.com/download',
          releaseNotes: latestVersion.release_notes || 'Perbaikan bug dan peningkatan performa.',
          isRequired: latestVersion.is_required || false,
          fileSize: latestVersion.file_size || null
        })
      }

      return null

    } catch (error) {
      console.error('Error checking APK updates:', error)
      return null
    }
  },

  /**
   * Mock APK update (for testing)
   */
  _sendMockApkUpdate(userId, currentVersion) {
    const mockVersions = [
      { version: '1.0.0', required: false, notes: 'Perbaikan bug minor' },
      { version: '1.1.0', required: false, notes: 'Fitur baru: Laporan keuangan' },
      { version: '2.0.0', required: true, notes: '⚠️ Update besar! Desain baru dan fitur AI' },
    ]

    const latest = mockVersions[mockVersions.length - 1]
    
    if (this._compareVersions(currentVersion, latest.version) < 0) {
      return this.createApkUpdateNotification(userId, {
        version: latest.version,
        downloadUrl: 'https://nexovra.com/download/latest.apk',
        releaseNotes: latest.notes,
        isRequired: latest.required,
        fileSize: 45000000
      })
    }

    return null
  },

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Compare version strings
   */
  _compareVersions(v1, v2) {
    const parts1 = String(v1).split('.').map(Number)
    const parts2 = String(v2).split('.').map(Number)
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0
      const p2 = parts2[i] || 0
      if (p1 !== p2) return p1 - p2
    }
    return 0
  },

  /**
   * Format currency
   */
  _formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace(/\s/g, '')
  },

  /**
   * Format file size
   */
  _formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Get month name in Indonesian
   */
  _getMonthName(month) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month] || month
  }
}

export default NotificationService