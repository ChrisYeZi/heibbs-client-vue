<template>
  <div class="permission-container">
    <!-- 页面标题 -->
    <div class="page-title">用户组管理</div>

    <!-- 加载状态 -->
    <div class="loading" v-if="isLoading">
      <van-loading color="#1989fa" size="24" />
      <span class="loading-text">加载用户组数据中...</span>
    </div>

    <!-- 错误状态 -->
    <div class="error-state" v-else-if="errorMsg">
      <van-icon name="warning-o" color="#ff4d4f" size="24" />
      <span class="error-text">{{ errorMsg }}</span>
    </div>

    <!-- 数据展示 -->
    <div v-else class="group-list-wrapper">
      <!-- 普通用户组 -->
      <div class="group-card">
        <div class="card-header">
          <van-icon name="user-o" color="#D4780D" />
          <span class="card-title">普通用户组</span>
        </div>
        <div class="card-content">
          <div
            class="group-item"
            v-for="(group, idx) in groupDo"
            :key="group.gid"
          >
            <!-- 等级标识 -->
            <div
              class="level-tag"
              :style="{
                backgroundColor: group.color,
              }"
            >
              {{ idx - 1 }}级
            </div>
            <!-- 组信息 -->
            <div class="group-info">
              <div class="group-name">
                <span class="name-text">{{ group.gname }}</span>
                <!-- 特殊标签 -->
                <van-tag
                  size="mini"
                  color="#ff9f43"
                  v-if="idx === userdata?.user?.groupid - 1"
                  >当前等级</van-tag
                >
                <van-tag size="mini" color="#ff9f43" v-if="idx === 2"
                  >初始等级</van-tag
                >
              </div>
              <div class="group-meta">
                <span class="meta-item">
                  <van-icon name="credit-o" size="14" color="#ff6b35" />
                  所需积分：{{
                    group.credits === 0 ? "无要求" : group.credits + " 积分"
                  }}
                </span>
                <span class="meta-item">
                  <van-icon name="key-o" size="14" color="#86909c" />
                  权限：{{ group.permission || "默认权限" }}
                </span>
                <span class="meta-item">
                  <van-icon name="info-o" size="14" color="#86909c" />
                  描述：{{ group.description || "无描述" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 特殊用户组 -->
      <div class="group-card" v-if="extgroupDo.length">
        <div class="card-header">
          <van-icon name="shield-o" color="#ff6b35" />
          <span class="card-title">特殊用户组</span>
        </div>
        <div class="card-content">
          <div class="group-item" v-for="group in extgroupDo" :key="group.gid">
            <div
              class="level-tag"
              :style="{
                backgroundColor: group.color,
              }"
            >
              特殊
            </div>
            <div class="group-info">
              <div class="group-name">
                <span class="name-text">{{ group.gname }}</span>
                <van-tag
                  size="mini"
                  color="#ff4d4f"
                  v-if="group.gid === userdata?.user?.extgroupids"
                  >当前</van-tag
                >
                <van-tag size="mini" color="#ff4d4f" v-if="group.gtype === 1"
                  >管理员</van-tag
                >
              </div>
              <div class="group-meta">
                <span class="meta-item">
                  <van-icon name="tag-o" size="14" color="#86909c" />
                  组类型：{{ group.gtype === 1 ? "系统管理组" : "自定义组" }}
                </span>
                <span class="meta-item">
                  <van-icon name="key-o" size="14" color="#ff6b35" />
                  权限：{{
                    group.permission
                      ? group.permission.split(",").join("、")
                      : "无特殊权限"
                  }}
                </span>
                <span class="meta-item">
                  <van-icon name="info-o" size="14" color="#86909c" />
                  描述：{{ group.description || "无描述" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from "vue";
import store from "@/store";
import { GetGroupListAPI } from "@/api/index";
import { Loading, Icon, Tag } from "vant"; // 引入vant组件

// 定义接口（精准匹配返回数据结构）
interface GroupDoItem {
  gid: number;
  gname: string;
  permission: string | null;
  credits: number;
  description: string | null;
  color: String;
}

interface ExtGroupDoItem {
  gid: number;
  gname: string;
  permission: string | null;
  description: string | null;
  gtype: number;
  color: String;
}

interface GroupResponseData {
  groupDo: GroupDoItem[];
  extgroupDo: ExtGroupDoItem[];
}

export default defineComponent({
  name: "UserGroupPermission",
  components: {
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
  },
  setup() {
    // 状态管理
    const isLoading = ref<boolean>(true);
    const errorMsg = ref<string>("");
    const groupDo = ref<GroupDoItem[]>([]); // 普通用户组
    const extgroupDo = ref<ExtGroupDoItem[]>([]); // 特殊用户组
    const userdata = store.state.user?.info;
    // 获取用户组数据
    const getGroupData = async () => {
      try {
        isLoading.value = true;
        const res: any = await GetGroupListAPI();

        if (res.status === 200 && res.data) {
          const data = res.data as GroupResponseData;
          groupDo.value = data.groupDo || [];
          extgroupDo.value = data.extgroupDo || [];
        } else {
          errorMsg.value = res.msg || "获取用户组数据失败";
        }
      } catch (err: any) {
        errorMsg.value = "网络错误，无法加载用户组数据";
        console.error("用户组数据请求失败:", err);
      } finally {
        isLoading.value = false;
      }
    };

    // 页面挂载时加载数据
    onMounted(() => {
      getGroupData();
    });

    return {
      userdata,
      isLoading,
      errorMsg,
      groupDo,
      extgroupDo,
    };
  },
});
</script>

<style lang="scss" scoped>
.permission-container {
  padding: 16px;
  min-height: calc(100vh - 70px); // 适配顶部导航栏高度
}

// 页面标题
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

// 加载状态
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  flex-direction: column;
  gap: 8px;

  .loading-text {
    font-size: 14px;
    color: #86909c;
  }
}

// 错误状态
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 8px;

  .error-text {
    font-size: 14px;
    color: #ff4d4f;
  }
}

// 用户组卡片容器
.group-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 卡片样式
.group-card {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

// 卡片头部
.card-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #ebeef5;
  gap: 8px;

  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
}

// 卡片内容区
.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 单个用户组项
.group-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ebe9db;
  }
}

// 等级标签
.level-tag {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

// 组信息区
.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// 组名称
.group-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .name-text {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
  }
}

// 组元数据（积分、权限等）
.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #4e5969;
}

// 元数据项
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>