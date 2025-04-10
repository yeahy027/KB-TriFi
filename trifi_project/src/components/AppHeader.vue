<template>
  <header
    class="d-flex justify-content-between align-items-center px-4 border-bottom bg-white position-fixed"
    style="left: 240px; right: 0; height: 64px; top: 0; z-index: 1000"
  >
    <h6 class="fw-semibold m-0">{{ pageTitle }}</h6>
    <div class="d-flex align-items-center gap-3">
      <small class="text-muted">{{ timeLeft }} 후 만료</small>
      <button class="btn btn-light btn-sm" @click="resetTimer">
        <i class="bi bi-arrow-clockwise"></i>
      </button>
      <router-link to="/mypage">
        <button class="btn btn-light btn-sm rounded-circle">
          <i class="bi bi-person-circle"></i>
        </button>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();

// 페이지 타이틀 매핑
const pageTitleMap = {
  '/home': '캘린더',
  '/list': '내역',
  '/stat': '통계 분석 페이지',
  '/goal': '챌린지',
  '/mypage': '마이페이지',
};
const pageTitle = ref(pageTitleMap[route.path] || '페이지');

// 남은 시간 표시
const timeLeft = ref('60분');
let timer = null;

/**
 * 1. 로그인 시간(getOrSetLoginTime):
 *    - 로컬 스토리지에서 loginTime이 있으면 파싱하여 반환
 *    - 없으면 현재 시간을 저장하고 반환
 */
const getOrSetLoginTime = () => {
  const saved = localStorage.getItem('loginTime');
  if (saved) {
    return new Date(saved);
  } else {
    const now = new Date();
    localStorage.setItem('loginTime', now.toISOString());
    return now;
  }
};

/**
 * 2. 남은 시간 계산(updateRemainingTime):
 *    - 매번 localStorage에 있는 loginTime을 가져와서 계산
 *    - 세션 만료 시 로그아웃 처리
 */
const updateRemainingTime = () => {
  // 매번 최신 loginTime 가져오기
  const saved = localStorage.getItem('loginTime');
  let loginTime;
  if (saved) {
    loginTime = new Date(saved);
  } else {
    // 저장된 값이 없으면(비정상적 상황) 지금 시각으로 세팅
    loginTime = new Date();
    localStorage.setItem('loginTime', loginTime.toISOString());
  }

  // 경과 시간
  const now = new Date();
  const elapsed = Math.floor((now - loginTime) / 1000);
  const remaining = 3600 - elapsed;

  if (remaining <= 0) {
    timeLeft.value = '세션 만료됨';
    clearInterval(timer);

    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');

    Swal.fire({
      title: '세션이 만료되었습니다',
      text: '다시 로그인해주세요.',
      icon: 'warning',
      confirmButtonText: '확인',
    }).then(() => {
      router.push('/');
    });

    return;
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  timeLeft.value = `${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`;
};

/**
 * 3. 타이머 리셋(resetTimer):
 *    - 현재 시각을 localStorage에 다시 저장하여 60분 카운트다운을 재시작
 */
const resetTimer = () => {
  const now = new Date();
  localStorage.setItem('loginTime', now.toISOString());
  updateRemainingTime(); // 즉시 갱신
};

/**
 * 4. 컴포넌트 마운트 시(onMounted):
 *    - 최초 로그인 시간을 가져오거나 세팅
 *    - 남은 시간 즉시 업데이트
 *    - 이후 1초 간격으로 updateRemainingTime 실행
 */
onMounted(() => {
  // 최초 loginTime이 없으면 새로 세팅
  getOrSetLoginTime();

  // 즉시 1회 업데이트
  updateRemainingTime();

  // 1초마다 갱신
  timer = setInterval(() => {
    updateRemainingTime();
  }, 1000);
});

/**
 * 5. 언마운트 시(onUnmounted):
 *    - timer 정리
 */
onUnmounted(() => {
  clearInterval(timer);
});
const Mypage = () => {
  router.push(`/mypage`);
};
</script>
