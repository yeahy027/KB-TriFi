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
          </div>
          <div class="comment">
            <p>가계부와 연동할 카드 연결</p>
          </div>
          <div class="card-box">
            <button class="slide-btn left" @click="prevCard"><</button>

            <!-- 여기부터 카드 추가 UI -->
            <div class="create-card">
              <div class="card-add-circle">
                <div class="plus-sign" @click="isCardFormOpen = true">+</div>
                <RegisterCard
                  v-if="isCardFormOpen"
                  @close="isCardFormOpen = false"
                />
              </div>
              <p class="instruction">위의 + 버튼을 눌러 카드를 등록해 주세요</p>
            </div>
            <!-- 여기까지 카드 추가 UI -->

            <button class="slide-btn right" @click="nextCard">></button>
          </div>
        </div>

        <!-- 고정지출 내역 -->
        <div class="expenses">
          <div class="section-title">
            <h3>고정 거래 내역</h3>
          </div>

          <div class="expense-buttons">
            <div
              v-for="item in fixedExpenses"
              :key="item.id"
              class="position-relative"
              style="width: 500px"
            >
              <!-- 드롭다운 메뉴 -->
              <div
                v-if="openMenuId === item.id"
                class="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow-sm"
                style="z-index: 100; min-width: 100px"
              >
                <div
                  class="px-2 py-1 text-dark"
                  style="cursor: pointer"
                  @click.stop="editItem(item)"
                  @mouseover="hover = true"
                  @mouseleave="hover = false"
                >
                  수정
                </div>
                <div
                  class="px-2 py-1 text-dark"
                  style="cursor: pointer"
                  @click="deleteFixedExpense(item.id)"
                >
                  삭제
                </div>
              </div>
              <button class="expense-btn" @click="toggleMenu(item.id)">
                {{ item.description }} &nbsp;&nbsp;
                {{ item.type === '수입' ? '+' : '-' }}{{ item.amount }}
                <RegisterReEdit
                  v-if="editModalOpen"
                  :existingData="itemToEdit"
                  @close="editModalOpen = false"
                  :checked="true"
                />
              </button>
            </div>
          </div>

          <!-- 모달로 고정지출 추가 -->
          <button class="plus-fixlist" @click="isModalOpen = true">
            고정 거래 내역 추가하기
          </button>
          <RegisterEdit
            v-if="isModalOpen"
            @close="isModalOpen = false"
            @update="fetchFixedExpenses"
            :checked="true"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue';
import RegisterEdit from '@/pages/Register_edit.vue';
import RegisterCard from './RegisterCard.vue';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import RegisterReEdit from './RegisterReEdit.vue';

const userStore = useUserStore();
const user = computed(() => userStore.user);
const router = useRouter();

// 모달 열고 닫기 상태
const isModalOpen = ref(false);
const isCardFormOpen = ref(false);

// 고정지출 목록
const fixedExpenses = ref([]);

onMounted(() => {
  userStore.checkLocalStorage();
  fetchFixedExpenses();
});

// 고정지출 목록 불러오기 함수
const fetchFixedExpenses = async () => {
  try {
    const res = await axios.get('/api/fixedExpenses');
    // 현재 유저 id에 맞는 고정지출만 필터링
    fixedExpenses.value = res.data.filter(
      (item) => item.userId === user.value.id
    );
  } catch (err) {
    console.error('고정지출 불러오기 실패:', err);
  }
};

// 회원 관련 함수
const handleLogout = () => {
  userStore.logoutUser();
  router.push('/');
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
    try {
      const userIdToDelete = user.value.id;

      const res_f = await axios.get(
        `/api/fixedExpenses?userId=${userIdToDelete}`
      );
      const res_t = await axios.get(
        `/api/transactions?userId=${userIdToDelete}`
      );

      await Promise.all(
        res_f.data.map((item) => axios.delete(`/api/fixedExpenses/${item.id}`))
      );
      await Promise.all(
        res_t.data.map((item) => axios.delete(`/api/transactions/${item.id}`))
      );

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
    } catch (err) {
      console.error('회원 탈퇴 중 에러 발생:', err);
      Swal.fire('오류', '회원 탈퇴 중 문제가 발생했습니다.', 'error');
    }
  }
};

// 카드 슬라이드
const prevCard = () => {
  console.log('이전 카드');
};

const nextCard = () => {
  console.log('다음 카드');
};

// test
const records = ref([]);
const itemToEdit = ref(null);
const editModalOpen = ref(false); // RegisterReedit 모달 열림 여부
const openMenuId = ref(null);

// function editItem(event) {
//   itemToEdit.value = event;
//   editModalOpen.value = true;
// }
function editItem(item) {
  itemToEdit.value = item;
  editModalOpen.value = true;
}
const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const fetchFixedExpensesPlus = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  if (!userId) return;

  const res = await axios.get('/api/fixedExpenses', {
    params: { userId },
  });
  fixedExpenses.value = res.data; // fixedExpenses는 ref로 선언해줘야 함
};
const deleteFixedExpense = async (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    await axios.delete(`/api/fixedExpenses/${id}`);
    fetchFixedExpensesPlus();
    openMenuId.value = null;
  }
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
  gap: 30px;
  padding: 20px;
  /* width: 550px; */
  height: 150px;
  background-color: white;
  border-radius: 10px;
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
  background-color: rgba(255, 182, 193, 0.886);
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
  padding-top: 50px;
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

.comment p {
  margin-left: 10px;
  opacity: 0.6;
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

/* 카드 추가 버튼 스타일 */
.create-card {
  /* background-color: #f9f9ec; */
  background-color: rgba(255, 182, 193, 0.5);

  width: 330px;
  height: 200px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

.card-add-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.plus-sign {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: #999;
  margin: 0;
}

.add-text {
  font-size: 14px;
  color: #666;
}

.instruction {
  font-size: 12px;
  color: #888;
  margin: 0;
}

/* 카드 입력 폼 모달 예시 */
.card-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.card-detail-content {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  min-width: 300px;
}

.close-btn {
  margin-top: 10px;
  background-color: #f4c542;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

/* 수정 */
.expense-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 55px;
  padding-bottom: 15px;
}

.expense-btn {
  /* background-color: rgba(244, 197, 66, 0.5); */
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

.expense-btn:hover,
.plus-fixlist:hover {
  background-color: rgba(255, 182, 193, 0.5);
}
</style>
