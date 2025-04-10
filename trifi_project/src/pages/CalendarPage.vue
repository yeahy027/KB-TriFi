<template>
  <AppLayout>
    <div class="calendar-container">
      <!-- 상단 헤더(월/년도, 통계 표시) -->
      <div class="header">
        <!-- 월 이동 버튼/월 표시 영역 -->
        <!-- 월 선택 및 날짜 -->
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
              <!-- 날짜 표시 (오늘이면 today-badge 클래스 추가) -->
              <div
                class="day-number"
                :class="{ 'today-badge': isToday(day.dateObj) }"
              >
                {{ day.dateObj.getDate() }}

                <!-- (신규) 해당 날짜에 고정소비가 있다면: 압정 + -XXX원 표시 -->
                <template v-for="(fexp, idx) in fixedExpensesForDay(day.dateStr)" :key="idx">
                  <span style="margin-left: 4px;">
                    📌 - {{ fexp.amount.toLocaleString() }}원
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

      <!-- 모달로 등록 폼 열기 -->
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

// 날짜 더하기 유틸 (일수)
function addDays(dateObj, days) {
  const newDate = new Date(dateObj);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}
// 날짜 더하기 유틸 (개월)
function addMonths(dateObj, months) {
  const newDate = new Date(dateObj);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * startDate ~ endDate 까지 rotation(매일/매주/매월)에 따라
 * 날짜 리스트 생성해주는 함수
 */
function generateDatesBetween(startDateStr, endDateStr, rotation) {
  const result = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start) || isNaN(end)) return result; // 날짜가 이상한 경우

  let current = new Date(start);

  while (current <= end) {
    // 리스트에 넣기
    result.push(formatDateStr(current));

    // 회전 주기에 따라 날짜를 추가
    if (rotation === '매일') {
      current = addDays(current, 1);
    } else if (rotation === '매주') {
      current = addDays(current, 7);
    } else if (rotation === '매월') {
      // 매월의 경우, start일과 같은 '일(day)'로 한 달씩 증가
      const dayOfMonth = start.getDate();
      current = addMonths(current, 1);
      // 만약 dayOfMonth가 현재 달에 없으면 (예: 1월31일 +1개월 = 2월28일?)
      // 그 상태 그대로 진행(기본 JS Date 규칙에 따름)
      // 필요시 추가 보정 가능
    } else {
      // 혹시 다른 값이면 break
      break;
    }
  }
  return result;
}

// 가장 상단 setup 내에 선언
const selectedEventId = ref(null);

// 원하는 기본 연/월
const currentYear = ref(2025);
const currentMonth = ref(4);

// 서버에서 가져올 일반 이벤트 목록 (transactions)
const events = ref([]);

// (신규) 서버에서 가져올 고정 지출 목록 (fixedExpenses)
const fixedExpenses = ref([]);

// hover 중인 날짜(미리보기 팝업을 띄울 날짜)
const previewDateStr = ref(null);

// 필터 상태 ('all', '수입', '지출', '이체')
const eventFilter = ref('all');

// 계산기 열림
const showCalculator = ref(false);

// 모달 열림 여부
const isModalOpen = ref(false);

// 주기적으로 폴링할 타이머
let fetchInterval = null;

/** 서버에서 이벤트 목록 가져오는 함수 **/
async function fetchEvents() {
  try {
    const res = await axios.get('http://localhost:3000/transactions');
    events.value = res.data; // db.json의 transactions 배열
  } catch (error) {
    console.error('이벤트 목록을 가져오는 중 오류 발생:', error);
  }
}

/** (신규) 서버에서 fixedExpenses 목록 가져오기 **/
async function fetchFixedExpenses() {
  try {
    const res = await axios.get('http://localhost:3000/fixedExpenses');
    fixedExpenses.value = res.data;
  } catch (error) {
    console.error('고정 지출 목록을 가져오는 중 오류 발생:', error);
  }
}

/** onMounted에서 첫 로딩 + 주기적 폴링 **/
onMounted(() => {
  // 첫 로딩
  fetchEvents();
  fetchFixedExpenses();
  // 예시: 5초 간격으로 폴링
  fetchInterval = setInterval(() => {
    fetchEvents();
    fetchFixedExpenses();
  }, 5000);
});

onUnmounted(() => {
  if (fetchInterval) {
    clearInterval(fetchInterval);
  }
});

/**
 * (중요)
 *  fixedExpenses를 rotation에 맞춰 날짜별로 "실제 지출 이벤트"처럼 펼쳐내는 computed
 */
const expandedFixedExpenses = computed(() => {
  const result = [];
  for (const fe of fixedExpenses.value) {
    // fe가 { id, amount, date, endDate, rotation, ... } 형태라고 가정
    // date ~ endDate 사이 모든 날짜를 구해서 각각 "지출" 이벤트로 취급
    const dates = generateDatesBetween(fe.date, fe.endDate, fe.rotation);
    for (const d of dates) {
      result.push({
        // 고정 지출임을 구분하기 위해 id를 임의로 구성
        id: `fixed-${fe.id}-${d}`,
        date: d,
        amount: fe.amount,
        description: fe.description || '고정지출',
        type: '지출', // 고정 지출은 무조건 지출
        isFixed: true, // 나중에 필요하다면 구분자
      });
    }
  }
  return result;
});

