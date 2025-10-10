<template>
  <div class="Tabbar">
    <van-row justify="space-around">
      <van-col span="6">
        <div :class="{ select: true }" @click="toIndex()">
          <img src="../../assets/icon/guangchang.svg" width="25">
          <br />
          广场
        </div>
      </van-col>
      <van-col span="6">
        <div @click="toIndex()">
          <img src="../../assets/icon/huiguan.svg" width="25">
          <br />
          会馆
        </div>
      </van-col>
      <van-col span="6">
        <div @click="toIndex()">
          <img src="../../assets/icon/shiyanlu.svg" width="25">
          <br />
          集市
        </div>
      </van-col>
      <van-col span="6" @click="toGugu()">
        <div>
          <img src="../../assets/icon/gemen.svg" width="25">
          <br />
          鸽门
        </div>
      </van-col>
    </van-row>
  </div>
</template>

<script lang="ts">
import config from "@/config/index";
import router from "@/router";
export default {
  name: "Tabbar",

  data() {
    return {
      imgUrl: config.imgUrl,
    };
  },
  methods: {
    // 多个路由跳转
    toIndex(): void {
      router.push("/index");
    },
    toGugu(): void {
      router.push("/gugu");
    },
  },
};
</script>

<style lang="scss" scoped>
.Tabbar {
  width: 100%;
  height: 50px;
  padding-top: 9px;
  background: rgba(255, 254, 249, 1);
  position: fixed;
  bottom: 0px;
  text-align: center;
  font-size: 0.7rem;
  z-index: 998;
  .select {
    font-weight: 550;
    color: rgba(0, 0, 0, 0.7);
  }
}
</style>