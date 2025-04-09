<template>
  <AppLayout>
    <div class="my-page">
      <div class="header">
        <h1>My Page</h1>
      </div>

      <!-- 유저 정보 섹션 -->
      <div class="account-section">
        <div class="account-left">
          <img
            class="basic-img"
            src="../assets/basic-img.png"
            alt="User profile"
          />

          <div class="user-info">
            <h2>{{ user.nickname }}</h2>
            <p>{{ user.email }}</p>
            <div class="account-buttons">
              <router-link to="/editprofile">
                <button class="yellow-btn">회원정보 수정 ></button>
              </router-link>
              <button class="yellow-btn" @click="handleLogout">
                로그아웃 >
              </button>
              <button class="yellow-btn" @click="handleDeleteAccount">
                회원탈퇴 >
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 카드 + 고정지출 내역 -->
      <div class="content">
        <!-- 카드 섹션 -->
        <div class="cards">
          <div class="section-title">
            <h3>Cards</h3>
            <!-- <button class="plus-card" @click="addCard">+</button> -->
          </div>
          <div class="card-box">
            <button class="slide-btn left" @click="prevCard"><</button>

            <div class="create-card">
              <div class="create-text">
                <div style="color: #e3fc87; font-size: 18px">
                  카드를 추가하세요
                </div>
                <button class="plus-card" @click="waitPlease">+</button>
              </div>
            </div>

            <button class="slide-btn right" @click="nextCard">></button>
          </div>
        </div>

        <!-- 고정지출 내역 -->
        <div class="expenses">
          <div class="section-title">
            <h3>고정지출 내역</h3>
          </div>
          <div class="expense-buttons">
            <button
              class="expense-btn"
              v-for="item in fixedExpenses"
              :key="item.id"
            >
              {{ item.description }} &nbsp; - &nbsp; {{ item.date }}
            </button>
          </div>

          <!-- 모달로 고정지출 추가 -->
          <button class="plus-fixlist" @click="isModalOpen = true">
            고정지출 추가하기
          </button>
          <RegisterEdit v-if="isModalOpen" @close="isModalOpen = false" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue';
import RegisterEdit from '@/pages/Register_edit.vue';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';

const userStore = useUserStore(); // Pinia store 가져오기
const user = computed(() => userStore.user); // 최신 user 데이터
const router = useRouter();
const fixedExpenses = ref([]);

onMounted(async () => {
  try {
    const res = await axios.get('/api/fixedExpenses'); // db.json에서 고정지출 가져오기
    fixedExpenses.value = res.data.filter(
      (item) => item.userId === user.value.id
    );
  } catch (err) {
    console.error('고정지출 불러오기 실패:', err);
  }
});

onMounted(() => {
  userStore.checkLocalStorage();
});

const handleLogout = () => {
  userStore.logoutUser();
  router.push('/');
};

const waitPlease = () => {
  Swal.fire({
    title: '점검 중',
    text: '점검 중입니다.',
    icon: 'info',
  });
};

const handleDeleteAccount = async () => {
  const result = await Swal.fire({
    title: '회원 탈퇴 여부 확인',
    text: '정말로 탈퇴하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: '예',
    cancelButtonText: '아니오',
  });

  if (result.isConfirmed) {
    userStore.deleteUser(() => {
      Swal.fire({
        title: '회원 탈퇴',
        text: '회원 탈퇴가 완료되었습니다.',
        icon: 'success',
        confirmButtonText: '확인',
        customClass: {
          title: 'fw-bold',
          confirmButton: 'btn btn-success',
        },
      });
      router.push('/');
    });
  }
};

// 카드 슬라이드 기능
const prevCard = () => {
  console.log('이전 카드');
};

const nextCard = () => {
  console.log('다음 카드');
};

// 모달 열림 여부
const isModalOpen = ref(false);
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
  width: 100px;
  height: 100px;
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

.plus-card {
  border: none;
  border-radius: 30%;
  font-size: 24px;
  cursor: pointer;
  color: #f4c542;
  font-weight: bold;
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-fixlist {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  width: 500px;
  height: 50px;
  padding-left: 20px;
}

.card-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  padding-top: 20px;
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
  right: 20px;
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

.create-card {
  background-color: #253a82;
  width: 330px;
  height: 200px;
  border-radius: 16px;
  display: flex;
  align-items: center; /* 세로축 중앙 */
  justify-content: center; /* 가로축 중앙 */
}

.create-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  width: 200px;
  height: 100px;
}

/* 수정 */
.expense-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 5px;
  padding-bottom: 15px;
}

.expense-btn {
  background-color: rgba(244, 197, 66, 0.5);
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  padding-left: 20px;
  font-weight: bold;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  transition: background-color 0.2s;
  width: 500px;
}

.expense-btn:hover {
  background-color: #e5b832;
}
</style>
