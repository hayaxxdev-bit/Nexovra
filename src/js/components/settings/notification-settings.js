// @components/settings/notification-settings.js

import { NotificationSoundService } from '@services/notification-sound.services.js'

export const NotificationSettings = {
  _container: null,

  render(container) {
    this._container = container
    
    // Check support
    const soundSupported = NotificationSoundService.isAudioSupported()
    const vibrationSupported = NotificationSoundService.isVibrationSupported()

    container.innerHTML = `
      <div class="card p-5">
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">🔔 Notifikasi & Suara</h3>
        
        <div class="space-y-4">
          <!-- Sound Toggle -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔊</span>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Suara Notifikasi</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Mainkan suara saat notifikasi masuk</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="sound-toggle" class="sr-only peer" ${soundSupported ? 'checked' : 'disabled'}>
              <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 dark:bg-gray-700"></div>
            </label>
          </div>

          <!-- Vibration Toggle -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📳</span>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Getaran</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Perangkat bergetar saat notifikasi masuk</p>
                ${!vibrationSupported ? '<span class="text-xs text-yellow-500">⚠️ Tidak didukung</span>' : ''}
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="vibration-toggle" class="sr-only peer" ${vibrationSupported ? 'checked' : 'disabled'}>
              <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 dark:bg-gray-700"></div>
            </label>
          </div>

          <!-- Test Button -->
          <button id="test-notification-btn" class="btn btn-secondary w-full mt-2">
            🔔 Test Notifikasi
          </button>

          <!-- Sound Preview -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview Suara:</p>
            <div class="flex flex-wrap gap-2">
              <button class="sound-preview-btn text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-sound="default">🔔 Default</button>
              <button class="sound-preview-btn text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-sound="urgent">🚨 Urgent</button>
              <button class="sound-preview-btn text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-sound="success">✅ Success</button>
              <button class="sound-preview-btn text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-sound="warning">⚠️ Warning</button>
              <button class="sound-preview-btn text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-sound="reminder">⏰ Reminder</button>
            </div>
          </div>
        </div>
      </div>
    `

    this._setupEvents()
    this._loadSettings()
  },

  async _loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: settings } = await supabase
        .from('user_settings')
        .select('notification_sound, notification_vibration')
        .eq('user_id', user.id)
        .single()

      if (settings) {
        const soundToggle = this._container.querySelector('#sound-toggle')
        const vibrationToggle = this._container.querySelector('#vibration-toggle')
        
        if (soundToggle) soundToggle.checked = settings.notification_sound !== false
        if (vibrationToggle) vibrationToggle.checked = settings.notification_vibration !== false
      }

    } catch (error) {
      console.warn('⚠️ Failed to load settings:', error)
    }
  },

  _setupEvents() {
    // Sound toggle
    const soundToggle = this._container.querySelector('#sound-toggle')
    if (soundToggle) {
      soundToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked
        await this._saveSetting('notification_sound', enabled)
        
        // Update ReminderChecker
        if (window.__reminder) {
          window.__reminder.toggleSound(enabled)
        }
        
        const { Toast } = await import('@components/ui/toast.js')
        Toast.success(enabled ? '🔊 Suara diaktifkan' : '🔇 Suara dimatikan')
      })
    }

    // Vibration toggle
    const vibrationToggle = this._container.querySelector('#vibration-toggle')
    if (vibrationToggle) {
      vibrationToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked
        await this._saveSetting('notification_vibration', enabled)
        
        if (window.__reminder) {
          window.__reminder.toggleVibration(enabled)
        }
        
        const { Toast } = await import('@components/ui/toast.js')
        Toast.success(enabled ? '📳 Getaran diaktifkan' : '📳 Getaran dimatikan')
      })
    }

    // Test notification
    const testBtn = this._container.querySelector('#test-notification-btn')
    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        if (window.__reminder) {
          await window.__reminder.testNotification()
        } else {
          const { Toast } = await import('@components/ui/toast.js')
          Toast.warning('⚠️ Reminder checker tidak aktif')
        }
      })
    }

    // Sound preview
    this._container.querySelectorAll('.sound-preview-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const soundType = btn.dataset.sound
        NotificationSoundService.play(soundType, { volume: 0.5 })
      })
    })
  },

  async _saveSetting(key, value) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

    } catch (error) {
      console.error('Failed to save setting:', error)
    }
  }
}