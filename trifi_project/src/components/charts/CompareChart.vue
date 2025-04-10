<template>
    <div v-if="shouldRenderChart">
      <canvas ref="chartRef"></canvas>
    </div>
    <div v-else class="empty-box">
      <p class="text-muted">아직 등록된 내역이 없습니다 😢</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watchEffect, onBeforeUnmount, nextTick } from 'vue'
  import { Chart, registerables } from 'chart.js'
  import { registerChart, unregisterChart } from '@/utils/chartManager'
  
  Chart.register(...registerables)
  
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  })
  
  const chartRef = ref(null)
  let chartInstance = null
  
  const hasValidLabels = computed(() =>
    Array.isArray(props.data.labels) && props.data.labels.length > 0
  )
  
  const hasValidDatasets = computed(() =>
    Array.isArray(props.data.datasets) && props.data.datasets.length > 0
  )
  
  const isAllZero = computed(() =>
    props.data.datasets.every(ds =>
      Array.isArray(ds.data) && ds.data.every(value => value === 0)
    )
  )
  
  const shouldRenderChart = computed(() =>
    props.data && hasValidLabels.value && hasValidDatasets.value && !isAllZero.value
  )
  
  const renderChart = () => {
    if (!shouldRenderChart.value || !chartRef.value) return
  
    const ctx = chartRef.value.getContext('2d')
  
    if (chartInstance) {
      unregisterChart(chartInstance)
      chartInstance.destroy()
    }
  
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: props.data.labels,
        datasets: props.data.datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
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
  }
  
  watchEffect(async () => {
    if (shouldRenderChart.value) {
      await nextTick()
      renderChart()
    }
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
  
  .empty-box {
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #ccc;
    border-radius: 0.5rem;
    background-color: #f9f9f9;
    color: #888;
    font-weight: 500;
  }
  </style>
  