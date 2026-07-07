import { AuthService } from '@services/auth.service.js'
import { Toast } from '@components/ui/toast.js'

export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      <!-- Background Grid -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <!-- Glowing Orbs -->
      <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[128px] animate-pulse"></div>
      <div class="absolute bottom-1/3 left-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[128px] animate-pulse delay-1000"></div>
      
      <div class="w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8 animate-slide-down">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl shadow-purple-500/30 mb-6 relative group cursor-pointer"
               onclick="window.__app?.router?.navigate('/')">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <span class="relative text-white font-bold text-3xl tracking-tight">N</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Selamat Datang</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">Masuk ke akun Nexovra Anda</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-purple-500/5 animate-slide-up relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 dark:via-teal-500/50 to-transparent"></div>
          
          <form id="login-form" class="space-y-5">
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div class="relative group">
                <input type="email" id="email" name="email"
                       class="relative w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300"
                       placeholder="nama@email.com" required autocomplete="email" autofocus />
                <div class="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p id="email-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden"></p>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <a href="/forgot-password" class="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors">Lupa password?</a>
              </div>
              <div class="relative group">
                <input type="password" id="password" name="password"
                       class="relative w-full px-4 py-3 pl-11 pr-12 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300"
                       placeholder="Masukkan password" required autocomplete="current-password" />
                <div class="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button type="button" id="toggle-password"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1" tabindex="-1">
                  <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p id="password-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden"></p>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center">
              <input type="checkbox" id="remember-me" 
                     class="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a24] text-teal-500 focus:ring-teal-500/20 focus:ring-offset-0 cursor-pointer" />
              <label for="remember-me" class="ml-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">Ingat saya</label>
            </div>

            <!-- Error Message -->
            <div id="form-error" class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm hidden backdrop-blur-sm"></div>

            <!-- Submit -->
            <button type="submit" id="submit-btn" 
                    class="relative w-full py-3.5 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden">
              <span id="btn-text" class="relative flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Masuk
              </span>
              <span id="btn-loading" class="hidden relative items-center justify-center gap-2">
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
              <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-4 bg-white dark:bg-[#12121a] text-gray-400 dark:text-gray-500">atau masuk dengan</span>
            </div>
          </div>

          <!-- Social Login -->
          <div class="grid grid-cols-2 gap-3">
            <button class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#22222f] hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#22222f] hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <!-- Register Link -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Belum punya akun? 
            <a href="/register" class="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors ml-1">Daftar Sekarang →</a>
          </p>
        </div>

        <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          &copy; ${new Date().getFullYear()} Hayaxxdev-bit. All rights reserved.
        </p>
      </div>
    </div>
  `

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
  const rememberMe = container.querySelector('#remember-me')

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'
    passwordInput.setAttribute('type', type)
    
    if (type === 'text') {
      eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3l18 18" />`
    } else {
      eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`
    }
  })

  emailInput.addEventListener('input', () => {
    container.querySelector('#email-error')?.classList.add('hidden')
    formError.classList.add('hidden')
  })
  
  passwordInput.addEventListener('input', () => {
    container.querySelector('#password-error')?.classList.add('hidden')
    formError.classList.add('hidden')
  })

  const rememberedEmail = localStorage.getItem('nexovra_remembered_email')
  if (rememberedEmail) {
    emailInput.value = rememberedEmail
    rememberMe.checked = true
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    formError.classList.add('hidden')
    container.querySelector('#email-error')?.classList.add('hidden')
    container.querySelector('#password-error')?.classList.add('hidden')
    
    const email = emailInput.value.trim()
    const password = passwordInput.value

    let hasError = false
    
    if (!email) {
      showFieldError(container, 'email-error', 'Email wajib diisi')
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(container, 'email-error', 'Format email tidak valid')
      hasError = true
    }
    
    if (!password) {
      showFieldError(container, 'password-error', 'Password wajib diisi')
      hasError = true
    }
    
    if (hasError) return

    if (rememberMe.checked) {
      localStorage.setItem('nexovra_remembered_email', email)
    } else {
      localStorage.removeItem('nexovra_remembered_email')
    }

    setLoading(true)

      try {
      await AuthService.login({ email, password })
      
      // Success animation
      submitBtn.style.background = 'linear-gradient(to right, #10B981, #059669)'
      Toast.success('✅ Berhasil masuk!')
      
      // ⬇️ TAMBAHKAN INI: Force redirect setelah login
      setTimeout(() => {
        window.__app.router.navigate('/', true)
      }, 500)
      
    } catch (error) {
      setLoading(false)
      let errorMessage = 'Terjadi kesalahan, silakan coba lagi.'
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid')) {
        errorMessage = 'Email atau password salah.'
      } else if (error.message?.includes('Email not confirmed') || error.message?.includes('not confirmed')) {
        errorMessage = 'Email belum dikonfirmasi.'
      } else {
        errorMessage = error.message || errorMessage
      }
      formError.innerHTML = `<div class="flex items-start gap-3"><span>${errorMessage}</span></div>`
      formError.classList.remove('hidden')
    }
  })

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading
    btnText.classList.toggle('hidden', isLoading)
    btnLoading.classList.toggle('hidden', !isLoading)
    if (isLoading) btnLoading.classList.add('flex')
    else btnLoading.classList.remove('flex')
  }

  function showFieldError(container, id, message) {
    const el = container.querySelector(`#${id}`)
    if (el) {
      el.textContent = message
      el.classList.remove('hidden')
    }
  }
}