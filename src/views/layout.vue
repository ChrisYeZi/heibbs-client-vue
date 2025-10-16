<template>
  <div class="layout">
    <!-- 通过Vuex的loading状态控制加载动画显示 -->
    <LoadingVue v-if="loading"></LoadingVue>
    <NavbarVue v-if="$route.meta.Navbar"></NavbarVue>
    <nav-returnbar-vue v-if="$route.meta.NavReturnbar"></nav-returnbar-vue>
    <div class="layout-box">
      <router-view />
    </div>
    <div v-if="$route.meta.Copyright" class="layout-copyright">
      <p>罗小黑黑妖灵论坛（公益非官方）</p>
      <p>Copyright ©2020-2025 heibbs.net All Rights Reserved.</p>
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
  methods: {
    init() {
      if (localStorage.getItem("heibbs.token")) {
        // 1. 接口请求前：显示加载动画（调用Vuex的action设置loading为true）
        store.dispatch("system/SET_SYSLOADING_ACTION", true);

        GetUserInfoAPI()
          .then((res) => {
            // 3. 接口请求成功后：隐藏加载动画
            store.dispatch("system/SET_SYSLOADING_ACTION", false);

            if (res.status == 200) {
              store.commit("user/SET_USERINFO", res.data);
              store.commit("user/SET_USERLOGIN", true);
            } else {
              console.log(res.msg);
            }
          })
          .catch((err) => {
            // 4. 接口请求失败后：也要隐藏隐藏加载动画（避免一直直加载）
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
  .layout-box {
    max-width: 1200px;
    margin: 0 auto;
  }
  .layout-copyright {
    margin-top: 10px;
    padding-top: 20px;
    margin-bottom: 60px;
    height: 100px;
    text-align: center;
    color: rgb(155, 154, 128);
    line-height: 1.8em;
  }
}
</style>