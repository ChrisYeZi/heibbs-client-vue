<template>
  <div class="integralBox">
    <div class="integralList">
      <van-cell-group inset>
        <van-cell title="宇宙级超级无敌霸王龙战士的战斗力" :value="credits" />
        <van-cell title="妖灵币" :value="integral.extcredits1" />
        <van-cell title="人气" :value="integral.extcredits2" />
        <van-cell title="灵气" :value="integral.extcredits3" />
        <van-cell title="值钱玉佩" :value="integral.extcredits4" />
        <van-cell title="天明珠" :value="integral.extcredits5" />
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import store from "@/store";
export default {
  name: "integral",
  data() {
    return {
      credits: store.state.user?.info?.user?.credits,
      integral: store.state.user?.info?.count,
    };
  },
};
</script>

<style lang="scss" scoped>
.integralBox {
  margin-top: 70px;
  .integralList {
    padding: 20px 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    margin-bottom: 20px;
  }
}
</style>