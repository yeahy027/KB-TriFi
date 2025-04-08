import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import MyPage from '@/pages/MyPage.vue';
import EditProfile from '@/pages/EditProfile.vue';

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayout,
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPage,
    },
    {
      path: '/editprofile',
      name: 'editprofile',
      component: EditProfile,
    },
  ],
});
export default router;
