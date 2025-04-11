<template>
  <AppLayout>
    <div class="calendar-container">
      <!-- 상단 헤더(월/년도, 통계 표시) -->
      <div class="header" :class="seasonClass">
        <div
          class="d-flex align-items-center justify-content-center gap-2 mb-3"
        >
          <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">
            <i class="bi bi-chevron-left"></i>
          </button>
          <strong
            class="month-text mx-auto"
            style="cursor: pointer; font-size: xx-large"
            @click="showDatePicker"
          >
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

        <!-- 전체/수입/지출/이체 버튼 (필터) -->
        <div class="summary">
          <!-- 전체 -->
          <div
            class="summary-item total"
            :class="{ active: eventFilter === 'all' }"
            @click="setFilter('all')"
          >
            전체 ({{ totalCount }}건)
            <br />{{ formatCurrency(totalAmount) }}
          </div>
          <!-- 수입 -->
          <div
            class="summary-item income"
            :class="{ active: eventFilter === '수입' }"
            @click="setFilter('수입')"
          >
            💰 수입 ({{ incomeCount }}건)
            <br />{{ formatCurrency(incomeSum) }}
          </div>
          <!-- 지출 -->
          <div
            class="summary-item expense"
            :class="{ active: eventFilter === '지출' }"
            @click="setFilter('지출')"
          >
            💸 지출 ({{ expenseCount }}건)
            <br />{{ formatCurrency(expenseSum) }}
          </div>
          <!-- 이체 -->
          <div
            class="summary-item transfer"
            :class="{ active: eventFilter === '이체' }"
            @click="setFilter('이체')"
          >
            🏦 이체 ({{ transferCount }}건)<br />{{
              formatCurrency(transferSum)
            }}
          </div>
        </div>
      </div>

      <!-- 달력 -->
      <table class="calendar">
        <thead>
          <tr>
            <th v-for="(d, i) in dayNames" :key="i">{{ d }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, wIndex) in weeks" :key="wIndex">
            <td
              v-for="(day, dIndex) in week"
              :key="dIndex"
              :class="{
                'not-current-month': day.month !== currentMonth,
                sunday: day.dateObj.getDay() === 0,
                saturday: day.dateObj.getDay() === 6,
              }"
              @mouseenter="
                dayEvents(day.dateStr).length > 0 && openPreview(day.dateStr)
              "
              @mouseleave="closePreview"
            >
              <!-- 날짜 숫자 -->
              <div class="day-number">
                <!-- 오늘이면 .today-badge 클래스 추가 -->
                <span
                  class="day-badge"
                  :class="{ 'today-badge': isToday(day.dateObj) }"
                >
                  {{ day.dateObj.getDate() }}
                </span>

                <!-- 고정지출/고정수입이 있으면 표시 -->
                <template v-if="fixedExpensesForDay(day.dateStr).length">
                  <span class="pin-line">
                    📌
                    <template
                      v-for="(fexp, i) in fixedExpensesForDay(day.dateStr)"
                      :key="i"
                    >
                      {{ fexp.type === '지출' ? '-' : '+' }}
                      {{ fexp.amount.toLocaleString() }}원
                      <span
                        v-if="i < fixedExpensesForDay(day.dateStr).length - 1"
                      >
                        /
                      </span>
                    </template>
                  </span>
                </template>
              </div>

              <!-- 말풍선 팝업(hover) - 해당 날짜에 마우스 올라갔을 때만 표시 -->
              <div v-if="previewDateStr === day.dateStr" class="popup-bubble">
                <div
                  v-for="(evt, index) in dayEvents(day.dateStr)"
                  :key="index"
                  class="popup-item"
                >
                  {{ evt.description }}<br />
                  {{ formattedAmount(evt) }}
                </div>
              </div>

              <!-- 해당 날짜의 이벤트들을 표시 (클릭 시 오버레이) -->
              <div
                v-for="(event, eIndex) in dayEvents(day.dateStr)"
                :key="eIndex"
                :class="['event', event.type]"
                style="display: block"
                @click.stop="openEventAction(event)"
              >
                <span :class="event.type">
                  {{ formattedAmount(event) }}원
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- + 버튼 (등록 모달 열기) -->
    <button class="add-button" @click="isModalOpen = true">+</button>
    <!-- 계산기 버튼 -->
    <button class="calc-button" @click="showCalculator = true">
      <i class="bi bi-calculator"></i>
    </button>

    <!-- 계산기 컴포넌트 -->
    <Calculator :visible="showCalculator" @close="showCalculator = false" />

    <!-- 등록 모달 (기존 RegisterEdit) -->
    <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />

    <!-- 수정 모달 (RegisterReEdit) --> 
    <!-- 여기서 isFixed 여부까지 'existingData'에 담아서 넘깁니다. -->
    <RegisterReEdit
      v-if="editModalOpen"
      :existingData="itemToEdit"
      @close="editModalOpen = false"
    />

    <!-- (새로운) 이벤트 액션 팝업: 수정/삭제 -->
    <transition name="fade">
      <div
        v-if="showActionMenu"
        class="action-overlay"
        @click.self="closeEventAction"
      >
        <div class="action-popup">
          <!-- 선택된 이벤트 정보 표시 -->
          <h5>{{ currentEvent?.description || '이벤트' }} 항목을 수정 및 삭제 할까요?</h5>
          <div class="action-buttons">
            <button class="edit-btn" @click="confirmEdit">수정</button>
            <button class="delete-btn" @click="confirmDelete">삭제</button>
          </div>
        </div>
      </div>
    </transition>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

