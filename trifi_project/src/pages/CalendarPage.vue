<template>
    <AppLayout>
    <div class="calendar-container">
        <!-- 상단 헤더(월/년도, 통계 표시) -->
        <div class="header">
        <!-- 월 이동 버튼/월 표시 영역 -->
        <div class="month-nav">
            <button
            @click="prevMonth"
            class="btn btn-light btn-sm border-0 bg-transparent p-0"
            >
            <i class="bi bi-arrow-left-circle fs-3"></i>
            </button>
            <span>{{ formattedYearMonth }}</span>
            <button
            @click="nextMonth"
            class="btn btn-light btn-sm border-0 bg-transparent p-0"
            >
            <i class="bi bi-arrow-right-circle fs-3"></i>
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
            :class="{ active: eventFilter === 'income' }"
            @click="setFilter('income')"
            >
            수입 ({{ incomeCount }}건)<br />{{ formatCurrency(incomeSum) }}
            </div>
            <!-- 지출 -->
            <div
            class="summary-item expense"
            :class="{ active: eventFilter === 'expense' }"
            @click="setFilter('expense')"
            >
            지출 ({{ expenseCount }}건)<br />{{ formatCurrency(expenseSum) }}
            </div>
            <!-- 이체 -->
            <div
            class="summary-item transfer"
            :class="{ active: eventFilter === 'transfer' }"
            @click="setFilter('transfer')"
            >
            이체 ({{ transferCount }}건)<br />{{ formatCurrency(transferSum) }}
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
                'sunday': day.dateObj.getDay() === 0,
                'saturday': day.dateObj.getDay() === 6
                }"
            >
                <!-- 날짜 표시 (오늘이면 today-badge 클래스 추가) -->
                <div
                class="day-number"
                :class="{ 'today-badge': isToday(day.dateObj) }"
                >
                {{ day.dateObj.getDate() }}
                </div>

                <!-- 해당 날짜의 이벤트들을 표시 -->
                <div
                v-for="(event, eIndex) in dayEvents(day.dateStr)"
                :key="eIndex"
                :class="['event', event.type]"
                >
                <span :class="event.type">{{ formatCurrency(event.amount) }}</span>
                </div>
            </td>
            </tr>
        </tbody>
        </table>

        <!-- 우측 하단에 + 버튼 -->
        <button class="add-button" @click="addNewEvent">+</button>
    </div>
    </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AppLayout from '../components/AppLayout.vue'
import axios from 'axios';

defineOptions({ name: 'CalendarExample' });

/** YYYY-MM-DD 문자열 생성 */
function formatDateStr(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// 원하는 기본 연/월
const currentYear = ref(2025);
const currentMonth = ref(4);

// 이벤트 목록 (초기에는 빈 배열)
const events = ref([]);

// 필터 상태 ('all', 'income', 'expense', 'transfer')
const eventFilter = ref('all');

// 주기적으로 폴링할 타이머 아이디
let fetchInterval = null;

/** 서버에서 이벤트 목록 가져오는 함수 **/
async function fetchEvents() {
    try {
    const res = await axios.get('http://localhost:3000/events');
    events.value = res.data; // db.json의 events 배열을 받아옴
    } catch (error) {
    console.error('이벤트 목록을 가져오는 중 오류 발생:', error);
    }
}

/** onMounted에서 첫 로딩 + 주기적 폴링 설정 **/
onMounted(() => {
    // 1) 마운트 시 즉시 로딩
    fetchEvents();

    // 2) 예시: 5초 간격으로 다시 fetchEvents() 호출
    fetchInterval = setInterval(() => {
    fetchEvents();
    });
});

/** onUnmounted에서 타이머 해제 **/
onUnmounted(() => {
    if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
    }
});

/** computed **/

// YYYY-MM 표시
const formattedYearMonth = computed(() => {
    const m = String(currentMonth.value).padStart(2, '0');
    return `${currentYear.value}-${m}`;
});

// 요일 헤더
const dayNames = computed(() => ['일', '월', '화', '수', '목', '금', '토']);

