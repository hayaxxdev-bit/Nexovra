/**
 * Line Chart Component - Nexovra Next-Gen Finance
 * Wrapper around Chart.js Line Chart
 */
export const LineChart = {
  _instances: new Map(),

  /**
   * Render line chart
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
        duration: 1200,
        easing: 'easeInOutQuart',
      },
      interaction: { 
        intersect: false, 
        mode: 'index' 
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyleWidth: 18,
            pointStyleHeight: 10,
            padding: 24,
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
          beginAtZero: true,
        },
      },
    }

    // Prepare datasets with Nexovra styling
    const styledDatasets = (config.datasets || []).map((ds, index) => ({
      ...ds,
      tension: ds.tension !== undefined ? ds.tension : 0.4,
      fill: ds.fill !== undefined ? ds.fill : false,
      pointRadius: ds.pointRadius !== undefined ? ds.pointRadius : 4,
      pointHoverRadius: ds.pointHoverRadius !== undefined ? ds.pointHoverRadius : 8,
      pointBackgroundColor: ds.pointBackgroundColor || (ds.borderColor || this._getDefaultColor(index, isDark)),
      pointBorderColor: ds.pointBorderColor || '#FFFFFF',
      pointBorderWidth: ds.pointBorderWidth !== undefined ? ds.pointBorderWidth : 2,
      pointHoverBorderWidth: 3,
      pointHoverBorderColor: '#FFFFFF',
      borderWidth: ds.borderWidth !== undefined ? ds.borderWidth : 2.5,
      borderColor: ds.borderColor || this._getDefaultColor(index, isDark),
      backgroundColor: ds.backgroundColor || this._getFillColor(ds.borderColor || this._getDefaultColor(index, isDark)),
      hoverBorderWidth: 3,
      hoverBorderColor: ds.borderColor || this._getDefaultColor(index, isDark),
    }))

    const chart = new Chart(ctx, {
      type: 'line',
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
    this._instances.forEach((chart) => {
      const isDark = document.documentElement.classList.contains('dark')
      
      // Update grid colors
      if (chart.options.scales?.x?.grid) {
        chart.options.scales.x.grid.color = isDark 
          ? 'rgba(75, 85, 99, 0.2)' 
          : 'rgba(229, 231, 235, 0.8)'
      }
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
      
      // Update dataset point colors
      chart.data.datasets.forEach((dataset) => {
        if (!dataset._originalBorderColor) {
          dataset._originalBorderColor = dataset.borderColor
        }
        dataset.pointBorderColor = '#FFFFFF'
      })
      
      chart.update('none')
    })
  },

  /**
   * Get default color based on index
   */
  _getDefaultColor(index, isDark) {
    const colors = isDark ? [
      '#a855f7',  // Purple-500
      '#14b8a6',  // Teal-500
      '#6366f1',  // Indigo-500
      '#f59e0b',  // Amber-500
      '#ef4444',  // Red-500
      '#22d3ee',  // Cyan-400
    ] : [
      '#9333ea',  // Purple-600
      '#0d9488',  // Teal-600
      '#4f46e5',  // Indigo-600
      '#d97706',  // Amber-600
      '#dc2626',  // Red-600
      '#06b6d4',  // Cyan-500
    ]
    return colors[index % colors.length]
  },

  /**
   * Get fill color (with opacity)
   */
  _getFillColor(borderColor) {
    // Convert hex to rgba with 0.1 opacity
    if (borderColor.startsWith('#')) {
      const hex = borderColor.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, 0.1)`
    }
    // If already rgba, reduce opacity
    if (borderColor.startsWith('rgba')) {
      return borderColor.replace(/[\d.]+\)$/, '0.1)')
    }
    return borderColor
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