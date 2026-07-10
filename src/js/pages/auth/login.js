import { AuthService } from "@services/auth.service.js";
import { Toast } from "@components/ui/toast.js";

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
          
          <form id="login-form" class="space-y-5" novalidate>
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
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <button type="button" id="forgot-password-btn" class="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors">
                  Lupa password?
                </button>
              </div>
              <div class="relative group">
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  class="relative w-full px-4 py-3 pl-11 pr-12 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all duration-300"
                  placeholder="Masukkan password" 
                  required 
                  autocomplete="current-password" 
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
              <p id="password-error" class="text-red-500 dark:text-red-400 text-xs mt-1 hidden flex items-center gap-1">
                <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span></span>
              </p>
            </div>

<!-- Remember Me -->
<div class="flex items-center">
  <label class="relative flex items-center cursor-pointer select-none group">
    <div class="relative">
      <input 
        type="checkbox" 
        id="remember-me" 
        class="sr-only peer"
      />
      <div class="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a24] peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all duration-200 flex items-center justify-center group-hover:border-teal-400 dark:group-hover:border-teal-500">
        <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
      Ingat saya
    </span>
  </label>
</div>

            <!-- Error Message -->
            <div id="form-error" class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm hidden backdrop-blur-sm">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span id="form-error-message"></span>
              </div>
            </div>

            <!-- Success Message -->
            <div id="form-success" class="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm hidden backdrop-blur-sm">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span id="form-success-message"></span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              id="submit-btn" 
              class="relative w-full py-3.5 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
            >
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
            <button 
              type="button"
              id="google-login"
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
              id="github-login"
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#22222f] hover:border-gray-300 dark:hover:border-gray-600/50 transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <!-- Register Link -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Belum punya akun? 
            <a href="/register" class="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors ml-1">
              Daftar Sekarang →
            </a>
          </p>
        </div>

        <!-- Forgot Password Modal -->
        <div id="forgot-password-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-[#12121a] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lupa Password?</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Masukkan email Anda dan kami akan mengirimkan link reset password.</p>
            <input 
              type="email" 
              id="reset-email" 
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 mb-3"
              placeholder="nama@email.com"
            />
            <p id="reset-error" class="text-red-500 text-xs mb-3 hidden"></p>
            <div class="flex gap-2">
              <button id="cancel-reset" class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm">Batal</button>
              <button id="send-reset" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl text-sm">
                Kirim Link
              </button>
            </div>
          </div>
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
  const form = container.querySelector("#login-form");
  const submitBtn = container.querySelector("#submit-btn");
  const btnText = container.querySelector("#btn-text");
  const btnLoading = container.querySelector("#btn-loading");
  const formError = container.querySelector("#form-error");
  const formErrorMessage = container.querySelector("#form-error-message");
  const formSuccess = container.querySelector("#form-success");
  const formSuccessMessage = container.querySelector("#form-success-message");
  const emailInput = container.querySelector("#email");
  const passwordInput = container.querySelector("#password");
  const togglePassword = container.querySelector("#toggle-password");
  const eyeIcon = container.querySelector("#eye-icon");
  const rememberMe = container.querySelector("#remember-me");
  const googleBtn = container.querySelector("#google-login");
  const githubBtn = container.querySelector("#github-login");
  const forgotPasswordBtn = container.querySelector("#forgot-password-btn");
  const forgotPasswordModal = container.querySelector("#forgot-password-modal");
  const resetEmail = container.querySelector("#reset-email");
  const resetError = container.querySelector("#reset-error");
  const cancelReset = container.querySelector("#cancel-reset");
  const sendReset = container.querySelector("#send-reset");
  const rememberMeCheckbox = container.querySelector("#remember-me");
  const checkboxWrapper = rememberMeCheckbox
    .closest(".relative")
    .querySelector(".w-5");

  // Check URL params for messages
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("verified") === "true") {
    showSuccess("Email berhasil dikonfirmasi! Silakan login.");
  }
  if (urlParams.get("reset") === "true") {
    showSuccess(
      "Password berhasil direset! Silakan login dengan password baru.",
    );
  }

  rememberMeCheckbox.addEventListener("change", () => {
    if (rememberMeCheckbox.checked) {
      checkboxWrapper.classList.add(
        "peer-checked:bg-teal-500",
        "peer-checked:border-teal-500",
      );
    }
  });

  // Click on wrapper toggles checkbox
  checkboxWrapper.addEventListener("click", (e) => {
    e.preventDefault();
    rememberMeCheckbox.checked = !rememberMeCheckbox.checked;
    rememberMeCheckbox.dispatchEvent(new Event("change"));
  });
  // Toggle password visibility
  togglePassword.addEventListener("click", togglePasswordVisibility);

  function togglePasswordVisibility() {
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");

    if (isPassword) {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3l18 18" />
      `;
      togglePassword.setAttribute("aria-label", "Sembunyikan password");
    } else {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      `;
      togglePassword.setAttribute("aria-label", "Tampilkan password");
    }
  }

  // Clear errors on input
  emailInput.addEventListener("input", clearErrors);
  passwordInput.addEventListener("input", clearErrors);

  function clearErrors() {
    hideError("email-error");
    hideError("password-error");
    hideFormError();
    hideFormSuccess();
  }

  // Restore remembered email
  const rememberedEmail = localStorage.getItem("nexovra_remembered_email");
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMe.checked = true;
    passwordInput.focus();
  } else {
    emailInput.focus();
  }

  // Forgot Password
  forgotPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (email) resetEmail.value = email;
    forgotPasswordModal.classList.remove("hidden");
    resetEmail.focus();
  });

  cancelReset.addEventListener("click", () => {
    forgotPasswordModal.classList.add("hidden");
    resetError.classList.add("hidden");
  });

  forgotPasswordModal.addEventListener("click", (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.classList.add("hidden");
      resetError.classList.add("hidden");
    }
  });

  sendReset.addEventListener("click", async () => {
    const email = resetEmail.value.trim();

    if (!email || !isValidEmail(email)) {
      resetError.textContent = "Masukkan email yang valid";
      resetError.classList.remove("hidden");
      return;
    }

    sendReset.disabled = true;
    sendReset.textContent = "Mengirim...";

    try {
      await AuthService.resetPassword(email);
      Toast.success("✅ Link reset password telah dikirim ke email Anda!");
      forgotPasswordModal.classList.add("hidden");
      resetError.classList.add("hidden");
    } catch (error) {
      resetError.textContent = error.message || "Gagal mengirim link reset";
      resetError.classList.remove("hidden");
    } finally {
      sendReset.disabled = false;
      sendReset.textContent = "Kirim Link";
    }
  });

  // Form submission
  form.addEventListener("submit", handleSubmit);

  async function handleSubmit(e) {
    e.preventDefault();

    hideError("email-error");
    hideError("password-error");
    hideFormError();
    hideFormSuccess();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validateForm(email, password)) return;

    handleRememberMe(email);
    await submitLogin(email, password);
  }

  function validateForm(email, password) {
    let isValid = true;

    if (!email) {
      showError("email-error", "Email wajib diisi");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError("email-error", "Format email tidak valid");
      isValid = false;
    }

    if (!password) {
      showError("password-error", "Password wajib diisi");
      isValid = false;
    }

    if (!isValid) {
      form.classList.add("animate-shake");
      setTimeout(() => form.classList.remove("animate-shake"), 500);
    }

    return isValid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleRememberMe(email) {
    if (rememberMe.checked) {
      localStorage.setItem("nexovra_remembered_email", email);
    } else {
      localStorage.removeItem("nexovra_remembered_email");
    }
  }

  async function submitLogin(email, password) {
    setLoading(true);

    try {
      const result = await AuthService.login({ email, password });

      // Success animation
      submitBtn.style.background =
        "linear-gradient(to right, #10B981, #059669)";
      btnText.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Berhasil!
      `;

      Toast.success("✅ Login berhasil! Mengalihkan...");

      window.__app?.events?.emit("auth:signedIn", result.user);

      setTimeout(() => {
        const redirectTo = params.redirect || "/";
        window.__app.router.navigate(redirectTo, true);
      }, 800);
    } catch (error) {
      setLoading(false);
      handleLoginError(error);
    }
  }

  function handleLoginError(error) {
    let errorMessage = "Terjadi kesalahan, silakan coba lagi.";

    if (error.message) {
      const msg = error.message.toLowerCase();

      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid")
      ) {
        errorMessage = "Email atau password salah.";
      } else if (
        msg.includes("email not confirmed") ||
        msg.includes("not confirmed")
      ) {
        errorMessage = "Email belum dikonfirmasi.";
        showFormError(errorMessage, true);
        return;
      } else if (
        msg.includes("too many requests") ||
        msg.includes("rate limit")
      ) {
        errorMessage = "Terlalu banyak percobaan. Silakan coba lagi nanti.";
      } else if (msg.includes("network") || msg.includes("fetch")) {
        errorMessage =
          "Gagal terhubung ke server. Periksa koneksi internet Anda.";
      } else {
        errorMessage = error.message;
      }
    }

    showFormError(errorMessage);
  }

  // Social login handlers
  googleBtn.addEventListener("click", async () => {
    try {
      googleBtn.disabled = true;
      googleBtn.querySelector("span")?.classList.add("opacity-50");
      await AuthService.loginWithGoogle();
    } catch (error) {
      googleBtn.disabled = false;
      showFormError("Gagal login dengan Google: " + error.message);
    }
  });

  githubBtn.addEventListener("click", async () => {
    try {
      githubBtn.disabled = true;
      githubBtn.querySelector("span")?.classList.add("opacity-50");
      await AuthService.loginWithGithub();
    } catch (error) {
      githubBtn.disabled = false;
      showFormError("Gagal login dengan GitHub: " + error.message);
    }
  });

  // Resend confirmation handler
  window.__app?.events?.on("auth:resendConfirmation", async () => {
    const email = emailInput.value.trim();
    if (email && isValidEmail(email)) {
      try {
        await AuthService.resendConfirmationEmail(email);
        Toast.success("✅ Email konfirmasi telah dikirim ulang!");
      } catch (error) {
        Toast.error("❌ Gagal mengirim ulang email konfirmasi");
      }
    }
  });

  // Utility functions
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.classList.toggle("hidden", isLoading);
    btnLoading.classList.toggle("hidden", !isLoading);

    if (isLoading) {
      btnLoading.classList.add("flex");
      emailInput.disabled = true;
      passwordInput.disabled = true;
      googleBtn.disabled = true;
      githubBtn.disabled = true;
    } else {
      btnLoading.classList.remove("flex");
      emailInput.disabled = false;
      passwordInput.disabled = false;
      googleBtn.disabled = false;
      githubBtn.disabled = false;
    }
  }

  function showError(id, message) {
    const el = container.querySelector(`#${id}`);
    if (el) {
      const span = el.querySelector("span");
      if (span) span.textContent = message;
      el.classList.remove("hidden");
    }
  }

  function hideError(id) {
    const el = container.querySelector(`#${id}`);
    if (el) el.classList.add("hidden");
  }

  function showFormError(message, showResend = false) {
    if (formErrorMessage) {
      formErrorMessage.textContent = message;

      if (showResend) {
        formErrorMessage.innerHTML += `
          <button 
            type="button" 
            id="resend-confirmation"
            class="block mt-2 text-teal-600 dark:text-teal-400 hover:underline text-sm font-medium"
          >
            Kirim ulang email konfirmasi
          </button>
        `;

        // Add resend event listener
        setTimeout(() => {
          const resendBtn = container.querySelector("#resend-confirmation");
          if (resendBtn) {
            resendBtn.addEventListener("click", () => {
              window.__app?.events?.emit("auth:resendConfirmation");
            });
          }
        }, 100);
      }
    }
    formError.classList.remove("hidden");
    formSuccess.classList.add("hidden");
  }

  function hideFormError() {
    formError.classList.add("hidden");
  }

  function showSuccess(message) {
    if (formSuccessMessage) {
      formSuccessMessage.textContent = message;
    }
    formSuccess.classList.remove("hidden");
    formError.classList.add("hidden");
  }

  function hideFormSuccess() {
    formSuccess.classList.add("hidden");
  }
}
