<template>
  <!--  <AppLayout> -->
  <router-view />
  <!-- <h3 class="fw-bold">📄 가계부 페이지 본문입니다</h3> -->

  <!-- ✅ 여기에 버튼만 추가 -->
  <router-link to="/register" class="bottom-button">
    수입/지출 등록
  </router-link>
  <!-- </AppLayout> -->
</template>

<script setup>
import AppLayout from './components/AppLayout.vue';
</script>

<style scoped>
.bottom-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #6ded8f;
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s;
  z-index: 999;
}

.bottom-button:hover {
  background-color: #574fd6;
}
</style>
