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
        path: "/chat",
        name: "chat",
        component: () => import("../views/main/chat.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: true,
          NavReturnbar: true,
          title: "聊天",
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
      {
        path: "/integral",
        name: "integral",
        component: () => import("../views/user/integral.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          Login: true,
          NavReturnbar: true,
          title: "积分",
        },
      },
      {
        path: "/invitation",
        name: "invitation",
        component: () => import("../views/user/invitation.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          Login: true,
          NavReturnbar: true,
          title: "邀请码",
        },
      },
      {
        path: "/setting",
        name: "setting",
        component: () => import("../views/user/setting.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          Login: true,
          NavReturnbar: true,
          title: "设置",
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

import { GetUserInfoAPI } from "../api/index";

// 设置登录拦截器
router.beforeEach((to, from, next) => {
  if (localStorage.getItem("heibbs.token")) {
    GetUserInfoAPI().then((res) => {
      if (res.status == 200) {
        store.commit("user/SET_USERINFO", res.data);
        store.commit("user/SET_USERLOGIN", true);
        next()
      } else if (res.status == 500) {
        console.log(res.data);
        localStorage.clear()
      } else {
        next({ path: "/login", query: { url: to.path } })
      }
    });
  } else if (store.state.user?.login) {
    next()
  } else if (!to.meta.Login) {
    next()
  } else {
    next({ path: "/login", query: { url: to.path } })

  }

});

export default router
