<template>
  <div class="layout">
    <!-- 通过Vuex的loading状态控制加载动画显示 -->
    <LoadingVue v-if="loading"></LoadingVue>
    <div v-if="$route.meta.Navbar" class="layout-navbar">
      <NavbarVue></NavbarVue>
    </div>
    <div v-if="$route.meta.NavReturnbar" class="layout-returnbar">
      <nav-returnbar-vue></nav-returnbar-vue>
    </div>
    <div class="layout-box">
      <router-view />
    </div>
    <div v-if="$route.meta.Copyright" class="layout-copyright">
      <p>罗小黑妖灵论坛（公益非官方）</p>
      <p>Copyright ©2020-2026 heibbs.net All Rights Reserved.</p>
      <p>论坛管理组: admin@heibbs.net</p>
    </div>
    <TabbarVue v-if="$route.meta.Tabbar"></TabbarVue>
  </div>
</template>

<script>
import NavbarVue from "@/components/base/Navbar.vue";
import TabbarVue from "@/components/base/Tabbar.vue";
import NavReturnbarVue from "@/components/base/NavReturnbar.vue";
import LoadingVue from "@/components/base/Loading.vue";
import { GetUserInfoAPI } from "../api/index";
import store from "@/store";
export default {
  name: "layout",
  components: { TabbarVue, NavbarVue, NavReturnbarVue, LoadingVue },
  computed: {
    // 响应式获取Vuex中的loading状态
    loading() {
      return store.state.system.loading; // 对应Vuex中system模块的loading状态
    },
  },
  created() {
    console.log("ฅ(๑˙o˙๑)ฅ ~嗨！~你怎么发现这里了！");
  },
  mounted() {
    this.initSwipeGesture();
  },
  beforeUnmount() {
    document.removeEventListener("touchstart", this._touchStart);
    document.removeEventListener("touchend", this._touchEnd);
  },
  methods: {
    initSwipeGesture() {
      let startX = 0,
        startY = 0;
      this._touchStart = (e) => {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      };
      this._touchEnd = (e) => {
        if (e.changedTouches.length !== 1) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(dy)) return;
        const navbarOpen = store.state.system.navbarUserShow;
        if (dx > 100 && startX < 100 && !navbarOpen) {
          // 右滑(从左边缘) → 打开侧边栏
          store.commit("system/SET_NAVBARUSER_SHOW", true);
        } else if (dx < -60 && navbarOpen) {
          // 左滑 → 关闭侧边栏
          store.commit("system/SET_NAVBARUSER_SHOW", false);
        }
      };
      document.addEventListener("touchstart", this._touchStart, {
        passive: true,
      });
      document.addEventListener("touchend", this._touchEnd, { passive: false });
    },
    init() {
      if (localStorage.getItem("heibbs.token")) {
        // 显示加载动画（调用Vuex的action设置loading为true）
        store.dispatch("system/SET_SYSLOADING_ACTION", true);

        GetUserInfoAPI()
          .then((res) => {
            // 隐藏加载动画
            store.dispatch("system/SET_SYSLOADING_ACTION", false);

            if (res.status == 200) {
              store.commit("user/SET_USERINFO", res.data);
              store.commit("user/SET_USERLOGIN", true);
            } else {
              console.log(res.msg);
            }
          })
          .catch((err) => {
            // 隐藏隐藏加载动画（避免一直直加载）
            store.dispatch("system/SET_SYSLOADING_ACTION", false);
            console.error("获取用户信息失败", err);
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* 样式不变 */
.layout {
  .layout-navbar {
    height: 60px;
  }
  .layout-returnbar {
    height: 60px;
  }
  .layout-box {
    max-width: 1200px;
    margin: 0px auto;
  }
  .layout-copyright {
    margin-top: 10px;
    margin-bottom: 80px;
    padding: 0px 5px 0px 5px;
    height: 100px;
    text-align: center;
    color: rgb(155, 154, 128);
    line-height: 1.8em;
  }
}
</style>