import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { resizeAllCharts } from './utils/chartManager';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

router.beforeEach((to, from, next) => {
  document.title = 'Money Keeper';
  next();
});
// 🔥 윈도우 리사이즈 시 전체 차트 리사이즈
window.addEventListener('resize', () => {
  resizeAllCharts();
});
