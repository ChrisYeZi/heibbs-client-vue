<template>
  <div class="admin-block">
    <h2 class="page-title">会馆管理</h2>

    <!-- 操作按钮区 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加会馆
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="isLoading"
      :data="blockList"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <!-- 序号列 -->
      <el-table-column label="ID" prop="id" width="80" align="center" />

      <!-- 会馆名称 -->
      <el-table-column
        label="会馆名称"
        prop="name"
        align="left"
        min-width="110"
      />

      <!-- 类型 -->
      <el-table-column label="类型" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getBlockTypeTagType(scope.row.type)">
            {{ getBlockTypeName(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 管理者 -->
      <el-table-column label="馆长" width="200" align="center">
        <template #default="scope">
          {{ scope.row.management || "" }}
        </template>
      </el-table-column>

      <!-- 财政 -->
      <el-table-column label="财政" prop="finance" width="100" align="center" />

      <!-- 税率 -->
      <el-table-column
        label="税率(%)"
        prop="taxRate"
        width="100"
        align="center"
      />

      <!-- 权限 -->
      <el-table-column label="权限" width="160" align="center">
        <template #default="scope">
          <el-tag :type="getPermissionTagType(scope.row.license)">
            {{ getPermissionText(scope.row.license) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 排序 -->
      <el-table-column label="排序" prop="bindex" width="80" align="center" />

      <!-- 操作 -->
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row.id)"
            style="margin-left: 5px"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar" v-if="total > 0">
      <span class="page-info"> 共 {{ total }} 个会馆 </span>
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
      />
    </div>

    <!-- 会馆编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加会馆' : '编辑会馆'"
      width="600px"
    >
      <el-form
        ref="blockForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="会馆名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入会馆名称" />
        </el-form-item>

        <el-form-item label="会馆类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择会馆类型">
            <el-option label="会馆" value="1" />
            <el-option label="地方会馆" value="2" />
            <el-option label="小组" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="馆长" prop="management">
          <el-select
            v-model="formData.management"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请搜索并选择馆长"
            :remote-method="remoteSearchUser"
            :loading="searchLoading"
            style="width: 100%"
            @change="handleSelectChange"
            :popper-append-to-body="false"
          >
            <!-- 添加空数据提示 -->
            <template v-if="userList.length === 0 && !searchLoading && searchKeyword">
              <el-option disabled value="">暂无匹配用户</el-option>
            </template>
            <el-option
              v-for="user in userList"
              :key="`user-${user.uid}`"
              :label="user.username"
              :value="user.username"
            />
          </el-select>
          <!-- 显示已选用户 -->
          <div v-if="formData.management.length > 0" class="selected-users">
            <span class="label">已选择：</span>
            <span class="names">{{ formData.management.join('、') }}</span>
          </div>
        </el-form-item>

        <el-form-item label="财政" prop="finance">
          <el-input-number
            v-model="formData.finance"
            :min="0"
            placeholder="请输入财政金额"
          />
        </el-form-item>

        <el-form-item label="税率(%)" prop="taxRate">
          <el-input-number
            v-model="formData.taxRate"
            :min="0"
            :max="100"
            placeholder="请输入税率"
          />
        </el-form-item>

        <el-form-item label="权限设置" prop="license">
          <el-select v-model="formData.license" placeholder="请选择权限设置">
            <el-option label="可见可发表" value="0" />
            <el-option label="可见不可发表" value="1" />
            <el-option label="仅成员可见可发表" value="2" />
            <el-option label="仅管理者可见可发表" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="允许搬运">
          <el-switch
            v-model="formData.repost"
            active-text="允许"
            inactive-text="禁止"
          />
        </el-form-item>

        <el-form-item label="排序值" prop="bindex">
          <el-input-number
            v-model="formData.bindex"
            :min="0"
            placeholder="数值越高越靠前"
          />
        </el-form-item>

        <el-form-item label="图标地址" prop="imgUrl">
          <el-input v-model="formData.imgUrl" placeholder="请输入图标URL" />
        </el-form-item>

        <el-form-item label="横幅地址" prop="bannerurl">
          <el-input v-model="formData.bannerurl" placeholder="请输入横幅URL" />
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
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
import { ref, reactive, onMounted, defineComponent, watch } from "vue";
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElPagination,
  ElSwitch,
  ElInputNumber,
  ElMessageBox,
  ElDialog,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  GetBlockListAPI,
  InsertBlockAPI,
  UpdateBlockAPI,
  DeleteBlockAPI,
  SearchUserAPI,
} from "@/api/index";

// 自定义防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 定义用户类型接口（匹配API返回结构）
interface UserItem {
  uid: number;
  username: string;
  email: string;
  status: number;
  [key: string]: any;
}

// 定义搜索参数接口
interface SearchParams {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}

// 定义会馆数据接口
interface BlockItem {
  id?: number;
  name?: string;
  management?: string | null; // 存储逗号分隔的用户名
  license?: number;
  type?: number;
  repost?: boolean;
  finance?: number;
  taxRate?: number;
  title?: string | string[];
  imgUrl?: string;
  bindex?: number;
  bannerurl?: string;
  players?: string;
}

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: "请输入会馆名称", trigger: "blur" },
    { min: 2, max: 20, message: "名称长度在 2 到 20 个字符", trigger: "blur" },
  ],
  type: [{ required: true, message: "请选择会馆类型", trigger: "change" }],
  management: [], // 非必填
  finance: [{ required: true, message: "请输入初始财政金额", trigger: "blur" }],
  taxRate: [{ required: true, message: "请输入税率", trigger: "blur" }],
  license: [{ required: true, message: "请选择权限设置", trigger: "change" }],
  bindex: [{ required: true, message: "请输入排序值", trigger: "blur" }],
  title: [],
};