// 달력 주차 계산
const weeks = computed(() => {
    const firstDayOfMonth = new Date(currentYear.value, currentMonth.value - 1, 1);
    const lastDayOfMonth = new Date(currentYear.value, currentMonth.value, 0);
    const lastDate = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay();

    const calendarCells = [];

    // 이전 달(빈칸) 채우기
    for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(
        currentYear.value,
        currentMonth.value - 1,
        1 - (startDay - i)
    );
    calendarCells.push({
        dateObj: prevDate,
        dateStr: formatDateStr(prevDate),
        month: prevDate.getMonth() + 1,
    });
    }

    // 이번 달
    for (let d = 1; d <= lastDate; d++) {
    const dateObj = new Date(currentYear.value, currentMonth.value - 1, d);
    calendarCells.push({
        dateObj,
        dateStr: formatDateStr(dateObj),
        month: currentMonth.value,
    });
    }

    // 다음 달(빈칸) 채우기
    const remaining = 7 - (calendarCells.length % 7);
    if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(
        currentYear.value,
        currentMonth.value,
        i
        );
        calendarCells.push({
        dateObj: nextDate,
        dateStr: formatDateStr(nextDate),
        month: nextDate.getMonth() + 1,
        });
    }
    }

    // 7일 단위로 잘라 weeks 배열
    const result = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
    result.push(calendarCells.slice(i, i + 7));
    }
    return result;
});

/** 통계 계산 **/
const totalCount = computed(() => events.value.length);

// income => +, expense/transfer => - 로 합산
const totalAmount = computed(() => {
    return events.value.reduce((acc, ev) => {
    if (ev.type === 'income') {
        return acc + ev.amount;
    } else if (ev.type === 'expense' || ev.type === 'transfer') {
        return acc - ev.amount;
    }
    return acc;
    }, 0);
});

const incomeSum = computed(() =>
    events.value
    .filter(ev => ev.type === 'income')
    .reduce((acc, ev) => acc + ev.amount, 0)
);
const incomeCount = computed(() =>
    events.value.filter(ev => ev.type === 'income').length
);

const expenseSum = computed(() =>
    events.value
    .filter(ev => ev.type === 'expense')
    .reduce((acc, ev) => acc + ev.amount, 0)
);
const expenseCount = computed(() =>
    events.value.filter(ev => ev.type === 'expense').length
);

const transferSum = computed(() =>
    events.value
    .filter(ev => ev.type === 'transfer')
    .reduce((acc, ev) => acc + ev.amount, 0)
);
const transferCount = computed(() =>
    events.value.filter(ev => ev.type === 'transfer').length
);

/** methods **/

// 클릭 시 필터 변경
function setFilter(type) {
    eventFilter.value = type;
}

// 해당 날짜의 이벤트 (현재 필터가 'all'이거나 타입이 일치해야 표시)
function dayEvents(dateStr) {
    return events.value.filter(
    e =>
        e.date === dateStr &&
        (eventFilter.value === 'all' || e.type === eventFilter.value)
    );
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

// 통화 포맷
function formatCurrency(value) {
    return value.toLocaleString() + '원';
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

// + 버튼 클릭 시 -> 새 이벤트 POST 예시
async function addNewEvent() {
    // 실제로는 사용자 입력/모달 등을 통해 date, type, amount 등을 받아온 뒤 처리
    const newEvent = {
    date: '2025-04-10',
    type: 'income',
    amount: 999999,
    };

    try {
    const res = await axios.post('http://localhost:3000/events', newEvent);
    // 응답받은 객체(자동 부여된 id 포함)를 events 배열에 푸시
    events.value.push(res.data);
    alert('새 이벤트가 등록되었습니다!');
    } catch (error) {
    console.error('새 이벤트 등록 오류:', error);
    alert('등록 실패');
    }
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

/* 월 이동 버튼/월 표시 */
.month-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

/* 통계/요약 (필터) */
.summary {
    text-align: center;
    margin-top: 1rem;
    display: flex;
    justify-content: space-evenly;
}

/* 개별 항목(전체, 수입, 지출, 이체) */
.summary-item {
    font-weight: bold;
    margin: 0 0.5rem;
    cursor: pointer; /* 클릭 가능 */
    padding-bottom: 4px; /* 밑줄 공간 확보 */
}
.summary-item.total {
    color: #c62828; /* 빨간색 */
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
/* 활성화(필터 선택) 상태 */
.summary-item.active {
    border-bottom: 3px solid currentColor; /* 글자색과 동일한 색으로 밑줄 */
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
    height: 130px;
    padding: 4px;
    position: relative;
}

/* 이전/다음 달 날짜 회색 처리 */
.not-current-month {
    color: #ccc;
}

/* 일요일(0), 토요일(6) */
.sunday {
    color: red !important;
}
.saturday {
    color: blue !important;
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
    background-color: darkgrey; /* 원하는 배경색(파랑/남색 등) */
    color: #fff;
}

/* 이벤트 표시 */
.event {
    font-size: 0.9rem;
}
.event.income {
    color: blue;
}
.event.expense {
    color: red;
}
.event.transfer {
    color: green;
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
</style>
