<template>
  <div class="admin-report">
    <h2 class="page-title">举报管理</h2>

    <!-- 状态筛选 -->
    <div class="filter-container">
      <el-radio-group v-model="filterStatus" @change="handleFilterChange">
        <el-radio-button :label="undefined">全部</el-radio-button>
        <el-radio-button :label="0">待处理</el-radio-button>
        <el-radio-button :label="1">已处理</el-radio-button>
        <el-radio-button :label="2">已驳回</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 举报列表表格 -->
    <el-table
      v-loading="isLoading"
      :data="reportList.records"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <el-table-column label="ID" prop="id" width="60" align="center" />
      <el-table-column label="帖子ID" prop="pid" width="80" align="center">
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="viewPost(scope.row.pid)">
            #{{ scope.row.pid }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="举报人UID" prop="reporterUid" width="100" align="center" />
      <el-table-column label="举报原因" prop="reason" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="90" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="举报时间" width="170" align="center">
        <template #default="scope">
          {{ formatTime(scope.row.dateline) }}
        </template>
      </el-table-column>
      <el-table-column label="处理备注" prop="handleMsg" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="160" align="center">
        <template #default="scope">
          <template v-if="scope.row.status === 0">
            <el-button type="success" size="small" @click="handleReport(scope.row.id, 1)">
              通过
            </el-button>
            <el-button type="danger" size="small" @click="handleReport(scope.row.id, 2)">
              驳回
            </el-button>
          </template>
          <span v-else style="color: #909399;">已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="reportList.total > 0"
      class="pagination"
      layout="total, prev, pager, next"
      :total="reportList.total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: right"
    />

    <!-- 处理备注对话框 -->
    <el-dialog v-model="handleDialogVisible" title="处理举报" width="400px">
      <p>请输入处理备注（可选）：</p>
      <el-input
        v-model="handleMsg"
        type="textarea"
        :rows="3"
        placeholder="处理备注..."
      />
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { GetReportListAPI, HandleReportAPI } from "@/api/index";
import { ElMessage } from "element-plus";

interface ReportItem {
  id: number;
  pid: number;
  reporterUid: number;
  reason: string;
  status: number;
  handlerUid?: number;
  handleMsg?: string;
  dateline: number;
  handleTime?: number;
}

interface PageResult<T> {
  records: T[];
  total?: number;
}

export default defineComponent({
  name: "admin-report",
  setup() {
    const router = useRouter();
    const isLoading = ref(true);
    const reportList = ref<PageResult<ReportItem>>({ records: [] });
    const currentPage = ref(1);
    const pageSize = ref(30);
    const filterStatus = ref<number | undefined>(undefined);

    // 处理对话框
    const handleDialogVisible = ref(false);
    const pendingReportId = ref(0);
    const pendingStatus = ref(0);
    const handleMsg = ref("");

    const getStatusText = (status: number) => {
      const map: Record<number, string> = { 0: "待处理", 1: "已处理", 2: "已驳回" };
      return map[status] || "未知";
    };

    const getStatusType = (status: number) => {
      const map: Record<number, string> = { 0: "warning", 1: "success", 2: "info" };
      return map[status] || "info";
    };

    const formatTime = (timestamp: number) => {
      if (!timestamp) return "-";
      return new Date(timestamp * 1000).toLocaleString("zh-CN");
    };

    const fetchData = async () => {
      try {
        isLoading.value = true;
        const res = await GetReportListAPI({
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          status: filterStatus.value,
        });
        if (res.status === 200) {
          reportList.value = res.data;
        } else {
          ElMessage.error("获取举报列表失败");
        }
      } catch (error) {
        console.error("获取举报列表出错:", error);
        ElMessage.error("获取举报列表异常");
      } finally {
        isLoading.value = false;
      }
    };

    const handleFilterChange = () => {
      currentPage.value = 1;
      fetchData();
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchData();
    };

    const viewPost = (pid: number) => {
      router.push({ path: "/post/" + pid });
    };

    const handleReport = (reportId: number, status: number) => {
      pendingReportId.value = reportId;
      pendingStatus.value = status;
      handleMsg.value = "";
      handleDialogVisible.value = true;
    };

    const confirmHandle = async () => {
      try {
        const res = await HandleReportAPI({
          id: pendingReportId.value,
          status: pendingStatus.value,
          handleMsg: handleMsg.value,
        });
        if (res.status === 200) {
          ElMessage.success(String(res.msg || "处理成功"));
          handleDialogVisible.value = false;
          fetchData();
        } else {
          ElMessage.error(String(res.msg || "处理失败"));
        }
      } catch (error) {
        console.error("处理举报出错:", error);
        ElMessage.error("操作异常");
      }
    };

    // 初始加载
    fetchData();

    return {
      isLoading,
      reportList,
      currentPage,
      pageSize,
      filterStatus,
      handleDialogVisible,
      handleMsg,
      getStatusText,
      getStatusType,
      formatTime,
      handleFilterChange,
      handlePageChange,
      viewPost,
      handleReport,
      confirmHandle,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-report {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.filter-container {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