/**
 * (중요)
 *  기존 events + expandedFixedExpenses 를 합쳐서 실제 달력에 표시할 "allEvents"
 */
const allEvents = computed(() => {
  return [...events.value, ...expandedFixedExpenses.value];
});

/** --- 달력 관련 --- **/
// YYYY-MM 표시
const formattedYearMonth = computed(() => {
  const m = String(currentMonth.value).padStart(2, '0');
  return `${currentYear.value}년 ${m}월`;
});

// 요일 헤더
const dayNames = computed(() => ['일', '월', '화', '수', '목', '금', '토']);

// 달력 주차 계산
const weeks = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value - 1, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value, 0);
  const lastDate = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const cells = [];
  // 이전 달(빈칸)
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
  // 다음 달(빈칸)
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
  // 7일씩 잘라 weeks 배열
  const result = [];
  for (let i = 0; i < cells.length; i += 7) {
    result.push(cells.slice(i, i + 7));
  }
  return result;
});

/** --- "월별"에 해당하는 events 필터링 --- **/
const monthlyEvents = computed(() => {
  return allEvents.value.filter((ev) => {
    const [y, m] = ev.date.split('-');
    return Number(y) === currentYear.value && Number(m) === currentMonth.value;
  });
});

/** --- 월별 통계 --- **/
// 전체 건수
const totalCount = computed(() => monthlyEvents.value.length);

// 수입이면 +, 지출/이체면 - 처리하여 합산
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
const incomeCount = computed(() => {
  return monthlyEvents.value.filter((ev) => ev.type === '수입').length;
});
// 지출
const expenseSum = computed(() => {
  return monthlyEvents.value
    .filter((ev) => ev.type === '지출')
    .reduce((acc, ev) => acc + ev.amount, 0);
});
const expenseCount = computed(() => {
  return monthlyEvents.value.filter((ev) => ev.type === '지출').length;
});
// 이체
const transferSum = computed(() => {
  return monthlyEvents.value
    .filter((ev) => ev.type === '이체')
    .reduce((acc, ev) => acc + ev.amount, 0);
});
const transferCount = computed(() => {
  return monthlyEvents.value.filter((ev) => ev.type === '이체').length;
});

/** --- methods --- **/
// hover 시 팝업 열기/닫기
function openPreview(dateStr) {
  previewDateStr.value = dateStr;
}
function closePreview() {
  previewDateStr.value = null;
}

// 클릭 시 필터 변경
function setFilter(type) {
  eventFilter.value = type;
}

/**
 *  (수정)
 *  해당 날짜의 이벤트들
 *  (fixedExpenses 포함해서 allEvents에서 뽑는다.)
 */
function dayEvents(dateStr) {
  return allEvents.value.filter(
    (e) =>
      e.date === dateStr &&
      (eventFilter.value === 'all' || e.type === eventFilter.value)
  );
}

/** 
 * (추가)
 *  캘린더 날짜 숫자 옆에 표시할 "고정 지출"들만 간단히 필터 
 *   - 이미 expandedFixedExpenses.value에 포함되어 있지만,
 *     이왕이면 "그 날짜의, isFixed===true"인 항목만 골라서 표시
 */
function fixedExpensesForDay(dateStr) {
  return expandedFixedExpenses.value.filter((fe) => fe.date === dateStr);
}

// 오늘 날짜 판별
function isToday(dateObj) {
  const today = new Date();
  return (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  );
}

/**
 *  (중요) 캘린더에 표시될 이벤트 금액 포맷팅
 *   - 수입: + 붙여주기
 *   - 지출/이체: - 붙여주기
 *   - 3자리 콤마 처리(toLocaleString())
 */
function formattedAmount(evt) {
  if (evt.type === '수입') {
    return `+ ${evt.amount.toLocaleString()}`;
  } else if (evt.type === '지출' || evt.type === '이체') {
    return `- ${evt.amount.toLocaleString()}`;
  }
  return evt.amount.toLocaleString();
}

// 통화 포맷 (통계 부분에 사용) -> 3자리 콤마 + "원"
function formatCurrency(value) {
  if (typeof value === 'number') {
    return value.toLocaleString() + '원';
  }
  return String(value);
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
  currentMonth.value = today.getMonth() + 1; // JS에서 month는 0부터 시작하므로 +1
}

// 이벤트 클릭 시 선택/해제
function onEventClick(event) {
  // 같은 이벤트를 두 번 클릭하면 닫히도록 (토글)
  selectedEventId.value = selectedEventId.value === event.id ? null : event.id;
}

// 이벤트 삭제
async function deleteEvent(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await axios.delete(`http://localhost:3000/transactions/${id}`);
      // 삭제 후 local events 배열에서 제외
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
  // 원하는 로직
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
.calc-button {
  position: fixed;
  right: 30px;
  bottom: 100px; /* +버튼 위쪽으로 배치 */
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
