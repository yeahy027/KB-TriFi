<template>
  <AppLayout>
    <div>
      <!-- 월 선택 및 날짜 -->
      <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
        <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        <strong class="month-text mx-auto">{{ formattedMonth }}</strong>
        <button class="btn btn-outline-secondary btn-sm" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
        <button
          class="btn btn-outline-primary btn-sm"
          @click="resetToThisMonth"
        >
          📅이번 달
        </button>
      </div>

      <!-- 엑셀 다운로드 -->
      <div class="mb-3 text-end">
        <button class="btn btn-success btn-sm" @click="downloadExcel">
          <i class="bi bi-file-earmark-excel"></i> 엑셀 변환
        </button>
      </div>

      <!-- 수입/지출 요약 -->
      <div
        class="bg-white rounded p-3 shadow-sm mb-4 d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>전체 내역 {{ filteredRecords.length }}건</strong>
        </div>
        <div class="d-flex gap-3 align-items-center">
          <button
            class="btn btn-outline-danger btn-sm"
            @click="filterType = '지출'"
          >
            💸지출 {{ totalExpense.toLocaleString() }}원
          </button>
          <button
            class="btn btn-outline-primary btn-sm"
            @click="filterType = '수입'"
          >
            💰수입 {{ totalIncome.toLocaleString() }}원
          </button>
          <button
            class="btn btn-outline-secondary btn-sm"
            @click="filterType = ''"
          >
            📋전체 보기
          </button>
        </div>
      </div>

      <!-- 날짜별 내역 -->
      <div
        v-for="(dailyRecords, date) in groupedRecords"
        :key="date"
        class="mb-4"
      >
        <div class="fw-bold border-bottom pb-1 mb-2">{{ date }}</div>

        <div
          v-for="record in dailyRecords"
          :key="record.id"
          class="d-flex align-items-center justify-content-between py-2 px-3 border-bottom"
        >
          <!-- 카테고리 아이콘 + 뱃지 -->
          <span
            class="badge me-3 d-flex align-items-center gap-1"
            :class="getCategoryClass(record.category)"
          >
            {{ categoryIcons[record.category] || '❓' }} {{ record.category }}
          </span>

          <!-- 내용 + 자산 -->
          <div class="flex-grow-1">
            <div>{{ record.memo }}</div>
            <small class="text-muted">{{ record.asset }}</small>
          </div>

          <!-- 금액 -->
          <div
            :class="
              record.type === '수입'
                ? 'text-primary fw-bold'
                : 'text-danger fw-bold'
            "
          >
            {{ Number(record.amount).toLocaleString() }} 원
          </div>
        </div>
      </div>
      <button class="add-button" @click="isModalOpen = true">+ 등록</button>
      <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import RegisterEdit from '@/pages/Register_edit.vue';

const currentMonth = ref(new Date());
const records = ref([]);
const filterType = ref('');

// 월 형식 변환
const formattedMonth = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0');
  return `${year}년 ${month}월`;
});

const prevMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentMonth.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentMonth.value = newDate;
};

const resetToThisMonth = () => {
  currentMonth.value = new Date();
};

// fetch
let fetchInterval = null;

const fetchRecords = async () => {
  const res = await axios.get('http://localhost:3000/records');
  records.value = res.data;
};

onMounted(() => {
  fetchRecords();
  fetchInterval = setInterval(fetchRecords, 5000); // 5초마다 갱신
});

onUnmounted(() => {
  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }
});

// 필터링된 기록
const filteredRecords = computed(() => {
  return records.value.filter((record) => {
    const recordDate = new Date(record.date);
    const recordYear = recordDate.getFullYear();
    const recordMonth = recordDate.getMonth();
    const selectedYear = currentMonth.value.getFullYear();
    const selectedMonth = currentMonth.value.getMonth();

    const typeMatches = !filterType.value || record.type === filterType.value;
    const monthMatches =
      recordYear === selectedYear && recordMonth === selectedMonth;

    return typeMatches && monthMatches;
  });
});

// 날짜별 그룹
const groupedRecords = computed(() => {
  const groups = {};
  filteredRecords.value.forEach((record) => {
    if (!groups[record.date]) groups[record.date] = [];
    groups[record.date].push(record);
  });

  return Object.fromEntries(
    Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  );
});

// 카테고리 뱃지
const getCategoryClass = (category) => {
  const categoryMap = {
    식비: 'bg-primary',
    교통: 'bg-success',
    쇼핑: 'bg-warning text-dark',
    문화: 'bg-info text-dark',
    기타: 'bg-secondary',
    용돈: 'bg-danger',
    저축: 'bg-dark',
  };
  return categoryMap[category] || 'bg-secondary';
};

// 카테고리 아이콘
const categoryIcons = {
  식비: '🍔',
  교통: '🚌',
  쇼핑: '👗',
  미용: '💅',
  문화: '🎬',
  저축: '🏦',
  기타: '📝',
  급여: '💰',
  용돈: '💰',
  선물: '🎁',
  의료: '💊',
  공과금: '💡',
};

// 합계 (필터 기준)
const totalIncome = computed(() =>
  filteredRecords.value
    .filter((r) => r.type === '수입')
    .reduce((sum, r) => sum + Number(r.amount), 0)
);
const totalExpense = computed(() =>
  filteredRecords.value
    .filter((r) => r.type === '지출')
    .reduce((sum, r) => sum + Number(r.amount), 0)
);

// 엑셀 변환
const downloadExcel = () => {
  const excelData = filteredRecords.value.map((record) => ({
    날짜: record.date,
    자산: record.asset,
    분류: record.category,
    금액: record.amount,
    내용: record.memo,
    유형: record.type,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '가계부 내역');

  const year = currentMonth.value.getFullYear();
  const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `가계부_내역_${year}년_${month}월.xlsx`);
};
</script>

<style scoped>
.badge {
  min-width: 60px;
  font-size: 0.8rem;
  padding: 0.5em 0.75em;
}
/* + 버튼 (우측 하단 고정 등 원하는 스타일) */
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
</style>
