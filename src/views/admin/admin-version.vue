<template>
  <div class="admin-version">
    <h2 class="page-title">版本控制管理</h2>

    <!-- 操作按钮区 -->
    <div class="operation-bar">
      <el-button type="primary" @click="openAddVersion">
        <el-icon><Plus /></el-icon>添加版本
      </el-button>
    </div>

    <!-- 版本列表表格 -->
    <el-table
      v-loading="isLoading"
      :data="versionList"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <!-- 版本ID -->
      <el-table-column label="版本ID" prop="id" width="80" align="center" />

      <!-- 版本号 -->
      <el-table-column
        label="版本号"
        prop="version"
        min-width="120"
        align="center"
      />

      <!-- 发布时间 -->
      <el-table-column
        label="发布时间"
        prop="time"
        min-width="180"
        align="center"
      >
        <template #default="scope">
          {{ scope.row.time ? formatTime(scope.row.time) : "-" }}
        </template>
      </el-table-column>

      <!-- 强制更新状态 -->
      <el-table-column label="强制更新" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.state === 0 ? 'warning' : 'info'">
            {{ scope.row.state === 0 ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 推送状态 -->
      <el-table-column label="推送状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.push === 0 ? 'success' : 'danger'">
            {{ scope.row.push === 0 ? "推送" : "不推送" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 更新说明 -->
      <el-table-column
        label="更新说明"
        prop="message"
        min-width="200"
        align="left"
      >
        <template #default="scope">
          {{ scope.row.message || "-" }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="openEditVersion(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteVersion(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-if="total > 0"
      class="pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加/编辑版本弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑版本' : '添加版本'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="versionFormRef"
        :model="versionForm"
        :rules="versionRules"
        label-width="100px"
      >
        <el-form-item label="版本号" prop="version">
          <el-input
            v-model="versionForm.version"
            placeholder="请输入版本号（如：alpha-0.1.0）"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="强制更新" prop="state">
          <el-radio-group v-model="versionForm.state">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="推送状态" prop="push">
          <el-radio-group v-model="versionForm.push">
            <el-radio :label="0">推送</el-radio>
            <el-radio :label="1">不推送</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="更新说明" prop="message">
          <el-input
            v-model="versionForm.message"
            placeholder="请输入版本更新说明（可选）"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="下载地址">
          <el-input v-model="versionForm.downloadUrl" placeholder="版本下载地址（可选，留空则无下载链接）"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitVersionForm"
          :loading="submitLoading"
        >
          {{ isEdit ? "更新版本" : "添加版本" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, reactive } from "vue";
import {
  ElTable,
  ElTableColumn,
  ElTag,
  ElPagination,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioGroup,
  ElRadio,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
// 导入API文件中已定义的类型和方法
import {
  GetAdminVersionListAPI,
  InsertVersionAPI,
  UpdateVersionAPI,
  DeleteVersion,
} from "../../api/index";

// 类型转换工具函数
const toPrimitive = {
  number: (value: Number | number): number =>
    typeof value === "number" ? value : value.valueOf(),

  string: (value: String | string): string =>
    typeof value === "string" ? value : value.toString(),
};

// 时间格式化工具函数（处理秒级时间戳）
const formatTime = (timeStr: string): string => {
  if (!timeStr) return "-";
  try {
    // 转换为毫秒级时间戳（后端返回的是秒级）
    const timestamp = Number(timeStr) * 1000;
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    return timeStr;
  }
};

// 版本实体类
interface VersionItem {
  /** 版本ID，数据库自动增加 */
  id?: number;
  /** 版本号（如：1.0.0） */
  version?: string;
  /** 版本发布时间时间戳，前端不填 */
  time?: string;
  /** 发布人UID，前端不填后端填写 */
  uid?: number;
  /** 版本状态（1-启用，0-禁用） */
  state?: number;
  /** 是否强制推送（1-是，0-否） */
  push?: number;
  /** 版本更新说明 */
  message?: string;
  /** 下载地址 */
  downloadUrl?: string;
}

// RestFulAPI规范封装接口类型
interface ItypeAPI<T> {
  // 状态码
  status: Number
  // 返回请求状态信息
  msg: String | null
  // 请求数据
  data: T
}

export default defineComponent({
  name: "admin-version",
  components: {
    ElTable,
    ElTableColumn,
    ElTag,
    ElPagination,
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElRadioGroup,
    ElRadio,
    Plus,
  },
  setup() {
    // 版本列表数据
    const versionList = ref<VersionItem[]>([]);
    const total = ref(0);
    const pages = ref(0);
    const isLoading = ref(true);
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 弹窗相关
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const submitLoading = ref(false);
    const versionFormRef = ref<any>(null);

    // 版本表单数据（前端无需处理time和uid）
    const versionForm = reactive<VersionItem>({
      id: 0,
      version: "",
      state: 0,
      push: 0,
      message: "",
      downloadUrl: "",
    });

    // 表单验证规则
    const versionRules = reactive({
      version: [
        { required: true, message: "请输入版本号", trigger: "blur" },
        { min: 1, max: 20, message: "版本号长度1-20个字符", trigger: "blur" },
      ],
      state: [
        { required: true, message: "请选择是否强制更新", trigger: "change" },
      ],
      push: [{ required: true, message: "请选择推送状态", trigger: "change" }],
    });

    // 获取版本列表数据（类型匹配：PageResult<VersionItem>）
    const getVersionList = async () => {
      try {
        isLoading.value = true;
        const params = {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
        };
        // 直接使用API定义的Res类型，无需重复声明ItypeAPI
        const res = await GetAdminVersionListAPI(params);

        const status = toPrimitive.number(res.status);
        const msg = String(res.data ?? '');

        if (status === 200 && res.data) {
          versionList.value = res.data.records || [];
          total.value = res.data.total || 0;
          pages.value = res.data.pages || 0;
          currentPage.value = res.data.current || 1;
          pageSize.value = res.data.size || 10;
        } else {
          ElMessage.error(`获取版本列表失败: ${msg}`);
        }
      } catch (error) {
        console.error("获取版本列表失败:", error);
        ElMessage.error("获取版本列表失败，请重试");
      } finally {
        isLoading.value = false;
      }
    };

    // 分页大小改变
    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      currentPage.value = 1;
      getVersionList();
    };

    // 当前页改变
    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
      getVersionList();
    };

    // 打开添加版本弹窗
    const openAddVersion = () => {
      Object.assign(versionForm, {
        id: 0,
        version: "",
        state: 0,
        push: 0,
        message: "",
        downloadUrl: "",
      });
      isEdit.value = false;
      dialogVisible.value = true;
      versionFormRef.value?.clearValidate();
    };

    // 打开编辑版本弹窗
    const openEditVersion = (row: VersionItem) => {
      Object.assign(versionForm, {
        id: row.id,
        version: row.version,
        state: row.state || 0,
        push: row.push || 0,
        message: row.message,
      });
      isEdit.value = true;
      dialogVisible.value = true;
      versionFormRef.value?.clearValidate();
    };

    // 提交版本表单
    const submitVersionForm = async () => {
      try {
        if (!versionFormRef.value) return;
        const valid = await versionFormRef.value.validate();
        if (!valid) return;

        submitLoading.value = true;
        let res: ItypeAPI<String>;

        if (isEdit.value) {
          res = await UpdateVersionAPI(versionForm);
        } else {
          res = await InsertVersionAPI(versionForm);
        }

        const status = toPrimitive.number(res.status);
        const msg = String(res.data ?? '');

        if (status === 200) {
          ElMessage.success(isEdit.value ? "版本更新成功" : "版本添加成功");
          dialogVisible.value = false;
          getVersionList();
        } else {
          ElMessage.error(`${isEdit.value ? "更新" : "添加"}版本失败: ${msg}`);
        }
      } catch (error) {
        console.error(`${isEdit.value ? "更新" : "添加"}版本失败:`, error);
        ElMessage.error(`${isEdit.value ? "更新" : "添加"}版本失败，请重试`);
      } finally {
        submitLoading.value = false;
      }
    };

    // 删除版本
    const handleDeleteVersion = async (id?: number) => {
      if (!id) return;
      try {
        const confirm = await ElMessageBox.confirm(
          "确定要删除该版本吗？",
          "删除确认",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (confirm) {
          const res = await DeleteVersion(id);
          const status = toPrimitive.number(res.status);
          const msg = String(res.data ?? '');

          if (status === 200) {
            ElMessage.success("版本删除成功");
            getVersionList();
          } else {
            ElMessage.error(`删除版本失败: ${msg}`);
          }
        }
      } catch (error) {
        console.error("删除版本失败:", error);
        if ((error as any).message !== "cancel") {
          ElMessage.error("删除版本失败，请重试");
        }
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      getVersionList();
    });

    return {
      versionList,
      total,
      pages,
      isLoading,
      currentPage,
      pageSize,
      dialogVisible,
      isEdit,
      submitLoading,
      versionFormRef,
      versionForm,
      versionRules,
      formatTime,
      getVersionList,
      handleSizeChange,
      handleCurrentChange,
      openAddVersion,
      openEditVersion,
      submitVersionForm,
      handleDeleteVersion,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-version {
  padding: 20px;

  .page-title {
    margin: 0 0 16px;
    font-size: 18px;
    color: #333;
    font-weight: 500;
  }

  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-start;
  }

  .pagination {
    margin-top: 16px;
    text-align: right;
  }

  ::v-deep .el-table .cell {
    overflow: visible;
  }
}
</style>