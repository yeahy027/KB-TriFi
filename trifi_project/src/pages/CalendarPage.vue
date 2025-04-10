<template>
  <AppLayout>
    <div class="calendar-container">
      <!-- 상단 헤더(월/년도, 통계 표시) -->
      <div class="header">
        <!-- 월 이동 버튼/월 표시 영역 -->
        <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
          <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">
            <i class="bi bi-chevron-left"></i>
          </button>
          <strong
            class="month-text mx-auto"
            style="cursor: pointer; font-size: xx-large;"
            @click="goToCalender"
          >
            {{ formattedYearMonth }}
          </strong>
          <button class="btn btn-outline-secondary btn-sm" @click="nextMonth">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button class="btn btn-outline-primary btn-sm" @click="resetToThisMonth">
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
            전체 ({{ totalCount }}건)<br />{{ formatCurrency(totalAmount) }}
          </div>
          <!-- 수입 -->
          <div
            class="summary-item income"
            :class="{ active: eventFilter === '수입' }"
            @click="setFilter('수입')"
          >
            💰 수입 ({{ incomeCount }}건)<br />{{ formatCurrency(incomeSum) }}
          </div>
          <!-- 지출 -->
          <div
            class="summary-item expense"
            :class="{ active: eventFilter === '지출' }"
            @click="setFilter('지출')"
          >
            💸 지출 ({{ expenseCount }}건)<br />{{ formatCurrency(expenseSum) }}
          </div>
          <!-- 이체 -->
          <div
            class="summary-item transfer"
            :class="{ active: eventFilter === '이체' }"
            @click="setFilter('이체')"
          >
            🏦 이체 ({{ transferCount }}건)<br />{{ formatCurrency(transferSum) }}
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
                saturday: day.dateObj.getDay() === 6
              }"
              @mouseenter="dayEvents(day.dateStr).length > 0 && openPreview(day.dateStr)"
              @mouseleave="closePreview"
            >
              <!-- 날짜 숫자 -->
              <div
  class="day-number"
  :class="{ 'today-badge': isToday(day.dateObj) }"
>
  {{ day.dateObj.getDate() }}

  <!-- (중요) 해당 날짜에 매칭되는 고정 항목 표시 -->
  <template
    v-for="(fexp, idx) in fixedExpensesForDay(day.dateStr)"
    :key="idx"
  >
    <span style="margin-left: 4px;">
      📌
      <!-- 수입이면 +, 지출이면 - 표시 -->
      <template v-if="fexp.type === '지출'">
        - {{ fexp.amount.toLocaleString() }}원
      </template>
      <template v-else-if="fexp.type === '수입'">
        + {{ fexp.amount.toLocaleString() }}원
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

              <!-- 해당 날짜의 이벤트들을 표시 -->
              <div
                v-for="(event, eIndex) in dayEvents(day.dateStr)"
                :key="eIndex"
                :class="['event', event.type]"
                style="display: block"
                @click.stop="onEventClick(event)"
              >
                <span :class="event.type">
                  {{ formattedAmount(event) }}원
                </span>
                <div
                  v-if="selectedEventId === event.id"
                  class="edit-delete-buttons"
                  style="background-color: #f2f2f2"
                >
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click.stop="deleteEvent(event.id)"
                    style="margin-right: 10px"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-warning btn-sm"
                    @click.stop="editEvent(event)"
                  >
                    수정
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 등록 폼 모달 (예시) -->
    </div>
    <button class="add-button" @click="isModalOpen = true">+</button>
    <button class="calc-button" @click="showCalculator = true">
      <i class="bi bi-calculator"></i>
    </button>

    <!-- 계산기 컴포넌트 -->
    <Calculator
      :visible="showCalculator"
      @close="showCalculator = false"
    ></Calculator>
    <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import RegisterEdit from '@/pages/Register_edit.vue';
import axios from 'axios';
import Calculator from './Calculator.vue';

defineOptions({ name: 'CalendarExample' });

/** YYYY-MM-DD 문자열 생성 */
function formatDateStr(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 날짜 더하기 유틸(일)
function addDays(dateObj, days) {
  const newDate = new Date(dateObj);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}
// 날짜 더하기 유틸(월)
function addMonths(dateObj, months) {
  const newDate = new Date(dateObj);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * startDate ~ endDate 사이 rotation(매일/매주/매월)에 따라
 * 모든 날짜 문자열(YYYY-MM-DD) 배열을 만들어 반환
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
      // 다른 값이면 중단
      break;
    }
  }
  return result;
}

