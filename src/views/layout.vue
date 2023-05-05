<template>
  <NavbarVue v-if="$route.meta.Navbar"></NavbarVue>
  <nav-returnbar-vue v-if="$route.meta.NavReturnbar"></nav-returnbar-vue>
  <div class="layout">
    <router-view />
  </div>
  <TabbarVue v-if="$route.meta.Tabbar"></TabbarVue>
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
  padding: 0px 10px;
}
</style>