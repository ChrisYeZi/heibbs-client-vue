<template>
  <div class="Navbar">
    <!-- 两端对齐布局 -->
    <van-row justify="space-between">
      <!-- 头像 -->
      <div class="avatar" @click="showAvatar()">
        <van-icon :name="imgUrl + '/avatar.png'" size="35" />
      </div>
      <!-- Search框 -->
      <div class="search" @click="showSearch()">
        <van-icon name="search" color="rgba(255,255,255,0.7)" size="30" />
      </div>
      <!-- Chat UI -->
      <div class="chat">
        <van-icon :name="imgUrl + '/icon/xinxi.svg'" :badge?="test" size="30" />
      </div>
    </van-row>
    <!-- 搜索弹出框 -->
    <van-popup
      v-model:show="searchShow"
      position="top"
      :style="{ height: '200px' }"
      round
    >
      内容
    </van-popup>
    <!-- 头像设置弹出页 -->
    <van-popup
      v-model:show="avatarShow"
      closeable
      :close-icon="imgUrl + '/icon/guanbi.svg'"
      position="left"
      :style="{ height: '100%', width: '100%'}"
    >
      <NavbarUserVue></NavbarUserVue>
    </van-popup>
  </div>
</template>

<script lang="ts">
import config from "@/config/index";
import NavbarUserVue from "../user/NavbarUser.vue";
export default {
  name: "Navbar",
  components: { NavbarUserVue },
  data() {
    return {
      imgUrl: config.imgUrl,
      test: null,
      searchShow: false,
      avatarShow: false,
    };
  },
  methods: {
    showSearch() {
      this.searchShow = true;
    },
    showAvatar() {
      this.avatarShow = true;
    },
  },
};
</script>

<style lang="scss">
.Navbar {
  height: 60px;
  padding: 7px 10px;
  padding-top: 20px;
  .avatar {
  }
  .search {
    border: 2px solid rgba(255, 255, 255, 0.7);
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
  }
  .chat:active {
    transition: 0.2s;
    background: rgba(252, 249, 224, 0.9);
  }
}
</style>