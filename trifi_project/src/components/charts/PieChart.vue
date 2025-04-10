<template>
  <div class="w-full h-full relative">
    <!-- 데이터 없을 때만 보여줄 안내 박스 -->
    <div
      v-if="!hasData"
      class="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 z-10 bg-white"
    >
      <p class="text-lg font-medium">아직 등록된 내역이 없습니다</p>
    </div>

    <!-- 항상 렌더되지만, 데이터 없으면 차트는 안 그림 -->
    <canvas ref="chartRef" class="w-full h-full" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

// 데이터 유무 체크
const hasData = computed(() => {
  return props.data && props.data.length > 0
})

function renderChart() {
  if (!chartRef.value || !hasData.value) return

  const ctx = chartRef.value.getContext('2d')

  // 기존 차트가 있다면 파괴
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: props.data.map(item => item.name),
      datasets: [{
        label: '지출',
        data: props.data.map(item => item.value),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56',
          '#8AFFC1', '#FFD08A', '#A58AFF'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#333',
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: context => {
              const value = context.parsed
              return `${context.label}: ${value.toLocaleString()}원`
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  if (hasData.value) {
    renderChart()
  }
})

watch(() => props.data, async () => {
  await nextTick()
  if (hasData.value) {
    renderChart()
  } else if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
div {
  position: relative;
  width: 100%;
  height: 400px;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>
