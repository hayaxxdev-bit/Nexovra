// src/core/globalErrorHandler.js
export class GlobalErrorHandler {
  static init() {
    // Tangkap unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      GlobalErrorHandler.showNotification({
        type: 'error',
        title: 'Error',
        message: event.reason?.message || 'Terjadi kesalahan yang tidak terduga'
      });

      // Prevent default console error
      event.preventDefault();
    });

    // Tangkap global errors
    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.error);
      
      // Ignore network errors (handled separately)
      if (event.target !== window) return;

      GlobalErrorHandler.showNotification({
        type: 'error',
        title: 'System Error',
        message: event.error?.message || 'Terjadi kesalahan sistem'
      });
    });

    // Listen untuk app errors
    window.__app?.events?.on('app:error', (errorData) => {
      this.handleAppError(errorData);
    });
  }

  static handleAppError(errorData) {
    const { type, error } = errorData;
    
    // Log error
    this.logError(type, error);
    
    // Tampilkan notifikasi berdasarkan severity
    if (error.severity === 'critical') {
      this.showNotification({
        type: 'error',
        title: 'Critical Error',
        message: error.message,
        duration: 10000
      });
    }
  }

  static showNotification({ type, title, message, duration = 5000 }) {
    // Buat toast notification
    const toast = document.createElement('div');
    toast.className = `
      fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 
      rounded-lg shadow-lg border-l-4 p-4 z-50 animate-slide-in
      ${type === 'error' ? 'border-red-500' : 'border-yellow-500'}
    `;
    
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${type === 'error' ? '❌' : '⚠️'}
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            ${title}
          </p>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            ${message}
          </p>
        </div>
        <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static logError(type, error) {
    // Simpan error log ke localStorage untuk debugging
    const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
    errors.push({
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }
    
    localStorage.setItem('error_logs', JSON.stringify(errors));
  }
}