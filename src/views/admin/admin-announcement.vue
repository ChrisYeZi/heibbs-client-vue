<template>
  <div class="admin-announcement">
    <div class="page-header">
      <h2 class="page-title">公告管理</h2>
      <el-button type="primary" @click="showAddDialog">添加公告</el-button>
    </div>

    <!-- 公告列表表格 -->
    <el-table
      v-loading="isLoading"
      :data="announcementList.records"
      border
      stripe
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <el-table-column label="ID" prop="id" width="60" align="center" />
      <el-table-column label="标题" prop="title" min-width="150" show-overflow-tooltip />
      <el-table-column label="板块" width="100" align="center">
        <template #default="scope">
          {{ scope.row.fid === 0 ? '全局' : '板块#' + scope.row.fid }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="displayOrder" width="70" align="center" />
      <el-table-column label="发布时间" width="170" align="center">
        <template #default="scope">
          {{ scope.row.dateline ? new Date(scope.row.dateline * 1000).toLocaleString('zh-CN') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="showEditDialog(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="announcementList.total > 0"
      class="pagination"
      layout="total, prev, pager, next"
      :total="announcementList.total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '添加公告'"
      width="550px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="公告标题">
          <el-input v-model="formData.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容（支持HTML）"
          />
        </el-form-item>
        <el-form-item label="所属板块">
          <el-input-number v-model="formData.fid" :min="0" placeholder="0=全局公告" />
          <span style="margin-left: 8px; color: #909399; font-size: 12px;">0=全局公告</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="formData.statusBool"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.displayOrder" :min="0" />
          <span style="margin-left: 8px; color: #909399; font-size: 12px;">越大越靠前</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent } from "vue";
import { SelectAnnouncementAPI, InsertAnnouncementAPI, UpdateAnnouncementAPI, DeleteAnnouncementAPI } from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";

interface AnnouncementItem {
  id?: number;
  title: string;
  content: string;
  authorid?: number;
  fid?: number;
  status?: number;
  displayOrder?: number;
  dateline?: number;
}

interface PageResult<T> {
  records: T[];
  total?: number;
}

export default defineComponent({
  name: "admin-announcement",
  setup() {
    const isLoading = ref(true);
    const announcementList = ref<PageResult<AnnouncementItem>>({ records: [] });
    const currentPage = ref(1);
    const pageSize = ref(30);

    // 对话框
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const formData = reactive<AnnouncementItem & { statusBool: boolean }>({
      title: "",
      content: "",
      fid: 0,
      statusBool: true,
      displayOrder: 0,
    });

    const fetchData = async () => {
      try {
        isLoading.value = true;
        const res = await SelectAnnouncementAPI({
          pageNum: currentPage.value,
          pageSize: pageSize.value,
        });
        if (res.status === 200) {
          announcementList.value = res.data;
        }
      } catch (error) {
        console.error("获取公告列表失败:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const resetForm = () => {
      formData.id = undefined;
      formData.title = "";
      formData.content = "";
      formData.fid = 0;
      formData.statusBool = true;
      formData.displayOrder = 0;
    };

    const showAddDialog = () => {
      isEdit.value = false;
      resetForm();
      dialogVisible.value = true;
    };

    const showEditDialog = (row: AnnouncementItem) => {
      isEdit.value = true;
      formData.id = row.id;
      formData.title = row.title;
      formData.content = row.content;
      formData.fid = row.fid || 0;
      formData.statusBool = row.status === 1;
      formData.displayOrder = row.displayOrder || 0;
      dialogVisible.value = true;
    };

    const submitForm = async () => {
      if (!formData.title.trim()) {
        ElMessage.warning("标题不能为空");
        return;
      }
      const data: AnnouncementItem = {
        id: formData.id,
        title: formData.title,
        content: formData.content,
        fid: formData.fid,
        status: formData.statusBool ? 1 : 0,
        displayOrder: formData.displayOrder,
      };

      try {
        const res = isEdit.value
          ? await UpdateAnnouncementAPI(data)
          : await InsertAnnouncementAPI(data);
        if (res.status === 200) {
          ElMessage.success(String(res.msg || "操作成功"));
          dialogVisible.value = false;
          fetchData();
        } else {
          ElMessage.error(String(res.msg || "操作失败"));
        }
      } catch (error) {
        ElMessage.error("操作异常");
      }
    };

    const handleDelete = (id?: number) => {
      if (!id) return;
      ElMessageBox.confirm("确定删除该公告吗？", "删除确认", {
        type: "warning",
      }).then(async () => {
        const res = await DeleteAnnouncementAPI(id);
        if (res.status === 200) {
          ElMessage.success("删除成功");
          fetchData();
        } else {
          ElMessage.error(String(res.msg || "删除失败"));
        }
      }).catch(() => {});
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchData();
    };

    fetchData();

    return {
      isLoading,
      announcementList,
      currentPage,
      pageSize,
      dialogVisible,
      isEdit,
      formData,
      showAddDialog,
      showEditDialog,
      submitForm,
      handleDelete,
      handlePageChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-announcement {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
