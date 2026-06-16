<template>
  <div class="notification-page">
    <div class="page-header">
      <h2>通知中心</h2>
      <el-button
        v-if="unreadCount > 0"
        type="primary"
        size="small"
        @click="handleReadAll"
      >
        全部已读
      </el-button>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="isLoading" color="#1989fa" class="loading-indicator" />

    <!-- 空状态 -->
    <van-empty
      v-if="!isLoading && notificationList.length === 0"
      description="暂无通知"
      :image="require('@/assets/img/404.png')"
      image-size="45%"
    />

    <!-- 通知列表 -->
    <div
      class="notification-list"
      v-if="!isLoading && notificationList.length > 0"
    >
      <div
        v-for="item in notificationList"
        :key="item.id"
        class="notification-item"
        :class="{ unread: item.isRead === 0 }"
        @click="handleClickNotification(item)"
      >
        <!-- 类型图标 -->
        <div class="notify-icon">
          <span v-if="item.type === 'reply'">💬</span>
          <span v-else-if="item.type === 'like'">❤️</span>
          <span v-else-if="item.type === 'mention'">📢</span>
          <span v-else>🔔</span>
        </div>

        <!-- 内容 -->
        <div class="notify-content">
          <div class="notify-title">
            <span class="unread-dot" v-if="item.isRead === 0"></span>
            {{ item.title }}
          </div>
          <div class="notify-text">{{ item.content }}</div>
          <div class="notify-time">{{ formatTime(item.dateline) }}</div>
        </div>

        <!-- 跳转箭头 -->
        <div class="notify-arrow" v-if="item.relatedPid">›</div>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-if="total > pageSize"
      class="pagination"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { useRouter } from "vue-router";
import {
  GetNotificationListAPI,
  GetUnreadCountAPI,
  ReadNotificationAPI,
  ReadAllNotificationAPI,
} from "@/api/index";
import { ElMessage } from "element-plus";
import { Loading, Empty } from "vant";

interface NotificationItem {
  id: number;
  uid: number;
  type: string;
  title: string;
  content: string;
  relatedPid?: number;
  fromUid?: number;
  isRead: number;
  dateline: number;
}

export default defineComponent({
  name: "notification",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const router = useRouter();
    const isLoading = ref(true);
    const notificationList = ref<NotificationItem[]>([]);
    const unreadCount = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const total = ref(0);

    const formatTime = (timestamp: number) => {
      if (!timestamp) return "";
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "刚刚";
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      return date.toLocaleDateString("zh-CN");
    };

    const fetchData = async () => {
      try {
        isLoading.value = true;
        const res = await GetNotificationListAPI({
          pageNum: currentPage.value,
          pageSize: pageSize.value,
        });
        if (res.status === 200) {
          notificationList.value = res.data.records || [];
          total.value = res.data.total || 0;
        }
        // 获取未读数
        const countRes = await GetUnreadCountAPI();
        if (countRes.status === 200) {
          unreadCount.value = countRes.data;
        }
      } catch (error) {
        console.error("获取通知失败:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const handleClickNotification = async (item: NotificationItem) => {
      // 标记为已读
      if (item.isRead === 0) {
        try {
          await ReadNotificationAPI(item.id);
          item.isRead = 1;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        } catch (e) {
          // 忽略
        }
      }
      // 跳转到关联帖子
      if (item.relatedPid) {
        router.push({ path: "/post/" + item.relatedPid });
      }
    };

    const handleReadAll = async () => {
      try {
        const res = await ReadAllNotificationAPI();
        if (res.status === 200) {
          ElMessage.success(String(res.data || "操作成功"));
          fetchData();
        }
      } catch (error) {
        ElMessage.error("操作失败");
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchData();
    };

    fetchData();

    return {
      isLoading,
      notificationList,
      unreadCount,
      currentPage,
      pageSize,
      total,
      formatTime,
      handleClickNotification,
      handleReadAll,
      handlePageChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.notification-page {
  margin-top: 60px;
  padding: 10px 20px;
  min-height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.loading-indicator {
  padding: 50px 0;
  text-align: center;
}

.notification-list {
  .notification-item {
    display: flex;
    align-items: center;
    padding: 12px 8px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.unread {
      background: #f0f7ff;
    }
  }
}

.notify-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notify-content {
  flex: 1;
  min-width: 0;
}

.notify-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unread-dot {
  width: 6px;
  height: 6px;
  background: #e74c3c;
  border-radius: 50%;
  flex-shrink: 0;
}

.notify-text {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notify-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.notify-arrow {
  font-size: 20px;
  color: #c0c4cc;
  margin-left: 8px;
  flex-shrink: 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
