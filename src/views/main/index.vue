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
    没什么放的，那就放点歌吧！(↓黑历的咕咕咕)
    <iframe
      src="//player.bilibili.com/player.html?aid=73189916&bvid=BV1sE411y737&cid=125187065&page=1"
      scrolling="no"
      border="0"
      frameborder="no"
      framespacing="0"
      allowfullscreen="true"
    >
    </iframe>
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
  background: rgba(255, 255, 255, 0.9);
  margin-top: 90px;
  margin-bottom: 70px;
  padding: 20px 10px;
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