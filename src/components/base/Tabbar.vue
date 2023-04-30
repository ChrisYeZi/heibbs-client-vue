<template>
  <div class="Tabbar">
    <!-- 两端对齐布局 -->
    <van-row justify="space-between">
      <!-- 头像 -->
      <div class="avatar" @click="showAvatar()">
        <van-icon
          name="http://127.0.0.1:8082/avatar.png"
          :badge="test"
          size="35"
        />
      </div>
      <!-- Search框 -->
      <div class="search" @click="showSearch()">
        <van-icon name="search" color="rgba(255,255,255,0.7)" size="30" />
      </div>
      <!-- Chat UI -->
      <div class="chat">
        <van-icon
          name="http://127.0.0.1:8082/icon/chat.png"
          :badge="test"
          size="30"
        />
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
      close-icon="close"
      position="left"
      :style="{ height: '100%', width: '100%' }"
    >
      内容
    </van-popup>
  </div>
</template>

<script>
export default {
  name: "Tabbar",
  data() {
    return {
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

<style lang="scss" scoped>
.Tabbar {
  height: 60px;
  padding-top: 7px;
  .avatar {
  }
  .search {
    border: 2px solid rgba(255, 255, 255, 0.7);
    width: 150px;
    border-radius: 7px;
    padding: 5px 0px 0px 10px;
  }
  .chat {
    background: rgba(255, 255, 255, 0.5);
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