import {createRouter, createWebHashHistory} from "vue-router";

export const routes = [
  {
    path: "/",
    redirect: "/guide",
  },
  {
    name: "Guide",
    path: "/guide",
    component: () => import("@/views/guide"),
  },
  {
    name: "Layout",
    path: "/layout",
    component: () => import("@/layout"),
    children: [
      {
        name: "Home1",
        path: "home1",
        component: () => import("@/views/home"),
      },{
        name: "Home",
        path: "home",
        component: () => import("@/views/lute"),
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
