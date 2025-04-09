<template>
    <div style="max-width: 400px; margin: auto">
      <canvas ref="chartRef" width="300" height="300"></canvas>
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
      type: 'pie',
      data: {
        labels: props.data.map(item => item.name),
        datasets: [{
          data: props.data.map(item => item.value),
          backgroundColor: ['#E8FD94', '#2A4185', '#A6C1FF', '#FFD6A5'],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
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
  