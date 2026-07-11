// @components/ui/notification-panel.js

export class NotificationPanel {
  constructor(options = {}) {
    console.log('📦 NotificationPanel constructor called')
    this.container = options.container || document.body
    this.onNotificationClick = options.onNotificationClick || null
    this.onMarkAllRead = options.onMarkAllRead || null
    this._notifications = []
    this._unreadCount = 0
    this._isOpen = false
    this._panel = null

    this._render()
    this._setupEvents()
    console.log('✅ NotificationPanel initialized')
  }

  _render() {
    console.log('🎨 Rendering notification panel...')
    
    // Hapus panel lama jika ada
    const oldPanel = document.getElementById('notification-panel')
    if (oldPanel) {
      oldPanel.remove()
    }

    // Buat panel dengan inline styles untuk memastikan muncul
    this._panel = document.createElement('div')
    this._panel.id = 'notification-panel'
    
    // Style inline yang pasti
    Object.assign(this._panel.style, {
      position: 'fixed',
      top: '0',
      right: '0',
      width: '100%',
      maxWidth: '420px',
      height: '100%',
      backgroundColor: 'white',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    })

    // Dark mode support via class
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark) {
      this._panel.style.backgroundColor = '#12121a'
    }

    this._panel.innerHTML = `
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid ${isDark ? '#1f1f2e' : '#e5e7eb'};flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
          <h2 style="font-size:18px;font-weight:700;color:${isDark ? '#ffffff' : '#111827'};margin:0;">Notifikasi</h2>
          <span id="notif-badge-count" style="font-size:11px;padding:2px 10px;background:${isDark ? '#4c1d95' : '#ede9fe'};color:${isDark ? '#a78bfa' : '#7c3aed'};border-radius:999px;font-weight:600;">
            0
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button id="notif-mark-all-read" style="font-size:12px;color:${isDark ? '#a78bfa' : '#7c3aed'};background:transparent;border:none;cursor:pointer;padding:4px 12px;border-radius:8px;font-weight:500;transition:background 0.2s;">
            Tandai Semua
          </button>
          <button id="notif-close" style="padding:6px;background:transparent;border:none;cursor:pointer;border-radius:8px;transition:background 0.2s;color:${isDark ? '#9ca3af' : '#6b7280'};">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div id="notif-list" style="flex:1;overflow-y:auto;padding:16px 20px;">
        <div id="notif-loading" style="display:flex;align-items:center;justify-content:center;padding:40px 0;">
          <div style="width:32px;height:32px;border:3px solid ${isDark ? '#4c1d95' : '#ede9fe'};border-top-color:${isDark ? '#a78bfa' : '#7c3aed'};border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        </div>
        <div id="notif-empty" style="display:none;text-align:center;padding:40px 0;">
          <svg width="64" height="64" style="margin:0 auto 16px;color:${isDark ? '#374151' : '#d1d5db'};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p style="color:${isDark ? '#9ca3af' : '#6b7280'};margin:0;">Belum ada notifikasi</p>
          <p style="font-size:14px;color:${isDark ? '#4b5563' : '#9ca3af'};margin:4px 0 0;">Semua notifikasi akan muncul di sini</p>
        </div>
      </div>
    `

    // Append ke body
    document.body.appendChild(this._panel)
    console.log('✅ Notification panel rendered')

    // Simpan references
    this._list = this._panel.querySelector('#notif-list')
    this._badge = this._panel.querySelector('#notif-badge-count')
    this._empty = this._panel.querySelector('#notif-empty')
    this._loading = this._panel.querySelector('#notif-loading')

