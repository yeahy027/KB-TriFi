<!-- src/components/charts/CompareChart.vue -->
<template>
    <div>
      <canvas ref="chartRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Chart, registerables } from 'chart.js'
  
  Chart.register(...registerables)
  
  const props = defineProps({
    data: {
      type: Array,
      required: true,
    },
  })
  
  const chartRef = ref(null)
  
  onMounted(() => {
    const ctx = chartRef.value.getContext('2d')
  
    new Chart(ctx, {
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
  })
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
  }
  </style>
  