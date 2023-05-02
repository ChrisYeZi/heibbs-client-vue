<template>
  <NavbarVue v-if="$route.meta.Navbar"></NavbarVue>
  <div class="layout">
    <router-view></router-view>
  </div>
  <TabbarVue v-if="$route.meta.Tabbar"></TabbarVue>
</template>

<script lang="ts">
import NavbarVue from "@/components/base/Navbar.vue";
import TabbarVue from "@/components/base/Tabbar.vue";
export default {
  name: "layout",
  components: { TabbarVue, NavbarVue },
  data() {
    return {};
  },
  created(){
    console.log("ฅ(๑˙o˙๑)ฅ ~嗨！~你怎么发现这里了！");
  }
};
</script>

<style lang="scss" scoped>
.layout {
  padding: 0px 10px;
}
</style>