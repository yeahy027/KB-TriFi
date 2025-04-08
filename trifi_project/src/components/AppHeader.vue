<template>
  <header
    class="d-flex justify-content-between align-items-center px-4 border-bottom bg-white "
    style="left: 240px; right: 0; height: 64px; top: 0; z-index: 1000; position: fixed;"
  >
    <h6 class="fw-semibold m-0">{{  }}</h6>
    <div class="d-flex align-items-center gap-3">
      <small class="text-muted">{{ formattedTime }} 후 만료</small>
      <button class="btn btn-light btn-sm" @click="resetTimer">
        <i class="bi bi-arrow-clockwise"></i>
      </button>
      <button class="btn btn-light btn-sm rounded-circle">
        <i class="bi bi-person-circle"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const totalTime = 30 * 60 // 30분 = 1800초
const timeLeft = ref(totalTime)
let timer = null

const startCountdown = () => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const resetTimer = () => {
  clearInterval(timer)
  timeLeft.value = totalTime
  startCountdown()
}

onMounted(() => {
  startCountdown()
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  return `${minutes}분`
})
</script>
<style>

</style>