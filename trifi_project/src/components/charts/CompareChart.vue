<template>
    <div class="chart-container">
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
          backgroundColor: 'rgba(232, 253, 148, 0.4)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#2A4185',
          pointBorderColor: '#fff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#2A4185',
              font: {
                family: 'Pretendard, sans-serif',
                size: 14,
                weight: 'bold',
              }
            }
          },
          tooltip: {
            backgroundColor: '#2A4185',
            titleFont: { family: 'Pretendard, sans-serif', size: 14 },
            bodyFont: { family: 'Pretendard, sans-serif', size: 12 },
            callbacks: {
              label: context => `${context.parsed.y.toLocaleString()} 원`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#555',
              font: {
                family: 'Pretendard, sans-serif',
                size: 12,
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              color: '#777',
              font: {
                family: 'Pretendard, sans-serif',
                size: 12,
              },
              callback: value => `${value.toLocaleString()} 원`
            },
            grid: {
              color: '#eee'
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
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
  .chart-container {
    position: relative;
    width: 100%;
    height: 400px;
    padding: 1rem;
    background-color: #fdfdfd;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  canvas {
    max-width: 100%;
    max-height: 100%;
  }
  </style>
  