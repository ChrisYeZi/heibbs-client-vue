<template>
  <div class="admin-banner">
    <h2 class="page-title">Banner轮播管理</h2>

    <!-- 操作按钮区 -->
    <div class="operation-bar">
      <el-button type="primary" @click="openAddBanner">
        <el-icon><Plus /></el-icon>添加Banner
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="isLoading"
      :data="bannerList"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <!-- 序号列 -->
      <el-table-column label="BannerID" prop="id" width="80" align="center" />

      <!-- Banner标题 -->
      <el-table-column
        label="Banner标题"
        prop="title"
        min-width="150"
        align="left"
      />

      <!-- 图片预览 -->
      <el-table-column label="图片预览" width="120" align="center">
        <template #default="scope">
          <el-image
            :src="scope.row.url"
            :preview-src-list="[scope.row.url]"
            style="width: 80px; height: 40px; object-fit: cover"
            fit="cover"
            fallback="https://via.placeholder.com/80x40?text=图片"
          />
        </template>
      </el-table-column>

      <!-- 跳转帖ID -->
      <el-table-column label="跳转帖ID" prop="pid" width="100" align="center">
        <template #default="scope">
          {{ scope.row.pid || "-" }}
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 排序优先级 -->
      <el-table-column
        label="排序优先级"
        prop="bindex"
        width="120"
        align="center"
      />

      <!-- 操作 -->
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="openEditBanner(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteBanner(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="bannerList.length > 0"
      class="pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="bannerList.length"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 添加/编辑Banner弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑Banner' : '添加Banner'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="bannerFormRef"
        :model="bannerForm"
        :rules="bannerRules"
        label-width="100px"
      >
        <el-form-item label="Banner标题" prop="title">
          <el-input
            v-model="bannerForm.title"
            placeholder="请输入Banner标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="图片URL" prop="url">
          <el-input
            v-model="bannerForm.url"
            placeholder="请输入Banner图片地址"
          />
          <el-image
            v-if="bannerForm.url"
            :src="bannerForm.url"
            style="width: 200px; height: 100px; margin-top: 10px"
            fit="cover"
          />
        </el-form-item>

        <el-form-item label="跳转帖ID" prop="pid">
          <el-input
            v-model="bannerForm.pid"
            placeholder="可选,点击Banner跳转的帖子ID"
            type="number"
            min="0"
            step="1"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="bannerForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 修复：添加step="1"确保输入整数 -->
        <el-form-item label="排序优先级" prop="bindex">
          <el-input
            v-model="bannerForm.bindex"
            placeholder="数值越高越靠前"
            type="number"
            min="0"
            step="1"
            precision="0"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitBannerForm"
          :loading="submitLoading"
        >
          {{ isEdit ? "更新Banner" : "添加Banner" }}
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
  ElImage,
  ElMessage,
  ElMessageBox,
  ElTooltip,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  SelectBannerAPI,
  InsertBannerAPI,
  UpdateBannerAPI,
  DeleteBannerAPI,
} from "../../api/index";

// 导入或定义ItypeAPI类型
interface ItypeAPI<T> {
  status: Number;
  msg: String;
  data: T;
}

// 定义Banner项接口
interface BannerItem {
  id: number;
  title: string;
  pid?: number;
  url: string;
  status: number;
  bindex: number;
}

// 类型转换工具函数
const toPrimitive = {
  number: (value: Number | number): number =>
    typeof value === "number" ? value : value.valueOf(),

  string: (value: String | string): string =>
    typeof value === "string" ? value : value.toString(),
};

