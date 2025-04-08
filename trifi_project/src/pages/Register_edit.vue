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
            <input type="date" v-model="form.date" placeholder="날짜" />
            <input type="number" v-model="form.amount" placeholder="금액" />

            <select v-model="form.category" class="category-select">
              <option disabled value="">카테고리를 선택하세요</option>
              <option value="식비">🍔 식비</option>
              <option value="교통">🚗 교통</option>
              <option value="쇼핑">🛍 쇼핑</option>
              <option value="주거">🏠 주거</option>
              <option value="기타">🔖 기타</option>
            </select>

            <select v-model="form.paymentMethod" class="payment-select">
              <option disabled value="">방식을 선택하세요</option>
              <option value="현금">💵 현금</option>
              <option value="카드">💳 카드</option>
              <option value="계좌이체(은행)">🏦 계좌이체(은행)</option>
            </select>

            <input type="text" v-model="form.description" placeholder="내용" />

            <!-- ✅ 고정 여부 체크 -->
            <label class="fixed-checkbox">
              <input type="checkbox" v-model="form.fixed" />
              고정 수입/지출입니다
            </label>
          </div>
          <div class="form" v-else>
            <input type="date" v-model="form.date" placeholder="날짜" />
            <input type="number" v-model="form.from" placeholder="출금 금액" />
            <input type="number" v-model="form.to" placeholder="입금 금액" />
            <input type="text" v-model="form.memo" placeholder="메모" />
          </div>

          <button class="submit-btn" @click="submitForm">등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useCounterStore } from '@/stores/counter';
import axios from 'axios';

const emit = defineEmits(['close']);
const store = useCounterStore();

const activeTab = ref('수입');

const initialForm = () => ({
  date: '',
  amount: '',
  category: '',
  paymentMethod: '',
  description: '',
  fixed: false,
  from: '',
  to: '',
  memo: '',
});

const form = ref(initialForm());

// 탭 변경 시 form 초기화
watch(activeTab, () => {
  Object.assign(form.value, initialForm());
});

// 한글 → 서버용 영문 매핑
const typeMap = {
  수입: 'income',
  지출: 'expense',
};

const submitForm = async () => {
  const entry = {
    type: activeTab.value,
    date: form.value.date,
  };

  if (activeTab.value === '이체') {
    entry.from = Number(form.value.from);
    entry.to = Number(form.value.to);
    entry.memo = form.value.memo;
  } else {
    entry.userId = 1;
    entry.amount = Number(form.value.amount);
    entry.category = form.value.category;
    entry.payment = form.value.paymentMethod;
    entry.description = form.value.description;
    entry.fixed = form.value.fixed;
  }

  store.addTransaction(entry);

  try {
    const res = await axios.post('/api/transactions', entry);
    console.log('서버 응답:', res.data);
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
  background-color: rgba(240, 240, 240, 0.6);
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
