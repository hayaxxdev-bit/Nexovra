// src/components/ErrorToast.js
export class ErrorToast {
  static show({ type = 'error', title, message, duration = 5000 }) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };

    const colorClasses = {
      error: 'border-error-500 bg-error-50 dark:bg-error-900/20',
      warning: 'border-warning-500 bg-warning-50 dark:bg-warning-900/20',
      info: 'border-info-500 bg-info-50 dark:bg-info-900/20',
      success: 'border-success-500 bg-success-50 dark:bg-success-900/20'
    };

    const toast = document.createElement('div');
    toast.className = `
      fixed bottom-4 right-4 max-w-sm 
      card border-l-4 p-4 z-50
      animate-slide-right
      ${colorClasses[type]}
    `;
    
    toast.innerHTML = `
      <div class="flex items-start">
        <span class="text-lg mr-3">${icons[type]}</span>
        <div class="flex-1">
          <p class="text-sm font-medium">${title}</p>
          <p class="text-xs text-surface-600 dark:text-surface-400 mt-1">
            ${message}
          </p>
        </div>
        <button onclick="this.closest('.card').remove()" 
                class="ml-3 text-surface-400 hover:text-surface-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}