/**
 * Bar Chart Component - Nexovra Next-Gen Finance
 * Wrapper around Chart.js Bar Chart
 */
export const BarChart = {
  _instances: new Map(),

  /**
   * Render bar chart
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

    // Next-Gen Chart Defaults
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyleWidth: 8,
            pointStyleHeight: 8,
            padding: 20,
            color: isDark ? '#9CA3AF' : '#6B7280',
            font: { 
              family: 'Inter, system-ui, sans-serif', 
              size: 12,
              weight: '500'
            },
            useBorderRadius: true,
            borderRadius: 4,
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
              let label = context.dataset.label || ''
              if (label) label += ': '
              label += new Intl.NumberFormat('id-ID', {
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0,
              }).format(context.parsed.y)
              return label
            }
          }
        },
      },
      scales: {
        x: {
          grid: { 
            display: false 
          },
          ticks: { 
            color: isDark ? '#6B7280' : '#9CA3AF', 
            font: { 
              family: 'Inter, system-ui, sans-serif', 
              size: 11,
              weight: '500'
            },
            padding: 8,
          },
          border: {
            display: true,
            color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)',
          }
        },
        y: {
          grid: { 
            color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
            drawBorder: false,
            lineWidth: 1,
          },
          ticks: {
            color: isDark ? '#6B7280' : '#9CA3AF',
            font: { 
              family: 'Inter, system-ui, sans-serif', 
              size: 11,
              weight: '500'
            },
            padding: 12,
            callback: function(value) {
              if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'M'
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'JT'
              if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
              return value
            },
          },
          border: {
            display: false,
          },
          beginAtZero: true,
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    }

    // Prepare datasets with Nexovra styling
    const styledDatasets = (config.datasets || []).map((ds, index) => ({
      ...ds,
      borderRadius: {
        topLeft: 10,
        topRight: 10,
        bottomLeft: 0,
        bottomRight: 0,
      },
      borderSkipped: false,
      maxBarThickness: 52,
      minBarLength: 4,
      borderWidth: 0,
      borderColor: 'transparent',
      backgroundColor: ds.backgroundColor || this._getDefaultColor(index, isDark),
      hoverBackgroundColor: ds.hoverBackgroundColor || this._getHoverColor(ds.backgroundColor || this._getDefaultColor(index, isDark)),
    }))

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: config.labels || [],
        datasets: styledDatasets,
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
    this._instances.forEach((chart, canvasId) => {
      const isDark = document.documentElement.classList.contains('dark')
      
      // Update grid colors
      if (chart.options.scales?.y?.grid) {
        chart.options.scales.y.grid.color = isDark 
          ? 'rgba(75, 85, 99, 0.2)' 
          : 'rgba(229, 231, 235, 0.8)'
      }
      
      // Update tick colors
      if (chart.options.scales?.x?.ticks) {
        chart.options.scales.x.ticks.color = isDark ? '#6B7280' : '#9CA3AF'
      }
      if (chart.options.scales?.y?.ticks) {
        chart.options.scales.y.ticks.color = isDark ? '#6B7280' : '#9CA3AF'
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
   * Get default color based on index
   */
  _getDefaultColor(index, isDark) {
    const colors = isDark ? [
      'rgba(168, 85, 247, 0.8)',   // Purple
      'rgba(20, 184, 166, 0.8)',   // Teal
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(34, 211, 238, 0.8)',   // Cyan
    ] : [
      'rgba(168, 85, 247, 0.7)',   // Purple
      'rgba(20, 184, 166, 0.7)',   // Teal
      'rgba(99, 102, 241, 0.7)',   // Indigo
      'rgba(245, 158, 11, 0.7)',   // Amber
      'rgba(239, 68, 68, 0.7)',    // Red
      'rgba(34, 211, 238, 0.7)',   // Cyan
    ]
    return colors[index % colors.length]
  },

  /**
   * Get hover color
   */
  _getHoverColor(baseColor) {
    return baseColor.replace(/[\d.]+\)$/, '1)')
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