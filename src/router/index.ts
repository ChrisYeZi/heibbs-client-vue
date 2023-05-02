import store from '@/store';
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
          Navbar: true,//顶部导航栏
          Tabbar: true,//底部导航栏
          Login: false,//是否需要登录
          title: "首页",
        },
      },
      {
        path: "/login",
        name: "login",
        component: () => import("../views/main/login.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          Login: false,
          title: "登录",
        },
      },
      {
        path: "/gugu",
        name: "gugu",
        component: () => import("../views/gugu/gugu.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: true,
          title: "鸽门",
        },
      },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 设置标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + " - 罗小黑妖灵论坛 ʕ•͡-•ʔฅ ~ heibbs.net";
  }
  next();
});

// 设置登录拦截器
router.beforeEach((to, from, next) => {
  if (to.meta.Login) {
    if (!store.state.user?.login) {
      next({ path: "/login", query: { url: to.path } })
    }
  }
  next();
});

export default router