import AppLayout from '../components/AppLayout.vue';
import RegisterEdit from '@/pages/Register_edit.vue';
import RegisterReEdit from './RegisterReEdit.vue';
import Calculator from './Calculator.vue';

/** --- 날짜 헬퍼 함수들 --- **/
function formatDateStr(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function addDays(dateObj, days) {
  const newDate = new Date(dateObj);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}
function addMonths(dateObj, months) {
  const newDate = new Date(dateObj);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * 주기(rotation)에 따라 startDate ~ endDate 사이의 모든 날짜(YYYY-MM-DD) 배열 생성
 */
function generateDatesBetween(startDateStr, endDateStr, rotation) {
  const result = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start) || isNaN(end)) return result;

  let current = new Date(start);
  while (current <= end) {
    result.push(formatDateStr(current));
    if (rotation === '매일') {
      current = addDays(current, 1);
    } else if (rotation === '매주') {
      current = addDays(current, 7);
    } else if (rotation === '매월') {
      current = addMonths(current, 1);
    } else {
      break;
    }
  }
  return result;
}

/** --- 전역 상태들 --- **/
const editModalOpen = ref(false); // RegisterReedit 모달 열림 여부
const itemToEdit = ref(null); // 수정할 항목 데이터

const currentYear = ref(2025);
const currentMonth = ref(4);

const events = ref([]); // 일반 이벤트
const fixedExpenses = ref([]); // 고정 이벤트

const previewDateStr = ref(null); // hover 미리보기
const eventFilter = ref('all'); // 'all', '수입', '지출', '이체'

const showCalculator = ref(false); // 계산기
const isModalOpen = ref(false); // RegisterEdit(등록용) 모달

/** (새로 추가) 이벤트 액션 팝업 관련 */
const showActionMenu = ref(false);
const currentEvent = ref(null); // 클릭한 이벤트(수정/삭제 대상)

let fetchInterval = null;

/** --- onMounted에서 데이터 fetch + interval 설정 --- **/
onMounted(() => {
  fetchEvents();
  fetchFixedExpenses();
  // 필요하다면 폴링 주기를 원하시는 ms로
  fetchInterval = setInterval(()=>{
    fetchEvents();
    fetchFixedExpenses();
  },100); 
});

