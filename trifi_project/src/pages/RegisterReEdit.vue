<template>
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <button class="modal-close-btn" @click="emit('close')">×</button>
        <div class="register-container">
          <!-- props.existingData가 있으면 "수정", 없으면 "등록" -->
          <h2 class="title">{{ isEditMode ? '수정' : '등록' }}</h2>
          <p class="subtitle">
            {{ isEditMode ? '수정하고싶은 내역을 적어주세요' : '추가적으로 등록하고 싶으신 내역을 등록하세요' }}
          </p>
  
          <!-- 탭: 이체도 포함 (기존 코드 그대로) -->
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
            <!-- 지출/수입 -->
            <div class="form" v-if="activeTab !== '이체'">
              <input type="date" v-model="form.date" placeholder="날짜" />
  
              <input
                type="text"
                :value="formattedAmount"
                @input="formattedAmount = $event.target.value"
                placeholder="금액"
              />
  
              <!-- 지출 탭일 때만 카테고리 -->
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
                <option value="페이">💰 페이(카카오,네이버 등)</option>
              </select>
  
              <input type="text" v-model="form.description" placeholder="내용" />
  
              <!-- 고정 여부 체크 -->
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
  
            <!-- 이체 탭 -->
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
  import { ref, watch, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { useCounterStore } from '@/stores/counter';
  import { useUserStore } from '@/stores/userStore';
  import { useRoute } from 'vue-router';
  
  const emit = defineEmits(['close']);
  
  // ❗ 수정 모드를 위해 기존 데이터 전체를 넘겨받는 props 추가
  const props = defineProps({
    existingData: {
      type: Object,
      default: null,
    },
  });
  
  const store = useCounterStore();
  const userStore = useUserStore();
  userStore.checkLocalStorage();
  
  const route = useRoute();
  
  // “등록 모드” vs “수정 모드” 판별
  const isEditMode = computed(() => !!props.existingData);
  
  // 현재 탭
  const activeTab = ref('수입');
  
  // 오늘 날짜 기본값
  const today = new Date().toISOString().split('T')[0];
  
  // 폼 초기 상태 함수
  const initialForm = () => ({
    date: today,
    amount: '',
    category: '',
    paymentMethod: '',
    description: '',
    fixed: false, // 고정 체크박스
    period: '',
    endDate: '',
    from: '', // 이체 때 출금
  });
  
  // 실제 폼 데이터
  const form = ref(initialForm());
  
  /** 1) 수정 모드라면, 넘어온 existingData로 form을 채워 넣기 */
  onMounted(() => {
    if (isEditMode.value && props.existingData) {
      // type에 따라 탭 설정
      activeTab.value = props.existingData.type || '수입';
  
      // 공통 폼
      form.value.date = props.existingData.date || today;
      form.value.description = props.existingData.description || '';
      form.value.category = props.existingData.category || '';
      form.value.paymentMethod = props.existingData.payment || '';
      
      // 수입/지출/이체별
      if (props.existingData.type === '이체') {
        // 이체면 'from' 값을 채워줌
        form.value.from = props.existingData.from
          ? String(props.existingData.from)
          : '';
      } else {
        // 수입/지출이면 'amount'
        form.value.amount = props.existingData.amount
          ? String(props.existingData.amount)
          : '';
        // 'fixed' 여부
        form.value.fixed = !!props.existingData.fixed;
        // period, endDate
        if (props.existingData.period) {
          form.value.period = props.existingData.period;
        }
        if (props.existingData.endDate) {
          form.value.endDate = props.existingData.endDate;
        }
      }
    } else {
      // 등록 모드 + URL 쿼리에 fixed=true가 들어온 경우만 체크
      if (route.query.fixed === 'true') {
        activeTab.value = '지출'; 
        form.value.fixed = true;
      }
    }
  });
  
  /** 통화 포맷(수입/지출) */
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
  
  /** 이체 탭에서 사용: 'from' 금액 */
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
  
  /** 폼 전송 함수: 등록 / 수정 */
  const submitForm = async () => {
    if (activeTab.value === '이체') {
      // 이체 폼 구성
      const entry = {
        type: '이체',
        date: form.value.date,
        category: form.value.category,
        description: form.value.description,
        from: Number(form.value.from),
        userId: userStore.user.id,
      };
  
      // 수정 vs 등록
      if (isEditMode.value && props.existingData) {
        // 기존 “이체” 데이터 수정
        try {
          await axios.patch(
            `http://localhost:3000/transactions/${props.existingData.id}`,
            entry
          );
          alert('이체 내역 수정되었습니다.');
        } catch (error) {
          console.error('이체 수정 오류:', error);
        }
      } else {
        // 새로 등록
        try {
          await axios.post('http://localhost:3000/transactions', entry);
          alert('이체 등록 완료');
        } catch (error) {
          console.error('이체 등록 오류:', error);
        }
      }
      emit('close');
      return;
    }
  
    /** 수입/지출 공통 구조 */
    const entry = {
      type: activeTab.value,
      date: form.value.date,
      amount: Number(form.value.amount),
      category: form.value.category,
      payment: form.value.paymentMethod,
      description: form.value.description,
      fixed: form.value.fixed,
      userId: userStore.user.id,
    };
  
    // 고정 항목인 경우에만 필요한 데이터
    if (form.value.fixed) {
      entry.period = form.value.period;
      entry.endDate = form.value.endDate || null;
    }
  
    /** 수정 모드 && 원래 fixed냐 아니냐를 판별 */
    if (isEditMode.value && props.existingData) {
      // 원래 고정 항목이었으면 => /fixedExpenses
      // 원래 일반 항목이면 => /transactions
      const wasFixed = !!props.existingData.fixed;
  
      try {
        if (wasFixed) {
          // 기존 고정항목 수정
          await axios.patch(
            `http://localhost:3000/fixedExpenses/${props.existingData.id}`,
            entry
          );
        } else {
          // 기존 일반항목 수정
          await axios.patch(
            `http://localhost:3000/transactions/${props.existingData.id}`,
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
  
    /** 등록 모드 */
    if (form.value.fixed) {
      // 고정 항목 등록
      const fixedEntry = {
        userId: entry.userId,
        type: entry.type, // "지출" or "수입"
        category: entry.category,
        amount: entry.amount,
        payment: entry.payment,
        description: entry.description,
        date: entry.date,
        rotation: form.value.period, // "매일" / "매주" / "매월"
        endDate: entry.endDate,
      };
      try {
        await axios.post('http://localhost:3000/fixedExpenses', fixedEntry);
        alert('고정 항목 등록 완료');
      } catch (err) {
        console.error('고정 항목 전송 실패:', err);
        alert('고정 항목 등록 실패');
      }
    } else {
      // 일반 항목 등록
      try {
        await axios.post('http://localhost:3000/transactions', entry);
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
  </style>
  
  <!-- 사용할 부분에 추가해야 할 코드 <template>
    <div>
      <button @click="isModalOpen = true">+ 등록</button>
      <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />
    </div>
  </template>
  <script setup>
  import { ref } from 'vue'
  import RegisterEdit from '@/pages/Register_edit.vue'
  const isModalOpen = ref(false)
  </script> -->
  