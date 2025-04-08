<template>
  <nav class="bg-white border-end vh-100 p-4 position-fixed" style="width: 240px;">
    <h5 class="text-danger fw-bold mb-4">머니키퍼</h5>
    <ul class="nav flex-column gap-2">
      <li><router-link class="nav-link text-dark fw-semibold" to="/home">캘린더</router-link></li>
      <li><router-link class="nav-link text-dark" to="/home/list">내역</router-link></li>
      <li><router-link class="nav-link text-dark" to="/home/stats">통계</router-link></li>
      <li><router-link class="nav-link text-dark" to="/home/goal">챌린지</router-link></li>
      <li><router-link class="nav-link text-dark" to="/homemypage">마이페이지</router-link></li>
    </ul>
  </nav>
</template>
