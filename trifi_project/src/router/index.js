import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/LoginPage.vue';
import Swal from 'sweetalert2'; // ✅ SweetAlert2 import
import { useUserStore } from '@/stores/userStore'; // ✅ Pinia store 사용

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 오타 수정 BASE_UR → BASE_URL
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
    },
    {
      path: '/stat',
      name: 'stat',
      component: () => import('../pages/StatsPage.vue'),
    },
    {
      path: '/home',
      name: 'calender',
      component: () => import('../pages/CalendarPage.vue'),
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('../pages/ListPage.vue'),
    },
    {
      path: '/challenge',
      name: 'challenge',
      component: () => import('../pages/ChallengePage.vue'),
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: () => import('../pages/MyPage.vue'),
    },
    {
      path: '/registeredit',
      name: 'RegisterEdit',
      component: () => import('../pages/Register_edit.vue'),
    },
    {
      path: '/editprofile',
      name: 'editprofile',
      component: () => import('../pages/EditProfile.vue'),
    },
    {
      path: '/registercard',
      name: 'registercard',
      component: () => import('../pages/RegisterCard.vue'),
    },
  ],
});


// ✅ 전역 네비게이션 가드 추가
router.beforeEach((to, from, next) => {
  const publicPages = ['login', 'register'];
  const isPublic = publicPages.includes(to.name);
  const isLoggedIn = !!localStorage.getItem('user');

  if (!isPublic && !isLoggedIn) {
    // 로그인 필요 페이지에 접근하려고 할 때
    Swal.fire({
      title: '로그인이 필요합니다',
      text: '서비스를 이용하시려면 로그인이 필요해요!',
      icon: 'warning',
      confirmButtonText: '로그인하러 가기',
      customClass: {
        title: 'fw-bold',
        confirmButton: 'btn btn-primary',
      },
    }).then(() => {
      next({ name: 'login' });
    });
  } else {
    next(); // 문제 없으면 그대로 진행
  }
});

export default router;
