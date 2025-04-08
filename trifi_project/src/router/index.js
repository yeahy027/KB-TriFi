import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_UR),
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
  ],

})
export default router
