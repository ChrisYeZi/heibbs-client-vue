import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "layout",
    component: () => import("../views/layout.vue"),
    redirect: "/index",
    children: [
      {
        path: "/index",
        name: "index",
        component: () => import("../views/main/index.vue"),
        meta: {
          Tabbar: true,
          Login: false,
          title: "首页",
        },
      },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title+ " - 罗小黑妖灵论坛 ʕ•͡-•ʔฅ ~ heibbs.net";
  }
  next();
});

export default router
