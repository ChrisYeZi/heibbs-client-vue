<template>
  <div class="admin-index">
    <h2 class="page-title">管理仪表盘</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon user-icon">👤</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboardData.totalUsers }}</div>
            <div class="stat-label">用户总数</div>
            <div class="stat-sub">今日新增 +{{ dashboardData.todayNewUsers }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon post-icon">📝</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboardData.totalPosts }}</div>
            <div class="stat-label">帖子总数</div>
            <div class="stat-sub">今日新增 +{{ dashboardData.todayNewPosts }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon block-icon">📂</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboardData.totalBlocks }}</div>
            <div class="stat-label">板块总数</div>
            <div class="stat-sub">今日活跃 {{ dashboardData.todayActiveUsers }} 人</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统控制 -->
    <el-card shadow="hover" style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <strong>普通用户登录控制</strong>
          <div style="font-size:12px;color:#909399;margin-top:4px">
            {{ loginEnabled ? '当前允许普通用户登录' : '当前仅管理员可登录，普通用户已锁定' }}
          </div>
        </div>
        <el-switch v-model="loginEnabled" @change="toggleLogin" active-text="允许" inactive-text="禁止"/>
      </div>
    </el-card>

    <!-- 数据表格区域 -->
    <el-row :gutter="16" style="margin-top: 20px">
      <!-- 最新注册用户 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-header-title">最新注册用户</span>
          </template>
          <el-table
            v-loading="isLoading"
            :data="dashboardData.latestUsers"
            stripe
            size="small"
            style="width: 100%"
            empty-text="暂无数据"
          >
            <el-table-column label="UID" prop="uid" width="60" align="center" />
            <el-table-column label="用户名" prop="username" min-width="100" />
            <el-table-column label="邮箱" prop="email" min-width="150" />
            <el-table-column label="注册时间" width="160" align="center">
              <template #default="scope">
                {{ scope.row.userRegdate }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 最新发布的帖子 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-header-title">最新发布帖子</span>
          </template>
          <el-table
            v-loading="isLoading"
            :data="dashboardData.latestPosts"
            stripe
            size="small"
            style="width: 100%"
            empty-text="暂无数据"
          >
            <el-table-column label="标题" prop="subject" min-width="150">
              <template #default="scope">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="handleViewPost(scope.row.pid)"
                >
                  {{ scope.row.subject || '(无标题)' }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="作者" prop="author" width="100" align="center" />
            <el-table-column label="时间" width="160" align="center">
              <template #default="scope">
                {{ scope.row.formattedCreateTime }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { GetDashboardAPI, GetSystemConfigAPI, SetSystemConfigAPI } from "@/api/index";
import { ElMessage } from "element-plus";

// 仪表盘数据类型
interface DashboardVo {
  totalUsers: number;
  todayNewUsers: number;
  totalPosts: number;
  todayNewPosts: number;
  totalBlocks: number;
  todayActiveUsers: number;
  latestUsers: any[];
  latestPosts: any[];
}

export default defineComponent({
  name: "admin-index",
  setup() {
    const router = useRouter();
    const isLoading = ref(true);
    const dashboardData = ref<DashboardVo>({
      totalUsers: 0,
      todayNewUsers: 0,
      totalPosts: 0,
      todayNewPosts: 0,
      totalBlocks: 0,
      todayActiveUsers: 0,
      latestUsers: [],
      latestPosts: [],
    });

    // 登录控制
    const loginEnabled = ref(true);
    const fetchConfig = async () => {
      try {
        const r = await GetSystemConfigAPI();
        if (r.status === 200) loginEnabled.value = r.data.login_enabled === 'true';
      } catch (e) {}
    };
    const toggleLogin = async (val: boolean) => {
      const r = await SetSystemConfigAPI("login_enabled", val ? "true" : "false");
      ElMessage[r.status===200?'success':'error'](String(r.msg||''));
    };

    // 获取仪表盘数据
    const fetchDashboardData = async () => {
      try {
        isLoading.value = true;
        const res = await GetDashboardAPI();
        if (res.status === 200) {
          dashboardData.value = res.data;
        } else {
          ElMessage.error("获取仪表盘数据失败：" + res.msg);
        }
      } catch (error) {
        console.error("获取仪表盘数据出错:", error);
        ElMessage.error("获取仪表盘数据异常");
      } finally {
        isLoading.value = false;
      }
    };

    // 查看帖子
    const handleViewPost = (pid: number) => {
      if (!pid) return;
      router.push({ path: "/post/" + pid });
    };

    onMounted(() => {
      fetchDashboardData();
      fetchConfig();
    });

    return {
      isLoading,
      dashboardData,
      loginEnabled,
      toggleLogin,
      handleViewPost,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-index {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
}

.stat-cards {
  .stat-card {
    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      padding: 20px;
    }
  }

  .stat-icon {
    font-size: 48px;
    margin-right: 16px;
    line-height: 1;
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
    .stat-sub {
      font-size: 12px;
      color: #67c23a;
      margin-top: 2px;
    }
  }
}

.card-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
</style>
