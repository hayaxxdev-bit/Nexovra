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
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" data-modal-backdrop></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col animate-slide-up border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${title}</h3>
            <button class="btn btn-ghost btn-sm p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" data-modal-close aria-label="Tutup">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-4 overflow-y-auto flex-1">${content}</div>
          ${showFooter ? `
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              ${footerContent || `
                <button class="btn btn-secondary" data-modal-cancel>${cancelText}</button>
                <button class="btn ${confirmClass}" data-modal-confirm>${confirmText}</button>
              `}
            </div>
          ` : ''}
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', modalHTML)

    const modalElement = document.getElementById(this._id)

    modalElement.querySelector('[data-modal-close]')?.addEventListener('click', () => {
      this.close()
      onCancel?.()
    })

    modalElement.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
      this.close()
      onCancel?.()
    })

    modalElement.querySelector('[data-modal-confirm]')?.addEventListener('click', async () => {
      if (onConfirm) {
        try { await onConfirm() } catch (error) {
          console.error('Modal confirm error:', error)
          return
        }
      }
      this.close()
    })

    if (closeOnBackdrop) {
      modalElement.querySelector('[data-modal-backdrop]')?.addEventListener('click', () => {
        this.close()
        onCancel?.()
      })
    }

    this._handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close()
        onCancel?.()
      }
    }
    document.addEventListener('keydown', this._handleEscape)

    document.body.style.overflow = 'hidden'

    return {
      id: this._id,
      close: () => this.close(),
      getElement: () => modalElement,
    }
  },

  close() {
    const modal = document.getElementById(this._id)
    if (modal) {
      modal.style.opacity = '0'
      setTimeout(() => modal.remove(), 200)
    }

    if (this._handleEscape) {
      document.removeEventListener('keydown', this._handleEscape)
    }
    document.body.style.overflow = ''

    this._onClose?.()
    this._id = null
    this._onClose = null
    this._handleEscape = null
  },

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
        danger: { icon: '⚠️', confirmClass: 'btn-danger', iconBg: 'bg-red-100 dark:bg-red-900/30' },
        warning: { icon: '⚠️', confirmClass: 'btn-primary', iconBg: 'bg-yellow-100 dark:bg-yellow-900/30' },
        info: { icon: 'ℹ️', confirmClass: 'btn-primary', iconBg: 'bg-blue-100 dark:bg-blue-900/30' },
      }
      const style = variantStyles[variant] || variantStyles.info

      this.show({
        title: '',
        content: `
          <div class="flex flex-col items-center text-center py-4">
            <div class="w-16 h-16 ${style.iconBg} rounded-full flex items-center justify-center mb-4">
              <span class="text-3xl">${style.icon}</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">${title}</h3>
            <p class="text-gray-500 dark:text-gray-400">${message}</p>
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
   * Show loading modal (bisa di-close manual)
   * @param {string} message
   * @returns {Object} modal instance dengan method close
   */
  loading(message = 'Memproses...') {
    const instance = this.show({
      title: '',
      content: `
        <div class="flex flex-col items-center py-8">
          <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-gray-500 dark:text-gray-400">${message}</p>
        </div>
      `,
      size: 'sm',
      showFooter: false,
      closeOnBackdrop: false,
    })
    
    return instance // ⬅️ Return instance supaya bisa di-close
  },
}