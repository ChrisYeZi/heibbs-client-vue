<template>
  <div class="invitationBox">
    有笨比叶子忘记写显示自己邀请码的接口了，所以就不写创建邀请码的内容了嘿嘿
    <div class="createInvitation-submit" @click="createInvitation()">
      创建邀请码
    </div>
    <div
      class="invitationList"
      v-for="(item, index) in invitation"
      :key="index"
      v-if="invitation != null"
    >
      <van-cell-group inset>
        <van-cell title="邀请码" :value="item.code" />
        <van-cell
          title="使用人"
          :value="item.recipient"
          :label="item.usetime"
        />
      </van-cell-group>
    </div>
    <div class="noInvitation" v-else>
      <van-empty
        :image="imgUrl + '/icon/noInvitation.svg'"
        image-size="200"
        description="没有邀请码"
      />
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

<script>
import { showConfirmDialog } from "vant";
import config from "@/config/index";
import MessagebarVue from "@/components/common/Messagebar.vue";
import { GetUserInvitationAPI, CreateInvitationAPI } from "../../api/index";
export default {
  name: "invitation",
  components: { MessagebarVue },
  data() {
    return {
      imgUrl: config.imgUrl,
      invitation: {},
      msgShow: false,
      content: "",
    };
  },
  created() {
    this.getInvitationData();
  },
  methods: {
    createInvitation() {
      showConfirmDialog({
        message: "一个邀请码200妖灵币哦",
        confirmButtonColor: "rgba(251, 107, 107, 1)",
      })
        .then(() => {
          CreateInvitationAPI({}).then((res) => {
            if (res.status == 200) {
              this.content = res.data;
            } else {
              this.content = res.msg;
            }
          });
          this.msgShow = true;
        })
        .catch(() => {});
    },
    getInvitationData() {
      GetUserInvitationAPI({}).then((res) => {
        if (res.status == 200) {
          this.invitation = res.data;
        } else {
          this.content = res.data;
          this.msgShow = true;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.invitationBox {
  margin-top: 70px;
  .invitationList {
    margin: 10px 0px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 1);
  }
  .createInvitation-submit {
    margin: 20px 0px;
    padding: 20px 10px;
    background: rgba(244, 170, 41, 0.7);
    border-radius: 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 550;
  }
  .createInvitation-submit:active {
    transition: 0.2s;
    background: rgba(244, 170, 41, 0.9);
  }
}
</style>