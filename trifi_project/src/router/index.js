import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import List from "@/pages/List.vue";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      name: "home",
      component: AppLayout,
    },
    { path: "/list", name: "list", component: List },
  ],
});
export default router;
