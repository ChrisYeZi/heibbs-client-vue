<template>
  <div class="qyindex">
    <div class="qyindex-title">罗小黑妖灵论坛账户数据迁移</div>
    <div class="qyindex-post">
      <van-cell icon="user-circle-o" title="个人信息" />
      <van-cell title="用户名">{{ user.user.username }}</van-cell>
      <van-cell title="邮箱">{{ user.user.email }}</van-cell>
      <van-cell title="注册时间">{{ user.user.userRegdate }}</van-cell>
    </div>
    <div class="qyindex-post">
      <van-cell icon="gold-coin-o" title="新论坛积分" />
      <van-cell title="灵气">{{ user.count.extcredits1 }}</van-cell>
      <van-cell title="妖灵币">{{ user.count.extcredits2 }}</van-cell>
      <van-cell title="值钱玉佩">{{ user.count.extcredits3 }}</van-cell>
      <van-cell title="天明珠">{{ user.count.extcredits4 }}</van-cell>
    </div>
    <div class="qyindex-post">
      <van-cell icon="gold-coin-o" title="旧论坛积分" />
      <van-cell title="灵气">{{ qyUser.extcredits1 }}</van-cell>
      <van-cell title="妖灵币">{{ qyUser.extcredits2 }}</van-cell>
      <van-cell title="天明珠">{{ qyUser.extcredits3 }}</van-cell>
      <van-cell title="值钱玉佩">{{ qyUser.extcredits4 }}</van-cell>
      <van-cell title="灵石">{{ qyUser.extcredits5 }}</van-cell>
      <van-cell title="定心石">{{ qyUser.extcredits6 }}</van-cell>
      <van-cell title="妖灵卷">{{ qyUser.extcredits7 }}</van-cell>
      <van-notice-bar
        left-icon="volume-o"
        text="按照 灵气*1 + 妖灵币/5 + 妖灵卷*20 转换为新论坛妖灵币; 有任意 >=1 数额天明珠,转为 新论坛 1个天明珠; 有任意 >=1 数额值钱玉佩 转为 新论坛 5个值钱玉佩"
      />
      <van-button type="primary" block @click="changeUserCount()"
        >转换新论坛积分</van-button
      >
    </div>

    <van-cell icon="orders-o" title="主题" />
    <div
      class="qyindex-post"
      v-for="(item, index) in postList || []"
      :key="index"
      @click="openPost()"
    >
      <div class="index-post-title">
        {{ item.subject || "无标题"  }}
      </div>
      <div class="index-post-description">
        {{ item?.formattedCreateTime || "无时间" }}
        {{ item?.author || "无作者" }}
      </div>
      <van-popup v-model:showPost="showPost">
        {{ item?.message || "无内容" }}
      </van-popup>
    </div>
  </div>

  <!-- 弹出框 -->
  <van-toast
    v-model:show="msgShow"
    style="padding: 0; background: rgba(0, 0, 0, 0)"
  >
    <template #message>
      <messagebar-vue :content="content"></messagebar-vue>
    </template>
  </van-toast>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PostbarVue from "@/components/common/Postbar.vue";
import MessagebarVue from "@/components/common/Messagebar.vue";
import router from "@/router";
import store from "@/store";
import { Popup } from "vant";
import {
  GetPostListAPI,
  GetUserQYCountAPI,
  ChangeUserQYCountAPI,
  GetUserPostListAPI,
} from "@/api/index";

export default defineComponent({
  name: "qyindex",
  components: { PostbarVue, MessagebarVue },
  data() {
    return {
      msgShow: false,
      content: "",
      postList: [] as any,
      user: store.state.user?.info,
      qyUser: {} as any,
      showPost: false,
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      GetPostListAPI().then((res: any) => {
        if (res.status === 200) {
          this.postList = res.data;
        }
      });
      GetUserQYCountAPI().then((res: any) => {
        if (res.status === 200) {
          this.qyUser = res.data;
        }
      });
      GetUserPostListAPI().then((res: any) => {
        if (res.status === 200) {
          this.postList = res.data;
        }
      });
    },
    changeUserCount() {
      ChangeUserQYCountAPI().then((res: any) => {
        if (res.status === 200) {
          this.content = "积分操作成功";
          this.msgShow = true;
          this.getData();
        }
      });
    },
    openPost() {
      this.showPost = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.qyindex {
  background: rgba(255, 255, 255, 0.9);
  margin-top: 90px;
  margin-bottom: 70px;
  padding: 20px 10px;
  border-radius: 10px;
  line-height: 1.5em;
  .qyindex-title {
    text-align: center;
    font-weight: 550;
    font-size: 24px;
    padding-bottom: 10px;
  }
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
  .qyindex-post {
    // border-bottom: 5px solid rgb(255, 248, 226);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    margin-bottom: 10px;
    padding: 20px;
    overflow: hidden;
    .qyindex-post-title {
      font-weight: 550;
    }
    .qyindex-post-description {
      color: rgba(124, 123, 91, 0.5);
      text-align: right;
      padding-bottom: 10px;
    }
  }
}
</style>