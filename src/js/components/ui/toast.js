import { generateId } from '@core/utils.js'

export const Toast = {
  _container: null,
  _toasts: new Map(),

  _init() {
    if (this._container) return
    this._container = document.createElement('div')
    this._container.id = 'toast-container'
    this._container.className = 'fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none'
    document.body.appendChild(this._container)
  },

  show(options = {}) {
    this._init()

    const {
      type = 'info',
      title = '',
      message = '',
      duration = 4000,
      closable = true,
    } = options

    const id = `toast-${generateId()}`
    const icons = {
      success: { icon: '✅', bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200' },
      error: { icon: '❌', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200' },
      warning: { icon: '⚠️', bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200' },
      info: { icon: 'ℹ️', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200' },
    }

    const style = icons[type] || icons.info

    const toastHTML = `
      <div id="${id}" 
           class="pointer-events-auto ${style.bg} ${style.border} border rounded-xl p-4 shadow-lg animate-slide-left flex items-start gap-3"
           role="alert">
        <span class="text-lg shrink-0">${style.icon}</span>
        <div class="flex-1 min-w-0">
          ${title ? `<p class="font-semibold text-sm ${style.text}">${title}</p>` : ''}
          ${message ? `<p class="text-sm ${style.text} mt-0.5 opacity-90">${message}</p>` : ''}
        </div>
        ${closable ? `
          <button class="shrink-0 ${style.text} opacity-60 hover:opacity-100 transition-opacity" data-toast-close>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ''}
      </div>
    `

    this._container.insertAdjacentHTML('beforeend', toastHTML)

    const toastElement = document.getElementById(id)
    toastElement.querySelector('[data-toast-close]')?.addEventListener('click', () => {
      this._remove(id)
    })

    const timeout = setTimeout(() => {
      this._remove(id)
    }, duration)

    this._toasts.set(id, { element: toastElement, timeout })
  },

  _remove(id) {
    const toast = this._toasts.get(id)
    if (!toast) return

    clearTimeout(toast.timeout)
    toast.element.style.opacity = '0'
    toast.element.style.transform = 'translateX(100%)'
    toast.element.style.transition = 'all 0.3s ease'

    setTimeout(() => {
      toast.element.remove()
    }, 300)

    this._toasts.delete(id)
  },

  success(message, title = 'Berhasil!') {
    this.show({ type: 'success', title, message })
  },

  error(message, title = 'Error!') {
    this.show({ type: 'error', title, message, duration: 6000 })
  },

  info(message, title = 'Info') {
    this.show({ type: 'info', title, message })
  },

  warning(message, title = 'Peringatan!') {
    this.show({ type: 'warning', title, message, duration: 5000 })
  },

  clear() {
    this._toasts.forEach((_, id) => this._remove(id))
  },
  // Di bagian bawah, tambahkan:
  /**
   * Persistent toast (tidak auto-hide)
   */
  persist(type, message, title = '') {
    this.show({ type, title, message, duration: 0, closable: true })
  },
}