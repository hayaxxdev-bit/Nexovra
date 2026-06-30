export const LineChart = {
  _instances: new Map(),

  render(canvasId, config = {}) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      console.error(`Canvas #${canvasId} not found`)
      return null
    }

    this.destroy(canvasId)

    const ctx = canvas.getContext('2d')
    const isDark = document.documentElement.classList.contains('dark')

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            color: isDark ? '#9CA3AF' : '#6B7280',
            font: { family: 'Inter, system-ui, sans-serif', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          titleColor: isDark ? '#F9FAFB' : '#111827',
          bodyColor: isDark ? '#D1D5DB' : '#4B5563',
          borderColor: isDark ? '#374151' : '#E5E7EB',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) label += ': '
              label += new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR',
                minimumFractionDigits: 0, maximumFractionDigits: 0,
              }).format(context.parsed.y)
              return label
            }
          }
        },
      },
      scales: {
        x: {
          grid: { color: isDark ? '#1F2937' : '#F3F4F6', drawBorder: false },
          ticks: { color: isDark ? '#9CA3AF' : '#6B7280', font: { family: 'Inter, system-ui, sans-serif', size: 11 } },
        },
        y: {
          grid: { color: isDark ? '#1F2937' : '#F3F4F6', drawBorder: false },
          ticks: {
            color: isDark ? '#9CA3AF' : '#6B7280',
            font: { family: 'Inter, system-ui, sans-serif', size: 11 },
            callback: function(value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
              if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
              return value
            },
          },
        },
      },
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: config.labels || [],
        datasets: (config.datasets || []).map(ds => ({
          ...ds,
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        })),
      },
      options: { ...defaultOptions, ...config.options },
    })

    this._instances.set(canvasId, chart)
    return chart
  },

  destroy(canvasId) {
    const instance = this._instances.get(canvasId)
    if (instance) {
      instance.destroy()
      this._instances.delete(canvasId)
    }
  },

  destroyAll() {
    this._instances.forEach((instance) => instance.destroy())
    this._instances.clear()
  },

  get(canvasId) {
    return this._instances.get(canvasId) || null
  },
}