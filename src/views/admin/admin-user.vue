<template>
  <div class="admin-user">
    <h2 class="page-title">用户管理</h2>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入用户名或邮箱搜索"
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
      :data="userList.records"
      border
      stripe
      style="width: 100%; margin-top: 16px"
      :header-cell-style="{ background: '#f5f7fa', fontWeight: '500' }"
    >
      <!-- 序号列 -->
      <el-table-column label="用户ID" prop="uid" width="80" align="center" />

      <!-- 用户名 -->
      <el-table-column
        label="用户名"
        prop="username"
        align="left"
        min-width="120"
      />

      <!-- 邮箱 -->
      <el-table-column label="邮箱" prop="email" align="left" min-width="180" />

      <!-- 邮箱状态 -->
      <el-table-column label="邮箱状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.emailstatus === 1 ? 'success' : 'warning'">
            {{ scope.row.emailstatus === 1 ? "已验证" : "未验证" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 用户组 -->
      <el-table-column label="用户组" width="120" align="center">
        <template #default="scope">
          <span
            class="user-group"
            :style="{ backgroundColor: getGroupColor(scope.row.groupid) }"
          >
            {{ getGroupName(scope.row.groupid) }}
          </span>
        </template>
      </el-table-column>

      <!-- 特殊用户组 -->
      <el-table-column label="特殊用户组" width="120" align="center">
        <template #default="scope">
          <span
            v-if="scope.row.extgroupids"
            class="ext-user-group"
            :style="{
              backgroundColor: getExtGroupColor(scope.row.extgroupids),
            }"
          >
            {{ getExtGroupName(scope.row.extgroupids) }}
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>

      <!-- 积分 -->
      <el-table-column label="积分" prop="credits" width="100" align="center" />

      <!-- 注册时间 -->
      <el-table-column
        label="注册时间"
        prop="userRegdate"
        width="180"
        align="center"
      />

      <!-- 最后访问 -->
      <el-table-column
        label="最后访问"
        prop="userLastvisit"
        width="180"
        align="center"
      />

      <!-- 状态 -->
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleChangeStatus(scope.row)"
            >{{ scope.row.status === 0 ? "禁用" : "启用" }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <span class="page-info" style="margin-right: 8px">
        第 {{ currentPage }} 页 / 共 {{ userList.pages || 0 }} 页（共
        {{ userList.total || 0 }} 条）
      </span>

      <!-- 上一页按钮 -->
      <el-button
        @click="loadPrevPage"
        :loading="isLoadingMore"
        :disabled="currentPage === 1 || isLoadingMore"
        size="default"
      >
        上一页
      </el-button>

      <!-- 下一页按钮 -->
      <el-button
        @click="loadNextPage"
        :loading="isLoadingMore"
        :disabled="!hasMore || isLoadingMore"
        size="default"
      >
        {{ isLoadingMore ? "加载中..." : "下一页" }}
      </el-button>
    </div>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户"
      v-model="editDialogVisible"
      width="50%"
      @close="handleClose"
    >
      <el-form :model="form" ref="formRef" label-width="120px" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" disabled />
        </el-form-item>
        <el-form-item label="用户组" prop="groupid">
          <el-select v-model="form.groupid" placeholder="请选择用户组">
            <el-option
              v-for="group in groupList.groupDo"
              :key="group.gid"
              :label="group.gname"
              :value="group.gid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="特殊用户组" prop="extgroupids">
          <el-select
            v-model="form.extgroupids"
            placeholder="请选择特殊用户组"
            clearable
          >
            <el-option
              v-for="extGroup in groupList.extgroupDo"
              :key="extGroup.gid"
              :label="extGroup.gname"
              :value="extGroup.gid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="credits">
          <el-input v-model.number="form.credits" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-text="正常"
            inactive-text="禁用"
            :active-value="0"
            :inactive-value="1"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElTag,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElSwitch,
} from "element-plus";
import { SelectUserAPI, UpdateUserAPI, GetGroupListAPI, SearchUserAPI } from "@/api/index";

// 分页结果接口
interface PageResult<T> {
  records: T[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

// 用户信息接口
interface UserItem {
  uid: number;
  email: string;
  username: string;
  status: number;
  emailstatus: number;
  groupid: number;
  extgroupids?: number;
  regdate: number;
  regip: string;
  credits: number;
  newpm: string;
  newprompt: number;
  onlyacceptfriendpm: number;
  lastvisit: number;
  lastip: string;
  userRegdate?: string;
  userLastvisit?: string;
}

// 基础用户组接口
interface BaseGroup {
  gid: number;
  gname: string;
  color: string;
  permission?: string | null;
  credits?: number;
  description?: string | null;
  gtype?: number; // 特殊用户组特有
}

// 分组后的用户组
interface GroupItem {
  groupDo: BaseGroup[]; // 普通用户组
  extgroupDo: BaseGroup[]; // 特殊用户组
}

export default defineComponent({
  name: "admin-user",
  components: {
    ElTable,
    ElTableColumn,
    ElTag,
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElSwitch,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // 核心数据
    const userList = ref<PageResult<UserItem>>({ records: [] });
    const groupList = ref<GroupItem>({ groupDo: [], extgroupDo: [] });
    const isLoading = ref(true);
    const isLoadingMore = ref(false);

    // 搜索相关
    const searchKeyword = ref('');
    const hasSearched = ref(false);

    // 分页参数
    const currentPage = ref(1);
    const pageSize = ref(10);
    const hasMore = ref(true);

    // 编辑对话框相关
    const editDialogVisible = ref(false);
    const formRef = ref<any>(null);
    const form = ref<UserItem>({
      uid: 0,
      email: "",
      username: "",
      status: 0,
      emailstatus: 0,
      groupid: 0,
      regdate: 0,
      regip: "",
      credits: 0,
      newpm: "",
      newprompt: 0,
      onlyacceptfriendpm: 0,
      lastvisit: 0,
      lastip: "",
    });

    // 表单验证规则
    const rules = {
      groupid: [{ required: true, message: "请选择用户组", trigger: "change" }],
      credits: [
        { required: true, message: "请输入积分", trigger: "blur" },
        { type: "number", message: "积分必须为数字", trigger: "blur" },
      ],
    };

    // 从路由参数初始化页码
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

    // 获取用户列表数据（区分普通列表和搜索列表）
    const getData = async () => {
      try {
        isLoading.value = true;
        let res: any;
        
        // 根据是否有搜索关键词决定调用哪个接口
        if (hasSearched.value && searchKeyword.value) {
          res = await SearchUserAPI({
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            keyword: searchKeyword.value
          });
        } else {
          res = await SelectUserAPI({
            pageNum: currentPage.value,
            pageSize: pageSize.value,
          });
        }

        if (res.status === 200) {
          userList.value = res.data;
          hasMore.value = (res.data.current || 0) < (res.data.pages || 0);
        } else {
          ElMessage.error("获取用户列表失败");
          hasMore.value = false;
        }
      } catch (error) {
        console.error("用户列表请求失败:", error);
        ElMessage.error("获取用户列表异常");
        hasMore.value = false;
      } finally {
        isLoading.value = false;
      }
    };

    // 获取用户组数据
    const getGroupData = async () => {
      try {
        const res: any = await GetGroupListAPI();
        if (res.status === 200 && res.data) {
          groupList.value = {
            groupDo: res.data.groupDo || [],
            extgroupDo: res.data.extgroupDo || [],
          };
        } else {
          ElMessage.error("获取用户组数据失败");
        }
      } catch (error) {
        console.error("用户组请求失败:", error);
        ElMessage.error("获取用户组数据异常");
      }
    };

    // 搜索用户
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

    // 加载上一页
    const loadPrevPage = async () => {
      if (isLoadingMore.value || currentPage.value === 1) return;
      try {
        isLoadingMore.value = true;
        currentPage.value--;
        updateRouteParams();
        await getData();
      } finally {
        isLoadingMore.value = false;
      }
    };

    // 加载下一页
    const loadNextPage = async () => {
      if (isLoadingMore.value || !hasMore.value) return;
      try {
        isLoadingMore.value = true;
        currentPage.value++;
        updateRouteParams();
        await getData();
      } finally {
        isLoadingMore.value = false;
      }
    };

    // 编辑用户
    const handleEdit = (row: UserItem) => {
      form.value = { ...row };
      editDialogVisible.value = true;
      // 重置表单验证状态
      nextTick(() => {
        if (formRef.value) formRef.value.clearValidate();
      });
    };

    // 关闭对话框
    const handleClose = () => {
      editDialogVisible.value = false;
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };

    // 保存用户编辑
    const handleSave = async () => {
      if (!formRef.value) return;
      try {
        await formRef.value.validate();
        const res: any = await UpdateUserAPI(form.value);

        if (res.status === 200) {
          ElMessage.success("用户信息更新成功");
          editDialogVisible.value = false;
          getData(); // 重新加载数据
        } else {
          ElMessage.error(`更新失败: ${res.msg || "未知错误"}`);
        }
      } catch (error: any) {
        console.error("保存失败:", error);
        if (error.name !== "ValidationError") {
          ElMessage.error("保存用户信息异常");
        }
      }
    };

    // 更改用户状态
    const handleChangeStatus = async (row: UserItem) => {
      try {
        const newStatus = row.status === 0 ? 1 : 0;
        const res: any = await UpdateUserAPI({ ...row, status: newStatus });

        if (res.status === 200) {
          ElMessage.success(`用户已${newStatus === 0 ? "启用" : "禁用"}`);
          getData();
        } else {
          ElMessage.error(`操作失败: ${res.msg || "未知错误"}`);
        }
      } catch (error) {
        console.error("状态修改失败:", error);
        ElMessage.error("更改用户状态异常");
      }
    };

    // 获取用户组名称
    const getGroupName = (gid?: number) => {
      if (!gid) return "未知";
      const group = groupList.value.groupDo.find((item) => item.gid === gid);
      return group?.gname || "未知";
    };

    // 获取用户组颜色
    const getGroupColor = (gid?: number) => {
      if (!gid) return "#ccc";
      const group = groupList.value.groupDo.find((item) => item.gid === gid);
      return group?.color || "#ccc";
    };

    // 获取特殊用户组名称
    const getExtGroupName = (gid?: number) => {
      if (!gid) return "未知";
      const group = groupList.value.extgroupDo.find((item) => item.gid === gid);
      return group?.gname || "未知";
    };

    // 获取特殊用户组颜色
    const getExtGroupColor = (gid?: number) => {
      if (!gid) return "#ccc";
      const group = groupList.value.extgroupDo.find((item) => item.gid === gid);
      return group?.color || "#ccc";
    };

    // 监听路由变化
    watch(
      () => [route.query.current, route.query.size, route.query.keyword],
      () => {
        initFromRoute();
        getData();
      },
      { immediate: true }
    );

    // 初始化加载
    onMounted(() => {
      getGroupData();
    });

    // 解决Vue3 nextTick类型问题
    const nextTick = (fn: () => void) => {
      Promise.resolve().then(fn);
    };

    return {
      userList,
      groupList,
      isLoading,
      isLoadingMore,
      currentPage,
      hasMore,
      editDialogVisible,
      form,
      rules,
      formRef,
      searchKeyword,
      hasSearched,
      loadPrevPage,
      loadNextPage,
      handleEdit,
      handleClose,
      handleSave,
      handleChangeStatus,
      getGroupName,
      getGroupColor,
      getExtGroupName,
      getExtGroupColor,
      handleSearch,
      resetSearch
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-user {
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

.pagination-container {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-info {
  color: #666;
  font-size: 14px;
}

// 用户组样式
.user-group,
.ext-user-group {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

// 表格内容换行优化
::v-deep .el-table__cell {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}

// 对话框样式
::v-deep .el-dialog__body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 15px;
}
</style>