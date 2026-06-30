export const PieChart = {
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

    const defaultColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
      '#84CC16', '#D946EF', '#0EA5E9', '#E11D48', '#65A30D',
    ]

    const colors = config.colors || defaultColors

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: config.type === 'pie' ? 0 : '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 16,
            color: isDark ? '#9CA3AF' : '#6B7280',
            font: { family: 'Inter, system-ui, sans-serif', size: 11 },
            generateLabels: function(chart) {
              const data = chart.data
              return data.labels.map((label, i) => ({
                text: `${label} (${((data.datasets[0].data[i] / data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                pointStyle: 'circle',
                index: i,
              }))
            },
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
              let label = context.label || ''
              if (label) label += ': '
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              label += new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR',
                minimumFractionDigits: 0, maximumFractionDigits: 0,
              }).format(value)
              label += ` (${percentage}%)`
              return label
            },
          },
        },
      },
    }

    const chart = new Chart(ctx, {
      type: config.type === 'pie' ? 'pie' : 'doughnut',
      data: {
        labels: config.labels || [],
        datasets: [{
          data: config.data || [],
          backgroundColor: colors,
          borderColor: isDark ? '#1F2937' : '#FFFFFF',
          borderWidth: 2,
          hoverBorderWidth: 3,
        }],
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