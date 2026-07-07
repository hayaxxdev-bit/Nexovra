// src/core/errorBoundary.js
export class ErrorBoundary {
  constructor(container, fallbackUI = null) {
    this.container = container;
    this.fallbackUI = fallbackUI;
    this.hasError = false;
  }

  async wrap(asyncFn) {
    try {
      this.hasError = false;
      return await asyncFn();
    } catch (error) {
      this.hasError = true;
      this.handleError(error);
      return null;
    }
  }

  handleError(error) {
    console.error('Error Boundary caught:', error);
    
    // Emit error event
    window.__app?.events?.emit('app:error', {
      type: 'boundary',
      error: error
    });

    // Tampilkan fallback UI atau error default
    if (this.fallbackUI) {
      this.fallbackUI.render(this.container, error);
    } else {
      this.renderDefaultError(error);
    }
  }

  renderDefaultError(error) {
    this.container.innerHTML = `
      <div class="min-h-[400px] flex items-center justify-center p-8">
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Terjadi Kesalahan
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            ${error.message || 'Komponen gagal dimuat'}
          </p>
          <button onclick="window.location.reload()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            🔄 Muat Ulang
          </button>
        </div>
      </div>
    `;
  }

  static async safeRender(container, renderFn, fallbackUI = null) {
    const boundary = new ErrorBoundary(container, fallbackUI);
    return await boundary.wrap(renderFn);
  }
}