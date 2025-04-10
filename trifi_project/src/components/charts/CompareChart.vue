<template>
    <div v-if="hasValidData">
      <canvas ref="chartRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, watchEffect, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
  import { Chart, registerables } from 'chart.js'
  import { registerChart, unregisterChart } from '@/utils/chartManager'
  
  // Chart.js 전역 등록
  Chart.register(...registerables)
  
  // props 정의
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  })
  
  // chart ref 및 인스턴스
  const chartRef = ref(null)
  let chartInstance = null
  
  // 데이터가 유효한지 검사
  const hasValidData = computed(() => {
    return (
      props.data &&
      Array.isArray(props.data.labels) && props.data.labels.length > 0 &&
      Array.isArray(props.data.datasets) && props.data.datasets.length > 0
    )
  })
  
  // chart 생성 함수
  const renderChart = () => {
    if (!hasValidData.value || !chartRef.value) return
  
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
  
  // ❗️ 데이터가 변할 때마다 차트를 다시 그리는 반응형 watchEffect
  watchEffect(async () => {
    if (hasValidData.value) {
      await nextTick()  // DOM이 준비된 후 실행 보장
      renderChart()
    }
  })
  
  // 컴포넌트가 사라질 때 정리
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
  