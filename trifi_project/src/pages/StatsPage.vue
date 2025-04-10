<!-- KB-TriFi/trifi_project/src/pages/StatsPage.vue -->
<template>
  <AppLayout>
    <template #default>
      <h3 class="fw-bold mb-4">📊 지출 분석 통계</h3>

      <div class="row">
        <!-- ✅ 왼쪽: 원형 차트 -->
        <div class="col-md-6 mb-4">
          <h5 class="mb-2">카테고리별 지출 비율</h5>
          <PieChart :data="pieData" />
        </div>

        <!-- ✅ 오른쪽: 상위 지출 -->
        <div class="col-md-6 mb-4">
          <h5 class="mb-2">상위 3개 지출 항목</h5>
          <BarChart :data="topSpendingData" />
        </div>
      </div>

      <!-- ✅ 아래: 전월 vs 이번 달 -->
      <div class="mt-5">
        <h5 class="mb-2">전월 vs 이번 달 지출</h5>
        <CompareChart :data="compareData" />
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

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
    // ✅ 트랜잭션 데이터 요청
    const response = await axios.get(`/api/transactions?userId=${userId}`)
    transactions.value = response.data

    const response2 = await axios.get(`/api/fixedExpenses?userId=${userId}`)
    fixedExpenses.value = response2.data

    // ✅ 데이터 가공
    pieData.value = getPieChartData(transactions.value, fixedExpenses.value)
    topSpendingData.value = getTopSpendingData(transactions.value)
    compareData.value = getCompareChartData(transactions.value, fixedExpenses.value, userId)
    console.log("compareData.value: ", compareData.value)

  } catch (error) {
    console.error('트랜잭션 데이터를 불러오는 중 오류 발생:', error)
  }
})
</script>
