<template>
  <div class="layout">
    <NavbarVue v-if="$route.meta.Navbar"></NavbarVue>
    <nav-returnbar-vue v-if="$route.meta.NavReturnbar"></nav-returnbar-vue>
    <div class="layout-box">
      <router-view />
    </div>
    <div v-if="$route.meta.Copyright" class="layout-copyright">
      <p>罗小黑妖灵论坛（公益非官方）</p>
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
import { GetUserInfoAPI } from "../api/index";
import store from "@/store";
export default {
  name: "layout",
  components: { TabbarVue, NavbarVue, NavReturnbarVue },
  data() {
    return {};
  },
  created() {
    console.log("ฅ(๑˙o˙๑)ฅ ~嗨！~你怎么发现这里了！");
  },
  methods: {
    init() {
      if (localStorage.getItem("heibbs.token")) {
        GetUserInfoAPI().then((res) => {
          if (res.status == 200) {
            store.commit("user/SET_USERINFO", res.data);
            store.commit("user/SET_USERLOGIN", true);
          } else {
            console.log(res.msg);
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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