import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/LoginPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_UR),
  routes: [
    {
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
      path: "/challenge",
      name: "challenge",
      component: () => import("../pages/ChallengePage.vue"),
    },

    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../pages/MyPage.vue"),
    },
    {
      path: "/registeredit",
      name: "RegisterEdit",
      component: () => import("../pages/Register_edit.vue"),
    },
    {
      path: "/editprofile",
      name: "editprofile",
      component: () => import("../pages/EditProfile.vue"),
    },
    {
      path: "/registercard",
      name: "registercard",
      component: () => import("../pages/RegisterCard.vue"),
    },
  ],
});
export default router;
