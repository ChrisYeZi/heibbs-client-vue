import store from '@/store';
import { createRouter, createWebHashHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "layout",
    component: () => import("../views/layout.vue"),
    redirect: "/index",
    // children: [
    //   {
    //     path: "/qyindex",
    //     name: "qyindex",
    //     component: () => import("../views/qyindex.vue"),
    //     meta: {
    //       Navbar: true,//顶部导航栏
    //       Tabbar: false,//底部导航栏
    //       Login: true,//是否需要登录
    //       title: "账户转移",
    //     },
    //   },
    // ]
    children: [
      {
        path: "/index",
        name: "index",
        component: () => import("../views/main/index.vue"),
        meta: {
          Navbar: true,//顶部导航栏
          Tabbar: true,//底部导航栏
          Login: false,//是否需要登录
          NavReturnbar: false,
          Copyright: false,
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
          Copyright: true,
          title: "登录",
        },
      },
      {
        path: "/post/:pid",
        name: "post",
        component: () => import("../views/main/post.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          NavReturnbar: true,
          Login: false,
          Copyright: true,
          title: "帖子",
        },
      },
      {
        path: "/chatlist",
        name: "chatlist",
        component: () => import("../views/main/chatlist.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: true,
          NavReturnbar: true,
          Copyright: true,
          title: "消息列表",
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
          Copyright: false,
          title: "消息",
        },
      },
      {
        path: "/shop",
        name: "shop",
        component: () => import("../views/gugu/shop.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: false,
          Copyright: true,
          title: "集市",
        },
      },
      {
        path: "/gugu",
        name: "gugu",
        component: () => import("../views/gugu/gugu.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: false,
          Copyright: true,
          title: "鸽门",
        },
      },
      {
        path: "/blocklist",
        name: "blocklist",
        component: () => import("../views/main/blocklist.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: false,
          NavReturnbar: false,
          Copyright: true,
          title: "会馆列表",
        },
      },
      {
        path: "/block/:id",
        name: "block",
        component: () => import("../views/main/block.vue"),
        meta: {
          Navbar: false,
          Tabbar: true,
          Login: false,
          NavReturnbar: true,
          Copyright: true,
          title: "会馆",
        },
      },
      {
        path: "/qyindex",
        name: "qyindex",
        component: () => import("../views/qyindex.vue"),
        meta: {
          Navbar: true,//顶部导航栏
          Tabbar: false,//底部导航栏
          Login: true,//是否需要登录
          title: "账户转移",
        },
      },

      {
        path: "/info",
        name: "info",
        component: () => import("../views/user/info.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          Login: true,
          NavReturnbar: true,
          Copyright: true,
          title: "个人信息",
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
          Copyright: true,
          title: "邀请码",
        },
      },
      {
        path: "/permission",
        name: "permission",
        component: () => import("../views/user/permission.vue"),
        meta: {
          Navbar: false,
          Tabbar: false,
          Login: true,
          NavReturnbar: true,
          Copyright: true,
          title: "用户组",
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
          Copyright: true,
          title: "设置",
        },
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',  // 使用正则匹配所有路径
    redirect: '/index'  // 重定向到首页
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

// 登录状态验证拦截器
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {


  // 已经登录且有用户信息，直接放行
  if (store.state.user?.login) {
    return next();
  }

  // 有token但没有用户信息，尝试获取用户信息
  if (localStorage.getItem("heibbs.token")) {
    try {
      // 显示加载状态
      // store.commit("app/SET_LOADING", true);

      // 调用API获取用户信息
      const res = await GetUserInfoAPI();

      if (res.status === 200) {
        // 获取成功，更新用户状态
        store.commit("user/SET_USERINFO", res.data);
        store.commit("user/SET_USERLOGIN", true);
        next();
      } else {


        // 不需要登录的页面直接放行
        if (!to.meta.Login) {
          return next();
        }

        // 接口返回错误状态，清除token并跳转到登录页
        localStorage.removeItem("heibbs.token");
        store.commit("user/SET_USERLOGIN", false);
        store.commit("user/SET_USERINFO", null);
        next({
          path: "/login",
          query: { url: to.path }
        });
      }
    } catch (error) {
      // 处理网络错误等异常情况
      console.error("获取用户信息失败:", error);
      localStorage.removeItem("heibbs.token");
      store.commit("user/SET_USERLOGIN", false);
      store.commit("user/SET_USERINFO", null);
      next({
        path: "/login",
        query: { url: to.path }
      });
    } finally {
      // 隐藏加载状态
      // store.commit("app/SET_LOADING", false);
    }
  } else {
    // 没有token，跳转到登录页

    // 不需要登录的页面直接放行
    if (!to.meta.Login) {
      return next();
    }

    next({
      path: "/login",
      query: { url: to.path }
    });
  }
});

export default router