    // Tambahkan style untuk animasi spin jika belum ada
    if (!document.getElementById('notification-panel-styles')) {
      const style = document.createElement('style')
      style.id = 'notification-panel-styles'
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }
  }

  _setupEvents() {
    console.log('🔧 Setting up notification panel events...')
    
    if (!this._panel) {
      console.warn('⚠️ Panel not found')
      return
    }

    // Close button
    const closeBtn = this._panel.querySelector('#notif-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log('❌ Close button clicked')
        this.close()
      })
    }

    // Mark all read
    const markAllBtn = this._panel.querySelector('#notif-mark-all-read')
    if (markAllBtn) {
      markAllBtn.addEventListener('click', async (e) => {
        e.stopPropagation()
        try {
          const userId = window.__app?.store?.getState('auth.user')?.id
          if (userId) {
            const { NotificationService } = await import('@services/notification.service.js')
            await NotificationService.markAllAsRead(userId)
            await this._updateNotifications()
            if (this.onMarkAllRead) this.onMarkAllRead()
          }
        } catch (error) {
          console.error('Error marking all as read:', error)
        }
      })
    }

    // ESC key
    this._escHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.close()
      }
    }
    document.addEventListener('keydown', this._escHandler)
  }

  open() {
    console.log('📂 Opening notification panel...')
    
    if (this._isOpen) {
      this.close()
      return
    }

    if (!this._panel) {
      console.warn('⚠️ Panel not found')
      return
    }

    this._isOpen = true
    this._panel.style.transform = 'translateX(0)'
    this._panel.style.display = 'flex'
    
    console.log('✅ Panel opened')
    this._updateNotifications()
  }

  close() {
    console.log('📂 Closing notification panel...')
    
    this._isOpen = false
    if (this._panel) {
      this._panel.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (this._panel) {
          this._panel.style.display = 'none'
        }
      }, 300)
    }
  }

  async _updateNotifications() {
    try {
      const userId = window.__app?.store?.getState('auth.user')?.id
      if (!userId) {
        this._showEmpty()
        return
      }

      this._showLoading()
      
      const { NotificationService } = await import('@services/notification.service.js')
      const notifications = await NotificationService.getNotifications(userId, { limit: 50 })
      this._notifications = notifications
      
      const unreadCount = await NotificationService.getUnreadCount(userId)
      this._updateBadge(unreadCount)

      if (notifications.length === 0) {
        this._showEmpty()
        return
      }

      this._renderNotifications(notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      this._showError()
    }
  }

  _renderNotifications(notifications) {
    if (!this._list) return
    
    this._loading.style.display = 'none'
    this._empty.style.display = 'none'
    this._list.innerHTML = ''

    const isDark = document.documentElement.classList.contains('dark')

    notifications.forEach(notification => {
      const div = document.createElement('div')
      
      const bgColor = notification.is_read 
        ? (isDark ? '#1a1a24' : '#ffffff')
        : (isDark ? '#1e1b4b' : '#f5f3ff')
      
      const borderColor = notification.is_read
        ? (isDark ? '#1f1f2e' : '#e5e7eb')
        : (isDark ? '#4c1d95' : '#c4b5fd')

      Object.assign(div.style, {
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      })

      if (!notification.is_read) {
        div.style.borderLeft = '4px solid #8B5CF6'
      }

      div.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="flex-shrink:0;width:32px;height:32px;border-radius:8px;background:${notification.is_read ? (isDark ? '#1f1f2e' : '#f3f4f6') : (isDark ? '#4c1d95' : '#ede9fe')};display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" style="color:${notification.is_read ? (isDark ? '#6b7280' : '#9ca3af') : (isDark ? '#a78bfa' : '#7c3aed')};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;gap:8px;">
              <p style="font-size:14px;font-weight:600;color:${isDark ? '#ffffff' : '#111827'};margin:0;">${notification.title}</p>
              <span style="font-size:11px;color:${isDark ? '#6b7280' : '#9ca3af'};flex-shrink:0;">${this._formatTime(notification.created_at)}</span>
            </div>
            <p style="font-size:14px;color:${isDark ? '#d1d5db' : '#4b5563'};margin:4px 0 0;">${notification.message}</p>
          </div>
        </div>
      `

      div.addEventListener('click', async () => {
        if (!notification.is_read) {
          try {
            const { NotificationService } = await import('@services/notification.service.js')
            await NotificationService.markAsRead(notification.id)
            notification.is_read = true
            this._updateBadge(this._unreadCount - 1)
            this._updateNotifications()
          } catch (error) {
            console.error('Error marking as read:', error)
          }
        }

        if (this.onNotificationClick) {
          this.onNotificationClick(notification)
        }

        if (notification.link) {
          window.__app?.router?.navigate(notification.link)
          this.close()
        }
      })

      this._list.appendChild(div)
    })
  }

  _updateBadge(count) {
    this._unreadCount = count || 0
    if (this._badge) {
      this._badge.textContent = this._unreadCount > 99 ? '99+' : this._unreadCount
    }
    
    const navBadge = document.querySelector('#notif-btn span')
    if (navBadge) {
      if (this._unreadCount > 0) {
        navBadge.classList.remove('hidden')
      } else {
        navBadge.classList.add('hidden')
      }
    }
  }

  _showLoading() {
    if (this._loading) this._loading.style.display = 'flex'
    if (this._empty) this._empty.style.display = 'none'
    if (this._list) {
      this._list.innerHTML = ''
      this._list.appendChild(this._loading)
    }
  }

  _showEmpty() {
    if (this._loading) this._loading.style.display = 'none'
    if (this._empty) this._empty.style.display = 'block'
    if (this._list) {
      this._list.innerHTML = ''
      this._list.appendChild(this._empty)
    }
  }

  _showError() {
    if (this._loading) this._loading.style.display = 'none'
    if (this._empty) this._empty.style.display = 'none'
    if (this._list) {
      this._list.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <p style="color:${document.documentElement.classList.contains('dark') ? '#f87171' : '#dc2626'};">Gagal memuat notifikasi</p>
          <button id="notif-retry" style="margin-top:8px;padding:8px 16px;background:#7c3aed;color:white;border:none;border-radius:8px;cursor:pointer;">Coba Lagi</button>
        </div>
      `
      const retryBtn = this._list.querySelector('#notif-retry')
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this._updateNotifications())
      }
    }
  }

  _formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}j`
    if (diffDays < 7) return `${diffDays}h`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  destroy() {
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler)
    }
    if (this._panel) {
      this._panel.remove()
    }
  }
}