import { Calendar } from '@components/ui/calendar.js'
import { Toast } from '@components/ui/toast.js'
import { Skeleton } from '@components/ui/skeleton.js'
import { supabase } from '@services/supabase.js'
import { formatDate } from '@core/utils.js'

/**
 * Daily Planner Page - Calendar + Agenda + Mood + Target
 */
export async function render(container, params = {}) {
  const today = new Date().toISOString().split('T')[0]

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Planner</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Rencanakan hari Anda dengan lebih baik</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar Section -->
        <div class="lg:col-span-1">
          <div class="card p-5">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">📅 Kalender</h3>
            <div id="planner-calendar">
              ${Skeleton.card()}
            </div>
            
            <!-- Mood Tracker -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mood Hari Ini</h4>
              <div class="flex flex-wrap gap-2" id="mood-selector">
                ${renderMoodButtons()}
              </div>
            </div>
          </div>
        </div>

        <!-- Agenda Section -->
        <div class="lg:col-span-2">
          <!-- Target -->
          <div class="card p-5 mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">🎯 Target Hari Ini</h3>
            <textarea 
              id="planner-target" 
              class="input min-h-[80px]" 
              placeholder="Apa target utama Anda hari ini? Tulis di sini..."
              rows="2"
            ></textarea>
          </div>

          <!-- Agenda -->
          <div class="card p-5 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">📋 Agenda</h3>
              <button id="add-agenda-btn" class="btn btn-primary btn-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah
              </button>
            </div>
            <div id="agenda-list" class="space-y-3">
              <p class="text-gray-400 dark:text-gray-500 text-sm text-center py-8">Belum ada agenda</p>
            </div>
          </div>

          <!-- Notes -->
          <div class="card p-5">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">📝 Catatan</h3>
            <textarea 
              id="planner-notes" 
              class="input min-h-[120px]" 
              placeholder="Catatan tambahan untuk hari ini..."
              rows="4"
            ></textarea>
          </div>

          <!-- Save Button -->
          <button id="save-planner" class="btn btn-primary w-full mt-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Planner
          </button>
        </div>
      </div>
    </div>
  `

  // Load data for today
  await loadPlannerData(container, today)

  // Initialize calendar
  initCalendar(container, today)

  // Setup events
  setupPlannerEvents(container)
}

function renderMoodButtons() {
  const moods = [
    { value: 'happy', emoji: '😊', label: 'Senang' },
    { value: 'excited', emoji: '🤩', label: 'Semangat' },
    { value: 'productive', emoji: '💪', label: 'Produktif' },
    { value: 'neutral', emoji: '😐', label: 'Biasa' },
    { value: 'stressed', emoji: '😫', label: 'Stress' },
    { value: 'sad', emoji: '😢', label: 'Sedih' },
  ]

  return moods.map(m => `
    <button 
      class="mood-btn px-3 py-2 rounded-xl text-sm font-medium border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
      data-mood="${m.value}"
      title="${m.label}"
    >
      ${m.emoji} ${m.label}
    </button>
  `).join('')
}

function initCalendar(container, selectedDate) {
  const calendarContainer = container.querySelector('#planner-calendar')
  if (!calendarContainer) return

  Calendar.render(calendarContainer, {
    selectedDate,
    onDateSelect: (date) => {
      loadPlannerData(container, date)
    },
  })
}

async function loadPlannerData(container, date) {
  const targetInput = container.querySelector('#planner-target')
  const notesInput = container.querySelector('#planner-notes')
  const agendaList = container.querySelector('#agenda-list')

  // Show skeleton
  if (targetInput) targetInput.disabled = true
  if (notesInput) notesInput.disabled = true
  if (agendaList) agendaList.innerHTML = Skeleton.list(3)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load daily notes
    const { data: dailyNote } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('note_date', date)
      .maybeSingle()

    if (targetInput) {
      targetInput.value = dailyNote?.target || ''
      targetInput.disabled = false
    }

    if (notesInput) {
      notesInput.value = dailyNote?.notes || ''
      notesInput.disabled = false
    }

    // Load mood
    if (dailyNote?.priority) {
      container.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-950')
      })
      // Note: mood disimpan di priority untuk sementara
      // Bisa disesuaikan nanti
    }

    // Load todos as agenda
    const { data: todos } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('todo_date', date)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    renderAgendaList(agendaList, todos || [])

    // Update calendar selected date
    if (container.querySelector('#planner-calendar')) {
      Calendar.goToDate(date)
    }

    // Update title
    const dateObj = new Date(date)
    const today = new Date()
    const isToday = date === today.toISOString().split('T')[0]
    
    const dateDisplay = isToday 
      ? 'Hari Ini' 
      : formatDate(date, 'full')

    // Store current date
    container.dataset.currentDate = date

  } catch (error) {
    console.error('Failed to load planner data:', error)
    Toast.error('Gagal memuat data planner')
  }
}

function renderAgendaList(container, todos) {
  if (!container) return

  if (!todos || todos.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <div class="text-4xl mb-3">📋</div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Belum ada agenda</p>
        <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Klik "Tambah" untuk menambahkan agenda</p>
      </div>
    `
    return
  }

  container.innerHTML = todos.map((todo, i) => {
    const priorityColors = {
      urgent: 'border-red-500 bg-red-50 dark:bg-red-950',
      high: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
      medium: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
      low: 'border-gray-300 bg-gray-50 dark:bg-gray-800',
    }

    const statusIcons = {
      completed: '✅',
      in_progress: '🔄',
      pending: '⏳',
      cancelled: '❌',
    }

    return `
      <div class="flex items-start gap-3 p-3 rounded-xl border-l-4 ${priorityColors[todo.priority] || priorityColors.medium} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-sm group">
        <!-- Checkbox -->
        <button 
          class="todo-checkbox mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all ${todo.status === 'completed' ? 'bg-green-500 border-green-500' : 'hover:border-primary-500'}"
          data-id="${todo.id}"
          data-status="${todo.status}"
        >
          ${todo.status === 'completed' ? `
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          ` : ''}
        </button>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm ${todo.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}">
              ${todo.title}
            </span>
            <span class="text-xs">${statusIcons[todo.status] || ''}</span>
            ${todo.priority === 'urgent' ? '<span class="badge badge-danger text-[10px]">Penting</span>' : ''}
          </div>
          ${todo.description ? `
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">${todo.description}</p>
          ` : ''}
          ${todo.due_time ? `
            <p class="text-xs text-gray-400 mt-1">⏰ ${todo.due_time}</p>
          ` : ''}
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="edit-todo-btn btn btn-ghost btn-sm p-1" data-id="${todo.id}" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="delete-todo-btn btn btn-ghost btn-sm p-1 text-red-500" data-id="${todo.id}" title="Hapus">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `
  }).join('')
}

