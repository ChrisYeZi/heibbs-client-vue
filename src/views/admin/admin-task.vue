<template>
  <div class="admin-task">
    <div class="page-header">
      <h2>任务管理</h2>
      <el-button type="primary" @click="showAdd">添加任务</el-button>
    </div>

    <!-- 待确认完成任务列表 -->
    <div class="pending-section" v-if="pendingList.length > 0">
      <h3 style="font-size: 15px; margin-bottom: 8px; color: #e6a23c">
        ⏳ 待确认完成的任务
      </h3>
      <el-table :data="pendingList" border stripe size="small">
        <el-table-column label="记录ID" prop="userTask.id" width="70" />
        <el-table-column label="用户UID" prop="userTask.uid" width="80" />
        <el-table-column label="任务" prop="task.title" min-width="120" />
        <el-table-column label="进度" width="100">
          <template #default="s"
            >{{ s.row.userTask.progress }}/{{ s.row.userTask.target }}</template
          >
        </el-table-column>
        <el-table-column label="申请时间" width="160">
          <template #default="s">{{
            s.row.userTask.completeTime
              ? new Date(s.row.userTask.completeTime * 1000).toLocaleString()
              : "-"
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="s">
            <el-button
              type="success"
              size="small"
              @click="doConfirm(s.row.userTask.id)"
              >确认</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="doReject(s.row.userTask.id)"
              >拒绝</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-table
      v-loading="loading"
      :data="list.records"
      border
      stripe
      style="margin-top: 16px"
    >
      <el-table-column label="ID" prop="id" width="50" />
      <el-table-column label="标题" prop="title" min-width="100" />
      <el-table-column label="周期" width="70"
        ><template #default="s">{{
          cycleLabel(s.row.cycleType)
        }}</template></el-table-column
      >
      <el-table-column label="类型" width="80"
        ><template #default="s">{{
          acceptLabel(s.row.acceptType)
        }}</template></el-table-column
      >
      <el-table-column label="条件" width="130"
        ><template #default="s"
          >{{ conditionLabel(s.row.conditionType) }}={{
            s.row.conditionValue
          }}</template
        ></el-table-column
      >
      <el-table-column label="积分奖励" width="90"
        ><template #default="s">{{
          s.row.rewardType === "random"
            ? "随机"
            : s.row.rewardType && s.row.rewardValue
            ? s.row.rewardType.replace("extcredits", "积分") +
              "+" +
              s.row.rewardValue
            : "-"
        }}</template></el-table-column
      >
      <el-table-column label="随机奖池" width="80"
        ><template #default="s">{{ randomPoolText(s.row) }}</template></el-table-column
      >
      <el-table-column label="状态" width="60"
        ><template #default="s"
          ><el-tag
            :type="s.row.status === 1 ? 'success' : 'info'"
            size="small"
            >{{ s.row.status === 1 ? "启用" : "禁用" }}</el-tag
          ></template
        ></el-table-column
      >
      <el-table-column label="操作" width="140">
        <template #default="s"
          ><el-button size="small" @click="showEdit(s.row)">编辑</el-button
          ><el-button size="small" type="danger" @click="handleDelete(s.row.id)"
            >删除</el-button
          ></template
        >
      </el-table-column>
    </el-table>
    <el-dialog
      v-model="dlg"
      :title="isEdit ? '编辑任务' : '添加任务'"
      width="800px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"
          ><el-input v-model="form.title"
        /></el-form-item>
        <el-form-item label="周期"
          ><el-select v-model="form.cycleType"
            ><el-option
              v-for="t in ['daily', 'weekly', 'monthly', 'once']"
              :key="t"
              :label="cycleLabel(t)"
              :value="t" /></el-select
        ></el-form-item>
        <el-form-item label="接受方式"
          ><el-select v-model="form.acceptType"
            ><el-option label="自动接受" value="auto" /><el-option
              label="手动接受"
              value="manual_accept" /><el-option
              label="管理确认"
              value="manual_confirm" /></el-select
        ></el-form-item>
        <el-form-item label="条件类型"
          ><el-select v-model="form.conditionType"
            ><el-option label="发主题帖" value="post_count" /><el-option
              label="回帖"
              value="reply_count" /><el-option
              label="无条件"
              value="none" /></el-select
        ></el-form-item>
        <el-form-item label="条件数值" v-if="form.conditionType !== 'none'"
          ><el-input-number v-model="form.conditionValue" :min="1"
        /></el-form-item>
        <el-form-item label="奖励类型"
          ><el-select v-model="form.rewardType" clearable>
            <el-option label="灵气" value="extcredits1" /><el-option
              label="妖灵币"
              value="extcredits2"
            />
            <el-option label="值钱玉佩" value="extcredits3" /><el-option
              label="天明珠"
              value="extcredits4"
            />
            <el-option label="随机奖励" value="random" /> </el-select
        ></el-form-item>
        <template v-if="form.rewardType === 'random'">
          <el-form-item label="随机奖池">
            <div style="width: 100%">
              <div
                v-for="(r, i) in form.randomPool"
                :key="i"
                style="
                  display: flex;
                  gap: 4px;
                  align-items: center;
                  margin-bottom: 4px;
                  padding: 4px;
                  background: #fcf9e0;
                  border-radius: 4px;
                "
              >
                <el-select
                  v-model="r.type"
                  size="small"
                  style="width: 70px"
                  @change="onRandomTypeChange(r)"
                >
                  <el-option label="积分" value="credit" /><el-option
                    label="物品"
                    value="item"
                  /><el-option label="勋章" value="medal" />
                </el-select>
                <template v-if="r.type === 'credit'">
                  <el-select v-model="r.credit" size="small" style="width: 100px"
                    ><el-option v-for="cd in creditDefs" :key="cd.extcredits" :label="cd.extcreditsName" :value="cd.extcredits"/></el-select>
                  <el-input-number
                    v-model="r.value"
                    size="small"
                    :min="1"
                    style="width: 80px"
                    placeholder="数量"
                  />
                </template>
                <template v-if="r.type === 'item'">
                  <el-select v-model="r.id" size="small" style="width:150px" filterable placeholder="选择物品">
                    <el-option v-for="it in allItems" :key="it.id" :label="it.name" :value="it.id">
                      <span style="display:flex;align-items:center;gap:6px"><img v-if="it.icon" :src="it.icon" style="width:20px;height:20px;border-radius:3px"/>{{ it.name }}</span>
                    </el-option>
                  </el-select>
                  <el-input-number v-model="r.qty" size="small" :min="1" style="width:70px" placeholder="数量"/>
                </template>
                <template v-if="r.type === 'medal'">
                  <el-select v-model="r.id" size="small" style="width:150px" filterable placeholder="选择勋章">
                    <el-option v-for="md in allMedals" :key="md.id" :label="md.name" :value="md.id">
                      <span style="display:flex;align-items:center;gap:6px"><img v-if="md.imageUrl" :src="md.imageUrl" style="width:20px;height:20px;border-radius:3px"/>{{ md.name }}</span>
                    </el-option>
                  </el-select>
                </template>
                <span style="font-size: 11px; color: #728567">概率</span>
                <el-input-number
                  v-model="r.prob"
                  size="small"
                  :min="1"
                  :max="100"
                  style="width: 100px"
                />%
                <el-button
                  size="mini"
                  type="danger"
                  @click="form.randomPool.splice(i, 1)"
                  style="margin-left: auto"
                  >✕</el-button
                >
              </div>
              <el-button
                size="small"
                @click="
                  form.randomPool.push({
                    type: 'credit',
                    credit: 'extcredits2',
                    value: 1,
                    prob: 10,
                  })
                "
                >+ 添加奖励项</el-button
              >
              <div
                style="font-size: 11px; color: #e8743a; margin-top: 2px"
                v-if="totalProb !== 100"
              >
                ⚠ 概率合计: {{ totalProb }}%（需等于100%）
              </div>
            </div>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="积分数量"
            ><el-input-number v-model="form.rewardValue" :min="0"
          /></el-form-item>
          <el-form-item label="奖励物品ID"
            ><el-input-number v-model="form.rewardItemId" :min="0"
          /></el-form-item>
          <el-form-item label="物品数量"
            ><el-input-number v-model="form.rewardItemQuantity" :min="1"
          /></el-form-item>
        </template>
        <el-form-item label="状态"
          ><el-switch v-model="form.statusBool"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="dlg = false">取消</el-button
        ><el-button type="primary" @click="submit">{{
          isEdit ? "更新" : "添加"
        }}</el-button></template
      >
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ref, reactive, defineComponent, computed } from "vue";
import {
  GetAdminTaskListAPI,
  GetPendingConfirmListAPI,
  AdminConfirmTaskAPI,
  AdminRejectTaskAPI,
  InsertTaskAPI,
  UpdateTaskAPI,
  DeleteTaskAPI,
  GetCreditDefsAPI,
  GetAdminItemListAPI,
  GetAdminMedalListAPI,
} from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";

