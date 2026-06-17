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
      <el-table-column label="操作" width="400" align="center">
        <template #default="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" @click="openCreditDlg(scope.row)" style="background:#FCF9E0;border-color:#F6AD47;color:#728567">积分</el-button>
          <el-button size="mini" @click="openItemDlg(scope.row)" style="background:#FCF9E0;border-color:#F6AD47;color:#728567">物品</el-button>
          <el-button size="mini" @click="openMedalDlg(scope.row)" style="background:#FCF9E0;border-color:#F6AD47;color:#728567">勋章</el-button>
          <el-button v-if="scope.row.groupid===1" size="mini" type="success" @click="doUnban(scope.row.uid)">解封</el-button>
          <el-button v-if="scope.row.groupid===1||scope.row.groupid===2" size="mini" type="warning" @click="doAdminUnmute(scope.row.uid)">解禁</el-button>
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
      width="400px"
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
            <el-option label="无" :value="0"/>
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

    <!-- 积分编辑对话框 — 直接编辑各积分值 -->
    <el-dialog title="积分编辑" v-model="creditDlgVisible" width="420px">
      <p style="margin-bottom:10px;color:#728567">用户: <b>{{ creditTarget?.username }}</b> (UID: {{ creditTarget?.uid }})</p>
      <el-form label-width="120px">
        <el-form-item label="灵气 (extcredits1)">
          <el-input-number v-model="creditForm.extcredits1" :min="0" style="width:200px"/>
        </el-form-item>
        <el-form-item label="妖灵币 (extcredits2)">
          <el-input-number v-model="creditForm.extcredits2" :min="0" style="width:200px"/>
        </el-form-item>
        <el-form-item label="值钱玉佩 (extcredits3)">
          <el-input-number v-model="creditForm.extcredits3" :min="0" style="width:200px"/>
        </el-form-item>
        <el-form-item label="天明珠 (extcredits4)">
          <el-input-number v-model="creditForm.extcredits4" :min="0" style="width:200px"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creditDlgVisible=false">取消</el-button>
        <el-button type="primary" @click="doSetCredit" style="background:#F6AD47;border-color:#F6AD47">保存</el-button>
      </template>
    </el-dialog>

    <!-- 物品管理对话框 — 已有物品 + 发放 -->
    <el-dialog title="物品管理" v-model="itemDlgVisible" width="520px">
      <p style="margin-bottom:10px;color:#728567">用户: <b>{{ itemTarget?.username }}</b> (UID: {{ itemTarget?.uid }})</p>
      <!-- 已有物品 -->
      <div v-if="userItems.length" style="margin-bottom:12px">
        <h4 style="font-size:14px;color:#728567;margin:0 0 6px">已有物品</h4>
        <div class="user-item-table">
          <div v-for="ui in userItems" :key="'ui'+ui.id" class="user-item-row">
            <img v-if="getItemInfo(ui.itemId)?.icon" :src="getItemInfo(ui.itemId).icon" style="width:28px;height:28px;border-radius:4px;object-fit:cover"/>
            <span style="flex:1;font-size:13px;color:#728567;margin:0 8px">{{ getItemInfo(ui.itemId)?.name || '物品#'+ui.itemId }}</span>
            <el-input v-model="editItemQtys[ui.id]" size="small" style="width:70px" placeholder="数量"/>
            <el-button size="mini" @click="doSaveItemQty(ui.id)" style="margin-left:4px;background:#F6AD47;border-color:#F6AD47;color:#fff">保存</el-button>
            <el-button size="mini" type="danger" @click="doDeleteItem(ui.id)" style="margin-left:4px">删除</el-button>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无物品" :image-size="[60,60]"/>
      <!-- 发放物品 -->
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #FCF9E0">
        <h4 style="font-size:14px;color:#728567;margin:0 0 6px">发放物品</h4>
        <div style="display:flex;gap:8px;align-items:center">
          <el-select v-model="itemForm.itemId" style="width:200px" placeholder="选择物品" filterable>
            <el-option v-for="it in itemList" :key="it.id" :label="it.name" :value="it.id"/>
          </el-select>
          <el-input-number v-model="itemForm.qty" :min="1" size="small" style="width:80px"/>
          <el-button type="primary" size="small" @click="doGrantItem" style="background:#F6AD47;border-color:#F6AD47">发放</el-button>
        </div>
      </div>
      <template #footer><el-button @click="itemDlgVisible=false">关闭</el-button></template>
    </el-dialog>

    <!-- 勋章管理对话框 — 修正图片和名称字段 -->
    <el-dialog title="勋章管理" v-model="medalDlgVisible" width="500px">
      <p style="margin-bottom:10px;color:#728567">用户: <b>{{ medalTarget?.username }}</b> (UID: {{ medalTarget?.uid }})</p>
      <!-- 已有勋章 -->
      <div class="medal-section" v-if="userMedals.length">
        <h4 style="font-size:14px;color:#728567;margin:0 0 6px">已有勋章</h4>
        <div class="user-medal-list">
          <div v-for="m in userMedals" :key="'um'+m.id" class="user-medal-item">
            <img :src="m.medalImageUrl" style="width:32px;height:32px;border-radius:4px;object-fit:contain"/>
            <span style="flex:1;font-size:13px;color:#728567">{{ m.medalName }}</span>
            <el-button size="mini" type="danger" @click="doRevokeMedal(m.id)">收回</el-button>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无勋章" :image-size="[60,60]"/>
      <!-- 发放勋章 -->
      <div style="margin-top:14px">
        <h4 style="font-size:14px;color:#728567;margin:0 0 6px">发放勋章</h4>
        <div style="display:flex;gap:8px">
          <el-select v-model="medalForm.medalId" style="flex:1" placeholder="选择勋章" filterable>
            <el-option v-for="m in medalList" :key="m.id" :label="m.name" :value="m.id"/>
          </el-select>
          <el-button type="primary" @click="doGrantMedal" style="background:#F6AD47;border-color:#F6AD47;white-space:nowrap">发放</el-button>
        </div>
      </div>
      <template #footer><el-button @click="medalDlgVisible=false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted, defineComponent, computed, watch } from "vue";
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
import { Empty } from "vant";
import { SelectUserAPI, UpdateUserAPI, GetGroupListAPI, SearchUserAPI, GetUserCountAPI, SetUserCreditsAPI, GetAdminItemListAPI, GrantItemAPI, GetAdminUserItemsAPI, UpdateUserItemAPI, DeleteUserItemAPI, GetAdminMedalListAPI, GrantMedalAPI, RevokeMedalAPI, GetUserMedalsAPI, BanUserAPI, UnbanUserAPI, AdminUnmuteAPI } from "@/api/index";

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
    ElTable, ElTableColumn, ElTag, ElButton, ElDialog, ElForm, ElFormItem,
    ElInput, ElSelect, ElOption, ElSwitch,
    VanEmpty: Empty,
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

    // ===== 积分调整 =====
    const creditDlgVisible = ref(false);
    const creditTarget = ref<UserItem | null>(null);
    const creditForm = ref({ extcredits1: 0, extcredits2: 0, extcredits3: 0, extcredits4: 0 });

    // ===== 物品发放 =====
    const itemDlgVisible = ref(false);
    const itemTarget = ref<UserItem | null>(null);
    const userItems = ref<any[]>([]);
    const itemList = ref<any[]>([]);
    const editItemQtys = reactive<Record<number, string>>({});
    const itemForm = ref({ itemId: 0, qty: 1 });

    // ===== 勋章管理 =====
    const medalDlgVisible = ref(false);
    const medalTarget = ref<UserItem | null>(null);
    const medalList = ref<any[]>([]);
    const userMedals = ref<any[]>([]);
    const medalForm = ref({ medalId: 0 });

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

    // ===== 积分操作 — 直接编辑各积分值 =====
    const openCreditDlg = async (row: UserItem) => {
      creditTarget.value = row;
      creditDlgVisible.value = true;
      // 加载当前积分
      const r = await GetUserCountAPI(row.uid);
      if (r.status === 200) {
        creditForm.value = {
          extcredits1: r.data.extcredits1 || 0,
          extcredits2: r.data.extcredits2 || 0,
          extcredits3: r.data.extcredits3 || 0,
          extcredits4: r.data.extcredits4 || 0,
        };
      }
    };
    const doSetCredit = async () => {
      if (!creditTarget.value) return;
      const r = await SetUserCreditsAPI({ uid: creditTarget.value.uid, ...creditForm.value });
      if (r.status === 200) { ElMessage.success("积分更新成功"); creditDlgVisible.value = false; getData(); }
      else ElMessage.error(String(r.data || "更新失败"));
    };

    // ===== 物品操作 — 管理用户已有物品 =====
    const openItemDlg = async (row: UserItem) => {
      itemTarget.value = row;
      itemDlgVisible.value = true;
      const [ui, ai] = await Promise.all([GetAdminUserItemsAPI(row.uid), GetAdminItemListAPI()]);
      if (ai.status === 200) itemList.value = ai.data.records || [];
      if (ui.status === 200) {
        userItems.value = ui.data || [];
        Object.keys(editItemQtys).forEach(k => delete editItemQtys[Number(k)]);
        userItems.value.forEach((u:any) => { editItemQtys[u.id] = String(u.quantity ?? 0); });
      }
      itemForm.value = { itemId: 0, qty: 1 };
    };
    const doSaveItemQty = async (userItemId: number) => {
      const val = Number(editItemQtys[userItemId]);
      if (isNaN(val) || val < 0) { ElMessage.warning("请输入有效数量"); return; }
      const r = await UpdateUserItemAPI({ userItemId, quantity: val });
      if (r.status === 200) { ElMessage.success("已保存"); openItemDlg(itemTarget.value! as any); }
      else ElMessage.error(String(r.data || "更新失败"));
    };
    const doDeleteItem = async (userItemId: number) => {
      const r = await DeleteUserItemAPI({ userItemId });
      if (r.status === 200) { ElMessage.success("已删除"); openItemDlg(itemTarget.value! as any); }
      else ElMessage.error(String(r.data || "删除失败"));
    };
    const getItemInfo = (itemId: number) => itemList.value.find((it: any) => it.id === itemId);

    const doGrantItem = async () => {
      if (!itemForm.value.itemId || !itemTarget.value) { ElMessage.warning("请选择物品"); return; }
      const r = await GrantItemAPI({ itemId: itemForm.value.itemId, quantity: itemForm.value.qty, uids: String(itemTarget.value.uid) });
      if (r.status === 200) { ElMessage.success("发放成功"); openItemDlg(itemTarget.value! as any); }
      else ElMessage.error(String(r.data || "发放失败"));
    };

    // ===== 勋章操作 — 修正图片和名称字段 =====
    const openMedalDlg = async (row: UserItem) => {
      medalTarget.value = row;
      medalForm.value = { medalId: 0 };
      const [ml, um] = await Promise.all([GetAdminMedalListAPI(), GetUserMedalsAPI(row.uid)]);
      if (ml.status === 200) medalList.value = ml.data.records || ml.data || [];
      if (um.status === 200) userMedals.value = um.data || [];
      medalDlgVisible.value = true;
    };
    const doGrantMedal = async () => {
      if (!medalForm.value.medalId || !medalTarget.value) { ElMessage.warning("请选择勋章"); return; }
      const r = await GrantMedalAPI({ medalId: medalForm.value.medalId, uids: String(medalTarget.value.uid) });
      if (r.status === 200) {
        ElMessage.success("勋章发放成功");
        const um = await GetUserMedalsAPI(medalTarget.value.uid);
        if (um.status === 200) userMedals.value = um.data || [];
      } else ElMessage.error(String(r.data || "发放失败"));
    };
    const doRevokeMedal = async (userMedalId: number) => {
      const r = await RevokeMedalAPI(userMedalId);
      if (r.status === 200) {
        ElMessage.success("已收回");
        if (medalTarget.value) {
          const um = await GetUserMedalsAPI(medalTarget.value.uid);
          if (um.status === 200) userMedals.value = um.data || [];
        }
      } else ElMessage.error(String(r.data || "操作失败"));
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
          ElMessage.error(`更新失败: ${res.data || "未知错误"}`);
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
          ElMessage.error(`操作失败: ${res.data || "未知错误"}`);
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
      resetSearch,
      // 封禁/解禁/解禁言
      doUnban(uid: number) { UnbanUserAPI({ uid }).then(r => { if (r.status===200) { ElMessage.success("已解封"); getData(); } else ElMessage.error(String(r.data||"失败")); }); },
      doAdminUnmute(uid: number) { AdminUnmuteAPI({ uid }).then(r => { if (r.status===200) { ElMessage.success("禁言已解除"); getData(); } else ElMessage.error(String(r.data||"失败")); }); },
      // 积分/物品/勋章
      creditDlgVisible, creditTarget, creditForm, openCreditDlg, doSetCredit,
      itemDlgVisible, itemTarget, userItems, editItemQtys, itemList, itemForm, getItemInfo, openItemDlg, doSaveItemQty, doDeleteItem, doGrantItem,
      medalDlgVisible, medalTarget, medalList, userMedals, medalForm, openMedalDlg, doGrantMedal, doRevokeMedal,
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

// 勋章列表
.user-medal-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.user-medal-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FCF9E0;
  border: 1px solid rgba(246, 173, 71, 0.3);
  border-radius: 8px;
  padding: 6px 10px;
  min-width: 200px;
}
.medal-section {
  margin-bottom: 10px;
}
.user-item-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.user-item-row {
  display: flex;
  align-items: center;
  background: #FCF9E0;
  border: 1px solid rgba(246, 173, 71, 0.25);
  border-radius: 8px;
  padding: 6px 10px;
}
</style>