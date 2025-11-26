<template>
  <div class="admin-group">
    <h2 class="page-title">用户组管理</h2>

    <!-- 操作按钮区 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd('group')">
        <el-icon><Plus /></el-icon>
        添加普通用户组
      </el-button>
      <el-button
        type="success"
        @click="handleAdd('extgroup')"
        style="margin-left: 10px"
      >
        <el-icon><Plus /></el-icon>
        添加特殊用户组
      </el-button>
    </div>

    <!-- 普通用户组表格 -->
    <div class="group-section">
      <h3 class="section-title">普通用户组</h3>
      <el-table
        v-loading="isLoading.group"
        :data="groupList"
        border
        stripe
        style="width: 100%; margin-top: 16px"
        :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
      >
        <el-table-column label="ID" prop="gid" width="80" align="center" />
        <el-table-column
          label="用户组名称"
          prop="gname"
          align="left"
          min-width="150"
        />

        <el-table-column label="颜色标识" width="100" align="center">
          <template #default="scope">
            <div
              class="color-indicator"
              :style="{ backgroundColor: scope.row.color }"
            ></div>
          </template>
        </el-table-column>

        <el-table-column
          label="所需积分"
          prop="credits"
          width="100"
          align="center"
        />

        <el-table-column label="权限" min-width="200" align="left">
          <template #default="scope">
            <div class="permission-list">
              <el-tag
                v-for="(perm, index) in parsePermissions(scope.row.permission)"
                :key="index"
                size="small"
                effect="light"
              >
                {{ perm }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="描述"
          prop="description"
          min-width="200"
          align="left"
        />

        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit('group', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete('group', scope.row.gid)"
              style="margin-left: 5px"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 特殊用户组表格 -->
    <div class="group-section" style="margin-top: 30px">
      <h3 class="section-title">特殊用户组</h3>
      <el-table
        v-loading="isLoading.extgroup"
        :data="extgroupList"
        border
        stripe
        style="width: 100%; margin-top: 16px"
        :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
      >
        <el-table-column label="ID" prop="gid" width="80" align="center" />
        <el-table-column
          label="用户组名称"
          prop="gname"
          align="left"
          min-width="150"
        />

        <el-table-column label="颜色标识" width="100" align="center">
          <template #default="scope">
            <div
              class="color-indicator"
              :style="{ backgroundColor: scope.row.color }"
            ></div>
          </template>
        </el-table-column>

        <!-- 特殊用户组表格的类型列 -->
        <el-table-column label="类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gtype === 1 ? 'danger' : 'info'">
              {{ scope.row.gtype === 1 ? "管理组" : "地方会馆" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="权限" min-width="200" align="left">
          <template #default="scope">
            <div class="permission-list">
              <el-tag
                v-for="(perm, index) in parsePermissions(scope.row.permission)"
                :key="index"
                size="small"
                effect="light"
              >
                {{ perm }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="描述"
          prop="description"
          min-width="200"
          align="left"
        />

        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit('extgroup', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete('extgroup', scope.row.gid)"
              style="margin-left: 5px"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 用户组编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form
        ref="groupForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户组名称" prop="gname">
          <el-input v-model="formData.gname" placeholder="请输入用户组名称" />
        </el-form-item>

        <el-form-item label="颜色值" prop="color">
          <el-input
            v-model="formData.color"
            placeholder="请输入颜色值，如#ff0000"
          />
          <el-color-picker
            v-model="formData.color"
            style="margin-top: 10px"
          ></el-color-picker>
        </el-form-item>

        <template v-if="dialogType === 'group'">
          <el-form-item label="所需积分" prop="credits">
            <el-input-number
              v-model="formData.credits"
              :min="0"
              placeholder="请输入所需积分"
            />
          </el-form-item>
        </template>

        <template v-if="dialogType === 'extgroup'">
          <!-- 特殊用户组表单的类型选择器 -->
          <el-form-item label="用户组类型" prop="gtype">
            <el-select v-model="formData.gtype" placeholder="请选择用户组类型">
              <el-option label="管理组" value="1" />
              <el-option label="地方会馆" value="2" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="权限列表" prop="selectedPermissions">
          <!-- 按类型分组显示权限 -->
          <div v-for="(permissions, type) in groupedPermissions" :key="type" class="permission-group">
            <div class="permission-group-title">{{ type }}</div>
            <el-checkbox-group v-model="formData.selectedPermissions" class="permission-group-items">
              <div v-for="perm in permissions" :key="perm.pid" class="permission-item">
                <el-checkbox :label="perm.permission">
                  <span class="permission-name">{{ perm.permission }}</span>
                  <span class="permission-desc">{{ perm.description }}</span>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入用户组描述"
            type="textarea"
            :rows="3"
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
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElDialog,
  ElInputNumber,
  ElColorPicker,
  ElText,
  ElCheckbox,
  ElCheckboxGroup,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  SelectGroupAPI,
  InsertGroupAPI,
  UpdateGroupAPI,
  DeleteGroupAPI,
  SelectExtGroupAPI,
  InsertExtGroupAPI,
  UpdateExtGroupAPI,
  DeleteExtGroupAPI,
  SelectPermissionAPI
} from "@/api/index";

// 定义权限接口
interface PermissionItem {
  pid: number;
  type: string;
  permission: string;
  description: string;
}

// 定义按类型分组的权限接口
interface GroupedPermissions {
  [key: string]: PermissionItem[];
}

// 定义普通用户组接口
interface GroupItem {
  gid: number;
  gname: string;
  permission: string[] | string;
  credits: number;
  description: string;
  color: string;
}

// 定义特殊用户组接口
interface ExtgroupItem {
  gid: number;
  gname: string;
  permission: string[] | string;
  gType: number;
  color: string;
  description: string;
}

// 表单验证规则
const formRules = {
  gname: [
    { required: true, message: "请输入用户组名称", trigger: "blur" },
    { min: 2, max: 20, message: "名称长度在 2 到 20 个字符", trigger: "blur" },
  ],
  color: [{ required: true, message: "请输入颜色值", trigger: "blur" }],
  selectedPermissions: [{ required: true, message: "请至少选择一个权限", trigger: "change" }],
  credits: [{ required: true, message: "请输入所需积分", trigger: "blur" }],
  gtype: [{ required: true, message: "请选择用户组类型", trigger: "change" }],
};

export default defineComponent({
  name: "admin-group",
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElButton,
    ElTable,
    ElTableColumn,
    ElTag,
    ElDialog,
    ElInputNumber,
    ElColorPicker,
    ElText,
    ElCheckbox,
    ElCheckboxGroup,
    Plus,
  },
  setup() {
    // 状态数据
    const groupList = ref<GroupItem[]>([]);
    const extgroupList = ref<ExtgroupItem[]>([]);
    const permissionList = ref<PermissionItem[]>([]);
    const isLoading = ref({
      group: true,
      extgroup: true,
      permission: false
    });

    // 按类型分组的权限
    const groupedPermissions = computed<GroupedPermissions>(() => {
      const groups: GroupedPermissions = {};
      
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
    const dialogType = ref<"group" | "extgroup">("group");
    const groupForm = ref<any>(null);

    // 表单数据
    const formData = reactive<(GroupItem & ExtgroupItem) & { selectedPermissions?: string[] }>({
      gid: 0,
      gname: "",
      permission: "",
      selectedPermissions: [],
      credits: 0,
      description: "",
      color: "#ffffff",
      gType: 1,
    });

    // 解析权限列表
    const parsePermissions = (
      permission: string[] | string | undefined
    ): string[] => {
      if (!permission) return [];
      if (Array.isArray(permission)) return permission;
      return permission.split(",");
    };

    // 获取弹窗标题
    const dialogTitle = computed(() => {
      const typeText =
        dialogType.value === "group" ? "普通用户组" : "特殊用户组";
      return formData.gid ? `编辑${typeText}` : `添加${typeText}`;
    });

    // 获取权限列表
    const getPermissionList = async () => {
      try {
        isLoading.value.permission = true;
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
        isLoading.value.permission = false;
      }
    };

    // 获取普通用户组列表
    const getGroupList = async () => {
      try {
        isLoading.value.group = true;
        const res: any = await SelectGroupAPI();
        if (res.status === 200) {
          groupList.value = res.data || [];
        } else {
          ElMessage.error(`获取普通用户组列表失败: ${res.msg}`);
        }
      } catch (error) {
        console.error("获取普通用户组列表出错:", error);
        ElMessage.error("获取普通用户组列表失败");
      } finally {
        isLoading.value.group = false;
      }
    };

    // 获取特殊用户组列表
    const getExtgroupList = async () => {
      try {
        isLoading.value.extgroup = true;
        const res: any = await SelectExtGroupAPI();
        if (res.status === 200) {
          extgroupList.value = res.data || [];
        } else {
          ElMessage.error(`获取特殊用户组列表失败: ${res.msg}`);
        }
      } catch (error) {
        console.error("获取特殊用户组列表出错:", error);
        ElMessage.error("获取特殊用户组列表失败");
      } finally {
        isLoading.value.extgroup = false;
      }
    };

    // 打开添加弹窗
    const handleAdd = (type: "group" | "extgroup") => {
      dialogType.value = type;
      // 重置表单
      Object.assign(formData, {
        gid: 0,
        gname: "",
        permission: "",
        selectedPermissions: [],
        credits: 0,
        description: "",
        color: "#ffffff",
        gtype: 1,
      });
      dialogVisible.value = true;
    };

    // 打开编辑弹窗
    const handleEdit = (
      type: "group" | "extgroup",
      row: GroupItem | ExtgroupItem
    ) => {
      dialogType.value = type;

      // 处理permission类型转换 - 转换为选中的权限数组
      let selectedPermissions: string[] = [];
      if (Array.isArray(row.permission)) {
        selectedPermissions = row.permission;
      } else if (row.permission) {
        selectedPermissions = row.permission.split(",");
      }

      // 复制数据到表单
      Object.assign(formData, {
        ...row,
        selectedPermissions,
        permission: "", // 清空原有的permission字段
      });
      dialogVisible.value = true;
    };

    // 删除用户组
    const handleDelete = async (type: "group" | "extgroup", id?: number) => {
      if (!id) return;

      try {
        const confirm = await ElMessageBox.confirm(
          "确定要删除这个用户组吗？",
          "删除确认",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (confirm) {
          let res: any;
          if (type === "group") {
            res = await DeleteGroupAPI(id);
          } else {
            res = await DeleteExtGroupAPI(id);
          }

          if (res.status === 200) {
            ElMessage.success("删除成功");
            if (type === "group") {
              getGroupList();
            } else {
              getExtgroupList();
            }
          } else {
            ElMessage.error(`删除失败: ${res.msg}`);
          }
        }
      } catch (error) {
        console.error("删除用户组出错:", error);
        // 如果是用户取消，则不显示错误信息
        if ((error as any).message !== "cancel") {
          ElMessage.error("删除用户组失败");
        }
      }
    };

    // 提交表单
    const handleSubmit = async () => {
      try {
        // 表单验证
        await groupForm.value.validate();

        // 处理权限列表格式 - 将选中的权限转换为逗号分隔的字符串
        const formDataCopy = {
          ...formData,
          permission: formData.selectedPermissions.join(","),
        };

        let res: any;
        if (dialogType.value === "group") {
          if (formDataCopy.gid) {
            res = await UpdateGroupAPI(formDataCopy);
          } else {
            res = await InsertGroupAPI(formDataCopy);
          }
        } else {
          if (formDataCopy.gid) {
            res = await UpdateExtGroupAPI(formDataCopy);
          } else {
            res = await InsertExtGroupAPI(formDataCopy);
          }
        }

        if (res.status === 200) {
          ElMessage.success(formDataCopy.gid ? "更新成功" : "添加成功");
          dialogVisible.value = false;
          getGroupList();
          getExtgroupList();
        } else {
          ElMessage.error(
            `${formDataCopy.gid ? "更新" : "添加"}失败: ${res.msg}`
          );
        }
      } catch (error) {
        console.error(`${formData.gid ? "更新" : "添加"}用户组出错:`, error);
        // 如果是表单验证失败，则不显示错误信息
        if (!(error as any).message.includes("Validation failed")) {
          ElMessage.error(`${formData.gid ? "更新" : "添加"}用户组失败`);
        }
      }
    };

    // 初始化加载数据
    onMounted(() => {
      getGroupList();
      getExtgroupList();
      getPermissionList();
    });

    return {
      groupList,
      extgroupList,
      permissionList,
      groupedPermissions,
      isLoading,
      dialogVisible,
      dialogType,
      dialogTitle,
      groupForm,
      formData,
      formRules,
      parsePermissions,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-group {
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

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.group-section {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.color-indicator {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  margin: 0 auto;
}

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// 权限分组样式
.permission-group {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.permission-group-title {
  background-color: #f5f7fa;
  padding: 8px 12px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.permission-group-items {
  padding: 12px;
}

// 权限选择项样式
.permission-item {
  margin-bottom: 8px;
}

.permission-name {
  font-weight: 500;
  margin-right: 8px;
}

.permission-desc {
  color: #666;
  font-size: 12px;
}

// 表格内容换行优化
::v-deep .el-table__cell {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}
</style>