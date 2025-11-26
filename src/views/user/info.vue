<template>
  <div class="user-info-page" v-loading="isLoading">
    <!-- 错误提示 -->
    <van-empty 
      v-if="hasError" 
      description="获取用户信息失败"
      class="error-empty"
    >
      <van-button type="primary" @click="fetchUserInfo">重新加载</van-button>
    </van-empty>

    <!-- 用户信息卡片 -->
    <div class="user-card" v-if="!hasError">
      <!-- 头像区域 -->
      <div class="avatar-container">
        <img src="../../assets/img/avatar.png" alt="用户头像" class="avatar" />
      </div>

      <!-- 用户名和状态 -->
      <div class="user-basic">
        <h2 class="username">
          {{ userdata?.username }}
          <van-badge :text="userGroup" class="group-badge" />
        </h2>
        <p class="user-status" :class="statusClass">{{ statusText }}</p>
      </div>

      <!-- 注册信息 -->
      <div class="user-meta">
        <div class="meta-item">
          <van-icon name="clock-o" size="14" />
          <span>注册时间: {{ userdata?.userRegdate }}</span>
        </div>
        <div class="meta-item">
          <van-icon name="eye-o" size="14" />
          <span>最后登录: {{ userdata?.userLastvisit }}</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="content-container" v-if="!hasError">
      <!-- 基本信息卡片 -->
      <van-cell-group class="info-group">
        <van-cell title="用户ID" :value="userdata?.uid" />
        <!-- <van-cell title="邮箱" :value="userdata?.email" is-link>
          <template #label>
            邮箱
            <van-badge
              :text="emailstatus ? '已验证' : '未验证'"
              :color="emailstatus ? '#4cd263' : '#ff9f43'"
              class="email-badge"
            />
          </template>
        </van-cell> -->
        <van-cell title="注册IP" :value="userdata?.regip" />
        <van-cell title="最后登录IP" :value="userdata?.lastip" />
        <van-cell
          title="私信设置"
          :value="onlyacceptfriendpm ? '仅接受好友私信' : '接受所有人私信'"
        />
        <van-cell title="用户组" :value="userGroup" />
        <van-cell title="积分" :value="userdata?.credits" />
      </van-cell-group>

      <!-- 积分详情 -->
      <van-collapse v-model="activeNames" class="credits-detail">
        <van-collapse-item name="1" title="积分详情">
          <van-cell-group>
            <van-cell
              title="灵气"
              :value="count?.extcredits1"
            />
            <van-cell
              title="妖灵币"
              :value="count?.extcredits2"
            />
            <van-cell
              title="值钱玉佩"
              :value="count?.extcredits3"
            />
            <van-cell
              title="天明珠"
              :value="count?.extcredits4"
            />
            <van-cell
              title="关注数"
              :value="count?.follow"
            />
            <van-cell
              title="发帖数"
              :value="count?.posts"
            />
          </van-cell-group>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  Icon,
  Badge,
  Cell,
  CellGroup,
  Collapse,
  CollapseItem,
  Empty,
  Button,
  Loading,
} from "vant";
import { GetUserInformationAPI } from "@/api/index";
import { ElMessage } from "element-plus";

// 定义用户数据接口
interface UserData {
  uid?: number;
  username?: string;
  email?: string;
  status?: number;
  emailstatus?: number;
  groupid?: number;
  extgroupids?: number;
  regdate?: number;
  regip?: string;
  credits?: number;
  newpm?: string;
  newprompt?: number;
  onlyacceptfriendpm?: number;
  lastvisit?: number;
  lastip?: string;
  userRegdate?: string;
  userLastvisit?: string;
}

// 定义统计数据接口
interface CountData {
  uid?: number;
  extcredits1?: number;
  extcredits2?: number;
  extcredits3?: number;
  extcredits4?: number;
  extcredits5?: number;
  extcredits6?: number;
  extcredits7?: number;
  extcredits8?: number;
  follow?: number;
  posts?: number;
}

// 定义API响应接口
interface ApiResponse {
  status: number;
  msg: string;
  data: {
    user: UserData;
    count: CountData;
  };
}

// 定义用户组信息接口
interface GroupInfo {
  [key: number]: string;
}

