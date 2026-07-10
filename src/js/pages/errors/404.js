// src/pages/errors/404.js
export default class NotFoundPage {
  constructor(container, errorData = {}) {
    this.container = container;
    this.errorData = errorData;
  }

  async render() {
    const requestedPath = this.errorData.requestedPath || window.location.pathname;
    
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center px-4 py-16">
        <div class="text-center max-w-lg animate-slide-up">
          <!-- Error Visual -->
          <div class="relative mb-8">
            <h1 class="text-[12rem] font-bold text-surface-200 dark:text-surface-800 leading-none select-none">
              404
            </h1>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-7xl animate-float">🔍</span>
            </div>
          </div>
          
          <!-- Message Card -->
          <div class="card p-8 mb-8">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>
            
            <div class="flex justify-center mb-4">
              <span class="badge badge-error text-sm">404 Not Found</span>
            </div>
            
            <h2 class="text-2xl font-semibold mb-3 text-gradient">
              Halaman Tidak Ditemukan
            </h2>
            
            <!-- Tampilkan URL yang salah -->
            <div class="bg-surface-100 dark:bg-surface-800/50 rounded-lg p-4 mb-4 border border-surface-200 dark:border-surface-700">
              <p class="text-xs text-surface-500 dark:text-surface-400 mb-2 uppercase tracking-wide">URL yang diminta:</p>
              <code class="text-sm font-mono text-error-500 dark:text-error-400 break-all bg-surface-200 dark:bg-surface-900/50 px-3 py-2 rounded block">
                ${this.escapeHTML(requestedPath)}
              </code>
            </div>
            
            <p class="text-surface-600 dark:text-surface-400 mb-8">
              Maaf, halaman yang Anda cari tidak tersedia. Mungkin telah dipindahkan atau dihapus.
            </p>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button onclick="window.history.back()" 
                      class="btn-secondary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Kembali
              </button>
              <a href="/" class="btn-primary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Dashboard
              </a>
            </div>
          </div>
          
          <!-- Saran Navigasi -->
          <div class="card p-6">
            <h3 class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-4">
              Mungkin Anda mencari:
            </h3>
            <div class="flex flex-wrap justify-center gap-2">
              <a href="/accounts" class="badge badge-info hover-lift">Akun</a>
              <a href="/transactions" class="badge badge-info hover-lift">Transaksi</a>
              <a href="/reports" class="badge badge-info hover-lift">Laporan</a>
              <a href="/cashbook" class="badge badge-info hover-lift">Buku Kas</a>
              <a href="/planner" class="badge badge-info hover-lift">Perencana</a>
              <a href="/settings" class="badge badge-info hover-lift">Pengaturan</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="mt-6 space-y-2">
            <p class="text-xs text-surface-400 dark:text-surface-600">
              Error ID: ${this.generateErrorId()}
            </p>
            <p class="text-xs text-surface-400 dark:text-surface-600">
              Jika Anda yakin ini adalah kesalahan, hubungi tim support.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  generateErrorId() {
    return '404-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

  async cleanup() {
    this.container.innerHTML = '';
  }
}