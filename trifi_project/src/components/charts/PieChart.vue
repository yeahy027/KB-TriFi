<!-- src/components/charts/PieChart.vue -->
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
  })
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
  }
  </style>
  