onUnmounted(() => {
  if (fetchInterval) clearInterval(fetchInterval);
  fetchInterval=null;
});

/** 일반 트랜잭션 불러오기 */
async function fetchEvents() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;
    if (!userId) return;
    const res = await axios.get('http://localhost:3000/transactions', {
      params: { userId },
    });
    events.value = res.data;
  } catch (error) {
    console.error('이벤트 목록 오류:', error);
  }
}

/** 고정 항목 불러오기 */
async function fetchFixedExpenses() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;
    if (!userId) return;
    const res = await axios.get('http://localhost:3000/fixedExpenses', {
      params: { userId },
    });
    fixedExpenses.value = res.data;
  } catch (error) {
    console.error('고정 항목 목록 오류:', error);
  }
}

/** --- 계절 배경을 위한 computed --- */
const seasonClass = computed(() => {
  const month = currentMonth.value;
  if ([12, 1, 2].includes(month)) return 'winter-bg';
  if ([3, 4, 5].includes(month)) return 'spring-bg';
  if ([6, 7, 8].includes(month)) return 'summer-bg';
  if ([9, 10, 11].includes(month)) return 'autumn-bg';
  return '';
});

/** --- 고정 항목들을 실제 날짜별로 펼쳐서 리턴 --- */
const expandedFixedExpenses = computed(() => {
  const result = [];
  for (const fe of fixedExpenses.value) {
    const dates = generateDatesBetween(fe.date, fe.endDate, fe.rotation);
    for (const d of dates) {
      result.push({
        id: `fixed-${fe.id}-${d}`, // 고정 이벤트 id 구분
        date: d,
        amount: fe.amount,
        description: fe.description || '고정항목',
        type: fe.type, // "지출" or "수입"
        isFixed: true, // <--- 고정 항목임을 표시
        rotation: fe.rotation,
        endDate: fe.endDate,
      });
    }
  }
  return result;
});

/** 모든 이벤트(일반 + 고정) */
const allEvents = computed(() => {
  return [...events.value, ...expandedFixedExpenses.value];
});

/** --- 달력 계산 --- */
const formattedMonth = computed(() => {
  const m = String(currentMonth.value).padStart(2, '0');
  return `${currentYear.value}년 ${m}월`;
});
const dayNames = computed(() => ['일', '월', '화', '수', '목', '금', '토']);

const weeks = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value - 1, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value, 0);
  const lastDate = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const cells = [];
  // 이전 달 부분
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(
      currentYear.value,
      currentMonth.value - 1,
      1 - (startDay - i)
    );
    cells.push({
      dateObj: prevDate,
      dateStr: formatDateStr(prevDate),
      month: prevDate.getMonth() + 1,
    });
  }
  // 이번 달
  for (let d = 1; d <= lastDate; d++) {
    const dateObj = new Date(currentYear.value, currentMonth.value - 1, d);
    cells.push({
      dateObj,
      dateStr: formatDateStr(dateObj),
      month: currentMonth.value,
    });
  }
  // 다음 달
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear.value, currentMonth.value, i);
      cells.push({
        dateObj: nextDate,
        dateStr: formatDateStr(nextDate),
        month: nextDate.getMonth() + 1,
      });
    }
  }

  const result = [];
  for (let i = 0; i < cells.length; i += 7) {
    result.push(cells.slice(i, i + 7));
  }
  return result;
});

/** 현재 달에 속한 이벤트만 모아서 통계 */
const monthlyEvents = computed(() => {
  return allEvents.value.filter((ev) => {
    const [y, m] = ev.date.split('-');
    return Number(y) === currentYear.value && Number(m) === currentMonth.value;
  });
});

