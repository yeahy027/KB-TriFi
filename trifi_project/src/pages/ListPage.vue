<template>
  <AppLayout>
    <div>
      <!-- 월 선택 및 날짜 -->
      <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
        <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        <strong class="month-text mx-auto" style="cursor:pointer" @click="goToCalender">
          {{ formattedMonth }}
        </strong>
        <button class="btn btn-outline-secondary btn-sm" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
        <button class="btn btn-outline-primary btn-sm" @click="resetToThisMonth">📅이번 달</button>
      </div>

      <!-- 날짜 선택 + 엑셀 다운로드 -->
      <div class="mb-3 d-flex justify-content-end align-items-center gap-2">
        <input
          type="date"
          v-model="selectedDate"
          class="form-control form-control-sm"
          style="width: auto;"
        />
        <button class="btn btn-success btn-sm" @click="downloadExcel">
          <i class="bi bi-file-earmark-excel"></i> 엑셀 변환
        </button>
      </div>

      <!-- 수입/지출 요약 -->
      <div class="bg-white rounded p-3 shadow-sm mb-4 d-flex justify-content-between align-items-center">
        <div><strong>전체 내역 {{ monthlyRecords.length }}건</strong></div>
        <div class="d-flex gap-3 align-items-center">
          <button
            class="btn btn-sm"
            :class="['btn-outline-danger', filterType === 'expense' ? 'active-btn' : '']"
            @click="filterType = 'expense'"
          >
            💸 지출 {{ totalExpense.toLocaleString() }}원
          </button>
          <button
            class="btn btn-sm"
            :class="['btn-outline-primary', filterType === 'income' ? 'active-btn' : '']"
            @click="filterType = 'income'"
          >
            💰 수입 {{ totalIncome.toLocaleString() }}원
          </button>
          <button
            class="btn btn-sm"
            :class="['btn-outline-success', filterType === 'transfer' ? 'active-btn' : '']"
            @click="filterType = 'transfer'"
          >
            💰 이체 {{ totalTransfer.toLocaleString() }}원
          </button>
          <button
            class="btn btn-sm"
            :class="['btn-outline-secondary', filterType === '' ? 'active-btn' : '']"
            @click="filterType = ''"
          >
            📋 전체 보기
          </button>
        </div>
      </div>

      <!-- 날짜별 내역 -->
      <div v-for="(dailyRecords, date) in groupedRecords" :key="date" class="mb-4">
        <div class="fw-bold border-bottom pb-1 mb-2">{{ formatDateWithDay(date) }}</div>
        <div
          v-for="record in dailyRecords"
          :key="record.id"
          class="d-flex align-items-center justify-content-between py-2 px-3 border-bottom"
        >
          <span class="badge me-3 d-flex align-items-center gap-1" :class="getCategoryClass(record.category)">
            {{ categoryIcons[record.category] || '❓' }} {{ record.category }}
          </span>
          <div class="flex-grow-1">
            <div>{{ record.description }}</div>
            <small class="text-muted">{{ record.payment }}</small>
          </div>
          <div :class="record.type === 'income' ? 'text-primary fw-bold' : 'text-danger fw-bold'">
            {{ Number(record.amount).toLocaleString() }} 원
            <span class="menu-toggle" @click="toggleMenu(record.id)">⋯</span>
          </div>

          <!-- 수정,삭제 드롭다운 메뉴 -->
           <div v-if="openMenuId === record.id" class="dropdown-menu-custom">
            <button class="dropdown-item" @click="editRecord(record)">수정</button>
            <button class="dropdown-item" @click="deleteRecord(record.id)">삭제</button>
           </div>

          
        </div>
      </div>
    </div>
    <button class="add-button" @click="isModalOpen = true">+</button>
    <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useRouter } from 'vue-router'
import RegisterEdit from '@/pages/Register_edit.vue'

const router = useRouter()

const goToCalender = () => {
  router.push(`/home`)
}

const currentMonth = ref(new Date())
const records = ref([])
const filterType = ref('')
const selectedDate = ref('')

const clearSelectedDate = () => {
  selectedDate.value = ''
}

const formattedMonth = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0')
  return `${year}년 ${month}월`
})

