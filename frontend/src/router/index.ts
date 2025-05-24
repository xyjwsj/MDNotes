import {createRouter, createWebHashHistory} from "vue-router";

export const routes = [
  {
    path: "/",
    redirect: "/layout/home",
  },
  {
    name: "Layout",
    path: "/layout",
    component: () => import("@/layout"),
    children: [
      {
        name: "Home",
        path: "home",
        component: () => import("@/views/home"),
      }
    ],
  },
];
const router = createRouter({
  routes,
  // history: createWebHistory('/access_center/')
  history: createWebHashHistory(),
});

router.beforeEach((to, from, next) => {
  console.log("aaa", to, from);
  next();
});

export default router;
