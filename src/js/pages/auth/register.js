import { AuthService } from '@services/auth.service.js'
import { Toast } from '@components/ui/toast.js'

/**
 * Register Page - Nexovra Next-Gen
 */
export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      <!-- Background Grid -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <!-- Glowing Orbs -->
      <div class="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[128px] animate-pulse"></div>
      <div class="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>
      
      <div class="w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8 animate-slide-down">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-purple-600 rounded-3xl shadow-2xl shadow-teal-500/30 mb-6 relative group cursor-pointer"
               onclick="window.__app?.router?.navigate('/')">
            <div class="absolute inset-0 bg-gradient-to-br from-teal-500 to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <svg class="relative w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Buat Akun</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">Mulai perjalanan keuangan Anda dengan Nexovra</p>
        </div>

        <!-- Register Card -->
        <div class="bg-white dark:bg-[#12121a]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-teal-500/5 animate-slide-up relative overflow-hidden">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 dark:via-teal-500/50 to-transparent"></div>
          
          <form id="register-form" class="space-y-5" novalidate>
            <!-- Full Name -->
            <div class="space-y-2">
              <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Lengkap
              </label>
              <div class="relative group">
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName"
                  class="relative w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300"
                  placeholder="Nama lengkap Anda" 
                  required 
                  autocomplete="name"
                  autofocus
                />
                <div class="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p id="fullName-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden flex items-center gap-1">
                <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span></span>
              </p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div class="relative group">
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  class="relative w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300"
                  placeholder="nama@email.com" 
                  required 
                  autocomplete="email"
                />
                <div class="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p id="email-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden flex items-center gap-1">
                <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span></span>
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div class="relative group">
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  class="relative w-full px-4 py-3 pl-11 pr-12 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300"
                  placeholder="Minimal 8 karakter" 
                  required 
                  minlength="8"
                  autocomplete="new-password"
                />
                <div class="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button 
                  type="button" 
                  id="toggle-password"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 focus:outline-none"
                  tabindex="-1"
                  aria-label="Toggle password visibility"
                >
                  <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              
              <!-- Password Strength Indicator -->
              <div id="password-strength" class="mt-3 hidden">
                <div class="flex gap-1.5 mb-2">
                  <div class="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300" data-bar="1"></div>
                  <div class="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300" data-bar="2"></div>
                  <div class="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300" data-bar="3"></div>
                  <div class="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300" data-bar="4"></div>
                </div>
                <div class="flex items-center justify-between">
                  <p id="strength-text" class="text-xs font-medium"></p>
                  <ul id="password-requirements" class="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
                    <li id="req-length" class="flex items-center gap-1">
                      <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                      Min 8 karakter
                    </li>
                    <li id="req-uppercase" class="flex items-center gap-1">
                      <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                      Huruf besar
                    </li>
                    <li id="req-number" class="flex items-center gap-1">
                      <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                      Angka
                    </li>
                    <li id="req-special" class="flex items-center gap-1">
                      <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                      Karakter spesial
                    </li>
                  </ul>
                </div>
              </div>
              <p id="password-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden flex items-center gap-1">
                <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span></span>
              </p>
            </div>

            <!-- Terms & Conditions -->
            <div class="flex items-start">
              <label class="relative flex items-start cursor-pointer select-none group">
                <div class="relative mt-0.5">
                  <input 
                    type="checkbox" 
                    id="agree-terms" 
                    class="sr-only peer"
                  />
                  <div class="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a24] peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all duration-200 flex items-center justify-center group-hover:border-teal-400 dark:group-hover:border-teal-500">
                    <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span class="ml-2.5 text-sm text-gray-500 dark:text-gray-400">
                  Saya setuju dengan 
                  <a href="/terms" class="text-teal-600 dark:text-teal-400 hover:underline">Syarat & Ketentuan</a> 
                  dan 
                  <a href="/privacy" class="text-teal-600 dark:text-teal-400 hover:underline">Kebijakan Privasi</a>
                </span>
              </label>
            </div>
            <p id="terms-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden flex items-center gap-1">
              <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>Anda harus menyetujui syarat & ketentuan</span>
            </p>

            <!-- Error Message -->
            <div id="form-error" class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm hidden backdrop-blur-sm">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span id="form-error-message"></span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              id="submit-btn" 
              class="relative w-full py-3.5 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
            >
              <span id="btn-text" class="relative flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Daftar Sekarang
              </span>
              <span id="btn-loading" class="hidden relative items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Membuat Akun...
              </span>
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-4 bg-white dark:bg-[#12121a] text-gray-400 dark:text-gray-500">atau daftar dengan</span>
            </div>
          </div>

          <!-- Social Register -->
          <div class="grid grid-cols-2 gap-3">
            <button 
              type="button"
              id="google-register"
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#22222f] hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              type="button"
              id="github-register"
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#22222f] hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <!-- Login Link -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Sudah punya akun? 
            <a href="/login" class="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors ml-1">
              Masuk Sekarang →
            </a>
          </p>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          &copy; ${new Date().getFullYear()} Hayaxxdev-bit. All rights reserved.
        </p>
      </div>
    </div>
  `;

  setupForm(container, params);
}

function setupForm(container, params) {
  const form = container.querySelector('#register-form');
  const submitBtn = container.querySelector('#submit-btn');
  const btnText = container.querySelector('#btn-text');
  const btnLoading = container.querySelector('#btn-loading');
  const formError = container.querySelector('#form-error');
  const formErrorMessage = container.querySelector('#form-error-message');
  const fullNameInput = container.querySelector('#fullName');
  const emailInput = container.querySelector('#email');
  const passwordInput = container.querySelector('#password');
  const togglePassword = container.querySelector('#toggle-password');
  const eyeIcon = container.querySelector('#eye-icon');
  const strengthIndicator = container.querySelector('#password-strength');
  const agreeTerms = container.querySelector('#agree-terms');
  const googleBtn = container.querySelector('#google-register');
  const githubBtn = container.querySelector('#github-register');

  // Clear errors on input
  fullNameInput.addEventListener('input', clearFieldErrors);
  emailInput.addEventListener('input', clearFieldErrors);
  passwordInput.addEventListener('input', clearFieldErrors);

  function clearFieldErrors() {
    hideError('fullName-error');
    hideError('email-error');
    hideError('password-error');
    hideFormError();
  }

  // Toggle password visibility
  togglePassword.addEventListener('click', togglePasswordVisibility);

  function togglePasswordVisibility() {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    if (isPassword) {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3l18 18" />
      `;
      togglePassword.setAttribute('aria-label', 'Sembunyikan password');
    } else {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      `;
      togglePassword.setAttribute('aria-label', 'Tampilkan password');
    }
  }

  // Password strength checker
  passwordInput.addEventListener('input', checkPasswordStrength);

  function checkPasswordStrength() {
    const value = passwordInput.value;
    
    if (value.length > 0) {
      strengthIndicator.classList.remove('hidden');
    } else {
      strengthIndicator.classList.add('hidden');
      return;
    }

    const bars = strengthIndicator.querySelectorAll('[data-bar]');
    const strengthText = strengthIndicator.querySelector('#strength-text');
    
    // Check requirements
    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);

    // Calculate strength score
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase && hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    // Update requirement indicators
    updateRequirement('req-length', hasMinLength);
    updateRequirement('req-uppercase', hasUpperCase);
    updateRequirement('req-number', hasNumber);
    updateRequirement('req-special', hasSpecial);

    // Update strength bars
    const colors = ['#EF4444', '#F59E0B', '#EAB308', '#10B981'];
    const texts = ['Lemah', 'Cukup', 'Baik', 'Kuat'];
    const gradients = [
      'linear-gradient(to right, #EF4444, #DC2626)',
      'linear-gradient(to right, #F59E0B, #D97706)',
      'linear-gradient(to right, #EAB308, #CA8A04)',
      'linear-gradient(to right, #10B981, #059669)'
    ];

    bars.forEach((bar, i) => {
      if (i < score) {
        bar.style.background = gradients[score - 1];
        bar.classList.add('shadow-sm');
      } else {
        bar.style.background = '';
        bar.classList.remove('shadow-sm');
      }
    });

    // Update strength text
    if (score > 0) {
      strengthText.textContent = `Kekuatan: ${texts[score - 1]}`;
      strengthText.style.color = colors[score - 1];
    } else {
      strengthText.textContent = 'Password terlalu lemah';
      strengthText.style.color = colors[0];
    }
  }

  function updateRequirement(id, isValid) {
    const element = container.querySelector(`#${id}`);
    if (element) {
      const dot = element.querySelector('.w-1');
      if (isValid) {
        element.classList.add('text-green-500', 'dark:text-green-400');
        element.classList.remove('text-gray-400', 'dark:text-gray-500');
        if (dot) {
          dot.classList.add('bg-green-500');
          dot.classList.remove('bg-gray-400');
        }
      } else {
        element.classList.remove('text-green-500', 'dark:text-green-400');
        element.classList.add('text-gray-400', 'dark:text-gray-500');
        if (dot) {
          dot.classList.remove('bg-green-500');
          dot.classList.add('bg-gray-400');
        }
      }
    }
  }

  // Custom checkbox handler for terms
  agreeTerms.addEventListener('change', () => {
    hideError('terms-error');
  });

  // Form submission
  form.addEventListener('submit', handleSubmit);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    hideError('fullName-error');
    hideError('email-error');
    hideError('password-error');
    hideError('terms-error');
    hideFormError();
    
    // Get values
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const termsAccepted = agreeTerms.checked;

    // Validate
    if (!validateForm(fullName, email, password, termsAccepted)) return;

    // Submit
    await submitRegistration(fullName, email, password);
  }

  function validateForm(fullName, email, password, termsAccepted) {
    let isValid = true;

    // Full name validation
    if (!fullName) {
      showError('fullName-error', 'Nama lengkap wajib diisi');
      isValid = false;
    } else if (fullName.length < 3) {
      showError('fullName-error', 'Nama minimal 3 karakter');
      isValid = false;
    }

    // Email validation
    if (!email) {
      showError('email-error', 'Email wajib diisi');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError('email-error', 'Format email tidak valid');
      isValid = false;
    }

    // Password validation
    if (!password) {
      showError('password-error', 'Password wajib diisi');
      isValid = false;
    } else if (password.length < 8) {
      showError('password-error', 'Password minimal 8 karakter');
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      showError('password-error', 'Password harus mengandung huruf besar');
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      showError('password-error', 'Password harus mengandung angka');
      isValid = false;
    }

    // Terms validation
    if (!termsAccepted) {
      showError('terms-error', 'Anda harus menyetujui syarat & ketentuan');
      isValid = false;
    }

    // Shake animation on error
    if (!isValid) {
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
    }

    return isValid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function submitRegistration(fullName, email, password) {
    setLoading(true);

    try {
      const result = await AuthService.register({ email, password, fullName });
      
      // Success animation
      submitBtn.style.background = 'linear-gradient(to right, #10B981, #059669)';
      btnText.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Berhasil!
      `;
      
      Toast.success('✅ Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.', 5000);
      
      // Check if email confirmation is needed
      if (result?.user?.identities?.length === 0) {
        Toast.info('📧 Email sudah terdaftar. Silakan login.', 3000);
      }
      
      setTimeout(() => {
        window.__app.router.navigate('/login?registered=true', true);
      }, 1500);
      
    } catch (error) {
      setLoading(false);
      handleRegistrationError(error);
    }
  }

  function handleRegistrationError(error) {
    let errorMessage = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';
    
    if (error.message) {
      const msg = error.message.toLowerCase();
      
      if (msg.includes('already registered') || msg.includes('already exists')) {
        errorMessage = 'Email sudah terdaftar. Silakan login atau gunakan email lain.';
      } else if (msg.includes('password')) {
        errorMessage = 'Password tidak memenuhi syarat keamanan.';
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
      } else if (msg.includes('network') || msg.includes('fetch')) {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.message;
      }
    }
    
    showFormError(errorMessage);
  }

  // Social register handlers
  googleBtn.addEventListener('click', async () => {
    try {
      googleBtn.disabled = true;
      await AuthService.loginWithGoogle();
    } catch (error) {
      googleBtn.disabled = false;
      showFormError('Gagal mendaftar dengan Google: ' + error.message);
    }
  });

  githubBtn.addEventListener('click', async () => {
    try {
      githubBtn.disabled = true;
      await AuthService.loginWithGithub();
    } catch (error) {
      githubBtn.disabled = false;
      showFormError('Gagal mendaftar dengan GitHub: ' + error.message);
    }
  });

  // Utility functions
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    btnLoading.classList.toggle('hidden', !isLoading);
    
    if (isLoading) {
      btnLoading.classList.add('flex');
      fullNameInput.disabled = true;
      emailInput.disabled = true;
      passwordInput.disabled = true;
      agreeTerms.disabled = true;
      googleBtn.disabled = true;
      githubBtn.disabled = true;
    } else {
      btnLoading.classList.remove('flex');
      fullNameInput.disabled = false;
      emailInput.disabled = false;
      passwordInput.disabled = false;
      agreeTerms.disabled = false;
      googleBtn.disabled = false;
      githubBtn.disabled = false;
    }
  }

  function showError(id, message) {
    const el = container.querySelector(`#${id}`);
    if (el) {
      const span = el.querySelector('span');
      if (span) span.textContent = message;
      el.classList.remove('hidden');
    }
  }

  function hideError(id) {
    const el = container.querySelector(`#${id}`);
    if (el) el.classList.add('hidden');
  }

  function showFormError(message) {
    if (formErrorMessage) {
      formErrorMessage.textContent = message;
    }
    formError.classList.remove('hidden');
  }

  function hideFormError() {
    formError.classList.add('hidden');
  }
}

// Add shake animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);