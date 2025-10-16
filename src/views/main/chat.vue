<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <van-icon name="arrow-left" class="back-btn" @click="$router.go(-1)" />
      <div class="chat-title">{{ chatInfo.tname || "聊天" }}</div>
      <van-icon name="more" class="more-btn" />
    </div>

    <!-- 聊天内容区 -->
    <div class="chat-messages">
      <!-- 日期分组 -->
      <div
        class="date-group"
        v-for="([dateKey, messages], groupIndex) in Object.entries(
          groupedMessages
        )"
        :key="dateKey + groupIndex"
      >
        <div class="time-divider">{{ formatDateLabel(dateKey) }}</div>
        <!-- 消息列表 -->
        <div
          class="message-item"
          v-for="(msg, msgIndex) in messages"
          :key="msg.mid || msgIndex"
        >
          <!-- 接收消息（左侧） -->
          <div class="message received" v-if="msg.sid !== currentUid">
            <div class="avatar">
              <img src="../../assets/img/avatar.png" class="avatar-img" />
            </div>
            <div class="message-wrap">
              <div class="user-name">{{ getUserName(msg.sid) }}</div>
              <div class="message-bubble received-bubble">
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.time) }}</div>
              </div>
            </div>
          </div>

          <!-- 发送消息（右侧） -->
          <div class="message sent" v-else>
            <div class="message-wrap">
              <div class="message-bubble sent-bubble">
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.time) }}</div>
              </div>
            </div>
            <div class="avatar">
              <img
                src="../../assets/img/avatar.png"
                alt="我的头像"
                class="avatar-img"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="messageDoList.length === 0">
        <van-empty
          image="https://img.yzcdn.cn/vant/empty-image-default.png"
          image-size="100"
          description="暂无聊天记录"
        />
      </div>
    </div>

    <!-- 底部输入区 -->
    <div class="chat-input-area">
      <textarea
        v-model="inputContent"
        class="message-input"
        placeholder="请输入消息..."
        @keyup.enter.prevent="sendMessage"
        :style="{ height: inputHeight }"
        @input="adjustInputHeight"
        :disabled="isSending"
      ></textarea>
      <button
        class="send-btn"
        @click="sendMessage"
        :disabled="!inputContent.trim() || isSending"
      >
        <!-- 发送中显示加载文本 -->
        {{ isSending ? "发送中..." : "发送" }}
      </button>
    </div>

    <!-- 弹出框 -->
    <van-toast
      v-model:show="msgShow"
      :message="toastContent"
      :type="toastType"
      duration="2000"
    />
  </div>
</template>

<script lang="ts">
import { GetMessageAPI, ReplyMessageAPI } from "@/api/index";
import { Icon, Empty, Toast } from "vant";
import router from "@/router";
import store from "@/store";
import MessagebarVue from "@/components/common/Messagebar.vue";
import parsedContent from "@/assets/js/parsedContent";

// 导入回复消息的类型接口
interface ReplyMessageQuery {
  plid: number;
  content: string;
}

interface MessageDo {
  mid: number;
  plid: number;
  sid: number;
  content: string;
  delstatus: number;
  time: number;
}

interface MessageListDo {
  plid: number;
  pmtype: number;
  tid: number;
  tname: string;
  sid: number;
  sname: string;
  subject: string;
  dateline: number;
}

// 定义接口响应类型
interface Res<T> {
  status: number;
  msg: string;
  data: T;
}

