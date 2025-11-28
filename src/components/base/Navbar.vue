<template>
  <div class="Navbar">
    <!-- 两端对齐布局 -->
    <van-row justify="space-between">
      <!-- 头像 -->
      <div class="avatar" @click="showAvatar()">
        <img :src="avatarUrl" width="35" />
        <div class="Navbar-username">{{ username }}</div>
      </div>
      <!-- Search框
      <div class="search" @click="showSearch()">
        <van-icon name="search" color="rgba(124, 123, 91, 0.5)" size="30" />
      </div> -->
      <!-- Chat UI -->
      <div class="chat" @click="toChat()">
        <img src="../../assets/icon/xinxi.svg" width="30" />
      </div>
    </van-row>
    <!-- 搜索弹出框 -->
    <van-popup
      v-model:show="searchShow"
      position="top"
      :style="{ height: '200px' }"
      round
    >
      这里有好看的！
    </van-popup>
    <!-- 头像设置弹出页 -->
    <van-popup
      v-model:show="avatarShow"
      closeable
      :close-icon="require(`@/assets/icon/guanbi.svg`)"
      position="left"
      :style="{
        height: '100%',
        width: '100%',
        background: 'rgba(255,248,226,0)',
      }"
    >
      <NavbarUserVue></NavbarUserVue>
    </van-popup>
  </div>
</template>

<script>
import config from "@/config/index";
import NavbarUserVue from "../user/NavbarUser.vue";
import store from "@/store";
import router from "@/router";
// 引入头像接口
import { GetUserAvatarAPI } from "@/api/index";

export default {
  name: "Navbar",
  components: { NavbarUserVue },
  data() {
    return {
      imgUrl: config.imgUrl,
      test: null,
      searchShow: false,
      avatarShow: false,
      // 头像地址（默认使用本地图片）
      avatarUrl: "../../assets/img/avatar.png",
    };
  },
  computed: {
    login() {
      return store.state.user?.login;
    },
    username() {
      return store.state.user?.info?.user?.username;
    },
    // 获取用户ID
    userId() {
      return store.state.user?.info?.user?.uid;
    },
  },
  watch: {
    // 监听登录状态和用户ID变化，重新加载头像
    login: {
      handler: "loadUserAvatar",
      immediate: true,
    },
    userId: {
      handler: "loadUserAvatar",
      immediate: true,
    },
  },
  methods: {
    // 加载用户头像
    loadUserAvatar() {
      // 未登录时使用默认头像
      if (!this.login || !this.userId) {
        this.avatarUrl = "../../assets/img/avatar.png";
        return;
      }

      // 调用接口获取头像
      GetUserAvatarAPI(this.userId)
        .then((res) => {
          if (res.status === 200 && res.data) {
            // 拼接完整头像地址
            this.avatarUrl = config.avatarUrl + res.data;
          } else {
            // 接口返回异常时使用默认头像
            this.avatarUrl = "../../assets/img/avatar.png";
          }
        })
        .catch(() => {
          // 请求失败时使用默认头像
          this.avatarUrl = "../../assets/img/avatar.png";
        });
    },
    showSearch() {
      this.searchShow = true;
    },
    showAvatar() {
      this.avatarShow = true;
    },
    toChat() {
      router.push("/chatlist");
    },
  },
};
</script>

<style lang="scss" scoped>
.Navbar {
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
  padding: 0px 10px;
  padding-top: 10px;
  background: rgba(255, 254, 249, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 999;
  .avatar {
    margin-left: 10px;
    display: flex;
    align-items: center;
    img {
      box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
      border-radius: 30px;
    }
    .Navbar-username {
      font-size: 16px;
      margin-left: 12px;
      // 移除float，用flex布局更合理
    }
  }
  .search {
    border: 2px solid rgba(124, 123, 91, 0.5);
    width: 150px;
    border-radius: 7px;
    padding: 5px 0px 0px 10px;
  }
  .chat {
    background: rgba(255, 255, 255, 0.6);
    display: inline-block;
    padding: 5px 10px 0px 10px;
    border-radius: 5px;
    right: 0;
    box-sizing: border-box;
    margin-right: 10px;
  }
  .chat:active {
    transition: 0.2s;
    background: rgba(244, 170, 41, 0.5);
  }
}
</style>