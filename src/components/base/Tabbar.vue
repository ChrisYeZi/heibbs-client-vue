<template>
  <div class="Tabbar">
    <van-row justify="space-around">
      <van-col span="6">
        <div :class="{ select: true }" @click="toIndex()">
          <van-icon :name="imgUrl + `/icon/guangchang.svg`" size="25" />
          <br />
          广场
        </div>
      </van-col>
      <van-col span="6">
        <div @click="">
          <van-icon :name="imgUrl + `/icon/huiguan.svg`" size="25" />
          <br />
          会馆
        </div>
      </van-col>
      <van-col span="6">
        <div @click="">
          <van-icon :name="imgUrl + `/icon/shiyanlu.svg`" size="25" />
          <br />
          誓言录
        </div>
      </van-col>
      <van-col span="6">
        <div @click="toGugu()">
          <van-icon :name="imgUrl + `/icon/gemen.svg`" size="25" />
          <br />
          鸽门
        </div>
      </van-col>
    </van-row>
  </div>
</template>

<script lang="ts">
import config from "@/config/index";
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
      this.$router.push("/index");
    },
    toGugu(): void {
      this.$router.push("/gugu");
    },
  },
};
</script>

<style lang="scss" scoped>
.Tabbar {
  width: 100%;
  height: 50px;
  padding-top: 9px;
  background: rgba(255, 255, 255, 0.8);
  position: absolute;
  bottom: 0px;
  text-align: center;
  font-size: 0.7rem;
  .select {
    font-weight: 550;
    color: rgba(0, 0, 0, 0.7);
  }
}
</style>