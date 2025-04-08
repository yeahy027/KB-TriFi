<template>
    <div>
      <canvas ref="chartRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { Chart, registerables } from 'chart.js'
  import { registerChart, unregisterChart } from '@/utils/chartManager'
  
  Chart.register(...registerables)
  
  const props = defineProps({
    data: {
      type: Array,
      required: true,
    },
  })
  
  const chartRef = ref(null)
  let chartInstance = null
  
  onMounted(() => {
    const ctx = chartRef.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: props.data.map(item => item.name),
        datasets: [{
          label: '지출',
          data: props.data.map(item => item.value),
          borderColor: '#2A4185',
          backgroundColor: '#E8FD94',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
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
    unregisterChart(chartInstance)
    chartInstance.destroy()
  })
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
  }
  </style>
  