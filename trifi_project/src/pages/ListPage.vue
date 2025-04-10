<template>
  <AppLayout>
    <div>
      <!-- 월 선택 및 날짜 -->
      <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
        <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        <strong class="month-text mx-auto" style="cursor:pointer; font-size: xx-large;"
        @click="showDatePicker">
          {{ formattedMonth }}
        </strong>
       
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
<!-- 상단 필터 바 -->
<div class="mb-3 d-flex justify-content-end align-items-center gap-2 flex-wrap">
  <div class="d-flex align-items-center gap-2">
  
  <input
  type="text"
  v-model="searchText"
  placeholder="🔍 내역을 검색해보세요"
  class="form-control form-control-sm rounded-pill px-2"
  style="width: 200px; font-size: 14px; color: #333;"
/>
</div>



 <!-- 카테고리별 내역 드롭다운 -->
<div class="dropdown position-relative" ref="categoryDropdownRef">
  <button
  class="btn btn-outline-dark btn-sm rounded-pill"
  @click="toggleCategoryDropdown"
>
  📊 카테고리별 내역
</button>
  <div
    v-if="isCategoryDropdownOpen"
    class="category-dropdown"
  >
    <!-- 전체보기 항목 추가 -->
    <div
      class="dropdown-item"
      @click="filterByCategory('전체')"
    >
      전체보기
    </div>
    <!-- 기존 카테고리들 -->
    <div
      class="dropdown-item"
      v-for="(icon, category) in categoryIcons"
      :key="category"
      @click="filterByCategory(category)"
    >
      {{ icon }} {{ category }}
    </div>
  </div>
</div>


  <!-- 날짜 선택 -->
  <input
    type="date"
    v-model="selectedDate"
    ref="dateInput"
    class="form-control form-control-sm"
    style="width: auto"
  />

  <!-- 엑셀 다운로드 -->
  <button class="btn btn-success btn-sm" @click="downloadExcel">
    📂 엑셀 변환
  </button>
</div>


      <!-- 수입/지출 요약 -->
      <div
        class="bg-white rounded p-3 shadow-sm mb-4 d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>전체 내역 {{ monthlyRecordsWithFixed.length }}건</strong>
        </div>
        <div class="d-flex gap-3 align-items-center">
          <button
            class="btn btn-sm"
            :class="[
              'btn-outline-danger',
              filterType === '지출' ? 'active-btn' : '',
            ]"
            @click="filterType = '지출'"
          >
            💸 지출 {{ totalExpense.toLocaleString() }}원
          </button>
          <button
            class="btn btn-sm"
            :class="[
              'btn-outline-primary',
              filterType === '수입' ? 'active-btn' : '',
            ]"
            @click="filterType = '수입'"
          >
            💰 수입 {{ totalIncome.toLocaleString() }}원
          </button>
          <button
            class="btn btn-sm"
            :class="[
              'btn-outline-success',
              filterType === '이체' ? 'active-btn' : '',
            ]"
            @click="filterType = '이체'"
          >
            💰 이체 {{ totalTransfer.toLocaleString() }}원
          </button>
          <button
            class="btn btn-sm"
            :class="[
              'btn-outline-secondary',
              filterType === '' ? 'active-btn' : '',
            ]"
            @click="filterType = ''"
          >
            📋 전체 보기
          </button>
        </div>
      </div>

     
      
<!-- 고정지출 내역 -->
<div class="mb-2 d-flex justify-content-between align-items-center">
  <div class="fw-bold">📌 고정 수입/지출 내역</div>
  <button class="btn btn-sm btn-outline-secondary" @click="showFixed = !showFixed">
    {{ showFixed ? '숨기기' : '보이기' }}
  </button>
</div>

