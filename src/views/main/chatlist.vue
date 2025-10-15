<template>
  <div class="chatBox">
    <div
      class="chat-item"
      v-for="(item, index) in formattedChatList"
      :key="item.plid || index"
      @click="handleChatClick(item)"
    >
      <!-- 头像区域 -->
      <div class="chat-avatar">
        <img
          src="../../assets/img/avatar.png"
          :alt="item.sname"
          class="avatar-img"
        />
        <!-- 未读提示点 -->
        <div class="unread-dot" v-if="!item.read"></div>
      </div>

      <!-- 消息内容区域 -->
      <div class="chat-content">
        <div class="chat-header">
          <span class="chat-nickname" v-if="userdata.user.uid == item.tid">{{
            item.sname
          }}</span>
          <span class="chat-nickname" v-if="userdata.user.uid == item.sid">{{
            item.tname
          }}</span>
          <span class="chat-time">{{ item.formattedTime }}</span>
        </div>
        <div class="chat-message">
          <span class="message-text">{{ item.shortSubject }}</span>
          <span class="message-tag">消息</span>
        </div>
      </div>

      <!-- 右侧箭头 -->
      <div class="chat-arrow">
        <van-icon name="arrow-right" size="16" color="#c8c8c8" />
      </div>
    </div>

    <!-- 空状态 -->
    <div class="chat-empty" v-if="formattedChatList.length === 0">
      <van-empty
        image="https://img.yzcdn.cn/vant/empty-image-default.png"
        image-size="120"
        description="暂无消息"
      />
    </div>
  </div>
</template>

<script>
// 1. 移除了对 @/utils/dateHelper 的引用
import { GetMessageListAPI } from "../../api/index";
import store from "@/store";
import { Icon, Empty } from "vant";

export default {
  name: "chat",
  components: {
    [Icon.name]: Icon,
    [Empty.name]: Empty,
  },
  data() {
    return {
      chatList: [],
      unreadPlids: [1], // 模拟未读消息的plid
      userdata: store.state.user?.info,
    };
  },
  computed: {
    formattedChatList() {
      return this.chatList.map((item) => {
        return {
          ...item,
          // 2. 直接调用组件内的 formatChatTime 函数（不再依赖外部文件）
          formattedTime: this.formatChatTime(item.dateline),
          shortSubject: this.truncateText(item.subject, 20),
          read: !this.unreadPlids.includes(item.plid),
        };
      });
    },
  },
  created() {
    this.getChatData();
  },
  methods: {
    getChatData() {
      GetMessageListAPI().then((res) => {
        if (res.status == 200) {
          this.chatList = res.data || [];
        } else {
          console.log("获取消息失败：", res.msg);
        }
      });
    },

    // 3. 内置时间格式化函数（原 dateHelper 里的逻辑移到这里）
    formatChatTime(timestamp) {
      // 处理秒级/毫秒级时间戳
      const date = new Date(
        timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
      );
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const msgDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      // 格式化时间为 HH:MM
      const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // 按日期返回对应格式
      if (msgDate.getTime() === today.getTime()) {
        return `今天 ${timeStr}`;
      } else if (msgDate.getTime() === yesterday.getTime()) {
        return `昨天 ${timeStr}`;
      } else {
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")} ${timeStr}`;
      }
    },

    // 文本截取函数
    truncateText(text, maxLength) {
      if (!text) return "";
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    },

    // 头像生成函数
    getAvatarUrl(sid) {
      return `https://q1.qlogo.cn/g?b=qq&nk=${sid}&s=100`;
    },

    // 点击事件
    handleChatClick(item) {
      // console.log("进入：", item);
      // this.$router.push({ path: `"/chat/"+${item.plid}`});
      this.$router.push({ path: "/chat", query: { plid: item.plid } });
      // 可添加路由跳转逻辑，例：
      // this.$router.push({ path: "/chat/detail", query: { plid: item.plid } });
      // this.unreadPlids = this.unreadPlids.filter(plid => plid !== item.plid);
    },
  },
};
</script>

<style lang="scss" scoped>
/* 样式部分完全不变 */
.chatBox {
  margin-top: 60px;
  padding: 10px 12px;
  padding-bottom: 30px;
  // background: rgba(255, 255, 255, 0.5);
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 0%,
    rgba(255, 255, 255, 0.8) 10px
  );

  .chat-empty {
    padding: 50px 0;
  }
}

.chat-item {
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 5px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.07);
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafafa;
  }
}

.chat-avatar {
  position: relative;
  margin-right: 15px;

  .avatar-img {
    width: 48px;
    height: 48px;
    padding-left: 10px;
    border-radius: 8px;
    object-fit: cover;
  }

  .unread-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #ff4d4f;
    border: 2px solid #fff;
  }
}

.chat-content {
  flex: 1;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  .chat-nickname {
    font-size: 15px;
    color: #333;
    font-weight: 500;
  }

  .chat-time {
    font-size: 12px;
    color: #999;
  }
}

.chat-message {
  display: flex;
  align-items: center;

  .message-text {
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .message-tag {
    font-size: 11px;
    color: #999;
    background-color: #f5f5f5;
    padding: 1px 6px;
    border-radius: 10px;
    margin-left: 8px;
    white-space: nowrap;
  }
}

.chat-arrow {
  margin-left: 8px;
  padding-right: 4px;
}
</style>