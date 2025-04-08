<!-- src/components/charts/BarChart.vue -->
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
      type: 'bar',
      data: {
        labels: props.data.map(item => item.name),
        datasets: [{
          label: '지출 금액 (원)',
          data: props.data.map(item => item.amount),
          backgroundColor: '#2A4185',
          borderRadius: 8,
          barThickness: 30,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: {
              callback: value => `${value.toLocaleString()} 원`,
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
  