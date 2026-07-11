// @pages/auth/callback.js

import { AuthService } from '@services/auth.service.js'
import { Toast } from '@components/ui/toast.js'

/**
 * OAuth Callback Page
 * Menangani redirect dari Google/GitHub setelah login
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] p-4">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Memproses Login...</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  `;
  
  await handleCallback(container);
}

async function handleCallback(container) {
  try {
    // Tunggu sebentar untuk memastikan Supabase memproses URL
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = await AuthService.handleOAuthCallback();
    
    if (result?.user) {
      Toast.success(`✅ Selamat datang ${result.user.user_metadata?.full_name || result.user.email}!`, 3000);
      
      // Redirect ke dashboard/home
      setTimeout(() => {
        window.__app.router.navigate('/', true);
      }, 1000);
    } else {
      throw new Error('Tidak ada session ditemukan');
    }
  } catch (error) {
    console.error('Callback error:', error);
    Toast.error('❌ Gagal login. Silakan coba lagi.', 5000);
    
    setTimeout(() => {
      window.__app.router.navigate('/login', true);
    }, 2000);
  }
}