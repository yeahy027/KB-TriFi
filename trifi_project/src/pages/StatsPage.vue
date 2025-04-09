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
import AppLayout from '../components/AppLayout.vue'

import PieChart from '../components/charts/PieChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import CompareChart from '../components/charts/CompareChart.vue'

// 예시 더미 데이터
const pieData = [
  { name: '식비', value: 450000 },
  { name: '교통', value: 150000 },
  { name: '쇼핑', value: 200000 },
  { name: '기타', value: 100000 }
]

const topSpendingData = [
  { name: '스타벅스', amount: 120000 },
  { name: '이마트', amount: 90000 },
  { name: '버스 교통', amount: 70000 }
]

const compareData = [
  { name: '전월', value: 850000 },
  { name: '이번 달', value: 720000 }
]
</script>