export default {
  name: "Chat",
  components: {
    MessagebarVue,
    [Icon.name]: Icon,
    [Empty.name]: Empty,
  },
  data() {
    return {
      msgShow: false,
      toastContent: "",
      toastType: "success",
      pidParam: this.$route.query.plid,
      messageList: {} as any,
      messageDoList: [] as MessageDo[],
      chatInfo: {} as MessageListDo,
      inputContent: "",
      inputHeight: "40px",
      currentUid: store.state.user?.info?.user?.uid || 1,
      isSending: false, // 发送状态锁，防止重复发送
    };
  },
  computed: {
    groupedMessages() {
      const groups: Record<string, MessageDo[]> = {};

      this.messageDoList.forEach((msg) => {
        const date = new Date(msg.time * 1000);
        const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(msg);
      });

      return groups;
    },
  },
  methods: {
    getMessageList() {
      // 显示加载动画
      store.dispatch("system/SET_SYSLOADING_ACTION", true);
      
      GetMessageAPI({ plid: this.pidParam })
        .then((res: any) => {
          if (res.status === 200) {
            this.messageList = res.data;
            this.messageDoList = res.data.messageDoList || [];
            this.chatInfo = res.data.messageListDo || {};
            this.scrollToBottom();
          } else {
            this.showToast("获取消息失败", "error");
          }
        })
        .catch(() => {
          this.showToast("网络错误，获取消息失败", "error");
        })
        .finally(() => {
          // 隐藏加载动画
          store.dispatch("system/SET_SYSLOADING_ACTION", false);
        });
    },

    async sendMessage() {
      const content = this.inputContent.trim();
      if (!content) return;

      // 防止重复发送
      this.isSending = true;
      
      // 构建请求参数
      const requestData: ReplyMessageQuery = {
        plid: Number(this.pidParam), // 确保plid是数字类型
        content: content,
      };

      try {
        // 显示加载动画
        store.dispatch("system/SET_SYSLOADING_ACTION", true);
        
        // 调用实际的回复接口
        const res = await ReplyMessageAPI(requestData);
        
        if (res.status === 200) {
          // 发送成功，重新获取消息列表更新界面
          this.showToast("消息发送成功");
          this.inputContent = "";
          this.inputHeight = "40px";
          await this.getMessageList(); // 重新拉取最新消息
        } else {
          // 接口返回失败
          this.showToast(res.msg || "消息发送失败", "error");
        }
      } catch (error: any) {
        // 网络错误或其他异常
        this.showToast(error.message || "网络异常，发送失败", "error");
      } finally {
        // 恢复发送状态，隐藏加载动画
        this.isSending = false;
        store.dispatch("system/SET_SYSLOADING_ACTION", false);
      }
    },

    // 封装提示框方法
    showToast(content: string, type: "success" | "error" = "success") {
      this.toastContent = content;
      this.toastType = type;
      this.msgShow = true;
      
      // 自动关闭
      setTimeout(() => {
        this.msgShow = false;
      }, 2000);
    },

    adjustInputHeight() {
      const textarea = this.$el.querySelector(
        ".message-input"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 120);
        this.inputHeight = `${newHeight}px`;
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const messagesContainer = this.$el.querySelector(
          ".chat-messages"
        ) as HTMLElement;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    },

    formatTime(timestamp: number) {
      const date = new Date(timestamp * 1000);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },

    formatDateLabel(dateKey: string) {
      const [year, month, day] = dateKey.split("-").map(Number);
      const formattedMonth = month.toString().padStart(2, "0");
      const formattedDay = day.toString().padStart(2, "0");
      return `${year}年${formattedMonth}月${formattedDay}日`;
    },

    getAvatarUrl(uid: number) {
      return `https://q1.qlogo.cn/g?b=qq&nk=${uid}&s=100`;
    },

    getUserName(uid: number) {
      if (uid === this.currentUid) {
        return "我";
      }
      if (this.chatInfo) {
        if (uid === this.chatInfo.sid) {
          return this.chatInfo.sname || `用户${uid}`;
        } else if (uid === this.chatInfo.tid) {
          return this.chatInfo.tname || `用户${uid}`;
        }
      }
      return `用户${uid}`;
    },
  },
  created() {
    this.getMessageList();
  },
};
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

/* 顶部导航栏 */
.chat-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 10;

  .back-btn,
  .more-btn {
    font-size: 20px;
    color: #333;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .chat-title {
    flex: 1;
    text-align: center;
    font-size: 17px;
    font-weight: 500;
    color: #333;
  }
}

/* 聊天内容区 */
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 日期分组 */
.date-group {
  margin-bottom: 20px;
}

/* 时间分割线 */
.time-divider {
  text-align: center;
  margin: 0 0 12px;
  font-size: 12px;
  color: #999;

  &::before,
  &::after {
    content: "";
    display: inline-block;
    width: 40px;
    height: 1px;
    background-color: #ddd;
    vertical-align: middle;
  }

  &::before {
    margin-right: 8px;
  }

  &::after {
    margin-left: 8px;
  }
}

/* 单独一行，避免相互影响 */
.message-item {
  margin-bottom: 12px;
  display: block;
}

/* 控制头像和气泡的横向布局 */
.message {
  display: flex;
  align-items: flex-start;
  max-width: 100%;
}

/* 头像 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 消息包裹层 */
.message-wrap {
  display: inline-block;
  vertical-align: top;
  min-width: 90%;
  margin-left: 10px;
}

/* 发送方的消息包裹层 */
.sent .message-wrap {
  margin-left: 0;
  margin-right: 10px;
  text-align: right;
}

/* 用户名 */
.user-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  line-height: 1;
}

/* 气泡核心样式 */
.message-bubble {
  position: relative;
  max-width: calc(100% - 100px);
  padding: 10px 12px;
  border-radius: 18px;
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
  line-height: 1.5;
  display: inline-block;
}

/* 消息内容 */
.message-content {
  font-size: 16px;
  margin-bottom: 4px;
  display: block;
}

/* 消息时间 */
.message-time {
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
  display: block;
}

/* 接收方消息 */
.received {
  justify-content: flex-start;
}

.received-bubble {
  background-color: #fff;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  color: #333;
  border-top-left-radius: 6px;
}

.received .message-time {
  color: #999;
}

/* 发送方消息 */
.sent {
  justify-content: flex-end;
}

.sent-bubble {
  background-color: #ff9900;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  color: #fff;
  border-top-right-radius: 6px;
}

.sent .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 空状态 */
.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 底部输入区 */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  padding: 8px 16px;
  background-color: rgb(255, 254, 249);
  border-top: 1px solid #eee;
  z-index: 10;
  margin-bottom: 60px;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 14px;
  background-color: #f5f5f5c5;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  resize: none;
  outline: none;
  box-sizing: border-box;
  line-height: 1.4;
}

.message-input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.send-btn {
  width: 64px;
  height: 36px;
  margin-left: 10px;
  background-color: #0084ff;
  color: #fff;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
  &:disabled {
    background-color: #ccdfff;
    color: #fff;
    cursor: not-allowed;
  }
}

/* 修复vant组件样式 */
::v-deep .van-empty__description {
  color: #999;
  font-size: 14px;
}

::v-deep .van-toast {
  z-index: 9999 !important;
}

::v-deep .van-toast--error {
  background-color: rgba(255, 82, 82, 0.9) !important;
}
</style>