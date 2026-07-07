// src/pages/errors/maintenance.js
export default class MaintenancePage {
  constructor(container) {
    this.container = container;
  }

  async render() {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700">
        <div class="text-center text-white max-w-lg animate-slide-up">
          <!-- Maintenance Icon -->
          <div class="text-8xl mb-8 animate-float">
            🔧
          </div>
          
          <!-- Glass Card -->
          <div class="glass-card bg-white/10 backdrop-blur-xl border-white/20 p-8 mb-8">
            <h1 class="text-3xl font-bold mb-4">
              Dalam Pemeliharaan
            </h1>
            <p class="text-lg text-white/80 mb-8">
              Kami sedang melakukan pemeliharaan sistem untuk meningkatkan layanan. 
              Silakan kembali beberapa saat lagi.
            </p>
            
            <!-- Progress Indicator -->
            <div class="max-w-sm mx-auto mb-8">
              <div class="bg-white/20 rounded-full h-2 overflow-hidden">
                <div class="bg-white rounded-full h-full w-3/4 animate-pulse"></div>
              </div>
              <p class="text-sm text-white/60 mt-2">Estimasi selesai: 30 menit</p>
            </div>
            
            <!-- Countdown Timer -->
            <div class="flex justify-center gap-4 mb-8" id="maintenance-timer">
              <div class="text-center">
                <div class="bg-white/20 rounded-lg p-3 min-w-[60px]">
                  <span class="text-2xl font-bold" id="timer-minutes">30</span>
                </div>
                <span class="text-xs text-white/60 mt-1 block">Menit</span>
              </div>
              <div class="text-center">
                <div class="bg-white/20 rounded-lg p-3 min-w-[60px]">
                  <span class="text-2xl font-bold" id="timer-seconds">00</span>
                </div>
                <span class="text-xs text-white/60 mt-1 block">Detik</span>
              </div>
            </div>
          </div>
          
          <!-- Contact Info -->
          <div class="glass-card bg-white/10 backdrop-blur-xl border-white/20 p-6">
            <h3 class="font-semibold mb-3">Butuh bantuan segera?</h3>
            <div class="space-y-2 text-white/80">
              <p class="flex items-center justify-center gap-2">
                <span>📧</span> support@nexovra.com
              </p>
              <p class="flex items-center justify-center gap-2">
                <span>📞</span> +62 123 4567 890
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Simple countdown timer
        let totalSeconds = 1800; // 30 minutes
        const timerMinutes = document.getElementById('timer-minutes');
        const timerSeconds = document.getElementById('timer-seconds');
        
        if (timerMinutes && timerSeconds) {
          const interval = setInterval(() => {
            totalSeconds--;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            timerMinutes.textContent = String(minutes).padStart(2, '0');
            timerSeconds.textContent = String(seconds).padStart(2, '0');
            
            if (totalSeconds <= 0) {
              clearInterval(interval);
              window.location.reload();
            }
          }, 1000);
        }
      </script>
    `;
  }

  async cleanup() {
    this.container.innerHTML = '';
  }
}