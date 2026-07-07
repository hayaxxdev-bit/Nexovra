import { formatDate } from '@core/utils.js'

/**
 * Calendar Component - Real-time Interactive Calendar
 * Usage:
 *   Calendar.render(container, { onDateSelect: (date) => {} })
 */
export const Calendar = {
  _currentMonth: new Date().getMonth(),
  _currentYear: new Date().getFullYear(),
  _selectedDate: new Date().toISOString().split('T')[0],
  _onDateSelect: null,
  _container: null,

  /**
   * Render calendar
   * @param {HTMLElement} container - Container element
   * @param {Object} options
   * @param {Function} options.onDateSelect - Callback when date is selected
   * @param {string} options.selectedDate - Pre-selected date (YYYY-MM-DD)
   * @param {Array} options.markedDates - Array of dates to highlight
   * @param {Array} options.eventDates - Array of { date, label, color } for events
   */
  render(container, options = {}) {
    this._container = container
    this._onDateSelect = options.onDateSelect || null
    this._selectedDate = options.selectedDate || new Date().toISOString().split('T')[0]
    this._markedDates = options.markedDates || []
    this._eventDates = options.eventDates || []

    this._currentMonth = new Date(this._selectedDate).getMonth()
    this._currentYear = new Date(this._selectedDate).getFullYear()

    this._renderCalendar()
    this._setupEvents()
  },

  /**
   * Render calendar HTML
   */
  _renderCalendar() {
    if (!this._container) return

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    // Get first day and total days
    const firstDay = new Date(this._currentYear, this._currentMonth, 1).getDay()
    const totalDays = new Date(this._currentYear, this._currentMonth + 1, 0).getDate()
    const prevMonthDays = new Date(this._currentYear, this._currentMonth, 0).getDate()

    // Build calendar grid
    let daysHTML = ''

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      daysHTML += `
        <div class="calendar-day other-month opacity-30 cursor-default">
          <span>${day}</span>
        </div>
      `
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${this._currentYear}-${String(this._currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = dateStr === todayStr
      const isSelected = dateStr === this._selectedDate
      const isMarked = this._markedDates.includes(dateStr)
      
      // Find events for this date
      const events = this._eventDates?.filter(e => e.date === dateStr) || []
      const hasEvents = events.length > 0

      let dayClass = 'calendar-day'
      if (isToday) dayClass += ' calendar-today'
      if (isSelected) dayClass += ' calendar-selected'
      if (isMarked) dayClass += ' calendar-marked'
      if (hasEvents) dayClass += ' calendar-has-events'

      daysHTML += `
        <div class="${dayClass}" data-date="${dateStr}" role="button" tabindex="0">
          <span class="calendar-day-number">${day}</span>
          ${hasEvents ? `
            <div class="calendar-events">
              ${events.slice(0, 2).map(e => `
                <span class="calendar-event-dot" style="background-color: ${e.color || '#3B82F6'}" title="${e.label}"></span>
              `).join('')}
              ${events.length > 2 ? `<span class="calendar-event-more">+${events.length - 2}</span>` : ''}
            </div>
          ` : ''}
        </div>
      `
    }

    // Next month days
    const remainingCells = 42 - (firstDay + totalDays) // 6 rows x 7 columns
    for (let day = 1; day <= remainingCells; day++) {
      daysHTML += `
        <div class="calendar-day other-month opacity-30 cursor-default">
          <span>${day}</span>
        </div>
      `
    }

    this._container.innerHTML = `
      <div class="calendar-container select-none">
        <!-- Calendar Header -->
        <div class="calendar-header">
          <button class="calendar-nav-btn" data-action="prev" aria-label="Bulan sebelumnya">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="calendar-title">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${monthNames[this._currentMonth]} ${this._currentYear}
            </h3>
            <button class="calendar-today-btn" data-action="today">Hari Ini</button>
          </div>

          <button class="calendar-nav-btn" data-action="next" aria-label="Bulan berikutnya">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Day Names -->
        <div class="calendar-day-names">
          ${dayNames.map(name => `
            <div class="calendar-day-name">${name}</div>
          `).join('')}
        </div>

        <!-- Days Grid -->
        <div class="calendar-days-grid">
          ${daysHTML}
        </div>
      </div>
    `

    // Inject styles
    this._injectStyles()
  },

  /**
   * Setup event listeners
   */
  _setupEvents() {
    if (!this._container) return

    // Navigation buttons
    this._container.querySelectorAll('.calendar-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action
        if (action === 'prev') {
          this._currentMonth--
          if (this._currentMonth < 0) {
            this._currentMonth = 11
            this._currentYear--
          }
        } else if (action === 'next') {
          this._currentMonth++
          if (this._currentMonth > 11) {
            this._currentMonth = 0
            this._currentYear++
          }
        }
        this._renderCalendar()
        this._setupEvents()
      })
    })

    // Today button
    this._container.querySelector('.calendar-today-btn')?.addEventListener('click', () => {
      const today = new Date()
      this._currentMonth = today.getMonth()
      this._currentYear = today.getFullYear()
      this._selectedDate = today.toISOString().split('T')[0]
      this._renderCalendar()
      this._setupEvents()
      
      if (this._onDateSelect) {
        this._onDateSelect(this._selectedDate)
      }
    })

    // Day clicks
    this._container.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
      day.addEventListener('click', () => {
        const dateStr = day.dataset.date
        if (!dateStr) return

        this._selectedDate = dateStr
        this._renderCalendar()
        this._setupEvents()

        if (this._onDateSelect) {
          this._onDateSelect(dateStr)
        }
      })
    })

    // Keyboard navigation
    this._container.querySelector('.calendar-container')?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this._changeDate(-1)
      } else if (e.key === 'ArrowRight') {
        this._changeDate(1)
      } else if (e.key === 'ArrowUp') {
        this._changeDate(-7)
      } else if (e.key === 'ArrowDown') {
        this._changeDate(7)
      }
    })
  },

  /**
   * Change selected date by offset
   */
  _changeDate(offset) {
    const current = new Date(this._selectedDate)
    current.setDate(current.getDate() + offset)
    this._selectedDate = current.toISOString().split('T')[0]
    
    this._currentMonth = current.getMonth()
    this._currentYear = current.getFullYear()
    
    this._renderCalendar()
    this._setupEvents()

    if (this._onDateSelect) {
      this._onDateSelect(this._selectedDate)
    }
  },

  /**
   * Get selected date
   */
  getSelectedDate() {
    return this._selectedDate
  },

  /**
   * Inject calendar styles
   */
  _injectStyles() {
    if (document.getElementById('calendar-styles')) return

    const styles = document.createElement('style')
    styles.id = 'calendar-styles'
    styles.textContent = `
      .calendar-container {
        background: transparent;
        user-select: none;
      }

      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .calendar-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: #6B7280;
        cursor: pointer;
        transition: all 0.2s;
      }

      .calendar-nav-btn:hover {
        background: #F3F4F6;
        color: #111827;
      }

      .dark .calendar-nav-btn:hover {
        background: #1F2937;
        color: #F9FAFB;
      }

      .calendar-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }

      .calendar-today-btn {
        font-size: 0.75rem;
        color: #3B82F6;
        background: none;
        border: 1px solid #3B82F6;
        border-radius: 9999px;
        padding: 0.125rem 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .calendar-today-btn:hover {
        background: #3B82F6;
        color: white;
      }

      .calendar-day-names {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: 4px;
      }

      .calendar-day-name {
        text-align: center;
        font-size: 0.7rem;
        font-weight: 600;
        color: #9CA3AF;
        text-transform: uppercase;
        padding: 0.25rem 0;
      }

      .calendar-days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .calendar-day {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
        border-radius: 0.75rem;
        cursor: pointer;
        transition: all 0.15s;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      .dark .calendar-day {
        color: #D1D5DB;
      }

      .calendar-day:hover:not(.other-month) {
        background: #F3F4F6;
      }

      .dark .calendar-day:hover:not(.other-month) {
        background: #1F2937;
      }

      .calendar-today {
        background: #EFF6FF;
        color: #2563EB;
        font-weight: 700;
      }

      .dark .calendar-today {
        background: #1E3A5F;
        color: #60A5FA;
      }

      .calendar-selected {
        background: #3B82F6 !important;
        color: white !important;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }

      .dark .calendar-selected {
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
      }

      .calendar-marked {
        position: relative;
      }

      .calendar-marked::after {
        content: '';
        position: absolute;
        bottom: 4px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10B981;
      }

      .calendar-has-events .calendar-day-number {
        font-weight: 600;
      }

      .calendar-events {
        display: flex;
        gap: 2px;
        margin-top: 1px;
      }

      .calendar-event-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }

      .calendar-event-more {
        font-size: 0.55rem;
        color: #9CA3AF;
        line-height: 1;
      }

      .other-month {
        pointer-events: none;
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .calendar-day {
          font-size: 0.75rem;
          border-radius: 0.5rem;
        }
      }
    `

    document.head.appendChild(styles)
  },

  /**
   * Go to specific date
   */
  goToDate(dateStr) {
    const date = new Date(dateStr)
    this._currentMonth = date.getMonth()
    this._currentYear = date.getFullYear()
    this._selectedDate = dateStr
    this._renderCalendar()
    this._setupEvents()
  },

  /**
   * Refresh calendar
   */
  refresh(options = {}) {
    if (options.markedDates) this._markedDates = options.markedDates
    if (options.eventDates) this._eventDates = options.eventDates
    if (options.selectedDate) this._selectedDate = options.selectedDate
    if (options.onDateSelect) this._onDateSelect = options.onDateSelect
    this._renderCalendar()
    this._setupEvents()
  },
}