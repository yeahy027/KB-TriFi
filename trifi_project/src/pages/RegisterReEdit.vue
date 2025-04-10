<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <button class="modal-close-btn" @click="emit('close')">×</button>
      <div class="register-container">
        <!-- 수정 모드이면 "수정", 아니면 "등록" -->
        <h2 class="title">{{ isEditMode ? '수정' : '등록' }}</h2>
        <p class="subtitle">
          {{ isEditMode ? '수정하고 싶은 내역을 적어주세요' : '추가적으로 등록하실 내역을 입력하세요' }}
        </p>

        <!-- 탭: 지출, 수입, 이체 -->
        <div class="section-title">
          <span
            :class="{ selected: activeTab === '지출' }"
            @click="activeTab = '지출'"
          >지출</span>
          <span
            :class="{ selected: activeTab === '수입' }"
            @click="activeTab = '수입'"
          >수입</span>
          <span
            :class="{ selected: activeTab === '이체' }"
            @click="activeTab = '이체'"
          >이체</span>
        </div>

        <!-- 입력 폼 -->
        <div class="form-box">
          <!-- 수입/지출 폼 (이체가 아닐 경우) -->
          <div class="form" v-if="activeTab !== '이체'">
            <input type="date" v-model="form.date" placeholder="날짜" />

            <input
              type="text"
              :value="formattedAmount"
              @input="formattedAmount = $event.target.value"
              placeholder="금액"
            />

            <!-- 지출 탭일 때만 카테고리 선택 -->
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
            <select v-model="form.paymentMethod" class="payment-select">
              <option disabled value="">방식을 선택하세요</option>
              <option value="현금">💵 현금</option>
              <option value="카드">💳 카드</option>
              <option value="페이">💰 페이(카카오, 네이버 등)</option>
            </select>

            <input type="text" v-model="form.description" placeholder="내용" />

            <!-- 고정 여부 체크 (수정 모드에서 고정 항목이면 자동 체크) -->
            <label class="fixed-checkbox">
              <input type="checkbox" v-model="form.fixed" />
              고정 수입/지출입니다
            </label>

            <!-- 고정 항목일 경우 추가 항목: 주기 및 종료 날짜 -->
            <div v-if="form.fixed">
              <select v-model="form.rotation" class="category-select">
                <option disabled value="" hidden>📌 주기를 선택하세요</option>
                <option value="매일">📆 매일</option>
                <option value="매주">🗓 매주</option>
                <option value="매월">📅 매월</option>
              </select>
              <div class="recurring-date-wrapper">
                <label for="endDate">종료 날짜</label>
                <input
                  id="endDate"
                  type="date"
                  v-model="form.endDate"
                  class="recurring-date"
                />
              </div>
            </div>
          </div>

          <!-- 이체 폼 -->
          <div class="form" v-else>
            <input type="date" v-model="form.date" placeholder="날짜" />
            <input
              type="text"
              :value="formattedFrom"
              @input="formattedFrom = $event.target.value"
              placeholder="출금 금액"
            />
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
            <input type="text" v-model="form.description" placeholder="메모" />
          </div>

          <!-- 등록/수정 버튼 -->
          <button class="submit-btn" @click="submitForm">
            {{ isEditMode ? '수정' : '등록' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useRoute } from 'vue-router';

const emit = defineEmits(['close']);

// 수정 모드를 위한 기존 데이터 props (없으면 등록 모드)
const props = defineProps({
  existingData: {
    type: Object,
    default: null,
  },
});

const userStore = useUserStore();
userStore.checkLocalStorage();
const route = useRoute();

// 수정 모드 여부: 기존 데이터가 있으면 수정 모드
const isEditMode = computed(() => !!props.existingData);

// 현재 탭 (기본 '수입'; 수정 모드면 onMounted에서 재설정)
const activeTab = ref('수입');

// 오늘 날짜 (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// 폼 초기 상태
const initialForm = () => ({
  date: today,
  amount: '',
  category: '',
  paymentMethod: '',
  description: '',
  fixed: false,
  rotation: '',
  endDate: ''
});

// 실제 폼 데이터
const form = ref(initialForm());

// onMounted: 수정 모드일 경우 기존 데이터로 폼 채우기  
// 고정 항목의 경우 fixed 값이 없더라도 rotation(주기) 값이 있으면 고정으로 판단
onMounted(() => {
  if (isEditMode.value && props.existingData) {
    activeTab.value = props.existingData.type || '수입';
    form.value.date = props.existingData.date || today;
    form.value.description = props.existingData.description || '';
    form.value.category = props.existingData.category || '';
    form.value.paymentMethod = props.existingData.payment || '';

    // 만약 고정 항목이면 (props.existingData.fixed 가 true이거나 rotation 속성이 존재하면)
    if (props.existingData.fixed === true || props.existingData.rotation !== undefined) {
      form.value.fixed = true; // 체크박스가 기본 체크되도록 설정
      form.value.rotation = props.existingData.rotation || '';
      form.value.endDate = props.existingData.endDate || '';
    } else {
      form.value.fixed = false;
    }

    // 이체인 경우
    if (props.existingData.type === '이체') {
      form.value.from = String(props.existingData.from || '');
    } else {
      form.value.amount = String(props.existingData.amount || '');
    }
  } else {
    // 등록 모드: URL 쿼리 ?fixed=true인 경우 처리
    if (route.query.fixed === 'true') {
      activeTab.value = '지출';
      form.value.fixed = true;
    }
  }
});

// 통화 포맷 (수입/지출용)
const formattedAmount = computed({
  get() {
    if (!form.value.amount) return '';
    return Number(form.value.amount).toLocaleString() + '원';
  },
  set(value) {
    form.value.amount = value.replace(/[^\d]/g, '');
  },
});

// 이체 탭용 금액 포맷
const formattedFrom = computed({
  get() {
    if (!form.value.amount) return '';
    return Number(form.value.amount).toLocaleString() + '원';
  },
  set(value) {
    form.value.amount = value.replace(/[^\d]/g, '');
  },
});

/** 폼 전송 함수 (등록 / 수정) */
const submitForm = async () => {
  // ① 이체 탭 처리
  if (activeTab.value === '이체') {
    const entry = {
      type: '이체',
      date: form.value.date,
      category: form.value.category,
      description: form.value.description,
      amount: Number(form.value.amount),
      userId: userStore.user.id,
    };

    try {
      if (isEditMode.value && props.existingData) {
        await axios.patch(
          `/api/transactions/${props.existingData.id}`,
          entry
        );
        alert('이체 내역 수정되었습니다.');
      } else {
        await axios.post('/api/transactions', entry);
        alert('이체 등록 완료');
      }
    } catch (error) {
      console.error('이체 처리 오류:', error);
      alert('이체 처리 실패');
    }
    emit('close');
    return;
  }

  // ② 수입/지출 탭 처리
  const entry = {
    type: activeTab.value, // "수입" 또는 "지출"
    date: form.value.date,
    amount: Number(form.value.amount),
    category: form.value.category,
    payment: form.value.paymentMethod,
    description: form.value.description,
    fixed: form.value.fixed,
    userId: userStore.user.id,
  };

  // 고정 항목이면 추가 데이터
  if (form.value.fixed) {
    entry.rotation = form.value.rotation;
    entry.endDate = form.value.endDate || null;
  }

  // 수정 모드: 기존 데이터가 고정 항목이면 fixedExpenses, 아니면 transactions로 PATCH 요청
  if (isEditMode.value && props.existingData) {
    // 기존 데이터가 고정 항목인지 여부: fixed 값 true이거나 rotation(주기) 속성이 있다면 고정 항목으로 판단
    const wasFixed =
      props.existingData.fixed === true ||
      props.existingData.rotation !== undefined;

    try {
      if (wasFixed) {
        await axios.patch(
          `/api/fixedExpenses/${props.existingData.id}`,
          entry
        );
      } else {
        await axios.patch(
          `/api/transactions/${props.existingData.id}`,
          entry
        );
      }
      alert('수정 완료!');
    } catch (error) {
      console.error('수정 오류:', error);
      alert('수정 실패');
    }
    emit('close');
    return;
  }

  // 등록 모드
  if (form.value.fixed) {
    // 고정 항목 등록 (fixedExpenses 엔드포인트)
    const fixedEntry = {
      userId: entry.userId,
      type: entry.type,
      category: entry.category,
      amount: entry.amount,
      payment: entry.payment,
      description: entry.description,
      date: entry.date,
      rotation: form.value.rotation,
      endDate: entry.endDate,
    };
    try {
      await axios.post('/api/fixedExpenses', fixedEntry);
      alert('고정 항목 등록 완료');
    } catch (err) {
      console.error('고정 항목 등록 실패:', err);
      alert('고정 항목 등록 실패');
    }
  } else {
    // 일반 항목 등록 (transactions 엔드포인트)
    try {
      await axios.post('/api/transactions', entry);
      alert('등록 완료');
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 실패');
    }
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
}
.recurring-date-wrapper {
  width: 100%;
  max-width: 250px;
  margin: 10px auto;
}
.recurring-date {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #000;
  border-radius: 5px;
  text-align: left;
  font-size: 0.95rem;
}
.category-select option[disabled] {
  color: #999;
}
</style>
