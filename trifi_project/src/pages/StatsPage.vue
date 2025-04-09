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


// // ✅ 여기에 실제 transactions를 임시로 넣거나, API 등으로 받아야 함
// const transactions = [
//   { type: 'expense', amount: 120000, category: '식비', description: '스타벅스', date: '2025-04-01' },
//   { type: 'expense', amount: 100000, category: '쇼핑', description: '무신사', date: '2025-04-08' },
//   { type: 'expense', amount: 150000, category: '교통', description: '버스', date: '2025-04-15' },
//   { type: 'expense', amount: 90000, category: '기타', description: '편의점', date: '2025-04-22' },
//   { type: 'expense', amount: 70000, category: '식비', description: '이마트', date: '2025-03-10' },
//   { type: 'expense', amount: 110000, category: '쇼핑', description: '유니클로', date: '2025-03-20' },
//   // 더미 데이터 계속 추가 가능
// ]

// ✅ 이 데이터들을 기반으로 가공
// const pieData = getPieChartData(transactions)
// const topSpendingData = getTopSpendingData(transactions)
// const compareData = getCompareChartData(transactions)

// ✅ Pinia에서 유저 정보 가져오기
const userStore = useUserStore()
userStore.checkLocalStorage()

const userId = userStore.user.id

// ✅ 데이터 상태 관리
const transactions = ref([])
const fixedExpenses = ref([])
const pieData = ref([])
const topSpendingData = ref([])
const compareData = ref([])

onMounted(async () => {
  try {
    // ✅ 유저 ID 기반 트랜잭션 데이터 요청
    const response = await axios.get(`/api/transactions?userId=${userId}`)
    transactions.value = response.data
    const transactionsData = JSON.parse(JSON.stringify(transactions.value))

    console.log("transactions.value : ", transactions.value)

    // ✅ 유저 ID 기반 고정 지출 데이터 요청
    const response2 = await axios.get(`/api/fixedExpenses?userId=${userId}`)
    fixedExpenses.value = response2.data
    const fixedExpensesData = JSON.parse(JSON.stringify(fixedExpenses.value))
    
    console.log("fixedExpenses.value : ", fixedExpenses.value)

    // ✅ 받아온 데이터를 가공하여 그래프에 전달
    pieData.value = getPieChartData(transactions.value, fixedExpenses.value)
    console.log("Pie 차트 데이터:", pieData.value)

    topSpendingData.value = getTopSpendingData(transactions.value)
    console.log("3 차트 데이터:", topSpendingData.value)
    // compareData.value = getCompareChartData(transactions.value)

  } catch (error) {
    console.error('트랜잭션 데이터를 불러오는 중 오류 발생:', error)
  }
})

</script>
