<template>
  <div class="chatBox">
    <div class="chatList" v-for="(item, index) in chatList" :key="index">
      {{ item }}
    </div>
  </div>
</template>

<script>
import { GetChatListAPI } from "../../api/index";
export default {
  name: "chat",
  data() {
    return {
      chatList: [],
    };
  },
  created() {
    this.getChatData();
  },
  methods: {
    getChatData() {
      GetChatListAPI().then((res) => {
        if (res.status == 200) {
          this.chatList = res.data;
        } else {
          console.log(res.msg);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.chatBox {
  margin-top: 70px;
  .chatList {
    background: rgba(255, 255, 255, 1);
    padding: 10px 20px;
    border-radius: 10px;
    margin: 10px 0px;
  }
}
</style>