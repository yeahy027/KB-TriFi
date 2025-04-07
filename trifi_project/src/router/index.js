import AppLayout from '../components/AppLayout.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayout,
    },
  ],

})
export default router
