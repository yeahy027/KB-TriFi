<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <button class="modal-close-btn" @click="emit('close')">×</button>
      <div class="register-container">
        <h2 class="title">등록</h2>
        <p class="subtitle">추가적으로 등록하고 싶으신 내역을 등록하세요</p>

        <!-- 탭: 이체는 제거 -->
        <div class="section-title">
          <span
            :class="{ selected: activeTab === '지출' }"
            @click="activeTab = '지출'"
            >지출</span
          >
          <span
            :class="{ selected: activeTab === '수입' }"
            @click="activeTab = '수입'"
            >수입</span
          >
          <span
            :class="{ selected: activeTab === '이체' }"
            @click="activeTab = '이체'"
            >이체</span
          >
        </div>

        <!-- 입력 폼 -->
        <div class="form-box">
          <div class="form" v-if="activeTab !== '이체'">
            <input
              type="date"
              v-model="form.date"
              @blur="markTouched"
              placeholder="날짜"
            />
            <p class="error-message" v-if="isTouched && !form.date">
              날짜를 입력하세요
            </p>

            <input
              type="text"
              :value="formattedAmount"
              @input="handleAmountInput($event.target.value)"
              @blur="markTouched"
              placeholder="금액"
              :class="{ 'input-error': isTouched && form.amount === '' }"
            />
            <p class="error-message" v-if="isTouched && !form.amount">
              금액을 입력하세요
            </p>

            <!-- ✅ 지출 탭일 때만 표시 -->
            <select
              v-if="activeTab === '지출'"
              v-model="form.category"
              class="category-select"
            >
              <option disabled value="">카테고리를 선택하세요</option>
              <option value="식비">🍔 식비</option>
              <option value="교통">🚗 교통</option>
              <option value="쇼핑">🛍 쇼핑</option>
              <option value="주거">🏠 주거</option>
              <option value="기타">💅 미용</option>
              <option value="기타">🎬 문화</option>
              <option value="기타">🏦 저축</option>
              <option value="기타">💰 급여</option>
              <option value="기타">💰 용돈</option>
              <option value="기타">🎁 선물</option>
              <option value="기타">💊 의료</option>
              <option value="기타">💡 공과금</option>
            </select>
            <p
              class="error-message"
              v-if="isTouched && activeTab === '지출' && !form.category"
            >
              카테고리를 선택하세요
            </p>

            <!-- 수입 카테고리 -->
            <select
              v-if="activeTab === '수입'"
              v-model="form.category"
              class="category-select"
              :class="{ 'input-error': isTouched && !form.category }"
            >
              <option disabled value="">카테고리를 선택하세요</option>
              <option value="급여">💰 급여</option>
              <option value="용돈">💸 용돈</option>
              <option value="기타">🪙 기타</option>
            </select>
            <p
              class="error-message"
              v-if="isTouched && activeTab === '수입' && !form.category"
            >
              카테고리를 선택하세요
            </p>
            <select v-model="form.paymentMethod" class="payment-select">
              <option disabled value="">방식을 선택하세요</option>
              <option value="현금">💵 현금</option>
              <option value="카드">💳 카드</option>
              <option value="페이">💰 페이(카카오,네이버 등)</option>
            </select>
            <p class="error-message" v-if="isTouched && !form.paymentMethod">
              방식을 선택하세요
            </p>

            <input type="text" v-model="form.description" placeholder="내용" />
            <p class="error-message" v-if="isTouched && !form.description">
              내용을 입력하세요
            </p>

            <!-- ✅ 고정 여부 체크 -->
            <label class="fixed-checkbox">
              <input type="checkbox" v-model="form.fixed" />
              고정 수입/지출입니다
            </label>

            <div v-if="form.fixed">
              <select v-model="form.period" class="category-select">
                <option disabled value="" hidden>📌 주기를 선택하세요</option>
                <option value="매일">📆 매일</option>
                <option value="매주">🗓 매주</option>
                <option value="매월">📅 매월</option>
              </select>
              <p class="error-message" v-if="isTouched && !form.period">
                주기를 선택하세요
              </p>

              <div class="recurring-date-wrapper">
                <label for="endDate">종료 날짜</label>
                <input
                  id="endDate"
                  type="date"
                  v-model="form.endDate"
                  class="recurring-date"
                />
                <p class="error-message" v-if="isTouched && !form.endDate">
                  종료 날짜를 입력하세요
                </p>
                <!-- 여기까지 -->
              </div>
            </div>
          </div>
          <div class="form" v-else>
            <input type="date" v-model="form.date" placeholder="날짜" />
            <p class="error-message" v-if="isTouched && !form.date">
              날짜를 입력하세요
            </p>

            <input
              type="text"
              :value="formattedFrom"
              @input="handleFromInput($event.target.value)"
              placeholder="출금 금액"
              :class="{ 'input-error': isTouched && !form.from }"
            />
            <p class="error-message" v-if="isTouched && !form.from">
              출금 금액을 입력하세요
            </p>

            <select v-model="form.category" class="category-select">
              <option disabled value="">카테고리를 선택하세요</option>
              <option value="식비">🍔 식비</option>
              <option value="교통">🚗 교통</option>
              <option value="쇼핑">🛍 쇼핑</option>
              <option value="주거">🏠 주거</option>
              <option value="기타">💅 미용</option>
              <option value="기타">🎬 문화</option>
              <option value="기타">🏦 저축</option>
              <option value="기타">💰 급여</option>
              <option value="기타">💰 용돈</option>
              <option value="기타">🎁 선물</option>
              <option value="기타">💊 의료</option>
              <option value="기타">💡 공과금</option>
            </select>
            <p class="error-message" v-if="isTouched && !form.category">
              카테고리를 선택하세요
            </p>

            <!-- <input type="text" v-model="form.description" placeholder="메모" /> -->
            <input
              type="text"
              placeholder="내용"
              v-model="form.description"
              :class="{ 'input-error': isTouched && !form.description }"
            />
            <p class="error-message" v-if="isTouched && !form.description">
              내용을 입력하세요
            </p>
          </div>

          <button
            class="submit-btn"
            :class="{ active: isFormValid }"
            :disabled="!isFormValid"
            @click="submitForm"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useCounterStore } from '@/stores/counter';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useRoute } from 'vue-router';

