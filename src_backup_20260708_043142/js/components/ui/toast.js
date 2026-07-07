import { generateId } from '@core/utils.js'

export const Toast = {
  _container: null,
  _toasts: new Map(),

  _init() {
    if (this._container) return
    this._container = document.createElement('div')
    this._container.id = 'toast-container'
    this._container.className = 'fixed top-20 right-4 z-[100] flex flex-col gap-3 w-[380px] max-w-[calc(100vw-2rem)] pointer-events-none'
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
    
    // Next-Gen Style Icons & Colors
    const icons = {
      success: { 
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
        border: 'border-emerald-200 dark:border-emerald-500/20', 
        text: 'text-emerald-800 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
        iconText: 'text-emerald-600 dark:text-emerald-400',
        glow: 'shadow-emerald-500/10'
      },
      error: { 
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        bg: 'bg-red-50 dark:bg-red-500/10', 
        border: 'border-red-200 dark:border-red-500/20', 
        text: 'text-red-800 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-500/20',
        iconText: 'text-red-600 dark:text-red-400',
        glow: 'shadow-red-500/10'
      },
      warning: { 
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>`,
        bg: 'bg-amber-50 dark:bg-amber-500/10', 
        border: 'border-amber-200 dark:border-amber-500/20', 
        text: 'text-amber-800 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-500/20',
        iconText: 'text-amber-600 dark:text-amber-400',
        glow: 'shadow-amber-500/10'
      },
      info: { 
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        bg: 'bg-blue-50 dark:bg-blue-500/10', 
        border: 'border-blue-200 dark:border-blue-500/20', 
        text: 'text-blue-800 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-500/20',
        iconText: 'text-blue-600 dark:text-blue-400',
        glow: 'shadow-blue-500/10'
      },
    }

    const style = icons[type] || icons.info

    const toastHTML = `
      <div id="${id}" 
           class="pointer-events-auto ${style.bg} ${style.border} border rounded-2xl p-4 shadow-xl ${style.glow} backdrop-blur-xl animate-slide-left flex items-start gap-3 relative overflow-hidden group"
           role="alert">
        <!-- Glow Line Top -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
        
        <!-- Icon Container -->
        <div class="w-10 h-10 rounded-xl ${style.iconBg} ${style.iconText} flex items-center justify-center shrink-0 shadow-sm">
          ${style.icon}
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0 pt-0.5">
          ${title ? `<p class="font-semibold text-sm ${style.text}">${title}</p>` : ''}
          ${message ? `<p class="text-sm ${style.text} mt-0.5 opacity-80">${message}</p>` : ''}
        </div>
        
        <!-- Close Button -->
        ${closable ? `
          <button class="shrink-0 p-1 rounded-lg ${style.text} opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200" data-toast-close>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ''}
        
        <!-- Progress Bar -->
        ${duration > 0 ? `
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5">
            <div class="h-full ${style.iconBg.replace('bg-', 'bg-').replace('/10', '/30').replace('/20', '/40')} toast-progress" style="animation: toast-progress ${duration}ms linear forwards;"></div>
          </div>
        ` : ''}
      </div>
    `

    this._container.insertAdjacentHTML('beforeend', toastHTML)

    const toastElement = document.getElementById(id)
    
    // Close button handler
    toastElement.querySelector('[data-toast-close]')?.addEventListener('click', () => {
      this._remove(id)
    })

    // Auto-remove timeout
    let timeout = null
    if (duration > 0) {
      timeout = setTimeout(() => {
        this._remove(id)
      }, duration)
    }

    this._toasts.set(id, { element: toastElement, timeout })
  },

  _remove(id) {
    const toast = this._toasts.get(id)
    if (!toast) return

    clearTimeout(toast.timeout)
    
    // Exit animation
    toast.element.style.opacity = '0'
    toast.element.style.transform = 'translateX(120%) scale(0.95)'
    toast.element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

    setTimeout(() => {
      toast.element.remove()
    }, 300)

    this._toasts.delete(id)
  },

  /**
   * Success toast
   */
  success(message, title = 'Berhasil!') {
    this.show({ type: 'success', title, message })
  },

  /**
   * Error toast
   */
  error(message, title = 'Error!') {
    this.show({ type: 'error', title, message, duration: 6000 })
  },

  /**
   * Info toast
   */
  info(message, title = 'Info') {
    this.show({ type: 'info', title, message })
  },

  /**
   * Warning toast
   */
  warning(message, title = 'Peringatan!') {
    this.show({ type: 'warning', title, message, duration: 5000 })
  },

  /**
   * Persistent toast (tidak auto-hide)
   */
  persist(type, message, title = '') {
    this.show({ type, title, message, duration: 0, closable: true })
  },

  /**
   * Clear all toasts
   */
  clear() {
    this._toasts.forEach((_, id) => this._remove(id))
  },
}

// Add progress bar animation to document
const style = document.createElement('style')
style.textContent = `
  @keyframes toast-progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @keyframes slide-left {
    from {
      opacity: 0;
      transform: translateX(120%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  
  .animate-slide-left {
    animation: slide-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
`
document.head.appendChild(style)