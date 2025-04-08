<!-- AppLayout.vue -->
<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <AppSidebar />

    <!-- 오른쪽 전체 -->
    <div class="flex-grow-1">
      <AppHeader />
      <main class="bg-light" style="padding-top: 64px; min-height: 100vh">
        <RouterView />
        <div class="container py-4">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
</script>
