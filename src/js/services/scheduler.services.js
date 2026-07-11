// @services/scheduler.service.js

import { NotificationService } from '@services/notification.service.js'
import { supabase } from '@services/supabase.js'

export const SchedulerService = {
  _intervals: [],
  _isRunning: false,

  /**
   * Start all scheduled tasks
   */
  start() {
    if (this._isRunning) {
      console.log('⚠️ Scheduler already running')
      return
    }

    console.log('⏰ Starting scheduler...')
    this._isRunning = true

    // Monthly report - every 1st day of month at 08:00
    this._scheduleMonthlyReport()

    // APK update check - every day at 12:00
    this._scheduleApkUpdateCheck()

    // Cleanup old notifications - every week
    this._scheduleCleanup()

    console.log('✅ Scheduler started')
  },

  /**
   * Stop all scheduled tasks
   */
  stop() {
    console.log('⏰ Stopping scheduler...')
    this._intervals.forEach(interval => clearInterval(interval))
    this._intervals = []
    this._isRunning = false
    console.log('✅ Scheduler stopped')
  },

  /**
   * Schedule monthly report
   */
  _scheduleMonthlyReport() {
    // Check every hour if it's the 1st day of month
    const interval = setInterval(async () => {
      const now = new Date()
      const isFirstDay = now.getDate() === 1
      const isMorning = now.getHours() === 8 && now.getMinutes() === 0

      if (isFirstDay && isMorning) {
        console.log('📊 Running monthly report...')
        try {
          await NotificationService.sendMonthlyReportsToAllUsers()
        } catch (error) {
          console.error('Error sending monthly reports:', error)
        }
      }
    }, 60000) // Check every minute

    this._intervals.push(interval)
  },

  /**
   * Schedule APK update check
   */
  _scheduleApkUpdateCheck() {
    // Check every day at 12:00
    const interval = setInterval(async () => {
      const now = new Date()
      const isNoon = now.getHours() === 12 && now.getMinutes() === 0

      if (isNoon) {
        console.log('📱 Checking for APK updates...')
        try {
          await this._checkApkUpdatesForAllUsers()
        } catch (error) {
          console.error('Error checking APK updates:', error)
        }
      }
    }, 60000)

    this._intervals.push(interval)
  },

  /**
   * Schedule cleanup
   */
  _scheduleCleanup() {
    // Run every Sunday at 03:00
    const interval = setInterval(async () => {
      const now = new Date()
      const isSunday = now.getDay() === 0
      const isNight = now.getHours() === 3 && now.getMinutes() === 0

      if (isSunday && isNight) {
        console.log('🧹 Running cleanup...')
        try {
          const { data: users, error } = await supabase
            .from('profiles')
            .select('id')

          if (!error && users) {
            for (const user of users) {
              await NotificationService.cleanupOldNotifications(user.id, 30)
            }
            console.log(`✅ Cleanup completed for ${users.length} users`)
          }
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      }
    }, 60000)

    this._intervals.push(interval)
  },

  /**
   * Check APK updates for all users
   */
  async _checkApkUpdatesForAllUsers() {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, app_version')
        .eq('is_active', true)

      if (error) throw error

      let updatesSent = 0

      for (const user of users) {
        const currentVersion = user.app_version || '1.0.0'
        const result = await NotificationService.checkAndSendApkUpdates(
          user.id, 
          currentVersion
        )
        if (result) updatesSent++
      }

      console.log(`📱 APK updates sent to ${updatesSent} users`)

    } catch (error) {
      console.error('Error checking APK updates:', error)
    }
  },

  /**
   * Manual trigger - Send monthly report now
   */
  async triggerMonthlyReportNow() {
    console.log('📊 Triggering monthly report manually...')
    return NotificationService.sendMonthlyReportsToAllUsers()
  },

  /**
   * Manual trigger - Check APK updates now
   */
  async triggerApkUpdateCheckNow() {
    console.log('📱 Triggering APK update check manually...')
    return this._checkApkUpdatesForAllUsers()
  }
}