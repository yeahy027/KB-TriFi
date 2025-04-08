import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_UR),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: { title: '로그인' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
      meta: { title: '회원가입' }
    },
    {
      path: '/stat',
      name: 'stat',
      component: () => import('../pages/StatsPage.vue'),
      meta: { title: '통계 분석 페이지' }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../pages/CalendarPage.vue'),
      meta: { title: '캘린더' }
    },
  ],

})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '기본 제목'
  next()
})

export default router
