/**
 * Pie / Doughnut Chart Component - Nexovra Next-Gen Finance
 * Wrapper around Chart.js Pie & Doughnut Chart
 */
export const PieChart = {
  _instances: new Map(),

  /**
   * Render pie/doughnut chart
   * @param {string} canvasId - Canvas element ID
   * @param {Object} config - Chart configuration
   * @returns {Chart|null}
   */
  render(canvasId, config = {}) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      console.error(`Canvas #${canvasId} not found`)
      return null
    }

    // Destroy existing instance
    this.destroy(canvasId)

    const ctx = canvas.getContext('2d')
    const isDark = document.documentElement.classList.contains('dark')

    // Nexovra Next-Gen Color Palette
    const defaultColors = [
      '#a855f7', // Purple-500
      '#14b8a6', // Teal-500
      '#6366f1', // Indigo-500
      '#f59e0b', // Amber-500
      '#ef4444', // Red-500
      '#22d3ee', // Cyan-400
      '#ec4899', // Pink-500
      '#10b981', // Emerald-500
      '#8b5cf6', // Violet-500
      '#f97316', // Orange-500
      '#06b6d4', // Cyan-500
      '#84cc16', // Lime-500
      '#d946ef', // Fuchsia-500
      '#0ea5e9', // Sky-500
      '#e11d48', // Rose-600
    ]

    const colors = config.colors || defaultColors
    const isDoughnut = config.type !== 'pie'

    // Next-Gen Chart Defaults
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: isDoughnut ? '65%' : 0,
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1000,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            usePointStyle: true,
            pointStyleWidth: 12,
            pointStyleHeight: 12,
            padding: 20,
            color: isDark ? '#9CA3AF' : '#6B7280',
            font: { 
              family: 'Inter, system-ui, sans-serif', 
              size: 11,
              weight: '500'
            },
            useBorderRadius: true,
            borderRadius: 3,
            generateLabels: function(chart) {
              const data = chart.data
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0]
                const total = dataset.data.reduce((a, b) => a + b, 0)
                
                return data.labels.map((label, i) => {
                  const value = dataset.data[i]
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                  
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.backgroundColor[i],
                    pointStyle: 'circle',
                    index: i,
                    hidden: false,
                  }
                })
              }
              return []
            },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#12121a' : '#FFFFFF',
          titleColor: isDark ? '#F9FAFB' : '#111827',
          bodyColor: isDark ? '#D1D5DB' : '#4B5563',
          borderColor: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 16,
          displayColors: true,
          boxPadding: 4,
          titleFont: {
            family: 'Inter, system-ui, sans-serif',
            size: 13,
            weight: '600'
          },
          bodyFont: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500'
          },
          callbacks: {
            label: function(context) {
              let label = context.label || ''
              if (label) label += ': '
              
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              
              label += new Intl.NumberFormat('id-ID', {
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0,
              }).format(value)
              
              label += ` (${percentage}%)`
              return label
            },
          },
        },
      },
      // Center text for doughnut
      ...(isDoughnut && {
        elements: {
          center: {
            text: '',
            color: isDark ? '#9CA3AF' : '#6B7280',
            fontStyle: 'Inter, system-ui, sans-serif',
          }
        }
      }),
    }

    const chart = new Chart(ctx, {
      type: isDoughnut ? 'doughnut' : 'pie',
      data: {
        labels: config.labels || [],
        datasets: [{
          data: config.data || [],
          backgroundColor: colors,
          borderColor: isDark ? 'rgba(18, 18, 26, 0.8)' : '#FFFFFF',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverBorderColor: isDark ? 'rgba(18, 18, 26, 1)' : '#FFFFFF',
          borderRadius: 4,
          spacing: 4,
          hoverOffset: 8,
        }],
      },
      options: this._deepMerge(defaultOptions, config.options || {}),
    })

    this._instances.set(canvasId, chart)
    return chart
  },

  /**
   * Destroy chart instance
   * @param {string} canvasId
   */
  destroy(canvasId) {
    const instance = this._instances.get(canvasId)
    if (instance) {
      instance.destroy()
      this._instances.delete(canvasId)
    }
  },

  /**
   * Destroy all chart instances
   */
  destroyAll() {
    this._instances.forEach((instance) => instance.destroy())
    this._instances.clear()
  },

  /**
   * Get chart instance
   * @param {string} canvasId
   * @returns {Chart|null}
   */
  get(canvasId) {
    return this._instances.get(canvasId) || null
  },

  /**
   * Update chart theme (call when theme changes)
   */
  updateTheme() {
    this._instances.forEach((chart) => {
      const isDark = document.documentElement.classList.contains('dark')
      
      // Update border color
      if (chart.data.datasets[0]) {
        chart.data.datasets[0].borderColor = isDark 
          ? 'rgba(18, 18, 26, 0.8)' 
          : '#FFFFFF'
        chart.data.datasets[0].hoverBorderColor = isDark 
          ? 'rgba(18, 18, 26, 1)' 
          : '#FFFFFF'
      }
      
      // Update legend colors
      if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = isDark ? '#9CA3AF' : '#6B7280'
      }
      
      // Update tooltip
      if (chart.options.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = isDark ? '#12121a' : '#FFFFFF'
        chart.options.plugins.tooltip.titleColor = isDark ? '#F9FAFB' : '#111827'
        chart.options.plugins.tooltip.bodyColor = isDark ? '#D1D5DB' : '#4B5563'
        chart.options.plugins.tooltip.borderColor = isDark 
          ? 'rgba(168, 85, 247, 0.2)' 
          : 'rgba(168, 85, 247, 0.1)'
      }
      
      chart.update('none')
    })
  },

  /**
   * Add center text to doughnut chart
   * @param {string} canvasId
   * @param {Object} textConfig - { title, subtitle, color }
   */
  addCenterText(canvasId, textConfig = {}) {
    const chart = this.get(canvasId)
    if (!chart) return

    const {
      title = '',
      subtitle = '',
      color = '#9CA3AF',
    } = textConfig

    const originalDraw = chart.draw
    chart.draw = function() {
      originalDraw.apply(this, arguments)
      
      if (chart.config.type === 'doughnut') {
        const ctx = chart.ctx
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2

        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Title
        if (title) {
          ctx.font = 'bold 16px Inter, system-ui, sans-serif'
          ctx.fillStyle = color
          ctx.fillText(title, centerX, centerY - 8)
        }

        // Subtitle
        if (subtitle) {
          ctx.font = '12px Inter, system-ui, sans-serif'
          ctx.fillStyle = color
          ctx.globalAlpha = 0.7
          ctx.fillText(subtitle, centerX, centerY + 12)
        }

        ctx.restore()
      }
    }

    chart.update()
  },

  /**
   * Get default color based on index
   */
  _getDefaultColor(index) {
    const colors = [
      '#a855f7', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444',
      '#22d3ee', '#ec4899', '#10b981', '#8b5cf6', '#f97316',
    ]
    return colors[index % colors.length]
  },

  /**
   * Deep merge objects
   */
  _deepMerge(target, source) {
    const output = { ...target }
    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this._isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key]
          } else {
            output[key] = this._deepMerge(target[key], source[key])
          }
        } else {
          output[key] = source[key]
        }
      })
    }
    return output
  },

  /**
   * Check if value is object
   */
  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
  },
}