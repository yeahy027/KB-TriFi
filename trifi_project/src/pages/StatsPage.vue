<!-- KB-TriFi/trifi_project/src/pages/StatsPage.vue -->
<template>
  <AppLayout>
    <template #default>
      <!-- ✅ 제목과 버튼을 같은 줄에 -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 class="fw-bold m-0">📊 지출 분석 통계</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary rounded-2 btn-sm fw-semibold shadow-sm" @click="exportAsImage">
            🖼 이미지로 저장
          </button>
          <button class="btn btn-outline-secondary rounded-2 btn-sm fw-semibold shadow-sm" @click="exportAsPDF">
            📄 PDF로 저장
          </button>
        </div>
      </div>

      <!-- ✅ 전체 차트 영역 -->
      <div id="chart-container">
        <div class="row">
          <!-- ✅ 왼쪽: 원형 차트 -->
          <div class="col-md-6 mb-4">
            <h5 class="mb-2">카테고리별 지출 비율</h5>
            <p class="text-muted">지출을 항목별로 분류한 비율을 보여줍니다.</p>
            <PieChart :data="pieData" />
          </div>

          <!-- ✅ 오른쪽: 상위 지출 -->
          <div class="col-md-6 mb-4">
            <h5 class="mb-2">상위 3개 지출 항목</h5>
            <p class="text-muted">가장 많은 금액이 지출된 항목 3가지를 보여줍니다. <b>=͟͟͞͞ ͟͟͞͞𖤐 고정 비용 제외</b></p>
            <BarChart :data="topSpendingData" />
          </div>
        </div>

        <!-- ✅ 아래: 전월 vs 이번 달 -->
        <div class="mt-5">
          <h5 class="mb-2">전월 vs 이번 달 지출</h5>
          <p class="text-muted">두 달 간의 지출 변화를 비교하여 보여줍니다.</p>
          <CompareChart :data="compareData" />
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import AppLayout from '../components/AppLayout.vue'
import PieChart from '../components/charts/PieChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import CompareChart from '../components/charts/CompareChart.vue'

import { getPieChartData, getTopSpendingData, getCompareChartData } from '@/utils/stats'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
userStore.checkLocalStorage()

const userId = userStore.user.id

const transactions = ref([])
const fixedExpenses = ref([])
const pieData = ref([])
const topSpendingData = ref([])
const compareData = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(`/api/transactions?userId=${userId}`)
    transactions.value = response.data

    const response2 = await axios.get(`/api/fixedExpenses?userId=${userId}`)
    fixedExpenses.value = response2.data
    console.log("fixedExpenses.value : ", fixedExpenses.value)

    pieData.value = getPieChartData(transactions.value, fixedExpenses.value)
    console.log("pieData.value : ", pieData.value)
    topSpendingData.value = getTopSpendingData(transactions.value)
    console.log("topSpendingData.value : ", topSpendingData.value)
    compareData.value = getCompareChartData(transactions.value, fixedExpenses.value, userId)
    console.log("compareData.value : ", compareData.value)
  } catch (error) {
    console.error('트랜잭션 데이터를 불러오는 중 오류 발생:', error)
  }
})

const exportAsImage = async () => {
  const element = document.getElementById('chart-container')
  if (!element) return

  const canvas = await html2canvas(element, { scale: 2 })
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = '지출분석통계.png'
  link.click()
}

const exportAsPDF = async () => {
  const element = document.getElementById('chart-container')
  if (!element) return

  const canvas = await html2canvas(element, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')
  const width = 210
  const height = (canvas.height * width) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save('지출분석통계.pdf')
}
</script>

<style scoped>
/* 버튼 hover 애니메이션 */
button.btn {
  transition: all 0.2s ease-in-out;
}
button.btn:hover {
  transform: scale(1.03);
}
</style>
