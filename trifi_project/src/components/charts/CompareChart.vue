<template>
    <div v-if="chartData">
      <canvas ref="chartRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { Chart, registerables } from 'chart.js'
  import { registerChart, unregisterChart } from '@/utils/chartManager'
  import { prepareCompareChartDataFromDB } from '@/utils/stats'
  import dbData from '@/assets/db.json'  // 또는 API에서 받아온 데이터로 대체 가능
  
  Chart.register(...registerables)
  
  const chartRef = ref(null)
  let chartInstance = null
  
  // 🔥 chartData 준비
  const chartData = prepareCompareChartDataFromDB(dbData)
  
  onMounted(() => {
    if (!chartData) return
  
    const ctx = chartRef.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          y: {
            ticks: {
              callback: value => `${value.toLocaleString()} 원`
            }
          }
        }
      }
    })
  
    registerChart(chartInstance)
  })
  
  onBeforeUnmount(() => {
    if (chartInstance) {
      unregisterChart(chartInstance)
      chartInstance.destroy()
    }
  })
  </script>
  
  <style scoped>
  canvas {
    max-width: 95%;
  }
  </style>
  