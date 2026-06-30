import { AuthService } from '@services/auth.service.js'
import { Toast } from '@components/ui/toast.js'

/**
 * Login Page
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8 animate-slide-down">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl shadow-primary-500/20 mb-4">
            <span class="text-white font-bold text-2xl">Nexovra</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Nexovra</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Masuk untuk melanjutkan</p>
        </div>

        <!-- Login Form -->
        <div class="card p-6 md:p-8 animate-slide-up">
          <form id="login-form" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                name="email"
                class="input" 
                placeholder="nama@email.com" 
                required 
                autocomplete="email"
                autofocus
              />
              <p id="email-error" class="text-red-500 text-xs mt-1 hidden"></p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div class="relative">
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  class="input pr-10" 
                  placeholder="Masukkan password" 
                  required 
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  id="toggle-password"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabindex="-1"
                >
                  <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p id="password-error" class="text-red-500 text-xs mt-1 hidden"></p>
            </div>

            <!-- Error Message -->
            <div id="form-error" class="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm hidden">
            </div>

            <!-- Submit -->
            <button type="submit" id="submit-btn" class="btn btn-primary w-full">
              <span id="btn-text">Masuk</span>
              <span id="btn-loading" class="hidden">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">atau</span>
            </div>
          </div>

          <!-- Register Link -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            Belum punya akun? 
            <a href="/register" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Daftar Sekarang
            </a>
          </p>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          &copy; ${new Date().getFullYear()} Hayaxxdev-bit. All rights reserved.
        </p>
      </div>
    </div>
  `

  // Setup form
  setupForm(container)
}

function setupForm(container) {
  const form = container.querySelector('#login-form')
  const submitBtn = container.querySelector('#submit-btn')
  const btnText = container.querySelector('#btn-text')
  const btnLoading = container.querySelector('#btn-loading')
  const formError = container.querySelector('#form-error')
  const emailInput = container.querySelector('#email')
  const passwordInput = container.querySelector('#password')
  const togglePassword = container.querySelector('#toggle-password')
  const eyeIcon = container.querySelector('#eye-icon')

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'
    passwordInput.setAttribute('type', type)
    
    if (type === 'text') {
      eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />`
    } else {
      eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`
    }
  })

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Reset errors
    formError.classList.add('hidden')
    container.querySelector('#email-error')?.classList.add('hidden')
    container.querySelector('#password-error')?.classList.add('hidden')
    
    const email = emailInput.value.trim()
    const password = passwordInput.value

    // Basic validation
    let hasError = false
    if (!email) {
      showFieldError(container, 'email-error', 'Email wajib diisi')
      hasError = true
    }
    if (!password) {
      showFieldError(container, 'password-error', 'Password wajib diisi')
      hasError = true
    }
    if (hasError) return

    // Show loading
    setLoading(true)

    try {
      await AuthService.login({ email, password })
      Toast.success('Berhasil masuk!')
      // Router akan otomatis redirect ke dashboard
    } catch (error) {
      setLoading(false)
      
      let errorMessage = 'Terjadi kesalahan, coba lagi.'
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email belum dikonfirmasi. Silakan cek inbox email Anda.'
      } else {
        errorMessage = error.message || errorMessage
      }
      
      formError.textContent = errorMessage
      formError.classList.remove('hidden')
    }
  })

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading
    btnText.classList.toggle('hidden', isLoading)
    btnLoading.classList.toggle('hidden', !isLoading)
  }

  function showFieldError(container, id, message) {
    const el = container.querySelector(`#${id}`)
    if (el) {
      el.textContent = message
      el.classList.remove('hidden')
    }
  }
}