/** --- 통계 --- **/
const totalCount = computed(() => monthlyEvents.value.length);
const totalAmount = computed(() => {
  return monthlyEvents.value.reduce((acc, ev) => {
    if (ev.type === '수입') return acc + ev.amount;
    else return acc - ev.amount;
  }, 0);
});
const incomeSum = computed(() =>
  monthlyEvents.value
    .filter((ev) => ev.type === '수입')
    .reduce((acc, ev) => acc + ev.amount, 0)
);
const incomeCount = computed(
  () => monthlyEvents.value.filter((ev) => ev.type === '수입').length
);
const expenseSum = computed(() =>
  monthlyEvents.value
    .filter((ev) => ev.type === '지출')
    .reduce((acc, ev) => acc + ev.amount, 0)
);
const expenseCount = computed(
  () => monthlyEvents.value.filter((ev) => ev.type === '지출').length
);
const transferSum = computed(() =>
  monthlyEvents.value
    .filter((ev) => ev.type === '이체')
    .reduce((acc, ev) => acc + ev.amount, 0)
);
const transferCount = computed(
  () => monthlyEvents.value.filter((ev) => ev.type === '이체').length
);

/** --- methods --- **/
// hover 말풍선
function openPreview(dateStr) {
  previewDateStr.value = dateStr;
}
function closePreview() {
  previewDateStr.value = null;
}

// 필터 변경
function setFilter(type) {
  eventFilter.value = type;
}

// 특정 날짜의 이벤트(필터 적용)
function dayEvents(dateStr) {
  return allEvents.value.filter(
    (e) =>
      e.date === dateStr &&
      (eventFilter.value === 'all' || e.type === eventFilter.value)
  );
}

// 오늘인지 판별
function isToday(dateObj) {
  const today = new Date();
  return (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  );
}

// 달력 표시 금액
function formattedAmount(evt) {
  if (evt.type === '수입') return `+ ${evt.amount.toLocaleString()}`;
  if (evt.type === '지출' || evt.type === '이체')
    return `- ${evt.amount.toLocaleString()}`;
  return evt.amount.toLocaleString();
}

// 통화 포맷
function formatCurrency(value) {
  if (typeof value === 'number') return value.toLocaleString() + '원';
  return String(value);
}

// 특정 날짜 고정항목
function fixedExpensesForDay(dateStr) {
  return expandedFixedExpenses.value.filter((fe) => fe.date === dateStr);
}

// 달 이동
function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}
function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}
function resetToThisMonth() {
  const today = new Date();
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth() + 1;
}

/** (새) 이벤트 클릭 -> 오버레이에서 수정/삭제 보여주기 */
function openEventAction(ev) {
  currentEvent.value = ev;
  showActionMenu.value = true;
}
function closeEventAction() {
  showActionMenu.value = false;
  currentEvent.value = null;
}
function confirmEdit() {
  if (!currentEvent.value) return;
  // 수정 모달 열기
  editItem(currentEvent.value);
  closeEventAction();
}
function confirmDelete() {
  if (!currentEvent.value) return;
  deleteEvent(currentEvent.value.id);
  closeEventAction();
}

/** 삭제 로직 */
async function deleteEvent(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      if (typeof id === 'string' && id.startsWith('fixed-')) {
        // 고정 항목
        const realId = id.split('-')[1];
        await axios.delete(`http://localhost:3000/fixedExpenses/${realId}`);
        fetchFixedExpenses(); // 다시 불러오기
      } else {
        // 일반 트랜잭션
        await axios.delete(`http://localhost:3000/transactions/${id}`);
        events.value = events.value.filter((ev) => ev.id !== id);
      }
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 실패');
    }
  }
}

/** 수정 버튼 -> RegisterReEdit 모달 오픈 */
function editItem(event) {
  if (event.isFixed) {
    // 고정지출이면 복합 id("fixed-123-2025-04-10")에서 실제 id(여기서는 123)를 추출
    const realId = event.id.split('-')[1];
    // 실제 고정지출 API에서 요구하는 형태로 object를 구성합니다.
    itemToEdit.value = { ...event, id: realId };
  } else {
    itemToEdit.value = { ...event };
  }
  editModalOpen.value = true;
}
</script>