function setupPlannerEvents(container) {
  // Mood buttons
  container.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.mood-btn').forEach(b => {
        b.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-950')
      })
      btn.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-950')
    })
  })

  // Add agenda
  container.querySelector('#add-agenda-btn')?.addEventListener('click', () => {
    showAgendaForm(container)
  })

  // Save planner
  container.querySelector('#save-planner')?.addEventListener('click', () => {
    savePlanner(container)
  })

  // Todo checkbox (delegated)
  container.querySelector('#agenda-list')?.addEventListener('click', async (e) => {
    const checkbox = e.target.closest('.todo-checkbox')
    if (!checkbox) return

    const todoId = checkbox.dataset.id
    const currentStatus = checkbox.dataset.status
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'

    try {
      await supabase.from('todos').update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      }).eq('id', todoId)

      Toast.success(newStatus === 'completed' ? 'Selesai! 🎉' : 'Dibatalkan')
      
      // Reload
      const date = container.dataset.currentDate || new Date().toISOString().split('T')[0]
      loadPlannerData(container, date)
    } catch (error) {
      Toast.error('Gagal update status')
    }
  })

  // Delete todo (delegated)
  container.querySelector('#agenda-list')?.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-todo-btn')
    if (!deleteBtn) return

    const { ConfirmDialog } = await import('@components/ui/confirm-dialog.js')
    const confirmed = await ConfirmDialog.delete('agenda ini')
    if (!confirmed) return

    try {
      await supabase.from('todos').delete().eq('id', deleteBtn.dataset.id)
      Toast.success('Agenda dihapus')
      const date = container.dataset.currentDate || new Date().toISOString().split('T')[0]
      loadPlannerData(container, date)
    } catch (error) {
      Toast.error('Gagal menghapus agenda')
    }
  })
}

