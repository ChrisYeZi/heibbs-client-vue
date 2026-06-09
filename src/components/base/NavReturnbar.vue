<template>
  <div class="NavReturnbar">
    <div class="return" @click="goBack()">
      <van-icon name="arrow-left" size="25" />
    </div>
    <div class="title">{{ title }}</div>
    <div class="home" @click="goHome()">
      <van-icon name="home-o" size="25" />
    </div>
  </div>
</template>

<script>
import router from "@/router";
export default {
  name: "NavReturnbar",
  data() {
    return {};
  },
  computed: {
    title() {
      return this.$route.meta.title;
    },
  },
  methods: {
    // 返回路由的上一级
    goBack() {
      const matched = this.$route.matched;
      // 有父级路由时跳转到父级，否则跳首页
      if (matched.length >= 2) {
        const parent = matched[matched.length - 2];
        router.push({ path: parent.path });
      } else {
        // 单级路由：去掉最后一段路径
        const currentPath = this.$route.path;
        const parentPath =
          currentPath.substring(0, currentPath.lastIndexOf("/")) || "/index";
        router.push(parentPath);
      }
    },
    // 直接跳转到首页
    goHome() {
      router.push("/index");
    },
  },
};
</script>

<style lang="scss" scoped>
.NavReturnbar {
  background: rgba(255, 254, 249, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: space-between; // 左右分布按钮，中间标题
  user-select: none;
  .return,
  .home {
    text-align: center;
    background: rgb(255, 254, 249);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    border-radius: 10px;
    margin: 0 10px;
    cursor: pointer;
  }

  .return:active,
  .home:active {
    transition: 0.1s;
    background: rgba(223, 209, 186, 0.3);
  }

  .title {
    flex: 1; // 占满中间空间
    text-align: center;
    font-size: 18px;
    font-weight: 500;
  }
}
</style>