<style scoped>
/* (사용자 기존 스타일 그대로 복사) */
.calendar-container {
  width: 100%;
  margin: 0 auto;
}
.header {
  display: flex;
  flex-direction: column;
}
.summary {
  text-align: center;
  margin-top: 1rem;
  display: flex;
  justify-content: space-evenly;
}
.summary-item {
  font-weight: bold;
  margin: 0 0.5rem;
  cursor: pointer;
  padding-bottom: 4px;
}
.summary-item.total {
  color: #c62828;
}
.summary-item.income {
  color: blue;
}
.summary-item.expense {
  color: red;
}
.summary-item.transfer {
  color: green;
}
.summary-item.active {
  border-bottom: 3px solid currentColor;
}
.calendar {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  height: 100%;
}
.calendar th {
  background: #f2f2f2;
  font-weight: normal;
  padding: 0.5rem 0;
}
.calendar td {
  vertical-align: top;
  border: 1px solid #ddd;
  height: 120px;
  padding: 4px;
  position: relative;
}
.not-current-month {
  color: #ccc;
}
.sunday {
  color: red;
}
.saturday {
  color: blue;
}
.day-number {
  display: flex;
  margin-bottom: 4px;
  align-items: center;
}
.day-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  font-weight: bold;
  border-radius: 50%;
}
.day-badge.today-badge {
  background-color: black;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.event {
  font-size: 0.9rem;
  margin-right: 4px;
  display: inline-block;
  border-radius: 4px;
  padding: 0 2px;
}
.event.수입 {
  background-color: #9cc0cb7c;
  color: blue;
}
.event.지출 {
  background-color: rgba(255, 192, 225, 0.494);
  color: red;
}
.event.이체 {
  background-color: greenyellow;
  color: green;
}
.popup-bubble {
  color: black;
  position: absolute;
  top: 20px;
  left: 170px;
  width: 90%;
  background-color: ivory;
  border: 1px solid #ccc;
  padding: 4px;
  z-index: 999;
  font-size: 0.9rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.popup-bubble::before {
  content: '';
  position: absolute;
  top: 10px;
  left: -10px;
  border-width: 8px;
  border-style: solid;
  border-color: transparent #fff transparent transparent;
}
.popup-bubble::after {
  content: '';
  position: absolute;
  top: 10px;
  left: -12px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent #ddd transparent transparent;
  z-index: -1;
}
.popup-item {
  margin-bottom: 6px;
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
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.add-button:hover {
  background-color: #fdb3b3;
}
.calc-button {
  position: fixed;
  right: 30px;
  bottom: 100px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  color: black;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  background-color: white;
}
.calc-button:hover {
  background-color: #fdb3b3;
}
.pin-line {
  margin-left: 4px;
  font-size: 12px;
  color: #444;
}
.header.winter-bg {
  background: url('/src/assets/winter.jpg') center/cover no-repeat;
}
.header.spring-bg {
  background: url('src/assets/spring2.jpg') center/cover no-repeat;
}
.header.summer-bg {
  background: url('src/assets/summer2.png') center/cover no-repeat;
}
.header.autumn-bg {
  background: url('src/assets/fall2.jpg') center/cover no-repeat;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.action-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.action-popup {
  background-color: #fff;
  padding: 24px 50px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  text-align: center;
}
.action-buttons {
  margin: 16px 0;
  display: flex;
  justify-content: space-around;
}
.edit-btn {
  background-color: #ffc107;
  border: none;
  color: #000;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.edit-btn:hover {
  background-color: #e0a800;
}
.delete-btn {
  background-color: #dc3545;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.delete-btn:hover {
  background-color: #c82333;
}
</style>
