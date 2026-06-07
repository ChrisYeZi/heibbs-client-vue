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
      <el-table-column label="图章" align="center" width="80">
        <template #default="scope"><span v-if="scope.row.stampName" style="color:#c0392b;font-weight:600">{{ scope.row.stampName }}</span></template>
      </el-table-column>
      <el-table-column label="帖子状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.state)" size="small">
            {{ getStatusText(scope.row.state) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="center" width="280">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row.pid)">编辑</el-button>
          <el-button type="warning" size="small" @click="handleSetState(scope.row)">设状态</el-button>
          <el-button size="small" @click="openStampDialog(scope.row)">图章</el-button>
          <el-button type="danger" size="small"
            @click="handleDelete(scope.row.pid)"
          >
            删除
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

    <!-- 设置帖子状态对话框 -->
    <el-dialog v-model="stateDialogVisible" title="设置帖子状态" width="400px">
      <p style="margin-bottom: 12px;">
        帖子ID: <strong>{{ currentPost.pid }}</strong>
        当前状态: <el-tag :type="getStatusTagType(currentPost.state)" size="small">{{ getStatusText(currentPost.state) }}</el-tag>
      </p>
      <el-radio-group v-model="selectedState">
        <el-radio :label="0">正常</el-radio>
        <el-radio :label="1">隐藏内容</el-radio>
        <el-radio :label="2">关闭</el-radio>
        <el-radio :label="3">屏蔽并关闭</el-radio>
        <el-radio :label="4">全局置顶</el-radio>
        <el-radio :label="5">板块内置顶</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="stateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSetState">确定</el-button>
      </template>
    </el-dialog>

    <!-- 设置图章对话框 -->
    <el-dialog v-model="stampDialogVisible" title="设置图章" width="400px">
      <p>帖子: <strong>#{{ stampTargetPid }}</strong></p>
      <el-radio-group v-model="selectedStampId">
        <el-radio :label="null">无图章</el-radio>
        <el-radio v-for="s in stampList" :key="s.id" :label="s.id">{{ s.name }}</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="stampDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmSetStamp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed, watch } from "vue";
import { GetPostListAPI, SearchPostAPI, SetPostStateAPI, DeletePostAPI, GetActiveStampsAPI, SetPostStampAPI } from "@/api/index";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

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
  state?: number;
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

    // 状态对话框
    const stateDialogVisible = ref(false);
    const currentPost = ref<PostItem>({ subject: '', author: '', message: '', formattedCreateTime: '' });
    const selectedState = ref(0);
    // 图章相关
    const stampDialogVisible=ref(false),stampTargetPid=ref(0),selectedStampId=ref<number|null>(null),stampList=ref<any[]>([]);
    const openStampDialog=async(row:any)=>{stampTargetPid.value=row.pid;selectedStampId.value=row.stampId||null;const r=await GetActiveStampsAPI();if(r.status===200)stampList.value=r.data;stampDialogVisible.value=true};
    const confirmSetStamp=async()=>{const r=await SetPostStampAPI(stampTargetPid.value,selectedStampId.value);if(r.status===200){ElMessage.success(String(r.msg||"设置成功"));stampDialogVisible.value=false;getData()}else ElMessage.error(String(r.msg||""))};

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

    // 从路由参数初始化
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

    // 获取帖子列表数据
    const getData = async () => {
      try {
        isLoading.value = true;
        let res: any;

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
          postList.value = res.data;
        } else {
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
      currentPage.value = 1;
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

    // 每页条数变化
    const handleSizeChange = (val: number) => {
      pageSize.value = val;
      currentPage.value = 1;
      updateRouteParams();
      getData();
    };

    // 当前页变化
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

    // 打开设置状态对话框
    const handleSetState = (row: PostItem) => {
      currentPost.value = row;
      selectedState.value = row.state ?? 0;
      stateDialogVisible.value = true;
    };

    // 确认设置状态
    const confirmSetState = async () => {
      const pid = Number(currentPost.value.pid);
      if (!pid) {
        ElMessage.error("无效的帖子ID");
        return;
      }
      try {
        const res = await SetPostStateAPI({ pid, state: selectedState.value });
        if (res.status === 200) {
          ElMessage.success(String(res.msg || "状态更新成功"));
          stateDialogVisible.value = false;
          getData(); // 刷新列表
        } else {
          ElMessage.error(String(res.msg || "状态更新失败"));
        }
      } catch (error) {
        console.error("设置状态出错:", error);
        ElMessage.error("操作异常");
      }
    };

    // 删除帖子
    const handleDelete = (pid?: string | number) => {
      const id = Number(pid);
      if (!id) {
        ElMessage.error("无效的帖子ID");
        return;
      }
      ElMessageBox.confirm(
        "确定要删除该帖子吗？此操作不可恢复！",
        "删除确认",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        try {
          const res = await DeletePostAPI(id);
          if (res.status === 200) {
            ElMessage.success("删除成功");
            getData(); // 刷新列表
          } else {
            ElMessage.error(String(res.msg || "删除失败"));
          }
        } catch (error) {
          console.error("删除帖子出错:", error);
          ElMessage.error("删除异常");
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 监听路由参数变化
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
      stateDialogVisible,
      currentPost,
      selectedState,
      getStatusText,
      getStatusTagType,
      handleView,
      handleEdit,
      handleDelete,
      handleSetState,
      confirmSetState,
      stampDialogVisible,stampTargetPid,selectedStampId,stampList,openStampDialog,confirmSetStamp,
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

.search-container {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

::v-deep .el-table__cell {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}
</style>
