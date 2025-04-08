<!-- AppSidebar.vue -->
<template>
  <nav
    class="bg-white border-end vh-100 p-4 position-fixed"
    style="width: 240px"
  >
    <h5 class="text-danger fw-bold mb-4">머니키퍼</h5>
    <ul class="navbar-nav flex-column gap-2">
      <!-- <li class="nav-item">
        <RouterLink class="nav-link text-dark fw-semibold active" href="#"
          >캘린더</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link text-dark" to="#">내역</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link text-dark" href="#">통계</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link text-dark" href="#">챌린지</RouterLink>
      </li> -->
      <li class="nav-item">
        <RouterLink class="nav-link text-dark" to="/mypage"
          >마이페이지</RouterLink
        >
      </li>
    </ul>
  </nav>
</template>