const emit = defineEmits(['close', 'update']);
const store = useCounterStore();
/* entry.userId = useUserStore.user.id; */
const userStore = useUserStore();
userStore.checkLocalStorage();
const activeTab = ref('수입');
const isTouched = ref(false);

const today = new Date().toISOString().split('T')[0];

const props = defineProps({
  checked: Boolean,
  onSubmitted: Function, // ✅ 부모에서 받아온 fetchEvents 함수
});

const initialForm = () => ({
  date: today,
  amount: '',
  category: '',
  paymentMethod: '',
  description: '',
  fixed: false,
  from: '',
  period: '',
  /*   to: '', */
  /* memo: '', */
});

//입력 시 isTouched를 true로 만드는 함수
const markTouched = () => {
  if (!isTouched.value) isTouched.value = true;
};
const form = ref(initialForm());
// 고정내역 추가하기로 넘어왔을 때 체크박스 체크되어있도록 수정
const route = useRoute();

/* const props = defineProps({
  onSubmitted: Function, // ✅ 부모에서 받아온 fetchEvents 함수
}); */

// 등록 가능 여부를 판단하는 computed
const isFormValid = computed(() => {
  if (activeTab.value === '이체') {
    return (
      form.value.date !== '' &&
      form.value.amount !== '' &&
      form.value.category !== '' &&
      form.value.description !== ''
    );
  }

  const baseValid =
    form.value.date !== '' &&
    form.value.amount !== '' &&
    form.value.paymentMethod !== '' &&
    form.value.description !== '';

  if (activeTab.value === '지출' || activeTab.value === '수입') {
    if (!form.value.category) return false;
  }

  if (form.value.fixed) {
    return baseValid && form.value.period && form.value.endDate;
  }

  return baseValid;
});

// 탭 변경 시 form 초기화
watch(activeTab, () => {
  Object.assign(form.value, initialForm());
  isTouched.value = false;

  //   // 고정 여부 쿼리 반영
  //   if (route.query.fixed === 'true') {
  //     form.value.fixed = true;
  //   }
});

onMounted(() => {
  form.value.fixed = props.checked;

  // 탭도 URL 쿼리로 제어하고 싶다면
  if (route.query.fixed === 'true') {
    activeTab.value = '지출'; // watch가 작동하면서 체크됨
  }
});
/* 숫자 칸 처리하는 방법 */
const handleAmountInput = (value) => {
  const numeric = value.replace(/[^\d]/g, '');
  form.value.amount = numeric;
};

const handleFromInput = (value) => {
  const numeric = value.replace(/[^\d]/g, '');
  form.value.from = numeric;
};

const formattedFrom = computed({
  get() {
    if (!form.value.from) return '';
    return Number(form.value.from).toLocaleString() + '원';
  },
  set(value) {
    const numeric = value.replace(/[^\d]/g, '');
    form.value.from = numeric;
  },
});

