<template>
  <div class="NavReturnbar">
    <div class="return" @click="goBack()">
      <van-icon name="arrow-left" size="25" />
    </div>
    <div class="title">{{ title }}</div>
  </div>
</template>

<script>
import router from '@/router';
export default {
  name: "NavReturnbar",
  data() {
    return {
      title: this.$route.meta.title,
    };
  },
  methods: {
    // 改为回退到上一页，无历史记录时兜底跳首页
    goBack() {
      // 检查浏览器历史记录长度：若小于2（当前页是第一个页面），则跳首页
      if (window.history.length <= 1) {
        router.push("/index");
      } else {
        // 回退到上一次跳转过来的页面（历史记录的上一页）
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.NavReturnbar {
  background: rgba(255, 254, 249, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed;
  display: flex;
  top: 0;
  width: 100%;
  height: 60px;
  z-index: 998;
  .return {
    text-align: center;
    background: rgb(255, 254, 249);
    display: inline-block;
    padding: 8px 20px;
    border-radius: 10px;
    margin: 10px;
  }
  .return:active {
    transition: 0.1s;
    background: rgba(223, 209, 186, 0.3);
  }
  .title {
    position: absolute;
    line-height: 3.5rem;
    font-size: 18px;
    width: 100%;
    z-index: -1;
    text-align: center;
  }
}
</style>