export default defineComponent({
  name: "admin-banner",
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
    ElImage,
    ElTooltip,
    Plus,
  },
  setup() {
    // Banner列表数据
    const bannerList = ref<BannerItem[]>([]);
    const isLoading = ref(true);
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 弹窗相关
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const submitLoading = ref(false);
    const bannerFormRef = ref<any>(null);

    // Banner表单数据
    const bannerForm = reactive<BannerItem>({
      id: 0,
      title: "",
      pid: 0,
      url: "",
      status: 1,
      bindex: 0,
    });

    // 自定义验证函数：验证非负整数
    const validateNonNegativeInteger = (
      rule: any,
      value: number,
      callback: any
    ) => {
      if (value === undefined || value === null) {
        callback(new Error("请输入排序优先级"));
      } else {
        callback();
      }
    };

    // 表单验证规则 - 修复：使用自定义验证确保整数验证
    const bannerRules = reactive({
      title: [
        { required: true, message: "请输入Banner标题", trigger: "blur" },
        { min: 2, max: 50, message: "标题长度在2-50个字符", trigger: "blur" },
      ],
      url: [
        { required: true, message: "请输入图片URL", trigger: "blur" },
        { type: "url", message: "请输入有效的URL地址", trigger: "blur" },
      ],
      status: [{ required: true, message: "请选择状态", trigger: "change" }],
      bindex: [
        {
          required: true,
          validator: validateNonNegativeInteger,
          trigger: "blur",
        },
      ],
    });

    // 获取Banner列表数据
    const getBannerList = async () => {
      try {
        isLoading.value = true;
        const res: ItypeAPI<BannerItem[]> = await SelectBannerAPI();

        const status = toPrimitive.number(res.status);
        const msg = toPrimitive.string(res.msg);

        if (status === 200 && res.data) {
          bannerList.value = res.data;
        } else {
          ElMessage.error(`获取Banner列表失败: ${msg}`);
        }
      } catch (error) {
        console.error("获取Banner列表失败:", error);
        ElMessage.error("获取Banner列表失败，请重试");
      } finally {
        isLoading.value = false;
      }
    };

    // 分页大小改变
    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      currentPage.value = 1;
    };

    // 当前页改变
    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
    };

    // 打开添加Banner弹窗
    const openAddBanner = () => {
      Object.assign(bannerForm, {
        id: 0,
        title: "",
        pid: 0,
        url: "",
        status: 1,
        bindex: 0,
      });
      isEdit.value = false;
      dialogVisible.value = true;
      bannerFormRef.value?.clearValidate();
    };

    // 打开编辑Banner弹窗
    const openEditBanner = (row: BannerItem) => {
      Object.assign(bannerForm, {
        id: row.id,
        title: row.title,
        pid: row.pid || 0,
        url: row.url,
        status: row.status,
        bindex: row.bindex,
      });
      isEdit.value = true;
      dialogVisible.value = true;
      bannerFormRef.value?.clearValidate();
    };

    // 提交Banner表单
    const submitBannerForm = async () => {
      try {
        if (!bannerFormRef.value) return;
        const valid = await bannerFormRef.value.validate();
        if (!valid) return;

        submitLoading.value = true;
        let res: ItypeAPI<String>;

        if (isEdit.value) {
          res = await UpdateBannerAPI(bannerForm);
        } else {
          res = await InsertBannerAPI(bannerForm);
        }

        const status = toPrimitive.number(res.status);
        const msg = toPrimitive.string(res.msg);

        if (status === 200) {
          ElMessage.success(isEdit.value ? "Banner更新成功" : "Banner添加成功");
          dialogVisible.value = false;
          getBannerList();
        } else {
          ElMessage.error(
            `${isEdit.value ? "更新" : "添加"}Banner失败: ${msg}`
          );
        }
      } catch (error) {
        console.error(`${isEdit.value ? "更新" : "添加"}Banner失败:`, error);
        ElMessage.error(`${isEdit.value ? "更新" : "添加"}Banner失败，请重试`);
      } finally {
        submitLoading.value = false;
      }
    };

    // 删除Banner
    const handleDeleteBanner = async (id: number) => {
      try {
        const confirm = await ElMessageBox.confirm(
          "确定要删除该Banner吗？",
          "删除确认",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (confirm) {
          const res: ItypeAPI<String> = await DeleteBannerAPI(id);
          const status = toPrimitive.number(res.status);
          const msg = toPrimitive.string(res.msg);

          if (status === 200) {
            ElMessage.success("Banner删除成功");
            getBannerList();
          } else {
            ElMessage.error(`删除Banner失败: ${msg}`);
          }
        }
      } catch (error) {
        console.error("删除Banner失败:", error);
        if ((error as any).message !== "cancel") {
          ElMessage.error("删除Banner失败，请重试");
        }
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      getBannerList();
    });

    return {
      bannerList,
      isLoading,
      currentPage,
      pageSize,
      dialogVisible,
      isEdit,
      submitLoading,
      bannerFormRef,
      bannerForm,
      bannerRules,
      getBannerList,
      handleSizeChange,
      handleCurrentChange,
      openAddBanner,
      openEditBanner,
      submitBannerForm,
      handleDeleteBanner,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-banner {
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