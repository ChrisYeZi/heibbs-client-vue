<template>
  <TabbarVue v-if="$route.meta.Tabbar"></TabbarVue>
  <div class="layout">
    <router-view></router-view>
  </div>
</template>

<script>
import TabbarVue from "@/components/base/Tabbar.vue";
export default {
  name: "layout",
  components: { TabbarVue },
};
</script>

<style lang="scss" scoped>
.layout {
  padding: 0px 7px;
}
</style>