// 달력에서 클릭된 이벤트 id
const selectedEventId = ref(null);

// 기본 연/월
const currentYear = ref(2025);
const currentMonth = ref(4);

// 일반 이벤트 목록
const events = ref([]);

// fixedExpenses(실제로는 고정 지출/수입 겸용)
const fixedExpenses = ref([]);

// 마우스 hover 중인 날짜
const previewDateStr = ref(null);

// 필터('all', '수입', '지출', '이체')
const eventFilter = ref('all');

// 모달 / 계산기
const showCalculator = ref(false);
const isModalOpen = ref(false);

// 주기적 폴링 타이머
let fetchInterval = null;

/** 서버에서 일반 트랜잭션 가져오기 */
async function fetchEvents() {
  try {
    const res = await axios.get('http://localhost:3000/transactions');
    events.value = res.data;
  } catch (error) {
    console.error('이벤트 목록 오류:', error);
  }
}

/** 서버에서 고정 지출/수입(fixedExpenses) 가져오기 */
async function fetchFixedExpenses() {
  try {
    const res = await axios.get('http://localhost:3000/fixedExpenses');
    fixedExpenses.value = res.data;
  } catch (error) {
    console.error('고정 항목 목록 오류:', error);
  }
}

/** onMounted 시점에 한번 실행 + 폴링 */
onMounted(() => {
  fetchAll();
  fetchInterval = setInterval(fetchAll, 5000);
});

function fetchAll() {
  fetchEvents();
  fetchFixedExpenses();
}

onUnmounted(() => {
  if (fetchInterval) clearInterval(fetchInterval);
});

/**
 * rotation에 따라 날짜별 이벤트로 펼쳐주는 computed
 *  fixedExpenses 배열에 있는 각 항목(fe)이
 *    - type: "수입" or "지출"
 *    - date, endDate, rotation: 주기
 *    - amount, description ...
 */
const expandedFixedExpenses = computed(() => {
  const result = [];
  for (const fe of fixedExpenses.value) {
    const dates = generateDatesBetween(fe.date, fe.endDate, fe.rotation);
    for (const d of dates) {
      result.push({
        id: `fixed-${fe.id}-${d}`,     // 중복 방지용
        date: d,
        amount: fe.amount,
        description: fe.description || '고정항목',
        type: fe.type,                // "지출" or "수입"
        isFixed: true,
      });
    }
  }
  return result;
});

/**
 * 최종적으로 달력에 표시할 모든 이벤트:
 *   1) 기존 transactions
 *   2) expandedFixedExpenses (고정항목)
 */
const allEvents = computed(() => {
  return [...events.value, ...expandedFixedExpenses.value];
});

/** --- 달력 계산 --- **/
// YYYY-MM 표시
const formattedYearMonth = computed(() => {
  const m = String(currentMonth.value).padStart(2, '0');
  return `${currentYear.value}년 ${m}월`;
});
// 요일 헤더
const dayNames = computed(() => ['일', '월', '화', '수', '목', '금', '토']);

// weeks: 달력용 2차원 배열
const weeks = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value - 1, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value, 0);
  const lastDate = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const cells = [];
  // 이전 달
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

  // 7칸씩 잘라서 주차 구성
  const result = [];
  for (let i = 0; i < cells.length; i += 7) {
    result.push(cells.slice(i, i + 7));
  }
  return result;
});

/** --- 현재 달에 속한 이벤트들 --- **/
const monthlyEvents = computed(() => {
  return allEvents.value.filter((ev) => {
    const [y, m] = ev.date.split('-');
    return Number(y) === currentYear.value && Number(m) === currentMonth.value;
  });
});

