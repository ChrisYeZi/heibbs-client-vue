<template>
  <div class="admin-post">
    <h2 class="page-title">帖子管理</h2>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入帖子标题关键词搜索"
        clearable
        style="width: 300px; margin-right: 10px"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button v-if="hasSearched" @click="resetSearch">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="isLoading"
      :data="postList.records"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <!-- 序号列 -->
      <el-table-column label="帖子id" prop="pid" width="80" align="center" />

      <!-- 帖子标题（点击查看） -->
      <el-table-column
        label="帖子标题"
        prop="subject"
        align="left"
        min-width="200"
      >
        <template #default="scope">
          <el-link
            type="primary"
            @click="handleView(scope.row.pid)"
            :underline="false"
          >
            {{ scope.row.subject }}
          </el-link>
        </template>
      </el-table-column>

      <!-- 作者 -->
      <el-table-column label="作者" prop="author" width="120" align="center" />

      <!-- 发布时间 -->
      <el-table-column
        label="发布时间"
        prop="formattedCreateTime"
        width="180"
        align="center"
      />

      <!-- 浏览量 -->
      <el-table-column
        label="浏览量"
        prop="viewCount"
        width="90"
        align="center"
      />

      <!-- 回复数 -->
      <el-table-column
        label="回复数"
        prop="replyCount"
        width="90"
        align="center"
      />

      <!-- 状态 -->
      <el-table-column label="帖子状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.state)" size="small">
            {{ getStatusText(scope.row.state) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="center" width="260">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row.pid)"
            style="margin-right: 8px"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row.pid)"
            disabled
            style="margin-right: 8px"
          >
            删除
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="handleSetState(scope.row.pid)"
            disabled
          >
            设置状态
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-if="postList.total > 0"
      class="pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="postList.total"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right"
    />
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, computed, watch } from "vue";
import { GetPostListAPI, SearchPostAPI } from "@/api/index";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElTag, ElButton, ElLink, ElInput, ElPagination } from "element-plus";

// 帖子接口定义
interface PostItem {
  pid?: string | number;
  fid?: number;
  tid?: number;
  subject: string;
  formattedCreateTime: string;
  author: string;
  message: string;
  viewCount?: number;
  replyCount?: number;
  likeCount?: number;
  groupid?: number;
  extgroupid?: number;
  state?: number; // 0正常、1隐藏、2关闭、3屏蔽、4置顶
}

// 分页结果接口
interface PageResult<T> {
  records: T[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

// 搜索参数接口
interface SearchParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
}

type PostListResponse = PageResult<PostItem>;

export default defineComponent({
  name: "admin-post",
  components: { ElTag, ElButton, ElLink, ElInput, ElPagination },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // 核心数据
    const postList = ref<PostListResponse>({ records: [] });
    const isLoading = ref(true);

    // 搜索相关
    const searchKeyword = ref('');
    const hasSearched = ref(false);

    // 分页参数
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 状态映射
    const statusMap = computed(() => ({
      0: { text: "正常", type: "success" },
      1: { text: "隐藏内容", type: "warning" },
      2: { text: "已关闭", type: "info" },
      3: { text: "屏蔽关闭", type: "danger" },
      4: { text: "置顶", type: "primary" },
      5: { text: "会馆置顶", type: "primary" },
      default: { text: "未知状态", type: "default" },
    }));

    // 状态文本格式化
    const getStatusText = (state?: number) => {
      return (
        statusMap.value[state as keyof typeof statusMap.value]?.text ||
        statusMap.value.default.text
      );
    };

    // 状态标签样式
    const getStatusTagType = (state?: number) => {
      return (
        statusMap.value[state as keyof typeof statusMap.value]?.type ||
        statusMap.value.default.type
      );
    };

    // 从路由参数初始化页码、每页数量和搜索关键词
    const initFromRoute = () => {
      const { current, size, keyword } = route.query;
      if (current && !isNaN(Number(current))) {
        currentPage.value = Number(current);
      }
      if (size && !isNaN(Number(size))) {
        pageSize.value = Number(size);
      }
      if (keyword && typeof keyword === 'string') {
        searchKeyword.value = keyword;
        hasSearched.value = true;
      }
    };

    // 更新路由参数
    const updateRouteParams = () => {
      router.push({
        path: route.path,
        query: {
          ...(hasSearched.value && searchKeyword.value ? { keyword: searchKeyword.value } : {}),
          current: currentPage.value,
          size: pageSize.value,
        },
      });
    };

    // 获取帖子列表数据（支持搜索）
    const getData = async () => {
      try {
        isLoading.value = true;
        let res: any;
        
        // 根据是否有搜索关键词选择调用的API
        if (hasSearched.value && searchKeyword.value) {
          res = await SearchPostAPI({
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            keyword: searchKeyword.value
          } as SearchParams);
        } else {
          res = await GetPostListAPI({
            current: currentPage.value,
            size: pageSize.value,
          });
        }

        if (res.status === 200) {
          const newData = res.data;
          postList.value = newData;
        } else {
          console.error("获取帖子列表失败:", res.msg);
          ElMessage.error("获取帖子列表失败");
        }
      } catch (error) {
        console.error("获取帖子列表出错:", error);
        ElMessage.error("获取帖子列表异常");
      } finally {
        isLoading.value = false;
      }
    };

    // 搜索帖子
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        ElMessage.warning("请输入搜索关键词");
        return;
      }
      
      currentPage.value = 1; // 搜索时重置到第一页
      hasSearched.value = true;
      updateRouteParams();
      await getData();
    };

    // 重置搜索
    const resetSearch = () => {
      searchKeyword.value = '';
      hasSearched.value = false;
      currentPage.value = 1;
      updateRouteParams();
      getData();
    };

    // 处理每页条数变化
    const handleSizeChange = (val: number) => {
      pageSize.value = val;
      currentPage.value = 1; // 切换每页条数时重置到第一页
      updateRouteParams();
      getData();
    };

    // 处理当前页变化
    const handleCurrentChange = (val: number) => {
      currentPage.value = val;
      updateRouteParams();
      getData();
    };

    // 查看帖子
    const handleView = (pid?: string | number) => {
      if (!pid) return;
      router.push({ path: "/post/" + pid });
    };

    // 编辑帖子
    const handleEdit = (pid?: string | number) => {
      if (!pid) return;
      router.push({ path: "/editpost/" + pid });
    };

    // 预留：删除帖子
    const handleDelete = (pid?: string | number) => {
      ElMessage.info("删除功能待实现");
    };

    // 预留：设置状态
    const handleSetState = (pid?: string | number) => {
      ElMessage.info("设置状态功能待实现");
    };

    // 监听路由参数变化（包含关键词）
    watch(
      () => [route.query.current, route.query.size, route.query.keyword],
      () => {
        initFromRoute();
        getData();
      },
      { immediate: true }
    );

    return {
      postList,
      isLoading,
      currentPage,
      pageSize,
      searchKeyword,
      hasSearched,
      getStatusText,
      getStatusTagType,
      handleView,
      handleEdit,
      handleDelete,
      handleSetState,
      handleSearch,
      resetSearch,
      handleSizeChange,
      handleCurrentChange
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-post {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

// 搜索区域样式
.search-container {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

// 分页组件样式
.pagination {
  margin-top: 20px;
  text-align: right;
}

// 表格内容换行优化
::v-deep .el-table__cell {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}
</style>