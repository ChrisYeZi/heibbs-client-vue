<template>
  <div class="NavbarUser">
    <div class="avatarBox">
      <van-icon :name="imgUrl + '/avatar.png'" size="70" />
      <div class="avatarBox-content" v-if="login">{{ username }}</div>
      <div class="avatarBox-content" v-else @click="toLogin()">
        您没有登录,立即登录
      </div>
    </div>
    <van-cell icon="user-circle-o" title="个人信息" is-link to="index" />
    <van-cell icon="gold-coin-o" title="积分" is-link to="integral" />
    <van-cell icon="coupon-o" title="邀请码" is-link to="invitation" />
    <van-cell icon="friends-o" title="权限组" is-link to="index" />
    <van-cell icon="setting-o" title="设置" is-link to="setting" />
  </div>
</template>

<script lang="ts">
import config from "@/config/index";
import store from "@/store";
import router from "@/router";
export default {
  name: "NavbarUser",
  data() {
    return {
      imgUrl: config.imgUrl,
      login: store.state.user?.login,
      username: store.state.user?.info?.user?.username,
    };
  },
  created() {},
  methods: {
    toLogin() {
      router.push({
        path: "/login",
        query: { url: router.currentRoute.value.path },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.NavbarUser {
  height: 100%;
  .avatarBox {
    background: rgba(246, 246, 246, 0.8);
    height: 10%;
    padding: 20px;
    margin-bottom: 20px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
    display: flex;
    .avatarBox-content {
      font-size: 1.2rem;
      margin: 15px 25px;
      line-height: 2.5em;
    }
  }
}
</style>