export default defineComponent({
  name: "admin-block",
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
    ElPagination,
    ElSwitch,
    ElInputNumber,
    ElDialog,
    Plus,
  },
  setup() {
    // 状态数据
    const blockList = ref<BlockItem[]>([]);
    const isLoading = ref(true);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 用户搜索相关状态
    const userList = ref<UserItem[]>([]);
    const searchLoading = ref(false);
    const searchKeyword = ref("");
    
    // 防抖处理的远程搜索函数
    const debouncedSearch = debounce(async (keyword: string) => {
      await remoteSearchUser(keyword);
    }, 300);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref<"add" | "edit">("add");
    const blockForm = ref<any>(null);

    // 表单数据
    const formData = reactive<{
      id?: number;
      name: string;
      management: string[]; // 存储选中的用户名数组
      license: number;
      type: number;
      repost: boolean;
      finance: number;
      taxRate: number;
      title: string;
      imgUrl: string;
      bindex: number;
      bannerurl: string;
      players: string;
    }>({
      name: "",
      management: [], // 改为数组存储多选的用户名
      license: 0,
      type: 1,
      repost: false,
      finance: 0,
      taxRate: 0,
      title: "",
      imgUrl: "",
      bindex: 0,
      bannerurl: "",
      players: "",
    });

    // 获取会馆类型名称
    const getBlockTypeName = (type?: number): string => {
      const typeMap: Record<number, string> = {
        1: "会馆",
        2: "地方会馆",
        3: "小组",
      };
      return typeMap[type || 0] || "未知类型";
    };

    // 获取会馆类型标签样式
    const getBlockTypeTagType = (type?: number): string => {
      const typeMap: Record<number, string> = {
        1: "primary",
        2: "success",
        3: "info",
      };
      return typeMap[type || 0] || "default";
    };

    // 获取权限文本
    const getPermissionText = (permission?: number): string => {
      const perm = Number(permission);
      const permissionMap: Record<number, string> = {
        0: "可见可发表",
        1: "可见不可发表",
        2: "仅成员可见可发表",
        3: "仅管理者可见可发表",
      };
      return permissionMap[perm] || "未知权限";
    };

    // 获取权限标签样式
    const getPermissionTagType = (permission?: number): string => {
      const perm = Number(permission);
      const permissionMap: Record<number, string> = {
        0: "success",
        1: "warning",
        2: "info",
        3: "primary",
      };
      return permissionMap[perm] || "default";
    };

    // 处理选择变化
    const handleSelectChange = (val: any) => {
      console.log("选择变化:", val);
      // 确保值是数组
      if (!Array.isArray(val)) {
        formData.management = val ? [val] : [];
      }
    };

    // 远程搜索用户（修复数据结构问题）
    const remoteSearchUser = async (keyword: string) => {
      searchKeyword.value = keyword.trim();
      console.log("搜索用户:", searchKeyword.value);
      
      if (!searchKeyword.value) {
        userList.value = [];
        return;
      }

      searchLoading.value = true;
      try {
        const params: SearchParams = {
          keyword: searchKeyword.value,
          pageNum: 1,
          pageSize: 30,
        };
        const res: any = await SearchUserAPI(params);
        
        console.log("API返回:", res);
        
        // 正确处理API返回数据结构：从records数组获取用户列表
        let users = [];
        if (res && res.status === 200 && res.data) {
          // API返回的是data.records数组
          users = Array.isArray(res.data.records) ? res.data.records : [];
        }
        
        console.log("用户列表:", users);
        
        // 过滤有效用户数据
        userList.value = users.filter(user => {
          return user && user.username; // 确保有用户名
        });
        
        console.log("过滤后用户列表:", userList.value);
        
        // 如果有数据但显示有问题，手动触发更新
        if (userList.value.length > 0) {
          // 强制更新
          userList.value = [...userList.value];
        }
        
      } catch (error) {
        console.error("搜索用户出错:", error);
        userList.value = [];
        ElMessage.error("搜索用户失败");
      } finally {
        searchLoading.value = false;
      }
    };

    // 获取会馆列表数据
    const getBlockList = async () => {
      try {
        isLoading.value = true;
        const res: any = await GetBlockListAPI();
        if (res.status === 200) {
          blockList.value = res.data || [];
          total.value = blockList.value.length;
        } else {
          ElMessage.error(`获取会馆列表失败: ${res.msg}`);
        }
      } catch (error) {
        console.error("获取会馆列表出错:", error);
        ElMessage.error("获取会馆列表失败");
      } finally {
        isLoading.value = false;
      }
    };

    // 分页变化处理
    const handlePageChange = (page: number) => {
      currentPage.value = page;
      getBlockList();
    };

    // 打开添加弹窗
    const handleAdd = () => {
      dialogType.value = "add";
      // 重置表单
      Object.assign(formData, {
        id: undefined,
        name: "",
        management: [], // 重置为空数组
        license: 0,
        type: 1,
        repost: false,
        finance: 0,
        taxRate: 0,
        title: "",
        imgUrl: "",
        bindex: 0,
        bannerurl: "",
        players: "",
      });
      userList.value = []; // 清空用户列表
      dialogVisible.value = true;
    };

    // 打开编辑弹窗
    const handleEdit = (row: BlockItem) => {
      dialogType.value = "edit";
      
      // 处理管理者字段（逗号分隔的字符串转数组）
      const managementArr = row.management 
        ? row.management.split(",").filter(item => item.trim()) 
        : [];

      console.log("编辑时的管理者:", managementArr);

      // 处理title字段
      let titleStr = "";
      if (Array.isArray(row.title)) {
        titleStr = row.title.join(",");
      } else if (row.title) {
        titleStr = String(row.title);
      }

      // 复制数据到表单
      Object.assign(formData, {
        ...row,
        management: managementArr, // 转为数组用于回显
        title: titleStr,
        license: row.license !== undefined ? Number(row.license) : 0,
        type: row.type !== undefined ? Number(row.type) : 1,
        finance: row.finance || 0,
        taxRate: row.taxRate || 0,
        bindex: row.bindex || 0,
        repost: row.repost || false,
      });

      dialogVisible.value = true;
    };

    // 删除会馆
    const handleDelete = async (id?: number) => {
      if (!id) return;

      try {
        const confirm = await ElMessageBox.confirm(
          "确定要删除这个会馆吗？",
          "删除确认",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        if (confirm) {
          const res: any = await DeleteBlockAPI(id);
          if (res.status === 200) {
            ElMessage.success("删除成功");
            getBlockList();
          } else {
            ElMessage.error(`删除失败: ${res.msg}`);
          }
        }
      } catch (error) {
        console.error("删除会馆出错:", error);
        // 修复布尔值和字符串比较的问题
        if ((error as any).message !== "cancel") {
          ElMessage.error("删除会馆失败");
        }
      }
    };

    // 提交表单
    const handleSubmit = async () => {
      try {
        // 表单验证
        await blockForm.value.validate();

        console.log("提交表单数据:", formData);

        // 处理提交数据：将管理者数组转为逗号分隔的字符串
        const managementStr = formData.management.join(",");

        // 处理title字段
        let titleValue = formData.title;
        if (Array.isArray(formData.title)) {
          titleValue = formData.title.join(",");
        }

        // 构造提交数据
        const formDataCopy = {
          ...formData,
          management: managementStr || null, // 空数组转为null
          title: titleValue || "",
        };

        let res: any;
        if (dialogType.value === "add") {
          res = await InsertBlockAPI(formDataCopy);
        } else {
          res = await UpdateBlockAPI(formDataCopy);
        }

        if (res.status === 200) {
          ElMessage.success(
            dialogType.value === "add" ? "添加成功" : "更新成功"
          );
          dialogVisible.value = false;
          getBlockList();
        } else {
          ElMessage.error(
            `${dialogType.value === "add" ? "添加" : "更新"}失败: ${res.msg}`
          );
        }
      } catch (error) {
        console.error(
          `${dialogType.value === "add" ? "添加" : "更新"}会馆出错:`,
          error
        );
        if ((error as any).message && !(error as any).message.includes("Validation failed")) {
          ElMessage.error(
            `${dialogType.value === "add" ? "添加" : "更新"}会馆失败`
          );
        }
      }
    };

    // 监听用户列表变化，调试用
    watch(userList, (newVal) => {
      console.log("用户列表变化:", newVal);
    }, { deep: true });

    // 初始化加载数据
    onMounted(() => {
      getBlockList();
    });

    return {
      blockList,
      isLoading,
      total,
      currentPage,
      pageSize,
      dialogVisible,
      dialogType,
      blockForm,
      formData,
      formRules,
      userList,
      searchLoading,
      searchKeyword,
      getBlockTypeName,
      getBlockTypeTagType,
      getPermissionText,
      getPermissionTagType,
      remoteSearchUser: debouncedSearch, // 使用防抖函数
      handleSelectChange,
      handlePageChange,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-block {
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

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-info {
  color: #666;
  font-size: 14px;
}

// 多选选择框样式优化
::v-deep .el-select__tags {
  flex-wrap: wrap;
}

// 多选标签样式优化
::v-deep .el-tag {
  margin-bottom: 2px;
}

// 表格内容换行优化
::v-deep .el-table__cell {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}

// 修复选择框下拉显示问题
::v-deep .el-select-dropdown {
  max-height: 300px !important;
}

// 已选用户显示样式
.selected-users {
  margin-top: 8px;
  font-size: 12px;
  
  .label {
    color: #999;
    margin-right: 4px;
  }
  
  .names {
    color: #666;
    word-break: break-all;
  }
}

// 确保选择框选项正常显示
::v-deep .el-select-dropdown__item {
  height: auto !important;
  line-height: normal !important;
  padding: 8px 16px !important;
  white-space: nowrap !important;
}
</style>