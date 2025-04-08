<template>
  <nav class="bg-white border-end vh-100 p-4 position-fixed " style="width: 240px;">
    <h5 class="text-danger fw-bold mb-4">Money Keeper</h5>
    <ul class="nav flex-column gap-2">
      <li v-for="item in menuItems" :key="item.to">
        <router-link
          class="nav-link custom-link"
          :to="item.to"
          active-class="active-link"
        >
          {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const menuItems = [
  { label: '캘린더', to: '/home' },
  { label: '내역', to: '/list' },
  { label: '통계', to: '/stat' },
  { label: '챌린지', to: '/goal' },
  { label: '마이페이지', to: '/mypage' },
]
</script>

<style scoped>
.nav-link.custom-link {
  color: black;
  font-weight: normal;
  padding: 10px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link.custom-link:hover {
  background-color: #f0f0f0;
}

.nav-link.custom-link.active-link {
  background-color: #f5f5f5;
  font-weight: bold;
  color: black;
}
</style>