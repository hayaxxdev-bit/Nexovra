// src/pages/errors/error.js
export default class ErrorPage {
  constructor(container, errorData = {}) {
    this.container = container;
    this.errorData = errorData;
  }

  async render() {
    const { 
      code = '500', 
      title = 'Terjadi Kesalahan', 
      message = 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
      details = null,
      showRetry = true 
    } = this.errorData;

    const isServerError = code.toString().startsWith('5');
    const icon = this.getErrorIcon(code);
    const colorClass = isServerError ? 'error' : 'warning';

    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center px-4 py-16">
        <div class="text-center max-w-lg w-full animate-slide-up">
          <!-- Error Icon & Code -->
          <div class="relative mb-8">
            <div class="text-8xl mb-4 ${isServerError ? 'animate-pulse' : ''}">
              ${icon}
            </div>
            <h1 class="text-8xl font-bold text-surface-200 dark:text-surface-800 select-none">
              ${code}
            </h1>
          </div>
          
          <!-- Error Details Card -->
          <div class="card p-8 mb-6">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-${colorClass}-500/30 to-transparent"></div>
            
            <!-- Status Badge -->
            <div class="flex justify-center mb-4">
              <span class="badge badge-${colorClass} text-sm">
                ${isServerError ? 'Server Error' : 'Client Error'}
              </span>
            </div>
            
            <h2 class="text-xl font-semibold mb-3 text-gradient">
              ${title}
            </h2>
            <p class="text-surface-600 dark:text-surface-400 mb-6">
              ${message}
            </p>
            
            ${details ? `
              <div class="bg-${colorClass}-50 dark:bg-${colorClass}-900/10 border border-${colorClass}-200 dark:border-${colorClass}-800 rounded-lg p-4 mb-6">
                <p class="text-sm text-${colorClass}-600 dark:text-${colorClass}-400 font-mono break-all">
                  ${details}
                </p>
              </div>
            ` : ''}
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              ${showRetry ? `
                <button onclick="window.location.reload()" 
                        class="btn-primary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Coba Lagi
                </button>
              ` : ''}
              <a href="/" class="btn-secondary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Kembali ke Beranda
              </a>
            </div>
          </div>
          
          <!-- Support Info -->
          <div class="text-center">
            <p class="text-sm text-surface-500 dark:text-surface-400">
              Jika masalah berlanjut, 
              <a href="/settings" class="text-primary-500 hover:text-primary-600 underline">
                hubungi tim support
              </a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  getErrorIcon(code) {
    const icons = {
      '400': '📝',
      '401': '🔒',
      '403': '🚫',
      '404': '🔍',
      '408': '⏰',
      '429': '🔄',
      '500': '💥',
      '502': '🔌',
      '503': '🔧',
      '504': '⏳',
    };
    return icons[code] || '⚠️';
  }

  async cleanup() {
    this.container.innerHTML = '';
  }
}