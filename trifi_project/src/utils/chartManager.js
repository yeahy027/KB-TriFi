// src/utils/chartManager.js
const chartInstances = []

export function registerChart(chart) {
  chartInstances.push(chart)
}

export function unregisterChart(chart) {
  const index = chartInstances.indexOf(chart)
  if (index !== -1) {
    chartInstances.splice(index, 1)
  }
}

export function resizeAllCharts() {
  chartInstances.forEach(chart => {
    if (chart && typeof chart.resize === 'function') {
      chart.resize()
    }
  })
}