const prevMonth = () => {
  const newDate = new Date(currentMonth.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentMonth.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentMonth.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentMonth.value = newDate
}

const resetToThisMonth = () => {
  currentMonth.value = new Date()
}

const formatDateWithDay = (dateStr) => {
  const date = new Date(dateStr)
  const days = ['일','월','화','수','목','금','토']
  const dayName = days[date.getDay()]
  return `${dateStr} (${dayName})`
}

let fetchInterval = null

const fetchRecords = async () => {
  const res = await axios.get('http://localhost:3000/transactions')
  records.value = res.data
}

onMounted(() => {
  fetchRecords()
  fetchInterval = setInterval(fetchRecords, 5000)
})

onUnmounted(() => {
  if (fetchInterval) {
    clearInterval(fetchInterval)
    fetchInterval = null
  }
})

const monthlyRecords = computed(() => {
  return records.value.filter(record => {
    const recordDate = new Date(record.date)
    const recordYear = recordDate.getFullYear()
    const recordMonth = recordDate.getMonth()
    const selectedYear = currentMonth.value.getFullYear()
    const selectedMonth = currentMonth.value.getMonth()
    const dateMatches = !selectedDate.value || record.date === selectedDate.value

    return recordYear === selectedYear && recordMonth === selectedMonth && dateMatches
  })
})

const filteredRecords = computed(() => {
  return monthlyRecords.value.filter(record => {
    return !filterType.value || record.type === filterType.value
  })
})

const groupedRecords = computed(() => {
  const groups = {}
  filteredRecords.value.forEach(record => {
    if (!groups[record.date]) groups[record.date] = []
    groups[record.date].push(record)
  })

  return Object.fromEntries(
    Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  )
})

const getCategoryClass = category => {
  const categoryMap = {
    '식비': 'bg-pastel-orange text-dark',
    '교통': 'bg-pastel-green text-dark',
    '쇼핑': 'bg-pastel-yellow text-dark',
    '미용': 'bg-pastel-pink text-dark',
    '문화': 'bg-pastel-blue text-dark',
    '저축': 'bg-pastel-purple text-dark',
    '기타': 'bg-pastel-gray text-dark',
    '급여': 'bg-pastel-sky text-dark',
    '용돈': 'bg-pastel-sky text-dark',
    '선물': 'bg-pastel-red text-dark',
    '의료': 'bg-pastel-teal text-dark',
    '공과금': 'bg-pastel-brown text-dark',
  }
  return categoryMap[category] || 'bg-pastel-gray text-dark'
}

const categoryIcons = {
  '식비': '🍔',
  '교통': '🚌',
  '쇼핑': '👗',
  '미용': '💅',
  '문화': '🎬',
  '저축': '🏦',
  '기타': '📝',
  '급여': '💰',
  '용돈': '💰',
  '선물': '🎁',
  '의료': '💊',
  '공과금': '💡',
}

// 총 수입, 지출, 이체 내역 계산산
const totalIncome = computed(() =>
  monthlyRecords.value.filter(r => r.type === 'income').reduce((sum, r) => sum + Number(r.amount), 0)
)
const totalExpense = computed(() =>
  monthlyRecords.value.filter(r => r.type === 'expense').reduce((sum, r) => sum + Number(r.amount), 0)
)
const totalTransfer = computed(() =>
  monthlyRecords.value.filter(r => r.type === 'transfer').reduce((sum, r) => sum + Number(r.amount), 0)
)

// 엑셀 데이터 변환환
const downloadExcel = () => {
  const excelData = monthlyRecords.value.map(record => ({
    날짜: record.date,
    결제수단: record.payment,
    분류: record.category,
    금액: record.amount,
    내용: record.description,
    유형: record.type,
  }))

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '가계부 내역')

  const year = currentMonth.value.getFullYear()
  const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0')
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `가계부_내역_${year}년_${month}월.xlsx`)
}


// 내역 수정, 삭제
const openMenuId = ref(null)

const toggleMenu = (id) => {openMenuId.value = openMenuId.value === id ? null : id}

const editRecord = (record) => {
  alert(`수정 기능 - ${record.description}`)
}

const deleteRecord = async (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await axios.delete(`http://localhost:3000/transactions/${id}`)
    fetchRecords()
  }
}
</script>

<style scoped>
/* 파스텔톤 색상 정의 */
.bg-pastel-orange { background-color: #ffd8a8; }
.bg-pastel-green { background-color: #c3fbd8; }
.bg-pastel-yellow { background-color: #fff3bf; }
.bg-pastel-pink { background-color: #ffccd5; }
.bg-pastel-blue { background-color: #d0ebff; }
.bg-pastel-purple { background-color: #e5d5fa; }
.bg-pastel-sky { background-color: #c5f6fa; }
.bg-pastel-red { background-color: #ffc9c9; }
.bg-pastel-teal { background-color: #d3f9d8; }
.bg-pastel-gray { background-color: #e9ecef; }
.bg-pastel-brown { background-color: #e7d3c8; }

.badge {
  min-width: 70px;
  font-size: 0.85rem;
  padding: 0.6em 0.9em;
  border-radius: 1rem;
}

/* 선택된 버튼 강조 스타일 */
.active-btn {
  font-weight: bold;
  opacity: 1 !important;
  border-width: 2px;
}

.btn-outline-danger.active-btn {
  background-color: #fa5252;
  color: white;
  border-color: #fa5252;
}

.btn-outline-primary.active-btn {
  background-color: #228be6;
  color: white;
  border-color: #228be6;
}

.btn-outline-success.active-btn {
  background-color: #40c057;
  color: white;
  border-color: #40c057;
}

.btn-outline-secondary.active-btn {
  background-color: #495057;
  color: white;
  border-color: #495057;
}
.add-button {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 30px;
  background: #ff5252;
  color: #fff;
  border: none;
  cursor: pointer;
}
.add-button:hover {
  background-color: #fdb3b3;
}

.menu-toggle {
  cursor: pointer;
  margin-left: 8px;
  font-size: 1.2rem;
  color: #000;
}

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 0.3rem 0;
  z-index: 10;
  min-width: 100px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.4rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f3f5;
}

</style>
