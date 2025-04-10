<template>
    <div>
      <canvas ref="chartRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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
  
  const createChart = () => {
    const ctx = chartRef.value.getContext('2d')
  
    const labels = props.data.map(item => item.name)
    const data = props.data.map(item => item.amount)
  
    // 항목 개수에 맞춰 색상 배열 준비 (3가지 예시 색상)
    const colors = ['#2A4185', '#4CAF50', '#9C27B0'] // 파랑, 초록, 보라
  
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '지출 금액 (원)',
          data: data,
          backgroundColor: colors.slice(0, data.length), // 항목 수에 맞게 색상 제한
          borderRadius: 8,
          barThickness: 30,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.raw.toLocaleString()} 원`,
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            min: 0,
            ticks: {
              precision: 0,
              callback: value => `${value.toLocaleString()} 원`,
            },
            title: {
              display: true,
              text: '금액 (원)',
              font: {
                size: 14,
                weight: 'bold',
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 14,
              }
            }
          }
        }
      }
    })
  
    registerChart(chartInstance)
  }
  
  onMounted(() => {
    if (chartRef.value && props.data.length > 0) {
      createChart()
    }
  })
  
  watch(() => props.data, (newData) => {
    if (chartInstance) {
      chartInstance.destroy()
      unregisterChart(chartInstance)
    }
    if (chartRef.value && newData.length > 0) {
      createChart()
    }
  }, { deep: true })
  
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
    height: 300px;
  }
  </style>
  