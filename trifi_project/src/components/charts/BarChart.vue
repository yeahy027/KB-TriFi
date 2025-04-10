<template>
  <div class="chart-wrapper">
    <!-- 데이터 없을 때만 보여줄 안내 박스 -->
    <div
      v-if="!hasData"
      class="empty-box"
    >
      <p class="text-muted">아직 등록된 내역이 없습니다 😢</p>
    </div>


    <!-- 항상 존재하는 canvas (단, 데이터 없으면 차트는 그리지 않음) -->
    <canvas ref="chartRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
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

const hasData = computed(() => props.data.length > 0)

const createChart = () => {
  if (!chartRef.value || !hasData.value) return

  const ctx = chartRef.value.getContext('2d')
  const labels = props.data.map(item => item.name)
  const data = props.data.map(item => item.amount)

  const colors = ['#2A4185', '#4CAF50', '#9C27B0']

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '지출 금액 (원)',
        data: data,
        backgroundColor: colors.slice(0, data.length),
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
  if (hasData.value) {
    createChart()
  }
})

watch(() => props.data, async (newData) => {
  if (chartInstance) {
    unregisterChart(chartInstance)
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()

  if (hasData.value) {
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
  height: 100%;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 380px;
  padding: 24px;
  position: relative;
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

</style>