/** --- 통계 --- **/
// 전체 건수
const totalCount = computed(() => monthlyEvents.value.length);
// 총액(수입=+, 지출/이체=-)
const totalAmount = computed(() => {
  return monthlyEvents.value.reduce((acc, ev) => {
    if (ev.type === '수입') {
      return acc + ev.amount;
    } else {
      return acc - ev.amount;
    }
  }, 0);
});
// 수입
const incomeSum = computed(() => {
  return monthlyEvents.value
    .filter((ev) => ev.type === '수입')
    .reduce((acc, ev) => acc + ev.amount, 0);
});
const incomeCount = computed(
  () => monthlyEvents.value.filter((ev) => ev.type === '수입').length
);
// 지출
const expenseSum = computed(() => {
  return monthlyEvents.value
    .filter((ev) => ev.type === '지출')
    .reduce((acc, ev) => acc + ev.amount, 0);
});
const expenseCount = computed(
  () => monthlyEvents.value.filter((ev) => ev.type === '지출').length
);
// 이체
const transferSum = computed(() => {
  return monthlyEvents.value
    .filter((ev) => ev.type === '이체')
    .reduce((acc, ev) => acc + ev.amount, 0);
});
const transferCount = computed(
  () => monthlyEvents.value.filter((ev) => ev.type === '이체').length
);

/** --- methods --- **/
// hover 팝업
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

// 특정 날짜의 이벤트 (필터 반영)
function dayEvents(dateStr) {
  return allEvents.value.filter(
    (e) =>
      e.date === dateStr &&
      (eventFilter.value === 'all' || e.type === eventFilter.value)
  );
}

// 오늘 판별
function isToday(dateObj) {
  const today = new Date();
  return (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  );
}

/**
 * 달력 표시용 금액 포맷
 *  - 수입: + 붙여주기
 *  - 지출/이체: - 붙여주기
 */
function formattedAmount(evt) {
  if (evt.type === '수입') {
    return `+ ${evt.amount.toLocaleString()}`;
  } else if (evt.type === '지출' || evt.type === '이체') {
    return `- ${evt.amount.toLocaleString()}`;
  }
  return evt.amount.toLocaleString();
}

// 통화 포맷
function formatCurrency(value) {
  if (typeof value === 'number') {
    return value.toLocaleString() + '원';
  }
  return String(value);
}

// 특정 날짜의 (고정) 항목만 뽑기
function fixedExpensesForDay(dateStr) {
  return expandedFixedExpenses.value.filter((fe) => fe.date === dateStr);
}

// 이전 달
function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}
// 다음 달
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

// 이벤트 클릭 -> 열기/닫기
function onEventClick(event) {
  selectedEventId.value = selectedEventId.value === event.id ? null : event.id;
}

// 이벤트 삭제 (transactions에만 해당)
async function deleteEvent(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await axios.delete(`http://localhost:3000/transactions/${id}`);
      events.value = events.value.filter((ev) => ev.id !== id);
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 실패');
    }
  }
}

// 이벤트 수정
function editEvent(event) {
  alert(`"${event.description}" 수정하기 버튼 클릭됨!`);
}
</script>

<style scoped>
.calendar-container {
  width: 100%;
  margin: 0 auto;
  font-family: sans-serif;
}

/* 상단 헤더 */
.header {
  display: flex;
  flex-direction: column;
}

/* 통계/요약 (필터) */
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

/* 달력 테이블 */
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
  position: relative; /* 말풍선 절대배치용 */
}

/* 이전/다음 달 날짜 회색 처리 */
.not-current-month {
  color: #ccc;
}

/* 일요일(0), 토요일(6) */
.sunday {
  color: red;
}
.saturday {
  color: blue;
}

/* '오늘' 날짜 원형 표시 */
.day-number {
  font-weight: bold;
  margin-bottom: 4px;
}
.day-number.today-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: black;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* 이벤트 표시 */
.event {
  font-size: 0.9rem;
  margin-right: 4px;
  display: inline-block;
  border-radius: 4px;
  padding: 0 2px;
}
.event.수입 {
  background-color: #9cc0cb7c; /* 파란톤 */
  color: blue;
}
.event.지출 {
  background-color: rgba(255, 192, 225, 0.494); /* 핑크톤 */
  color: red;
}
.event.이체 {
  background-color: greenyellow;
  color: green;
}

/* 말풍선 팝업 (arrow left) */
.popup-bubble {
  color: black;
  position: absolute;
  top: 20px; /* 날짜 숫자 아래로 조금 띄움 */
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

/* + 버튼 (우측 하단 고정) */
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
}
.add-button:hover {
  background-color: #fdb3b3;
}
/* 계산기 버튼 */
.calc-button {
  position: fixed;
  right: 30px;
  bottom: 100px;
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
</style>
