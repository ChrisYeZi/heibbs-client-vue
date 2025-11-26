<template>
  <div class="admin-message">
    <h2 class="page-title">消息管理</h2>

    <!-- 表格 -->
    <el-table
      v-loading="isLoading"
      :data="messageList.records"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <!-- 序号列 -->
      <el-table-column label="消息ID" prop="mid" width="80" align="center" />

      <!-- 会话ID -->
      <el-table-column label="会话ID" prop="plid" width="80" align="center" />

      <!-- 发送者 -->
      <el-table-column label="发送者ID" prop="sid" width="100" align="center" />

      <!-- 消息内容 -->
      <el-table-column label="消息内容" prop="content" min-width="200" align="left">
        <template #default="scope">
          <el-tooltip :content="scope.row.content" placement="top">
            <div class="content-cell">{{ scope.row.content }}</div>
          </el-tooltip>
        </template>
      </el-table-column>

      <!-- 发送时间 -->
      <el-table-column label="发送时间" prop="formattedTime" width="180" align="center" />

      <!-- 状态 -->
      <el-table-column label="状态" prop="delstatus" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.delstatus === 0 ? 'success' : 'danger'">
            {{ scope.row.delstatus === 0 ? '正常' : '已删除' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="messageList.total > 0"
      class="pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="messageList.total"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import { SelectMessageAPI } from "../../api/index";
import { ElTable, ElTableColumn, ElTag, ElPagination, ElTooltip } from "element-plus";

// 定义消息项接口（与实际返回数据匹配）
interface MessageItem {
  mid: number; // 消息ID
  plid: number; // 会话ID
  sid: number; // 发送者ID
  content: string; // 消息内容
  delstatus: number; // 状态(0-正常, 1-已删除)
  time: number; // 发送时间戳(秒级)
  formattedTime?: string; // 格式化后的时间
}

// 定义分页结果接口
interface PageResult<T> {
  records: T[]; // 数据列表
  total?: number; // 总条数
  size?: number; // 每页条数
  current?: number; // 当前页
  pages?: number; // 总页数
  orders?: any[];
  optimizeCountSql?: boolean;
  hitCount?: boolean;
  countId?: any;
  maxLimit?: any;
  searchCount?: boolean;
}

export default defineComponent({
  name: "admin-message",
  components: {
    ElTable,
    ElTableColumn,
    ElTag,
    ElPagination,
    ElTooltip
  },
  setup() {
    // 消息列表数据
    const messageList = ref<PageResult<MessageItem>>({ records: [] });
    // 加载状态
    const isLoading = ref(true);
    // 分页参数
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 获取消息列表数据
    const getMessageList = async () => {
      try {
        isLoading.value = true;
        const res = await SelectMessageAPI({
          pageNum: currentPage.value,
          pageSize: pageSize.value
        });

        if (res.status === 200 && res.data) {
          // 直接使用res.data（已为解析后的对象），无需JSON.parse
          const data = res.data;
          // 格式化时间
          data.records.forEach((item: MessageItem) => {
            item.formattedTime = new Date(item.time * 1000).toLocaleString();
          });
          messageList.value = data;
        }
      } catch (error) {
        console.error("获取消息列表失败:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // 分页大小改变
    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      currentPage.value = 1;
      getMessageList();
    };

    // 当前页改变
    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
      getMessageList();
    };

    // 组件挂载时获取数据
    onMounted(() => {
      getMessageList();
    });

    return {
      messageList,
      isLoading,
      currentPage,
      pageSize,
      handleSizeChange,
      handleCurrentChange
    };
  }
});
</script>

<style lang="scss" scoped>
.admin-message {
  padding: 20px;

  .page-title {
    margin: 0 0 16px;
    font-size: 18px;
    color: #333;
    font-weight: 500;
  }

  .content-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  .pagination {
    margin-top: 16px;
    text-align: right;
  }
}
</style>