// @services/notification-sound.service.js

export const NotificationSoundService = {
  _audioContext: null,
  _sounds: {},
  _vibrationPatterns: {
    default: [200, 100, 200],
    urgent: [100, 50, 100, 50, 200],
    success: [100, 50, 100],
    warning: [200, 100, 200, 100, 400],
    reminder: [150, 50, 150, 50, 150],
    error: [300, 100, 300],
  },

  /**
   * Initialize audio context
   */
  init() {
    if (!this._audioContext) {
      try {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)()
        console.log('🔊 Audio context initialized')
      } catch (error) {
        console.warn('⚠️ Audio context not supported:', error)
      }
    }
    return this._audioContext
  },

  /**
   * Play notification sound
   */
  async play(type = 'default', options = {}) {
    const { volume = 0.5, loop = false } = options

    try {
      // Try to play from audio file first
      const audioPlayed = await this._playAudioFile(type, volume, loop)
      if (audioPlayed) return true

      // Fallback: Generate sound via Web Audio
      return this._generateSound(type, volume, loop)
    } catch (error) {
      console.warn('⚠️ Failed to play sound:', error)
      return false
    }
  },

  /**
   * Play audio file
   */
  async _playAudioFile(type, volume, loop) {
    const soundFiles = {
      default: '/sounds/notification.mp3',
      urgent: '/sounds/urgent.mp3',
      success: '/sounds/success.mp3',
      warning: '/sounds/warning.mp3',
      reminder: '/sounds/reminder.mp3',
      error: '/sounds/error.mp3',
    }

    const file = soundFiles[type] || soundFiles.default
    
    try {
      const audio = new Audio(file)
      audio.volume = Math.min(volume, 1)
      audio.loop = loop
      
      // Load and play
      await audio.play()
      
      // Store for cleanup
      if (!this._sounds[type]) {
        this._sounds[type] = []
      }
      this._sounds[type].push(audio)
      
      // Clean up after playing
      audio.addEventListener('ended', () => {
        const index = this._sounds[type]?.indexOf(audio)
        if (index > -1) {
          this._sounds[type].splice(index, 1)
        }
        audio.remove()
      })

      return true
    } catch (error) {
      // File not found or cannot play
      return false
    }
  },

  /**
   * Generate sound using Web Audio API
   */
  _generateSound(type, volume, loop) {
    const ctx = this.init()
    if (!ctx) return false

    try {
      const patterns = {
        default: { frequencies: [800, 1000], duration: 150, interval: 200 },
        urgent: { frequencies: [600, 800, 1000], duration: 100, interval: 100 },
        success: { frequencies: [523, 659, 784], duration: 150, interval: 150 },
        warning: { frequencies: [400, 300], duration: 200, interval: 300 },
        reminder: { frequencies: [880, 880, 880], duration: 100, interval: 100 },
        error: { frequencies: [300, 200], duration: 300, interval: 200 },
      }

      const pattern = patterns[type] || patterns.default
      const { frequencies, duration, interval } = pattern

      const startTime = ctx.currentTime
      
      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.value = freq
        
        gainNode.gain.value = volume * 0.3
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + (i * (duration + interval)) / 1000 + duration / 1000
        )
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(startTime + (i * (duration + interval)) / 1000)
        oscillator.stop(startTime + (i * (duration + interval)) / 1000 + duration / 1000)
      })

      return true
    } catch (error) {
      console.warn('⚠️ Failed to generate sound:', error)
      return false
    }
  },

  /**
   * Vibrate device
   */
  vibrate(pattern = 'default') {
    // Cek apakah vibrasi didukung
    if (!navigator.vibrate) {
      console.log('📳 Vibrasi tidak didukung di perangkat ini')
      return false
    }

    try {
      const pattern = this._vibrationPatterns[type] || this._vibrationPatterns.default
      navigator.vibrate(pattern)
      return true
    } catch (error) {
      console.warn('⚠️ Failed to vibrate:', error)
      return false
    }
  },

  /**
   * Play notification with sound and vibration
   */
  notify(type = 'default', options = {}) {
    const { sound = true, vibrate = true, volume = 0.5 } = options

    // Play sound
    if (sound) {
      this.play(type, { volume })
    }

    // Vibrate
    if (vibrate) {
      this.vibrate(type)
    }
  },

  /**
   * Stop all playing sounds
   */
  stopAll() {
    Object.values(this._sounds).forEach(sounds => {
      sounds.forEach(audio => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch (e) {
          // Ignore
        }
      })
    })
    this._sounds = {}
  },

  /**
   * Check if browser supports vibration
   */
  isVibrationSupported() {
    return 'vibrate' in navigator
  },

  /**
   * Check if browser supports audio
   */
  isAudioSupported() {
    return 'AudioContext' in window || 'webkitAudioContext' in window
  }
}

export default NotificationSoundService