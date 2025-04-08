<template>
  <header class="d-flex justify-content-between align-items-center px-4 border-bottom bg-white position-fixed"
          style="left: 240px; right: 0; height: 64px; top: 0; z-index: 1000;">
    <h6 class="fw-semibold m-0">{{ pageTitle }}</h6>
    <div class="d-flex align-items-center gap-3">
      <small class="text-muted">{{ timeLeft }} 후 만료</small>
      <button class="btn btn-light btn-sm"><i class="bi bi-arrow-clockwise"></i></button>
      <button class="btn btn-light btn-sm rounded-circle"><i class="bi bi-person-circle"></i></button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

// 페이지 타이틀 매핑
const pageTitleMap = {
  '/home': '캘린더',
  '/list': '내역',
  '/stat': '통계 분석 페이지',
  '/goal': '챌린지',
  '/mypage': '마이페이지',
}
const pageTitle = ref(pageTitleMap[route.path] || '페이지')

// 남은 시간 표시
const timeLeft = ref('60분')
let timer = null

// 로그인 시간 가져오기 또는 저장
const getOrSetLoginTime = () => {
  const saved = localStorage.getItem('loginTime')
  if (saved) return new Date(saved)

  const now = new Date()
  localStorage.setItem('loginTime', now.toISOString())
  return now
}

// 남은 시간 계산 및 로그아웃 처리 함수
const updateRemainingTime = (loginTime) => {
  const now = new Date()
  const elapsed = Math.floor((now - loginTime) / 1000)
  const remaining = 3600 - elapsed

  if (remaining <= 0) {
    timeLeft.value = '세션 만료됨'
    clearInterval(timer)

    // 로그아웃 처리
    localStorage.removeItem('user')
    localStorage.removeItem('loginTime')

    Swal.fire({
      title: '세션이 만료되었습니다',
      text: '다시 로그인해주세요.',
      icon: 'warning',
      confirmButtonText: '확인'
    }).then(() => {
      router.push('/')
    })

    return
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  timeLeft.value = `${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  const loginTime = getOrSetLoginTime()

  // 👉 최초 1회 즉시 실행
  updateRemainingTime(loginTime)

  // 이후 1초마다 남은 시간 업데이트
  timer = setInterval(() => {
    updateRemainingTime(loginTime)
  }, 1000)
})

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
  clearInterval(timer)
})
</script>
