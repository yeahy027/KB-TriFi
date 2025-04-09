<template>
  <AppLayout>
    <div class="my-page">
      <div class="header">
        <h1>My Page</h1>
      </div>

      <!-- 유저 정보 섹션 -->
      <div class="account-section">
        <div class="account-left">
          <img class="basic-img" src="../basic-img.png" alt="User profile" />
          <div class="user-info">
            <h2>{{ user.nickname }}</h2>
            <p>{{ user.email }}</p>
          </div>
        </div>
        <div class="account-buttons">
          <router-link to="/editprofile">
            <button class="yellow-btn">회원정보 수정 ></button>
          </router-link>
          <button class="yellow-btn" @click="handleLogout">로그아웃 ></button>
          <button class="yellow-btn" @click="handleDeleteAccount">
            회원탈퇴 >
          </button>
        </div>
      </div>

      <!-- 카드 + 고정지출 내역 -->
      <div class="content">
        <!-- 카드 섹션 -->
        <div class="cards">
          <div class="section-title">
            <h3>Cards</h3>
            <button class="plus-card" @click="addCard">+</button>
          </div>
          <div class="card-box">
            <button class="slide-btn left" @click="prevCard"><</button>

            <!-- 카드 반복 출력 -->
            <div v-for="(card, index) in cards" :key="card.id" class="card">
              <p class="brand">{{ card.name }}</p>
              <p class="number">{{ card.number }}</p>
              <div class="card-footer">
                <span>{{ card.cardholder_name }}</span>
                <span>{{ card.expiry_date }}</span>
              </div>
            </div>

            <button class="slide-btn right" @click="nextCard">></button>
          </div>
        </div>

        <!-- 고정지출 섹션 -->
        <div class="expenses">
          <div class="section-title">
            <h3>고정지출 내역</h3>
            <button class="plus-fixlist" @click="addFixList">+</button>
          </div>
          <ul class="expense-list">
            <li>교통비</li>
            <li>핸드폰 요금</li>
            <li>애플뮤직</li>
            <li>월세</li>
          </ul>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const userStore = useUserStore(); // Pinia store 가져오기
const user = computed(() => userStore.user); // 최신 user 데이터
const router = useRouter();
const cards = ref([]); // 카드 데이터를 저장할 변수

onMounted(() => {
  userStore.checkLocalStorage();
  fetchCards(); // 카드 정보 불러오기
});

// 카드 정보 가져오기
const fetchCards = async () => {
  try {
    const response = await axios.get('/api/cards'); // API 요청 (db.json에서 카드 데이터 불러오기)
    cards.value = response.data.cards; // 카드 데이터를 상태에 저장
  } catch (error) {
    console.error('카드 정보 불러오기 실패:', error);
    alert('카드 정보를 불러오는 데 실패했습니다.');
  }
};

const handleLogout = () => {
  userStore.logoutUser();
  // 예: 로그인 페이지로 이동
  router.push('/');
};

const handleDeleteAccount = () => {
  if (confirm('정말로 탈퇴하시겠습니까?')) {
    userStore.deleteUser(() => {
      alert('회원 탈퇴가 완료되었습니다.');
      router.push('/'); // 홈이나 로그인 페이지 등으로 이동
    });
  }
};

// 카드를 추가하는 함수 (나중에 추가 기능을 위해 만들 수 있음)
const addCard = () => {
  console.log('카드 추가');
};

// 카드 슬라이드 기능
const prevCard = () => {
  console.log('이전 카드');
};

const nextCard = () => {
  console.log('다음 카드');
};

// 고정지출 목록 추가
const addFixList = () => {
  console.log('고정지출 목록 추가');
};
</script>

<style scoped>
.my-page {
  padding-left: 20px;
  padding-top: 20px;
  font-family: 'Arial', sans-serif;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 4px;
}
.subtitle {
  color: gray;
  font-size: 14px;
  margin-bottom: 32px;
}

.account-section {
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
}

.account-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.basic-img {
  width: 66px;
  height: 66px;
  border-radius: 50%;
}

.user-info h2 {
  margin: 0;
  font-size: 20px;
}

.user-info p {
  margin: 4px 0 0;
  color: gray;
}

.account-buttons {
  display: flex;
  gap: 12px;
  margin-top: 15px;
  margin-left: 80px;
}

.yellow-btn {
  background-color: #f4c542;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}

.content {
  display: flex;
  gap: 32px;
}

.cards,
.expenses {
  flex: 1;
}

.cards {
  position: relative;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title h3 {
  margin: 0;
}

.plus-card,
.plus-fixlist {
  border: none;
  border-radius: 30%;
  font-size: 24px;
  cursor: pointer;
  color: #f4c542;
  font-weight: bold;
  margin-right: 50px;
}

.card-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  padding-top: 20px;
}

.card {
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  color: white;
  border-radius: 16px;
  padding: 20px;
  min-width: 300px;
  min-height: 200px;
  margin-right: 30px;
  margin-top: 5px;
}

.slide-btn {
  color: navy;
  border: none;
  border-radius: 30%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 24px;
  z-index: 1;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
}

.left {
  position: absolute;
  left: 20px;
}

.right {
  position: absolute;
  right: 50px;
}

.card .brand {
  font-weight: bold;
  margin-bottom: 10px;
}

.card .number {
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.expense-list {
  list-style: none;
  padding: 0;
  font-weight: bold;
  padding-top: 10px;
}
.expense-list li {
  padding-top: 10px;
  margin-bottom: 8px;
}
</style>