async function savePlanner(container) {
  const btn = container.querySelector('#save-planner')
  const date = container.dataset.currentDate || new Date().toISOString().split('T')[0]
  const target = container.querySelector('#planner-target')?.value?.trim() || ''
  const notes = container.querySelector('#planner-notes')?.value?.trim() || ''
  
  // Get selected mood
  const moodBtn = container.querySelector('.mood-btn.border-primary-500')
  const mood = moodBtn?.dataset?.mood || 'neutral'

  console.log('Saving planner:', { date, target, notes, mood, priority: 'medium' })

  btn.disabled = true
  btn.innerHTML = 'Menyimpan...'

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // PASTIKAN data sesuai
    const payload = {
      user_id: user.id,
      note_date: date,
      target: target,
      notes: notes,
      mood: mood,           // ⬅️ mood ke kolom mood
      priority: 'medium',   // ⬅️ priority tetap medium
      updated_at: new Date().toISOString(),
    }

    console.log('Payload:', payload)

    const { error } = await supabase
      .from('daily_notes')
      .upsert(payload, {
        onConflict: 'user_id, note_date'
      })

    if (error) {
      console.error('Upsert error:', error)
      throw error
    }

    Toast.success('Planner berhasil disimpan! 📝')
  } catch (error) {
    console.error('Save planner error:', error)
    Toast.error('Gagal menyimpan: ' + error.message)
  } finally {
    btn.disabled = false
    btn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Simpan Planner
    `
  }
}

async function showAgendaForm(container) {
  const { Modal } = await import('@components/ui/modal.js')
  const date = container.dataset.currentDate || new Date().toISOString().split('T')[0]

  Modal.show({
    title: 'Tambah Agenda',
    size: 'md',
    confirmText: 'Simpan',
    content: `
      <form id="agenda-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Judul Agenda <span class="text-red-500">*</span>
          </label>
          <input type="text" id="agenda-title" class="input" placeholder="Apa yang harus dilakukan?" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi</label>
          <textarea id="agenda-desc" class="input min-h-[60px]" rows="2" placeholder="Deskripsi opsional..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prioritas</label>
            <select id="agenda-priority" class="input">
              <option value="low">Rendah</option>
              <option value="medium" selected>Sedang</option>
              <option value="high">Tinggi</option>
              <option value="urgent">Penting!</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jam</label>
            <input type="time" id="agenda-time" class="input" />
          </div>
        </div>
      </form>
    `,
    onConfirm: async () => {
      const title = document.querySelector('#agenda-title')?.value?.trim()
      const description = document.querySelector('#agenda-desc')?.value?.trim()
      const priority = document.querySelector('#agenda-priority')?.value
      const dueTime = document.querySelector('#agenda-time')?.value

      if (!title) {
        Toast.warning('Judul agenda wajib diisi')
        throw new Error('Validation failed')
      }

      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('todos').insert({
        user_id: user.id,
        title,
        description,
        priority,
        due_time: dueTime || null,
        todo_date: date,
        status: 'pending',
      })

      Toast.success('Agenda berhasil ditambahkan!')
      loadPlannerData(container, date)
    },
  })
}