const formattedAmount = computed({
  get() {
    if (!form.value.amount) return '';
    return Number(form.value.amount).toLocaleString() + '원';
  },
  set(value) {
    const numeric = value.replace(/[^\d]/g, '');
    form.value.amount = numeric;
  },
});

/* const formattedTo = computed({
  get() {
    if (!form.value.to) return '';
    return Number(form.value.to).toLocaleString() + '원';
  },
  set(value) {
    const numeric = value.replace(/[^\d]/g, '');
    form.value.to = numeric;
  },
});
 */
// 한글 → 서버용 영문 매핑
const typeMap = {
  수입: 'income',
  지출: 'expense',
  이체: 'transfer',
};

const submitForm = async () => {
  isTouched.value = true;
  if (!isFormValid.value) {
    return;
  }
  const entry = {
    type: activeTab.value,
    date: form.value.date,
  };

  if (activeTab.value === 'transfer') {
    entry.from = Number(form.value.from);
    /* entry.to = Number(form.value.to); */
    /*  entry.memo = form.value.memo; */
    entry.description = form.value.description;
  } else {
    /* 현재 로그인한 사람의 정보*/
    entry.userId = userStore.user.id;
    entry.amount = Number(form.value.amount);
    entry.category = form.value.category;
    entry.payment = form.value.paymentMethod;
    entry.description = form.value.description;
    entry.fixed = form.value.fixed;

    if (form.value.fixed) {
      entry.period = form.value.period;
      entry.endDate = form.value.endDate;

      // ✅ fixedExpenses용 구조로 따로 구성
      const fixedEntry = {
        userId: entry.userId,
        type: entry.type,
        category: entry.category,
        // type: entry.type,
        amount: entry.amount,
        payment: entry.payment,
        description: entry.description,
        date: entry.date,
        rotation: form.value.period, // ✅ 'period'를 'rotation'으로 보냄
        endDate: form.value.endDate || null,
      };

      try {
        const res = await axios.post(
          'http://localhost:3000/fixedExpenses',
          fixedEntry
        );
        console.log('✅ 고정 항목 등록 완료:', res.data);
        // emit('fixedExpenseSaved', res.data);
      } catch (err) {
        console.error('❌ 고정 항목 전송 실패:', err);
      }

      emit('update');
      emit('close');
      return;
    }
  }

  store.addTransaction(entry);

  try {
    const res = await axios.post('http://localhost:3000/transactions', entry);
    console.log('서버 응답:', res.data);
    props.onSubmitted?.();
  } catch (err) {
    console.error('전송 실패:', err);
  }

  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(240, 240, 240, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90%;
  overflow-y: auto;
  position: relative;
  z-index: 1000;
}

.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  color: #888;
  z-index: 1001;
  transition: color 0.2s;
}
.modal-close-btn:hover {
  color: #000;
}

.register-container {
  max-width: 700px;
  margin: 40px auto;
  text-align: center;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}
.subtitle {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 30px;
}
.section-title {
  display: flex;
  justify-content: center;
  gap: 30px;
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #999;
}
.section-title span {
  cursor: pointer;
  position: relative;
}
.section-title .selected {
  color: black;
}
.section-title .selected::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: black;
  bottom: -5px;
  left: 0;
}
.form input,
.category-select,
.payment-select {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.fixed-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.95rem;
  color: #444;
  gap: 0px;
  white-space: nowrap;
  box-sizing: border-box;
  text-align: center;
}

.fixed-checkbox input {
  margin-right: 150px;
  accent-color: #666;
}

.submit-btn {
  margin-top: 20px;
  background-color: #ccc;
  border: none;
  padding: 10px 30px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.submit-btn.active {
  background-color: #9c9a9a;
  color: white;
  cursor: pointer;
}

/* 고정 지출 + 수입 -> 종료 날짜 */
.recurring-date-wrapper {
  width: 100%;
  max-width: 250px; /* ✅ 박스 너비를 줄입니다 */
  margin: 10px auto;
}

.recurring-date {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #000;
  border-radius: 5px;

  /* ✅ 텍스트 왼쪽 정렬 */
  text-align: left;

  /* ✅ 글꼴 크기 조정도 가능 */
  font-size: 0.95rem;
}
.category-select option[disabled] {
  color: #999;
}
.input-error {
  border: 2px solid #e63946 !important;
  background-color: #fff0f0 !important;
  box-shadow: 0 0 4px rgba(230, 57, 70, 0.3) !important;
  transition: all 0.2s ease-in-out;
}

.error-message {
  color: #e63946;
  font-size: 0.75rem;
  margin: 4px auto 10px;
  max-width: 400px;
  text-align: left;
}
</style>
