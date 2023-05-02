<template>
  <div class="NavbarUser">
    <div class="avatarBox">
      <van-icon :name="imgUrl + '/avatar.png'" size="70" />
      <div class="avatarBox-content"></div>
    </div>
    <van-cell icon="user-circle-o" title="个人信息" is-link to="index" />
    <van-cell title="路由跳转" is-link to="index" />
    <van-cell title="路由跳转" is-link to="index" />
    <van-cell icon="setting-o" title="设置" is-link to="index" />
  </div>
</template>

<script lang="ts">
import config from "@/config/index";
export default {
  name: "NavbarUser",
  data() {
    return {
      imgUrl: config.imgUrl,
    };
  },
  methods: {
    toLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="scss">
.NavbarUser {
  height: 100%;
  .avatarBox {
    background: rgb(246, 246, 246);
    height: 10%;
    padding: 20px;
    margin-bottom: 20px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
  }
}
</style>