<!-- 실제 고정내역 리스트 -->
<div v-if="showFixed && fixedRecords.length" class="mb-5">
  <div
    v-for="record in fixedRecords"
    :key="record.id"
    class="d-flex align-items-center justify-content-between py-3 px-3 border position-relative"
    style="background-color: ivory; border-radius: 12px; margin-bottom: 10px;"
  >
   
    <span
      class="badge me-3 d-flex align-items-center gap-1"
      :class="getCategoryClass(record.category)"
    >
      {{ categoryIcons[record.category] || '❓' }} {{ record.category }}
    </span>
    <div class="flex-grow-1">
      <div>{{ record.description }}</div>
      <small class="text-muted">
        {{ record.payment }} |
        {{ formatDateWithDay(record.date) }} ~ {{ formatDateWithDay(record.endDate) }}
      </small>
    </div>
    <div
            :class="
              record.type === '수입'
                ? 'text-primary fw-bold'
                : 'text-danger fw-bold'
            "
          >
            {{ Number(record.amount).toLocaleString() }} 원
      <span class="menu-toggle" @click="toggleMenu(record.id)">⋯</span>



      <!-- 메뉴 영역 (⋯ 버튼 클릭 시 뜨는 팝업 메뉴) -->
<div
  v-if="openMenuId === record.id"
  class="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow-sm"
  style="z-index: 100; min-width: 100px;"
>
  <div
    class="px-2 py-1 text-dark"
    style="cursor: pointer;"
    @click.stop="editItem(record)"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    수정
  </div>
  <div
    class="px-2 py-1 text-dark"
    style="cursor: pointer;"
    @click="deleteFixedExpense(record.id)"
  >
    삭제
  </div>
</div>
    </div>
  </div>
</div>



<!-- 내역이 없을 때 보여줄 메시지 -->
<div v-if="Object.keys(groupedRecords).length === 0" class="text-center text-muted py-4">
  🫥 해당하는 내역이 없습니다
</div>

      <!-- 날짜별 내역 -->
      <div
        v-for="(dailyRecords, date) in groupedRecords"
        :key="date"
        class="mb-4"
      >
        <div class="fw-bold border-bottom pb-1 mb-2">
          {{ formatDateWithDay(date) }}
        </div>
        <div
          v-for="record in dailyRecords"
          :key="record.id"
          class="d-flex align-items-center justify-content-between py-2 px-3 border-bottom position-relative"
        >
          <span
            class="badge me-3 d-flex align-items-center gap-1"
            :class="getCategoryClass(record.category)"
          >
            {{ categoryIcons[record.category] || '❓' }} {{ record.category }}
          </span>
          <div class="flex-grow-1">
            <div>{{ record.description }}</div>
            <small class="text-muted">{{ record.payment }}</small>
          </div>
          <div
            :class="
              record.type === '수입'
                ? 'text-primary fw-bold'
                : 'text-danger fw-bold'
            "
          >
            {{ Number(record.amount).toLocaleString() }} 원
            <span class="menu-toggle" @click="toggleMenu(record.id)">⋯</span>
          </div>


          
          <!-- 수정,삭제 드롭다운 메뉴 -->
          <div v-if="openMenuId === record.id" class="dropdown-menu-custom">
            <button class="dropdown-item" @click.stop="editItem(record)">
              수정
            </button>
            <button class="dropdown-item" @click="deleteRecord(record.id)">
              삭제
            </button>
          </div>
        </div>
      </div>
      <button class="add-button" @click="isModalOpen = true">+</button>
    <button class="calc-button" @click="showCalculator = true">
      <i class="bi bi-calculator"></i>
    </button>



    <RegisterReEdit
      v-if="editModalOpen"
      :existingData="itemToEdit"
      @close="editModalOpen = false"
    />
    

    <!-- 계산기 컴포넌트 -->
    <Calculator 
      :visible="showCalculator"
      @close="showCalculator = false"></Calculator>
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
import { useRouter } from 'vue-router';
import RegisterEdit from '@/pages/Register_edit.vue';
import Calculator from './Calculator.vue';
import RegisterReEdit from './RegisterReedit.vue';

const router = useRouter();
const isModalOpen = ref(false);
const goToCalender = () => {
  router.push(`/home`);
};

