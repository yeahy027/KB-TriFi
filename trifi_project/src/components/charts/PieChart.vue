<template>
  <div class="chart-wrapper">
    <div v-if="data.length === 0" class="empty-chart">
      <div class="empty-box">
        아직 등록된 내역이 없습니다 😢
      </div>
    </div>
    <canvas v-else ref="chartRef" width="300" height="300"></canvas>
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
  
  const renderChart = () => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  
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
  }
  
  onMounted(() => {
    if (props.data && props.data.length > 0) {
      renderChart()
    }
  })
  
  // ✅ data가 변경되면 차트 다시 렌더링
  watch(() => props.data, (newVal) => {
    if (newVal && newVal.length > 0) {
      renderChart()
    }
  }, { deep: true })
  
  onBeforeUnmount(() => {
    unregisterChart(chartInstance)
    chartInstance?.destroy()
  })
  </script>
  
  <style scoped>
  canvas {
  max-width: 95%;
  height: 100%;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 380px; /* 기존보다 크게 */
  padding: 24px;
  position: relative;
}

.empty-chart {
  width: 100%;
  height: 100%;
}

.empty-box {
  width: 100%;
  height: 100%;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #777;
  font-size: 1.1rem;
  font-weight: 500;
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  margin-left: -20px;
}


  </style>
  
  