const cycleLabel = (c: string) =>
  (({ daily: "每日", weekly: "每周", monthly: "每月", once: "一次性" } as any)[
    c
  ] || c);
const acceptLabel = (a: string) =>
  ((
    {
      auto: "自动",
      manual_accept: "手动接受",
      manual_confirm: "管理确认",
    } as any
  )[a] || a);
const conditionLabel = (c: string) =>
  (({ post_count: "发主题帖", reply_count: "回帖", none: "无条件" } as any)[
    c
  ] || c);

export default defineComponent({
  name: "admin-task",
  setup() {
    const loading = ref(true),
      list = ref<any>({ records: [] }),
      pendingList = ref<any[]>([]),
      dlg = ref(false),
      isEdit = ref(false);
    const form = reactive<any>({
      title: "",
      cycleType: "daily",
      acceptType: "auto",
      conditionType: "post_count",
      conditionValue: 1,
      rewardType: "extcredits2",
      rewardValue: 1,
      rewardItemId: 0,
      rewardItemQuantity: 1,
      statusBool: true,
      randomPool: [],
    });
    const totalProb = computed(() =>
      form.randomPool.reduce(
        (s: number, r: any) => s + (Number(r.prob) || 0),
        0
      )
    );
    const onRandomTypeChange = (r: any) => {
      if (r.type === "credit") { r.credit = r.credit || "extcredits2"; r.value = r.value || 1; }
      else if (r.type === "item") { r.id = r.id || 0; r.qty = r.qty || 1; }
      else { r.id = r.id || 0; }
    };
    const creditDefs = ref<any[]>([]);
    const allItems = ref<any[]>([]);
    const allMedals = ref<any[]>([]);
    const getCreditName = (key: string) => { const d = creditDefs.value.find((i: any) => i.extcredits === key); return d ? d.extcreditsName : key.replace('extcredits', '积分'); };
    const getItemNameA = (id: number) => { const it = allItems.value.find((i: any) => i.id === id); return it ? it.name : '物品#' + id; };
    const getMedalNameA = (id: number) => { const m = allMedals.value.find((i: any) => i.id === id); return m ? m.name : '勋章#' + id; };
    const randomPoolText = (row: any) => {
      if (row.rewardType !== 'random' || !row.rewardRandom) return '-';
      try {
        return JSON.parse(row.rewardRandom).map((r: any) =>
          (r.type === 'credit' ? getCreditName(r.credit || 'extcredits2') : r.type === 'item' ? getItemNameA(r.id) : getMedalNameA(r.id)) + '(' + r.prob + '%)'
        ).join(', ');
      } catch (e) { return row.rewardRandom; }
    };
    const loadRefData = async () => {
      const [cd, it, md] = await Promise.all([GetCreditDefsAPI(), GetAdminItemListAPI(), GetAdminMedalListAPI()]);
      if (cd.status === 200) creditDefs.value = cd.data || [];
      if (it.status === 200) allItems.value = it.data.records || [];
      if (md.status === 200) allMedals.value = md.data.records || [];
    };
    loadRefData();
    const fetch = async () => {
      loading.value = true;
      const r = await GetAdminTaskListAPI({ pageNum: 1, pageSize: 50 });
      if (r.status === 200) list.value = r.data;
      loading.value = false;
    };
    const fetchPending = async () => {
      const r = await GetPendingConfirmListAPI({ pageNum: 1, pageSize: 50 });
      if (r.status === 200) pendingList.value = r.data.records || [];
    };
    const doConfirm = async (id: number) => {
      const r = await AdminConfirmTaskAPI(id);
      if (r.status === 200) {
        ElMessage.success("已确认");
        fetchPending();
      } else ElMessage.error(String(r.data));
    };
    const doReject = async (id: number) => {
      const r = await AdminRejectTaskAPI(id);
      if (r.status === 200) {
        ElMessage.success("已拒绝");
        fetchPending();
      } else ElMessage.error(String(r.data));
    };
    const showAdd = () => {
      isEdit.value = false;
      Object.assign(form, {
        id: undefined,
        title: "",
        cycleType: "daily",
        acceptType: "auto",
        conditionType: "post_count",
        conditionValue: 1,
        rewardType: "extcredits2",
        rewardValue: 1,
        rewardItemId: 0,
        rewardItemQuantity: 1,
        statusBool: true,
        randomPool: [],
      });
      dlg.value = true;
    };
    const showEdit = (row: any) => {
      isEdit.value = true;
      let pool = [];
      if (row.rewardType === "random" && row.rewardRandom) {
        try {
          pool = JSON.parse(row.rewardRandom);
        } catch (e) {}
      }
      Object.assign(form, {
        ...row,
        statusBool: row.status === 1,
        cycleType: row.cycleType || "daily",
        acceptType: row.acceptType || "auto",
        rewardItemId: row.rewardItemId || 0,
        rewardItemQuantity: row.rewardItemQuantity || 1,
        randomPool: pool,
      });
      dlg.value = true;
    };
    const submit = async () => {
      const d: any = {
        ...form,
        status: form.statusBool ? 1 : 0,
        rewardItemId: form.rewardItemId || null,
      };
      if (form.rewardType === "random") {
        d.rewardRandom = JSON.stringify(form.randomPool);
        d.rewardValue = 0;
        d.rewardItemId = null;
      }
      const r = isEdit.value ? await UpdateTaskAPI(d) : await InsertTaskAPI(d);
      if (r.status === 200) {
        ElMessage.success(String(r.data || "成功"));
        dlg.value = false;
        fetch();
      } else ElMessage.error(String(r.data || "失败"));
    };
    const handleDelete = (id: number) => {
      ElMessageBox.confirm("确定删除?", "提示", { type: "warning" }).then(
        async () => {
          await DeleteTaskAPI(id);
          fetch();
        }
      );
    };
    fetch();
    fetchPending();
    return {
      loading,
      list,
      pendingList,
      dlg,
      isEdit,
      form,
      cycleLabel,
      acceptLabel,
      conditionLabel,
      showAdd,
      showEdit,
      submit,
      handleDelete,
      doConfirm,
      doReject,
      fetchPending,
      totalProb,
      onRandomTypeChange,
      creditDefs,
      getCreditName,
      getItemNameA,
      getMedalNameA,
      randomPoolText,
      allItems,
      allMedals,
    };
  },
});
</script>
<style scoped>
.admin-task {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
h2 {
  margin: 0;
  font-size: 18px;
}
</style>