const showFixed = ref(true);
const currentMonth = ref(new Date())
const records = ref([])
const fixedExpenses = ref([])
const filterType = ref('')
const selectedDate = ref('')
const dateInput = ref(null);
const showCalculator = ref(false);
const editModalOpen = ref(false);    // RegisterReedit 모달 열림 여부
const itemToEdit = ref(null); 





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
  currentMonth.value = new Date()
  selectedDate.value = ''
}

// 요일 변환
const formatDateWithDay = (dateStr) => {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = days[date.getDay()];
  return `${dateStr} (${dayName})`;
};


// fetch
let fetchInterval = null


// 유저정보 가져오기
const fetchRecords = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  if (!userId) return;

  const res = await axios.get('http://localhost:3000/transactions', {
    params: { userId }
  });
  records.value = res.data;
};


const fetchFixedExpenses = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  if (!userId) return;

  const res = await axios.get('http://localhost:3000/fixedExpenses', {
    params: { userId }
  });
  fixedExpenses.value = res.data; // fixedExpenses는 ref로 선언해줘야 함
};




onMounted(() => {
  fetchRecords();
  fetchFixedExpenses();
  fetchInterval = setInterval(() => {
    fetchRecords();
    fetchFixedExpenses();
  }, 1000);

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }
  document.removeEventListener('click', handleClickOutside)
});

const monthlyRecords = computed(() => {
  return records.value.filter((record) => {
    const recordDate = new Date(record.date);
    const recordYear = recordDate.getFullYear();
    const recordMonth = recordDate.getMonth();
    const selectedYear = currentMonth.value.getFullYear();
    const selectedMonth = currentMonth.value.getMonth();
    const dateMatches =
      !selectedDate.value || record.date === selectedDate.value;

    return (
      recordYear === selectedYear &&
      recordMonth === selectedMonth &&
      dateMatches
    );
  });
});

const monthlyRecordsWithFixed = computed(() => {
  return [...monthlyRecords.value, ...fixedRecords.value];
});

// 고정지출 내역
const fixedRecords = computed(() => {
  const selectedYear = currentMonth.value.getFullYear();
  const selectedMonth = currentMonth.value.getMonth() + 1;

  return fixedExpenses.value.filter((record) => {
    const start = new Date(record.date);
    const end = new Date(record.endDate);
    const isInMonth =
      selectedYear >= start.getFullYear() &&
      selectedMonth >= start.getMonth() + 1 &&
      start <= new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0) &&
      end >= new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1);

    const matchesType = !filterType.value || record.type === filterType.value;

    // ✅ 카테고리 필터도 추가
    const matchesCategory =
      !selectedCategory.value || selectedCategory.value === '전체' || record.category === selectedCategory.value;

    return isInMonth && matchesType && matchesCategory;
  });
});
const categoryDropdownRef = ref(null);

