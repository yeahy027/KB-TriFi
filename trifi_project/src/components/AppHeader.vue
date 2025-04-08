<!-- AppHeader.vue -->
<template>
  <header
    class="d-flex justify-content-between align-items-center px-4 border-bottom bg-white position-fixed"
    style="left: 240px; right: 0; height: 64px; top: 0; z-index: 1000"
  >
    <h6 class="fw-semibold m-0">내역</h6>
    <div class="d-flex align-items-center gap-3">
      <small class="text-muted">17분 후 만료</small>
      <button class="btn btn-light btn-sm">
        <i class="bi bi-arrow-clockwise"></i>
      </button>
      <button class="btn btn-light btn-sm rounded-circle">
        <i class="bi bi-person-circle"></i>
      </button>
    </div>
  </header>
</template>
