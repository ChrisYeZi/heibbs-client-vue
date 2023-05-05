<template>
  <div class="settingBox">
    <div class="settingList">11111111111</div>
    <div class="quitLogin" @click="quit()">退出登录</div>
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

<script>
import { showConfirmDialog } from "vant";
import router from "@/router";
import store from "@/store";
import MessagebarVue from "@/components/common/Messagebar.vue";
export default {
  name: "setting",
  components: {
    MessagebarVue,
  },
  data() {
    return {
      msgShow: false,
      content: "",
    };
  },
  methods: {
    quit() {
      showConfirmDialog({
        message:
          "你真的要退出吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗？？？？？？？？？？？？？？？？？？？？？？？？？？",
        confirmButtonColor: "rgba(251, 107, 107, 1)",
      })
        .then(() => {
          localStorage.clear();
          this.content = "成功退出登录";
          store.commit("user/SET_USERLOGIN", false);
          store.commit("user/SET_USERINFO", {});
          this.msgShow = true;
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        })
        .catch(() => {
          // on cancel
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.settingBox {
  margin-top: 70px;
  .settingList {
    padding: 20px 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .quitLogin {
    padding: 20px 10px;
    background: rgba(244, 170, 41, 0.7);
    border-radius: 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 550;
  }
  .quitLogin:active {
    transition: 0.2s;
    background: rgba(244, 170, 41, 0.9);
  }
}
</style>