const handleClickOutside = (event) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target))
{isCategoryDropdownOpen.value = false;}
}
const filteredRecords = computed(() => {
  return monthlyRecords.value.filter((record) => {
    const matchesType = !filterType.value || record.type === filterType.value;
    const matchesCategory = !selectedCategory.value || record.category === selectedCategory.value;
    const matchesSearch = !searchText.value || record.description.toLowerCase().includes(searchText.value.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });
});

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

const getCategoryClass = (category) => {
  const categoryMap = {
    식비: 'bg-pastel-orange text-dark',
    교통: 'bg-pastel-green text-dark',
    쇼핑: 'bg-pastel-yellow text-dark',
    미용: 'bg-pastel-pink text-dark',
    문화: 'bg-pastel-blue text-dark',
    저축: 'bg-pastel-purple text-dark',
    기타: 'bg-pastel-gray text-dark',
    급여: 'bg-pastel-sky text-dark',
    용돈: 'bg-pastel-sky text-dark',
    선물: 'bg-pastel-red text-dark',
    의료: 'bg-pastel-teal text-dark',
    공과금: 'bg-pastel-brown text-dark',
  };
  return categoryMap[category] || 'bg-pastel-gray text-dark';
};

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

// 총 수입, 지출, 이체 내역 계산
const totalIncome = computed(() => {
  const normalIncome = monthlyRecords.value
    .filter((r) => r.type === '수입')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const fixedIncome = fixedRecords.value
    .filter((r) => r.type === '수입')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return normalIncome + fixedIncome;
});

const totalExpense = computed(() => {
  const normalExpense = monthlyRecords.value
    .filter((r) => r.type === '지출')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const fixedExpense = fixedRecords.value
    .filter((r) => r.type === '지출')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return normalExpense + fixedExpense;
});

const totalTransfer = computed(() =>
  monthlyRecords.value
    .filter((r) => r.type === '이체')
    .reduce((sum, r) => sum + Number(r.amount), 0)
);


// 엑셀 데이터 변환
const downloadExcel = () => {
  const excelData = monthlyRecords.value.map((record) => ({
    날짜: record.date,
    결제수단: record.payment,
    분류: record.category,
    금액: record.amount,
    내용: record.description,
    유형: record.type,
  }));

   // 총합 정보 추가
  excelData.push({});
  excelData.push({ 내용: ' *총 지출', 금액: totalExpense.value });
  excelData.push({ 내용: ' *총 수입', 금액: totalIncome.value });
  excelData.push({ 내용: ' *총 이체', 금액: totalTransfer.value });



  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '가계부 내역');

  const year = currentMonth.value.getFullYear();
  const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `가계부_내역_${year}년_${month}월.xlsx`);
};

// 내역 수정, 삭제


const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const openMenuId = ref(null);
const editTarget = ref(null)

const editRecord = (record) => {
  editTarget.value = record;
  isModalOpen.value = true;
};




const deleteRecord = async (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await axios.delete(`http://localhost:3000/transactions/${id}`);
    fetchRecords();
  }
}

const deleteFixedExpense = async (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await axios.delete(`http://localhost:3000/fixedExpenses/${id}`);
    fetchFixedExpenses();
    openMenuId.value = null;
  }
};

const isCategoryDropdownOpen = ref(false);
const selectedCategory = ref('');

const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};


const incomeCategories = ['급여','용돈'];
const expenseCategories = ['식비', '교통', '쇼핑', '미용', '문화', '저축', '기타', '의료', '공과금','선물'];

const filterByCategory = (category) => {
  if (category === '전체') {
    selectedCategory.value = '';
    filterType.value = '';
  } else {
    selectedCategory.value = category;
    filterType.value = incomeCategories.includes(category)
      ? '수입'
      : '지출';
  }
  isCategoryDropdownOpen.value = false;
};
function editItem(event) {
  itemToEdit.value = event;
  editModalOpen.value = true;
}


const searchText = ref('');


</script>

<style scoped>
/* 파스텔톤 색상 정의 */
.bg-pastel-orange {
  background-color: #ffd8a8;
}
.bg-pastel-green {
  background-color: #c3fbd8;
}
.bg-pastel-yellow {
  background-color: #fff3bf;
}
.bg-pastel-pink {
  background-color: #ffccd5;
}
.bg-pastel-blue {
  background-color: #d0ebff;
}
.bg-pastel-purple {
  background-color: #e5d5fa;
}
.bg-pastel-sky {
  background-color: #c5f6fa;
}
.bg-pastel-red {
  background-color: #ffc9c9;
}
.bg-pastel-teal {
  background-color: #d3f9d8;
}
.bg-pastel-gray {
  background-color: #e9ecef;
}
.bg-pastel-brown {
  background-color: #e7d3c8;
}

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
  color: black;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  background-color: white;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
.calc-button {
  position: fixed;
  right: 30px;
  bottom: 100px; /* +버튼 위쪽으로 배치해봤습니다. 원하는 대로 조절 */
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px; /* 아이콘 크기 */
  color: black;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  background-color: white;
}
.calc-button:hover {
  background-color: #fdb3b3;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 0.3rem 0;
  min-width: 160px;
}

.category-dropdown .dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.category-dropdown .dropdown-item:hover {
  background-color: #f8f9fa;
}

</style>