export default defineComponent({
  name: "UserInfoMobile",
  components: {
    [Icon.name]: Icon,
    [Badge.name]: Badge,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Empty.name]: Empty,
    [Button.name]: Button,
    [Loading.name]: Loading,
  },
  setup() {
    const route = useRoute();
    const userdata = ref<UserData>({});
    const count = ref<CountData>({});
    const isLoading = ref(true);
    const hasError = ref(false);
    const activeNames = ref(["1"]);

    // 用户组信息映射
    const groupMap: GroupInfo = {
      1: "禁灵",
      2: "锁灵",
      3: "物质灵",
      4: "生灵",
      5: "精灵",
      6: "妖灵",
      7: "仙灵",
      8: "神灵",
    };

    // 获取用户信息
const fetchUserInfo = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    
    // 获取路由参数中的用户ID并转为数字
    const userIdStr = route.params.id as string;
    if (!userIdStr) {
      throw new Error("用户ID不存在");
    }
    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
      throw new Error("用户ID格式错误");
    }
    
    // 调用API时传递id参数
    const response = await GetUserInformationAPI({ id: userId }) as ApiResponse;
    
    if (response.status === 200 && response.data) {
      userdata.value = response.data.user || {};
      count.value = response.data.count || {};
    } else {
      const errorMsg = response?.msg ? String(response.msg) : "获取用户信息失败";
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    hasError.value = true;
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : "获取用户信息失败";
    ElMessage.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

    // 计算属性 - 用户组名称
    const userGroup = computed(() => {
      return groupMap[userdata.value.groupid || 0] || "普通用户";
    });

    // 计算属性 - 状态文本
    const statusText = computed(() => {
      return userdata.value.status === 0 ? "正常" : "禁用";
    });

    // 计算属性 - 状态样式
    const statusClass = computed(() => {
      return userdata.value.status === 0 ? "status-normal" : "status-banned";
    });

    // 计算属性 - 新私信数量
    const newPmCount = computed(() => {
      try {
        const pmData = JSON.parse(userdata.value.newpm || "[]");
        return Array.isArray(pmData) ? pmData.length : 0;
      } catch (e) {
        return 0;
      }
    });

    // 解构用户数据方便使用
    const emailstatus = computed(() => userdata.value.emailstatus || 0);
    const onlyacceptfriendpm = computed(() => userdata.value.onlyacceptfriendpm || 0);

    // 页面加载时获取用户信息
    onMounted(() => {
      fetchUserInfo();
      
      // 监听路由参数变化，重新获取数据
      if (route.params.id) {
        fetchUserInfo();
      }
    });

    return {
      userdata,
      count,
      isLoading,
      hasError,
      userGroup,
      statusText,
      statusClass,
      newPmCount,
      emailstatus,
      onlyacceptfriendpm,
      activeNames,
      fetchUserInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-info-page {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  margin: 110px 10px 20px 10px;
  max-width: calc(800px - 20px);
  margin: 110px auto;
  padding-bottom: 20px;
}

// 错误提示样式
.error-empty {
  padding: 40px 20px;
  text-align: center;
}

// 用户卡片
.user-card {
  width: 93%;
  max-width: 400px;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  margin: 0 auto;
}

// 头像区域
.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto -15px;
  top: -50px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

// 用户基本信息
.user-basic {
  padding-top: 5px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.user-status {
  font-size: 13px;
  margin-bottom: 10px;
}

.status-normal {
  color: #4cd263;
}

.status-banned {
  color: #ff4d4f;
}

// 用户元数据
.user-meta {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 8px 0;
  border-top: 1px dashed #f0f0f0;
  font-size: 12px;
  color: #86909c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

// 内容容器
.content-container {
  width: 94%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 信息组样式
.info-group {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  :deep(.van-cell) {
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;

    &::after {
      right: 15px;
      left: 15px;
    }
  }
}

.email-badge {
  margin-left: 5px;
}

// 积分详情
.credits-detail {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  :deep(.van-collapse-item__content) {
    padding: 0;
  }

  :deep(.van-cell) {
    font-size: 14px;
  }

  :deep(.van-cell__label) {
    font-size: 12px;
    color: #86909c;
    line-height: 1.4;
  }
}

// 加载状态样式
:deep(.van-loading) {
  display: block;
  margin: 40px auto;
}
</style>