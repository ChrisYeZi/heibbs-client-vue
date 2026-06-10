<template>
  <div class="NavbarUser">
    <div class="avatarBox">
      <!-- 头像区域：点击跳转到设置页面更换头像 -->
      <div class="avatar-container" @click="goToSettingAvatar">
        <img :src="avatarUrl" alt="用户头像" class="user-avatar" />
        <div class="avatar-tip" v-if="login">更换头像</div>
      </div>

      <div class="avatarBox-content" v-if="login">{{ username }}</div>
      <div class="avatarBox-content" v-else @click="toLogin()">
        您没有登录,立即登录
      </div>
    </div>

    <van-cell
      icon="user-circle-o"
      title="个人信息"
      is-link
      :to="{
        name: 'info',
        params: { id: uid },
      }"
    />
    <van-cell icon="balance-o" title="会馆财政" is-link to="/block-finance" />
    <van-cell icon="medal-o" title="勋章" is-link to="/medal-page" />
    <van-cell icon="notes-o" title="帖子" is-link to="/my-posts" />
    <van-cell icon="label-o" title="任务" is-link to="/task" />
    <van-cell icon="gold-coin-o" title="积分" is-link to="/credits" />
    <van-cell icon="send-gift-o" title="物品" is-link to="/inventory" />
    <van-cell icon="coupon-o" title="邀请码" is-link to="invitation" />
    <van-cell icon="friends-o" title="用户组" is-link to="permission" />
    <van-cell icon="setting-o" title="设置" is-link to="setting" />
    <van-cell
      icon="setting"
      title="论坛管理"
      is-link
      to="admin"
      v-if="admin === 1"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import config from "@/config/index";
import store from "@/store";
import router from "@/router";
import { GetUserAvatarAPI } from "@/api/index";

export default defineComponent({
  name: "NavbarUser",
  setup() {
    const avatarUrl = ref<string>("../../assets/img/avatar.png");
    const uid = ref<number | null>(store.state.user?.info?.user?.uid);
    const login = ref<boolean>(!!store.state.user?.login);
    const username = ref<string>(store.state.user?.info?.user?.username || "");
    const admin = ref<number | null>(store.state.user?.info?.user?.extgroupids);

    const loadUserAvatar = async () => {
      if (!login.value || !uid.value) {
        avatarUrl.value = "../../assets/img/avatar.png";
        return;
      }
      try {
        const res = await GetUserAvatarAPI(uid.value);
        if (res.status === 200 && res.data) {
          avatarUrl.value = `${config.avatarUrl}${res.data}`;
        }
      } catch (error) {
        console.error("加载头像失败:", error);
        avatarUrl.value = "../../assets/img/avatar.png";
      }
    };

    // 点击头像跳转到设置页面
    const goToSettingAvatar = () => {
      if (!login.value) { toLogin(); return; }
      router.push("/setting");
    };

    watch(
      [() => store.state.user?.login, () => store.state.user?.info?.user?.uid],
      () => {
        uid.value = store.state.user?.info?.user?.uid;
        login.value = !!store.state.user?.login;
        username.value = store.state.user?.info?.user?.username || "";
        admin.value = store.state.user?.info?.user?.extgroupids;
        loadUserAvatar();
      },
      { immediate: true }
    );

    const toLogin = () => {
      router.push({
        path: "/login",
        query: { url: router.currentRoute.value.path },
      });
    };

    return {
      avatarUrl, uid, login, username, admin,
      loadUserAvatar, goToSettingAvatar, toLogin,
    };
  },
});
</script>

<style lang="scss" scoped>
.NavbarUser {
  background: rgba(246, 246, 246, 1);
  height: 100%;
  max-width: 700px;
  user-select: none;
  .avatarBox {
    background: rgba(255, 252, 244, 0.8);
    height: 10%;
    padding: 20px;
    margin-bottom: 20px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;

    .avatar-container {
      position: relative;
      cursor: pointer;

      .user-avatar {
        width: 70px;
        height: 70px;
        border-radius: 50%; // 圆形头像
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      }

      .avatar-tip {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 12px;
        text-align: center;
        padding: 2px 0;
        border-bottom-left-radius: 50%;
        border-bottom-right-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .avatar-tip {
        opacity: 1;
      }
    }

    .avatarBox-content {
      font-size: 1.2rem;
      margin: 0 25px;
      line-height: 2.5em;
      cursor: pointer;

      &:hover {
        color: #1989fa;
      }
    }
  }
}
</style>