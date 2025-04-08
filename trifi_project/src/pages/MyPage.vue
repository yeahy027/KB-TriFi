<!-- MyPage.vue -->
<template>
  <div class="my-page">
    <div class="header">
      <h1>My Page</h1>
    </div>

    <!-- 유저 정보 섹션 -->
    <div class="account-section">
      <div class="account-left">
        <img class="basic-img" src="../basic-img.png" alt="User profile" />
        <div class="user-info">
          <h2>{{ user.nickName }}</h2>
          <p>{{ user.email }}</p>
          <!-- <h2>TriFi</h2>
          <p>TriFi</p> -->
        </div>
      </div>
      <div class="account-buttons">
        <router-link to="/editprofile">
          <button class="yellow-btn">회원정보 수정 ></button>
        </router-link>
        <button class="yellow-btn">로그아웃 ></button>
        <button class="yellow-btn">회원탈퇴 ></button>
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
          <div class="card">
            <p class="brand">cloudcash</p>
            <p class="number">5789 •••• •••• 2847</p>
            <div class="card-footer">
              <span>Mike Smith</span>
              <span>06/21</span>
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
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore(); // Pinia store 가져오기
const user = userStore.user; // 최신 user 데이터
</script>

<style scoped>
.my-page {
  padding-left: 270px;
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
  /* padding: 12px; */

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

  /* background: #e0f0ff;
  padding: 24px;
  border-radius: 16px; */
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
  /* padding: 12px; */
  cursor: pointer;
  font-size: 24px;
  z-index: 1;
  width: 40px; /* 버튼 크기 조정 */
  height: 40px; /* 버튼 높이 조정 */
  display: flex;
  justify-content: center;
  align-items: center; /* 버튼 안의 아이콘을 중앙 정렬 */
  top: 50%;
}

.left {
  position: absolute;
  left: 20px; /* 좌측 버튼 위치 */
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
