<template>
    <AppLayout>
      <div>
        <!-- 월 선택 및 날짜 -->
        <div class="d-flex align-items-center gap-2 mb-3">
          <button class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-chevron-left"></i>
          </button>
          <strong>{{ currentMonth }}</strong>
          <button class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button class="btn btn-outline-primary btn-sm">이번 달</button>
        </div>
  
        <!-- 엑셀 다운로드 -->
        <div class="mb-3 text-end">
          <button class="btn btn-success btn-sm" @click="downloadExcel">
            <i class="bi bi-file-earmark-excel"></i> 엑셀 변환
          </button>
        </div>
  
        <!-- 수입/지출 요약 -->
        <div class="bg-white rounded p-3 shadow-sm mb-4">
          <div class="d-flex justify-content-between">
            <div><strong>전체 내역 {{ records.length }}건</strong></div>
            <div class="text-danger">총 지출 {{ totalExpense.toLocaleString() }} 원</div>
            <div class="text-primary">총 수입 {{ totalIncome.toLocaleString() }} 원</div>
          </div>
        </div>
  
        <!-- 날짜별로 묶은 내역 -->
        <div v-for="(dailyRecords, date) in groupedRecords" :key="date" class="mb-4">
          <!-- 날짜 헤더 -->
          <div class="fw-bold border-bottom pb-1 mb-2">{{ date }}</div>
  
          <!-- 각 내역 -->
          <div
            v-for="record in dailyRecords"
            :key="record.id"
            class="d-flex align-items-center justify-content-between py-2 px-3 border-bottom"
          >
            <!-- 카테고리 뱃지 -->
            <span class="badge me-3" :class="getCategoryClass(record.category)">
              {{ record.category }}
            </span>
  
            <!-- 내용 및 결제수단 -->
            <div class="flex-grow-1">
              <div>{{ record.memo }}</div>
              <small class="text-muted">{{ record.asset }}</small>
            </div>
  
            <!-- 금액 -->
            <div :class="record.type === '수입' ? 'text-primary fw-bold' : 'text-danger fw-bold'">
              {{ Number(record.amount).toLocaleString() }} 원
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  </template>
  
  <script setup>
  import AppLayout from '@/components/AppLayout.vue'
  import { ref, computed, onMounted } from 'vue'
  import axios from 'axios'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'
  
  const currentMonth = ref('2025-04')
  const records = ref([])
  
  // 내역 불러오기
  const fetchRecords = async () => {
    const res = await axios.get('http://localhost:3000/records')
    records.value = res.data
  }
  onMounted(() => {
    fetchRecords()
  })
  
  // 날짜별로 그룹화
  const groupedRecords = computed(() => {
    const groups = {}
    records.value.forEach(record => {
      if (!groups[record.date]) {
        groups[record.date] = []
      }
      groups[record.date].push(record)
    })
  
    // 날짜 내림차순 정렬
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
    )
  })
  
  // 카테고리에 따라 색상 뱃지 지정
  const getCategoryClass = (category) => {
    const categoryMap = {
      '식비': 'bg-primary',
      '교통': 'bg-success',
      '의류': 'bg-warning text-dark',
      '문화': 'bg-info text-dark',
      '기타': 'bg-secondary',
      '용돈': 'bg-danger',
    }
    return categoryMap[category] || 'bg-dark'
  }
  
  // 수입/지출 계산
  const totalIncome = computed(() =>
    records.value
      .filter(record => record.type === '수입')
      .reduce((sum, r) => sum + Number(r.amount), 0)
  )
  
  const totalExpense = computed(() =>
    records.value
      .filter(record => record.type === '지출')
      .reduce((sum, r) => sum + Number(r.amount), 0)
  )
  
  // 엑셀 다운로드
  const downloadExcel = () => {
    const excelData = records.value.map(record => ({
      날짜: record.date,
      자산: record.asset,
      분류: record.category,
      금액: record.amount,
      내용: record.memo,
      유형: record.type,
    }))
  
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '가계부 내역')
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `가계부_내역_${currentMonth.value}.xlsx`)
  }
  </script>
  
  <style scoped>
  .badge {
    min-width: 50px;
    text-align: center;
    font-size: 0.8rem;
    padding: 0.5em 0.75em;
  }
  </style>
  