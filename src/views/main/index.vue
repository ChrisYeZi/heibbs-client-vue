<template>
  <div class="index">
    轮播图
    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item>1</van-swipe-item>
      <van-swipe-item>2</van-swipe-item>
      <van-swipe-item>3</van-swipe-item>
      <van-swipe-item>4</van-swipe-item>
    </van-swipe>
    最新发的帖子（考虑是独占一行还是一行两个）
    <div class="post-list">
      <PostbarVue postObj=""></PostbarVue>
      <van-grid direction="horizontal" :column-num="2">
        <van-grid-item icon="photo-o" text="文字" />
        <van-grid-item icon="photo-o" text="文字" />
        <van-grid-item icon="photo-o" text="文字" />
      </van-grid>
    </div>
  </div>
</template>

<script lang="ts">
import PostbarVue from "@/components/common/Postbar.vue";
export default {
  name: "index",
  components: { PostbarVue },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.index {
  background: rgba(252, 249, 224, 1);
  padding: 10px 10px;
  border-radius: 10px;
  line-height: 1.5em;
  .post-list {
    border: 1px solid red;
    border-radius: 5px;
  }
  .my-swipe .van-swipe-item {
    font-size: 20px;
    line-height: 150px;
    text-align: center;
    background-color: #fff;
    border-radius: 10px;
  }
}
</style>