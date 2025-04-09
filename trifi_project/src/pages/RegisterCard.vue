<template>
    <!-- 오버레이 클릭 시 @click.self="emit('close')" -> 바깥 누르면 닫힘 -->
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <!-- 닫기 버튼 -->
        <button class="modal-close-btn" @click="emit('close')">×</button>
  
        <!-- 카드등록 폼 -->
        <div class="card-register-container">
          <h2 class="title">카드 등록</h2>
          <p class="subtitle">
            카드 정보를 입력해주세요.
          </p>
  
          <!-- 예: 카드번호 -->
          <div class="form-group">
            <label>카드번호</label>
            <div class="card-input-row">
              <input v-model="card1" maxlength="4" placeholder="0000" />
              <input v-model="card2" maxlength="4" placeholder="0000" />
              <input v-model="card3" maxlength="4" placeholder="0000" />
              <input v-model="card4" maxlength="4" placeholder="0000" />
            </div>
          </div>
  
          <!-- 예: 유효기간 -->
          <div class="form-group">
            <label>유효기간 (MM/YY)</label>
            <div class="exp-input-row">
              <input v-model="expMonth" maxlength="2" placeholder="MM" />
              <span>/</span>
              <input v-model="expYear" maxlength="2" placeholder="YY" />
            </div>
          </div>
  
          <!-- 예: CVC -->
          <div class="form-group">
            <label>CVC</label>
            <input v-model="cvc" maxlength="3" type="password" placeholder="3자리" />
          </div>
  
          <!-- 예: 비밀번호 앞 2자리 -->
          <div class="form-group">
            <label>비밀번호 (앞 2자리)</label>
            <input v-model="pw2" maxlength="2" type="password" placeholder="**" />
          </div>
  
          <!-- 약관동의 -->
          <div class="form-group check-group">
            <input type="checkbox" id="agree" v-model="isAgree" />
            <label for="agree" class="label-check">
              간편결제 등록 정보제공 동의
            </label>
          </div>
  
          <!-- 버튼 -->
          <div class="button-row">
            <button class="gray-btn" @click="emit('close')">
              다음에 하기
            </button>
            <button class="blue-btn" :disabled="!isAgree" @click="submitCard">
              등록하기
            </button>
          </div>
        </div>
        <!-- // card-register-container -->
      </div>
      <!-- // modal-content -->
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const emit = defineEmits(['close']);
  
  // 카드정보 입력 상태
  const card1 = ref('');
  const card2 = ref('');
  const card3 = ref('');
  const card4 = ref('');
  const expMonth = ref('');
  const expYear = ref('');
  const cvc = ref('');
  const pw2 = ref('');
  const isAgree = ref(false);
  
  function submitCard() {
    if (!isAgree.value) {
      alert('약관에 동의해주세요');
      return;
    }
    // 실제 등록 로직 (axios 등)
    const cardData = {
      cardNumber: `${card1.value}-${card2.value}-${card3.value}-${card4.value}`,
      expMonth: expMonth.value,
      expYear: expYear.value,
      cvc: cvc.value,
      pw2: pw2.value,
    };
    console.log('카드등록 데이터:', cardData);
  
    alert('카드 등록 완료!');
    emit('close');
  }
  </script>
  
  <style scoped>
  /* --- 모달 오버레이(배경 블러) --- */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(240, 240, 240, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    backdrop-filter: blur(2px); /* 배경 흐리게 처리 */
  }
  
  /* --- 모달 컨텐츠 박스 --- */
  .modal-content {
    background: #fff;
    border-radius: 16px;
    padding: 30px;
    width: 90%;
    max-width: 400px;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    z-index: 1000;
  }
  
  /* 닫기 버튼 */
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
  
  /* 폼 컨테이너 */
  .card-register-container {
    text-align: center;
  }
  
  .title {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
    text-align: left;
  }
  
  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  /* 카드번호 등 가로로 배치 */
  .card-input-row,
  .exp-input-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .card-input-row input,
  .exp-input-row input {
    width: 60px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
    text-align: center;
  }
  
  /* 체크박스 */
  .check-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .label-check {
    font-size: 0.9rem;
    color: #333;
  }
  
  /* 버튼 배치 */
  .button-row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  .gray-btn,
  .blue-btn {
    flex: 1;
    margin: 0 4px;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    color: white;
    font-weight: bold;
  }
  .gray-btn {
    background-color: #aaa;
  }
  .blue-btn {
    background-color: #253a82;
  }
  .blue-btn:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
  </style>
  