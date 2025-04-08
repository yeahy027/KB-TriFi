import AppLayout from '../components/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import RegisterEdit from '../pages/Register_edit.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: AppLayout,
  },
  {
    path: '/register',
    name: 'RegisterEdit',
    component: RegisterEdit,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes /*:  [
     {
      path: '/',
      name: 'home',
      component: AppLayout,
    }, 
  ], */,
});
export default router;
