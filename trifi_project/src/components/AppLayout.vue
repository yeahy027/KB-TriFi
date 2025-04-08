<template>
  <div class="d-flex">
    <!-- 사이드바 -->
    <AppSidebar />
    <!-- <div class="main-content" style="margin-left: 240px;"> -->
      <!-- 오른쪽 전체 -->
      <div class="flex-grow-1">
        <AppHeader :page-title="pageTitle" />
        <main class="bg-light" style="padding-top: 64px; min-height: 100vh; margin-left: 240px;">
          <div class="container py-4">
            <slot />
          </div>
        </main>
      </div>
  </div>
</template>

<style scoped>
/* 사이드바가 고정되어 있으므로 main-content에 margin-left를 줘서 겹치지 않게 */
.main-content {
  margin-left: 240px; /* 사이드바 width만큼 여백 확보 */
}
</style>
  
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
const pageTitle = ref('')

onMounted(() => {
  pageTitle.value = route.meta.title || '기본 제목'
})
</script>
  