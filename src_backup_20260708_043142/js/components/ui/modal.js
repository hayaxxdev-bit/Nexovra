import { generateId } from '@core/utils.js'

export const Modal = {
  _id: null,
  _onClose: null,
  _handleEscape: null,

  show(options = {}) {
    const {
      title = '',
      content = '',
      size = 'md',
      closeOnBackdrop = true,
      showFooter = true,
      confirmText = 'Simpan',
      cancelText = 'Batal',
      confirmClass = 'btn-primary',
      onConfirm,
      onCancel,
      onClose,
      footerContent = null,
    } = options

    this._onClose = onClose || null
    this._id = `modal-${generateId()}`

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    }

    const modalHTML = `
      <div id="${this._id}" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-300" data-modal-backdrop></div>
        
        <!-- Modal Container -->
        <div class="relative bg-white dark:bg-[#12121a] rounded-3xl shadow-2xl shadow-black/20 dark:shadow-purple-500/5 ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col animate-scale border border-gray-200 dark:border-gray-800/50 overflow-hidden">
          
          <!-- Glow Line Top -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/50 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full"></div>
              <h3 class="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">${title}</h3>
            </div>
            <button class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group" data-modal-close aria-label="Tutup">
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            ${content}
          </div>
          
          <!-- Footer -->
          ${showFooter ? `
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800/50 shrink-0 bg-gray-50/50 dark:bg-[#0a0a0f]/50">
              ${footerContent || `
                <button class="px-4 py-2.5 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300" data-modal-cancel>
                  ${cancelText}
                </button>
                <button class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-100" data-modal-confirm>
                  ${confirmText}
                </button>
              `}
            </div>
          ` : ''}
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', modalHTML)

    const modalElement = document.getElementById(this._id)

    // Close button
    modalElement.querySelector('[data-modal-close]')?.addEventListener('click', () => {
      this.close()
      onCancel?.()
    })

    // Cancel button
    modalElement.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
      this.close()
      onCancel?.()
    })

    // Confirm button
    modalElement.querySelector('[data-modal-confirm]')?.addEventListener('click', async () => {
      const btn = modalElement.querySelector('[data-modal-confirm]')
      
      // Loading state on confirm button
      if (onConfirm) {
        try {
          btn.disabled = true
          btn.innerHTML = `
            <span class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
          `
          await onConfirm()
        } catch (error) {
          console.error('Modal confirm error:', error)
          btn.disabled = false
          btn.innerHTML = confirmText
          return
        }
      }
      this.close()
    })

    // Backdrop click
    if (closeOnBackdrop) {
      modalElement.querySelector('[data-modal-backdrop]')?.addEventListener('click', () => {
        this.close()
        onCancel?.()
      })
    }

    // Escape key handler
    this._handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close()
        onCancel?.()
      }
    }
    document.addEventListener('keydown', this._handleEscape)

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`

    return {
      id: this._id,
      close: () => this.close(),
      getElement: () => modalElement,
    }
  },

  close() {
    const modal = document.getElementById(this._id)
    if (modal) {
      // Exit animation
      modal.style.opacity = '0'
      modal.style.transform = 'scale(0.95)'
      modal.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      
      const backdrop = modal.querySelector('[data-modal-backdrop]')
      if (backdrop) {
        backdrop.style.opacity = '0'
        backdrop.style.transition = 'opacity 0.2s ease'
      }
      
      setTimeout(() => {
        modal.remove()
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }, 200)
    }

    if (this._handleEscape) {
      document.removeEventListener('keydown', this._handleEscape)
    }

    this._onClose?.()
    this._id = null
    this._onClose = null
    this._handleEscape = null
  },

  /**
   * Confirm dialog
   */
  confirm(options = {}) {
    const {
      title = 'Konfirmasi',
      message = 'Apakah Anda yakin?',
      confirmText = 'Ya, Lanjutkan',
      cancelText = 'Batal',
      variant = 'danger',
    } = options

    return new Promise((resolve) => {
      const variantStyles = {
        danger: { 
          icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>`,
          confirmClass: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
          iconBg: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
          iconRing: 'ring-red-100 dark:ring-red-500/20'
        },
        warning: { 
          icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>`,
          confirmClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
          iconBg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
          iconRing: 'ring-amber-100 dark:ring-amber-500/20'
        },
        info: { 
          icon: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
          confirmClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
          iconBg: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
          iconRing: 'ring-blue-100 dark:ring-blue-500/20'
        },
      }
      const style = variantStyles[variant] || variantStyles.info

      this.show({
        title: '',
        content: `
          <div class="flex flex-col items-center text-center py-6">
            <div class="w-20 h-20 ${style.iconBg} rounded-2xl flex items-center justify-center mb-5 ring-4 ${style.iconRing}">
              ${style.icon}
            </div>
            <h3 class="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">${title}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">${message}</p>
          </div>
        `,
        size: 'sm',
        confirmText,
        cancelText,
        confirmClass: style.confirmClass,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        onClose: () => resolve(false),
      })
    })
  },

  /**
   * Show loading modal
   * @param {string} message
   * @returns {Object} modal instance dengan method close
   */
  loading(message = 'Memproses...') {
    const instance = this.show({
      title: '',
      content: `
        <div class="flex flex-col items-center py-8">
          <div class="relative mb-5">
            <div class="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-500/20 border-t-purple-600 dark:border-t-purple-400 animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-purple-600 dark:text-purple-400">N</span>
            </div>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">${message}</p>
          <p class="text-gray-400 dark:text-gray-600 text-xs mt-2">Mohon tunggu sebentar</p>
        </div>
      `,
      size: 'sm',
      showFooter: false,
      closeOnBackdrop: false,
    })
    
    return instance
  },

  /**
   * Alert dialog
   */
  alert(options = {}) {
    const {
      title = 'Perhatian',
      message = '',
      variant = 'info',
    } = options

    return new Promise((resolve) => {
      const variantStyles = {
        success: { icon: '✅', iconBg: 'bg-emerald-100 dark:bg-emerald-500/10' },
        error: { icon: '❌', iconBg: 'bg-red-100 dark:bg-red-500/10' },
        warning: { icon: '⚠️', iconBg: 'bg-amber-100 dark:bg-amber-500/10' },
        info: { icon: 'ℹ️', iconBg: 'bg-blue-100 dark:bg-blue-500/10' },
      }
      const style = variantStyles[variant] || variantStyles.info

      this.show({
        title: '',
        content: `
          <div class="flex flex-col items-center text-center py-6">
            <div class="w-20 h-20 ${style.iconBg} rounded-2xl flex items-center justify-center mb-5 text-3xl">
              ${style.icon}
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">${title}</h3>
            ${message ? `<p class="text-gray-500 dark:text-gray-400 text-sm">${message}</p>` : ''}
          </div>
        `,
        size: 'sm',
        confirmText: 'OK',
        cancelText: '',
        confirmClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25',
        showFooter: true,
        footerContent: `
          <button class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300" data-modal-confirm>
            OK
          </button>
        `,
        onConfirm: () => resolve(true),
        onClose: () => resolve(true),
      })
    })
  },

  /**
   * Prompt dialog
   */
  prompt(options = {}) {
    const {
      title = 'Input',
      message = '',
      placeholder = 'Masukkan teks...',
      defaultValue = '',
      confirmText = 'Simpan',
      cancelText = 'Batal',
    } = options

    return new Promise((resolve) => {
      let inputValue = defaultValue

      this.show({
        title,
        content: `
          <div class="space-y-4">
            ${message ? `<p class="text-gray-500 dark:text-gray-400 text-sm">${message}</p>` : ''}
            <input 
              type="text" 
              id="modal-prompt-input"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300"
              placeholder="${placeholder}"
              value="${defaultValue}"
              autofocus
            />
          </div>
        `,
        size: 'sm',
        confirmText,
        cancelText,
        confirmClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25',
        onConfirm: () => {
          const input = document.getElementById('modal-prompt-input')
          resolve(input?.value || '')
        },
        onCancel: () => resolve(null),
        onClose: () => resolve(null),
      })

      // Focus input after render
      setTimeout(() => {
        document.getElementById('modal-prompt-input')?.focus()
      }, 100)
    })
  },
}