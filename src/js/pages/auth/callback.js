import { AuthService } from '@services/auth.service.js';

export async function render(container) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f]">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
          <svg class="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400">Menyelesaikan autentikasi...</p>
      </div>
    </div>
  `;

  try {
    await AuthService.handleOAuthCallback();
  } catch (error) {
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] p-4">
        <div class="text-center max-w-md">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Gagal Autentikasi</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">${error.message}</p>
          <a href="/login" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl">
            Kembali ke Login
          </a>
        </div>
      </div>
    `;
  }
}