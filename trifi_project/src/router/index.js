import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/LoginPage.vue";

const router = createRouter({
  history: createWebHistory("/"),
  history: createWebHistory(import.meta.env.BASE_UR),
  routes: [
    {
      path: "/",
      name: "home",
      component: AppLayout,
      path: "/",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../pages/RegisterPage.vue"),
    },
    {
      path: "/stat",
      name: "stat",
      component: () => import("../pages/StatsPage.vue"),
    },
    {
      path: "/home",
      name: "calender",
      component: () => import("../pages/CalendarPage.vue"),
    },
    {
      path: "/list",
      name: "list",
      component: () => import("../pages/ListPage.vue"),
    },
    {
      path: "/goal",
      name: "goal",
      component: () => import("../pages/GoalPage.vue"),
    },
    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../pages/MypagePage.vue"),
    },
  ],
});
export default router;
