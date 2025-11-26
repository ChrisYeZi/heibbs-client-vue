<template>
  <div class="admin-permission">
    <h2 class="page-title">权限管理</h2>

    <!-- 操作按钮区 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加权限
      </el-button>
    </div>

    <!-- 权限列表区域（按类型分组） -->
    <div class="permission-groups">
      <div v-for="(group, type) in groupedPermissions" :key="type" class="permission-group">
        <div class="group-title">{{ type }}权限</div>
        
        <el-table
          v-loading="isLoading"
          :data="group"
          border
          stripe
          style="width: 100%; margin-top: 8px"
          :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
        >
          <el-table-column label="ID" prop="pid" width="80" align="center" />
          <el-table-column
            label="权限标识"
            prop="permission"
            align="left"
            min-width="150"
          />
          <el-table-column
            label="类型"
            prop="type"
            align="left"
            min-width="120"
          />
          <el-table-column
            label="描述"
            prop="description"
            min-width="300"
            align="left"
          />
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row.pid)"
                style="margin-left: 5px"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 权限编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form
        ref="permissionForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="权限类型" prop="type">
          <el-input v-model="formData.type" placeholder="请输入权限类型（如：管理组、帖子、用户等）" />
        </el-form-item>
        
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="请输入权限标识（英文）" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入权限描述"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted, defineComponent, computed } from "vue";
import {
  ElMessage,
  ElMessageBox,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElText,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  SelectPermissionAPI,
  InsertPermissionAPI,
  UpdatePermissionAPI,
  DeletePermissionAPI,
} from "@/api/index";

// 定义权限接口
interface PermissionItem {
  pid: number;
  type: string;
  permission: string;
  description: string;
}

// 表单验证规则
const formRules = {
  type: [
    { required: true, message: "请输入权限类型", trigger: "blur" },
    { min: 2, max: 20, message: "类型长度在 2 到 20 个字符", trigger: "blur" }
  ],
  permission: [
    { required: true, message: "请输入权限标识", trigger: "blur" },
    { pattern: /^[a-zA-Z_]+$/, message: "请使用英文和下划线", trigger: "blur" },
    { min: 2, max: 50, message: "标识长度在 2 到 50 个字符", trigger: "blur" }
  ],
  description: [
    { required: true, message: "请输入权限描述", trigger: "blur" },
    { min: 2, max: 200, message: "描述长度在 2 到 200 个字符", trigger: "blur" }
  ]
};

export default defineComponent({
  name: "admin-permission",
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElTable,
    ElTableColumn,
    ElDialog,
    ElText,
    Plus,
  },
  setup() {
    // 状态数据
    const permissionList = ref<PermissionItem[]>([]);
    const isLoading = ref(true);

    // 按类型分组的权限列表
    const groupedPermissions = computed(() => {
      const groups: Record<string, PermissionItem[]> = {};
      
      permissionList.value.forEach(permission => {
        if (!groups[permission.type]) {
          groups[permission.type] = [];
        }
        groups[permission.type].push(permission);
      });
      
      return groups;
    });

    // 弹窗相关
    const dialogVisible = ref(false);
    const permissionForm = ref<any>(null);

    // 表单数据
    const formData = reactive<PermissionItem>({
      pid: 0,
      type: "",
      permission: "",
      description: ""
    });

    // 获取弹窗标题
    const dialogTitle = computed(() => {
      return formData.pid ? "编辑权限" : "添加权限";
    });

    // 获取权限列表
    const getPermissionList = async () => {
      try {
        isLoading.value = true;
        const res: any = await SelectPermissionAPI();
        if (res.status === 200) {
          permissionList.value = res.data || [];
        } else {
          ElMessage.error(`获取权限列表失败: ${res.msg}`);
        }
      } catch (error) {
        console.error("获取权限列表出错:", error);
        ElMessage.error("获取权限列表失败");
      } finally {
        isLoading.value = false;
      }
    };

    // 打开添加弹窗
    const handleAdd = () => {
      // 重置表单
      Object.assign(formData, {
        pid: 0,
        type: "",
        permission: "",
        description: ""
      });
      dialogVisible.value = true;
    };

    // 打开编辑弹窗
    const handleEdit = (row: PermissionItem) => {
      // 复制数据到表单
      Object.assign(formData, { ...row });
      dialogVisible.value = true;
    };

    // 删除权限
    const handleDelete = async (id?: number) => {
      if (!id) return;

      try {
        const confirmResult = await ElMessageBox.confirm(
          "确定要删除这个权限吗？删除后使用该权限的用户组将失去此权限",
          "删除确认",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (confirmResult) {
          const res: any = await DeletePermissionAPI(id);
          if (res.status === 200) {
            ElMessage.success("删除成功");
            getPermissionList();
          } else {
            ElMessage.error(`删除失败: ${res.msg}`);
          }
        }
      } catch (error) {
        console.error("删除权限出错:", error);
        // 如果是用户取消，则不显示错误信息
        if ((error as any).message !== "cancel") {
          ElMessage.error("删除权限失败");
        }
      }
    };

    // 提交表单
    const handleSubmit = async () => {
      try {
        // 表单验证
        await permissionForm.value.validate();

        let res: any;
        if (formData.pid) {
          res = await UpdatePermissionAPI(formData);
        } else {
          res = await InsertPermissionAPI(formData);
        }

        if (res.status === 200) {
          ElMessage.success(formData.pid ? "更新成功" : "添加成功");
          dialogVisible.value = false;
          getPermissionList();
        } else {
          ElMessage.error(
            `${formData.pid ? "更新" : "添加"}失败: ${res.msg}`
          );
        }
      } catch (error) {
        console.error(`${formData.pid ? "更新" : "添加"}权限出错:`, error);
        // 如果是表单验证失败，则不显示错误信息
        if (!(error as any).message.includes("Validation failed")) {
          ElMessage.error(`${formData.pid ? "更新" : "添加"}权限失败`);
        }
      }
    };

    // 初始化加载数据
    onMounted(() => {
      getPermissionList();
    });

    return {
      permissionList,
      groupedPermissions,
      isLoading,
      dialogVisible,
      dialogTitle,
      permissionForm,
      formData,
      formRules,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-permission {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
}

.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.permission-group {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.group-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

// 表格内容换行优化
::v-deep .el-table__cell {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}
</style>