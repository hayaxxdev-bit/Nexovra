// @components/ui/command-palette.js

export class CommandPalette {
  constructor(options = {}) {
    console.log('📦 CommandPalette constructor called')
    this.container = options.container || document.body
    this.onSelect = options.onSelect || null
    this._isOpen = false
    this._items = []
    this._filteredItems = []
    this._selectedIndex = -1
    this._palette = null

    this._render()
    this._setupEvents()
    this._registerShortcuts()
    console.log('✅ CommandPalette initialized')
  }

  _render() {
    console.log('🎨 Rendering command palette...')
    
    // Hapus palette lama
    const oldPalette = document.getElementById('command-palette')
    if (oldPalette) {
      oldPalette.remove()
    }

    const isDark = document.documentElement.classList.contains('dark')

    this._palette = document.createElement('div')
    this._palette.id = 'command-palette'
    
    Object.assign(this._palette.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: '9998',
      display: 'none',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '20vh'
    })

    this._palette.innerHTML = `
      <div style="width:100%;max-width:560px;margin:0 16px;">
        <div style="background:${isDark ? '#12121a' : '#ffffff'};border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid ${isDark ? '#1f1f2e' : '#e5e7eb'};overflow:hidden;">
          <!-- Input -->
          <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid ${isDark ? '#1f1f2e' : '#e5e7eb'};">
            <svg width="20" height="20" style="color:${isDark ? '#6b7280' : '#9ca3af'};flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              id="cmd-input" 
              style="flex:1;background:transparent;border:none;outline:none;font-size:16px;color:${isDark ? '#ffffff' : '#111827'};"
              placeholder="Cari atau ketik perintah..."
              autofocus
            />
            <kbd style="display:inline-flex;padding:4px 8px;background:${isDark ? '#1f1f2e' : '#f3f4f6'};border-radius:6px;font-size:11px;color:${isDark ? '#6b7280' : '#9ca3af'};font-family:monospace;">
              ⌘K
            </kbd>
          </div>

          <!-- Results -->
          <div id="cmd-results" style="max-height:320px;overflow-y:auto;padding:8px;">
            <div id="cmd-loading" style="display:flex;align-items:center;justify-content:center;padding:32px 0;">
              <div style="width:24px;height:24px;border:3px solid ${isDark ? '#4c1d95' : '#ede9fe'};border-top-color:${isDark ? '#a78bfa' : '#7c3aed'};border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            </div>
            <div id="cmd-empty" style="display:none;text-align:center;padding:32px 0;">
              <p style="color:${isDark ? '#9ca3af' : '#6b7280'};margin:0;">Tidak ada hasil</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="display:flex;justify-content:space-between;padding:8px 16px;border-top:1px solid ${isDark ? '#1f1f2e' : '#e5e7eb'};background:${isDark ? '#0a0a0f' : '#f9fafb'};">
            <span style="font-size:11px;color:${isDark ? '#6b7280' : '#9ca3af'};">↑↓ navigasi · ↵ pilih · ESC tutup</span>
            <span id="cmd-result-count" style="font-size:11px;color:${isDark ? '#6b7280' : '#9ca3af'};">0 hasil</span>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(this._palette)
    console.log('✅ Command palette rendered')

    // References
    this._input = this._palette.querySelector('#cmd-input')
    this._results = this._palette.querySelector('#cmd-results')
    this._empty = this._palette.querySelector('#cmd-empty')
    this._loading = this._palette.querySelector('#cmd-loading')
    this._resultCount = this._palette.querySelector('#cmd-result-count')

    // Tambahkan style untuk spin
    if (!document.getElementById('command-palette-styles')) {
      const style = document.createElement('style')
      style.id = 'command-palette-styles'
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }
  }

  _setupEvents() {
    console.log('🔧 Setting up command palette events...')
    
    if (!this._palette) return

    // Click outside to close
    this._palette.addEventListener('click', (e) => {
      if (e.target === this._palette) {
        this.close()
      }
    })

    // Input
    if (this._input) {
      this._input.addEventListener('input', () => this._search())
      this._input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          this._selectNext()
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this._selectPrevious()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          this._executeSelected()
        } else if (e.key === 'Escape') {
          this.close()
        }
      })
    }
  }

  _registerShortcuts() {
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler)
    }

    this._keydownHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        this.toggle()
      }
    }
    
    document.addEventListener('keydown', this._keydownHandler)
  }

  setItems(items) {
    this._items = items
    this._filteredItems = items
    this._renderItems(items)
  }

  addItem(item) {
    this._items.push(item)
    this._filteredItems = this._items
    this._renderItems(this._filteredItems)
  }

  setDefaultItems() {
    this.setItems([
      {
        title: 'Dashboard',
        description: 'Lihat ringkasan keuangan',
        category: 'Navigasi',
        action: '/',
        color: '#8B5CF6'
      },
      {
        title: 'Transaksi',
        description: 'Lihat semua transaksi',
        category: 'Navigasi',
        action: '/transactions',
        color: '#3B82F6'
      },
      {
        title: 'Transaksi Baru',
        description: 'Tambah transaksi baru',
        category: 'Aksi',
        action: '/transactions/new',
        color: '#10B981'
      },
      {
        title: 'Akun',
        description: 'Kelola akun keuangan',
        category: 'Navigasi',
        action: '/accounts',
        color: '#F59E0B'
      },
      {
        title: 'Transfer',
        description: 'Transfer antar akun',
        category: 'Navigasi',
        action: '/transfer',
        color: '#F97316'
      },
      {
        title: 'Buku Kas',
        description: 'Lihat buku kas harian',
        category: 'Navigasi',
        action: '/cashbook',
        color: '#14B8A6'
      },
      {
        title: 'Laporan',
        description: 'Analisis dan laporan keuangan',
        category: 'Navigasi',
        action: '/reports',
        color: '#EF4444'
      },
      {
        title: 'Pengaturan',
        description: 'Pengaturan akun dan aplikasi',
        category: 'Navigasi',
        action: '/settings',
        color: '#6B7280'
      },
      {
        title: 'Keluar',
        description: 'Keluar dari aplikasi',
        category: 'Akun',
        action: 'window.__app?.events?.emit("auth:logout")',
        color: '#EF4444'
      }
    ])
  }

  _search() {
    const query = this._input?.value.trim().toLowerCase() || ''
    
    if (!query) {
      this._filteredItems = this._items
    } else {
      this._filteredItems = this._items.filter(item => {
        const searchStr = `${item.title} ${item.description || ''} ${item.category || ''}`.toLowerCase()
        return searchStr.includes(query)
      })
    }

    this._renderItems(this._filteredItems, query)
    this._selectedIndex = -1
  }

  _renderItems(items, query = '') {
    if (!this._results) return
    
    this._loading.style.display = 'none'
    this._empty.style.display = 'none'
    this._results.innerHTML = ''

    if (items.length === 0) {
      this._empty.style.display = 'block'
      this._resultCount.textContent = '0 hasil'
      return
    }

    this._resultCount.textContent = `${items.length} hasil`

    const isDark = document.documentElement.classList.contains('dark')

    items.forEach((item, index) => {
      const div = document.createElement('div')
      
      Object.assign(div.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.15s'
      })

      div.dataset.index = index
      div.dataset.action = item.action

      // Hover effect
      div.addEventListener('mouseenter', () => {
        this._selectedIndex = index
        this._updateSelection()
      })

      const iconColor = item.color || '#8B5CF6'

      div.innerHTML = `
        <div style="width:32px;height:32px;border-radius:8px;background:${isDark ? '#1f1f2e' : '#f3f4f6'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="16" height="16" style="color:${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:14px;font-weight:500;color:${isDark ? '#ffffff' : '#111827'};margin:0;">${item.title}</p>
          ${item.description ? `<p style="font-size:12px;color:${isDark ? '#6b7280' : '#9ca3af'};margin:2px 0 0;">${item.description}</p>` : ''}
        </div>
        ${item.shortcut ? `<span style="font-size:11px;color:${isDark ? '#4b5563' : '#d1d5db'};font-family:monospace;">${item.shortcut}</span>` : ''}
      `

      div.addEventListener('click', () => this._executeItem(item))
      this._results.appendChild(div)
    })
  }

  _updateSelection() {
    const items = this._results?.querySelectorAll('[data-index]')
    if (!items) return
    
    const isDark = document.documentElement.classList.contains('dark')
    
    items.forEach((el, i) => {
      if (i === this._selectedIndex) {
        el.style.background = isDark ? '#1e1b4b' : '#f5f3ff'
      } else {
        el.style.background = 'transparent'
      }
    })
  }

  _selectNext() {
    const items = this._results?.querySelectorAll('[data-index]')
    if (!items || items.length === 0) return
    this._selectedIndex = (this._selectedIndex + 1) % items.length
    this._updateSelection()
    items[this._selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  _selectPrevious() {
    const items = this._results?.querySelectorAll('[data-index]')
    if (!items || items.length === 0) return
    this._selectedIndex = this._selectedIndex <= 0 ? items.length - 1 : this._selectedIndex - 1
    this._updateSelection()
    items[this._selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  _executeSelected() {
    const items = this._results?.querySelectorAll('[data-index]')
    if (items && items[this._selectedIndex]) {
      const action = items[this._selectedIndex].dataset.action
      const item = this._filteredItems.find(i => i.action === action)
      if (item) this._executeItem(item)
    }
  }

  _executeItem(item) {
    if (this.onSelect) {
      this.onSelect(item)
    } else if (item.action) {
      if (item.action.startsWith('/')) {
        window.__app?.router?.navigate(item.action)
      } else {
        try {
          eval(item.action)
        } catch (e) {
          console.warn('Cannot execute action:', item.action, e)
        }
      }
    }
    this.close()
  }

  open() {
    console.log('🔍 Opening command palette...')
    if (this._isOpen) return
    
    this._isOpen = true
    this._palette.style.display = 'flex'
    
    setTimeout(() => {
      this._input?.focus()
      this._input?.select()
    }, 100)
    
    // Reset results
    this._filteredItems = this._items
    this._renderItems(this._items)
  }

  close() {
    console.log('🔍 Closing command palette...')
    this._isOpen = false
    this._palette.style.display = 'none'
    if (this._input) this._input.value = ''
  }

  toggle() {
    if (this._isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  destroy() {
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler)
    }
    if (this._palette) {
      this._palette.remove()
    }
  }
}