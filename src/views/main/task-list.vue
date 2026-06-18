<template>
  <div class="task-page">
    <!-- 周期筛选 -->
    <div class="cycle-tabs">
      <span
        v-for="c in cycles"
        :key="c.key"
        class="cycle-tab"
        :class="{ active: filterCycle === c.key }"
        @click="filterCycle = c.key"
        >{{ c.label }}</span
      >
    </div>

    <van-loading v-if="loading" class="loading" />
    <van-empty
      v-if="!loading && tasks.length === 0"
      description="暂无任务"
      :image="require('@/assets/img/404.png')"
      image-size="45%"
    />

    <div class="task-list">
      <div
        v-for="item in filteredTasks"
        :key="item.task.id"
        class="task-card"
        :class="{
          'task-done':
            item.progress &&
            (item.progress.status === 4 || item.progress.status === 5),
        }"
      >
        <div class="task-header">
          <span class="task-tag">{{ cycleLabel(item.task.cycleType) }}</span
          ><span class="task-title">{{ item.task.title }}</span>
        </div>
        <div class="task-desc">{{ item.task.description }}</div>
        <div class="task-meta">
          <span
            >{{ conditionLabel(item.task.conditionType) }}:
            {{ item.task.conditionValue }}</span
          >
          <span>奖励: {{ rewardLabel(item.task) }}</span>
        </div>
        <!-- 随机奖励详情 -->
        <div
          class="random-reward-box"
          v-if="item.task.rewardType === 'random' && item.task.rewardRandom"
        >
          <div
            class="random-reward-toggle"
            @click="item._showRandom = !item._showRandom"
          >
            随机奖励 ({{
              parseRandomPool(item.task.rewardRandom).length
            }}种可能)
            <span style="font-size: 11px; color: #728567">{{
              item._showRandom ? "▲" : "▼"
            }}</span>
          </div>
          <div class="random-reward-list" v-if="item._showRandom">
            <div
              v-for="(r, i) in parseRandomPool(item.task.rewardRandom)"
              :key="i"
              class="random-reward-item"
            >
              <img
                v-if="r.type === 'item' && getItemIcon(r.id)"
                :src="getItemIcon(r.id)"
                class="random-icon"
              />
              <img
                v-if="r.type === 'medal' && getMedalIcon(r.id)"
                :src="getMedalIcon(r.id)"
                class="random-icon"
              />
              <span class="random-reward-name">{{ randomRewardText(r) }}</span>
              <span class="random-reward-prob">{{ r.prob }}%</span>
            </div>
          </div>
        </div>

        <!-- 进度条 -->
        <div
          class="task-progress"
          v-if="item.progress && item.progress.status >= 1"
        >
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: getPercent(item) + '%' }"
            ></div>
          </div>
          <span class="progress-text"
            >{{ item.progress.progress || 0 }}/{{
              item.task.conditionValue
            }}</span
          >
        </div>

        <!-- 操作按钮 -->
        <div class="task-actions">
          <!-- 待接受 -->
          <el-button
            v-if="!item.progress || item.progress.status === 0"
            type="warning"
            size="small"
            @click="doAccept(item.task.id)"
            >接受任务</el-button
          >
          <!-- 进行中 → 取消 + 完成 -->
          <template v-if="item.progress && item.progress.status === 1">
            <el-button
              type="danger"
              size="small"
              plain
              @click="doCancel(item.task.id)"
              >取消</el-button
            >
            <el-button
              type="success"
              size="small"
              @click="doComplete(item.task.id)"
              >完成</el-button
            >
          </template>
          <!-- 待确认(manual_confirm) -->
          <span
            v-if="item.progress && item.progress.status === 2"
            class="status-text pending"
            >等待管理员确认</span
          >
          <!-- 待领取 -->
          <el-button
            v-if="item.progress && item.progress.status === 3"
            type="warning"
            size="small"
            @click="doClaim(item.task.id)"
            >领取奖励</el-button
          >
          <!-- 已领取 -->
          <el-button
            v-if="item.progress && item.progress.status === 4"
            size="small"
            disabled
            class="done-btn"
            >任务已完成</el-button
          >
          <!-- 已取消 -->
          <el-button
            v-if="item.progress && item.progress.status === 5"
            size="small"
            disabled
            class="done-btn"
            >任务已取消</el-button
          >
        </div>
      </div>
    </div>

    <!-- 已完成任务 -->
    <div class="completed-section" v-if="completedTasks.length > 0">
      <h3 style="font-size: 15px; margin-top: 20px; margin-bottom: 8px">
        已完成任务
      </h3>
      <div
        v-for="item in completedTasks"
        :key="'c' + item.userTask.id"
        class="completed-card"
      >
        <span class="completed-title">{{ item.task?.title }}</span>
        <span class="completed-time">{{
          fmtTime(item.userTask.completeTime)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from "vue";
import {
  GetTaskListAPI,
  AcceptTaskAPI,
  CancelTaskAPI,
  CompleteTaskAPI,
  ClaimTaskRewardAPI,
  GetCompletedTasksAPI,
  GetAdminItemListAPI,
  GetAdminMedalListAPI,
  GetCreditDefsAPI,
} from "@/api/index";
import { ElMessage } from "element-plus";
import { Loading, Empty } from "vant";

const cycles = [
  { key: "all", label: "全部" },
  { key: "daily", label: "每日" },
  { key: "weekly", label: "每周" },
  { key: "monthly", label: "每月" },
  { key: "once", label: "一次性" },
];

export default defineComponent({
  name: "task-list",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const loading = ref(true),
      tasks = ref<any[]>([]),
      completedTasks = ref<any[]>([]),
      filterCycle = ref("all");
    const fmtTime = (t: any) =>
      t ? new Date(t * 1000).toLocaleDateString() : "";
    const filteredTasks = computed(() =>
      filterCycle.value === "all"
        ? tasks.value
        : tasks.value.filter((t: any) => t.task.cycleType === filterCycle.value)
    );

    const cycleLabel = (c: string) =>
      ((
        {
          daily: "每日",
          weekly: "每周",
          monthly: "每月",
          once: "一次性",
        } as any
      )[c] || c);
    const conditionLabel = (c: string) =>
      ((
        {
          post_count: "发主题帖",
          reply_count: "回帖",
          none: "无条件",
          credit_threshold: "积分达标",
          group_level: "用户组等级",
        } as any
      )[c] || c);
    const parseRandomPool = (json: string) => {
      try {
        return JSON.parse(json) || [];
      } catch (e) {
        return [];
      }
    };
    const itemList = ref<any[]>([]);
    const medalList = ref<any[]>([]);
    const creditDefList = ref<any[]>([]);
    const getItemIcon = (id: number) => {
      const it = itemList.value.find((i: any) => i.id === id);
      return it ? it.icon : "";
    };
    const getMedalIcon = (id: number) => {
      const m = medalList.value.find((i: any) => i.id === id);
      return m ? m.imageUrl : "";
    };
    const getCreditName = (key: string) => {
      const d = creditDefList.value.find((i: any) => i.extcredits === key);
      return d ? d.extcreditsName : key.replace("extcredits", "积分");
    };
    const getItemName = (id: number) => {
      const it = itemList.value.find((i: any) => i.id === id);
      return it ? it.name : "物品#" + id;
    };
    const getMedalName = (id: number) => {
      const m = medalList.value.find((i: any) => i.id === id);
      return m ? m.name : "勋章#" + id;
    };
    const randomRewardText = (r: any) => {
      if (r.type === "credit")
        return getCreditName(r.credit || "extcredits2") + "+" + (r.value || 0);
      if (r.type === "item") return getItemName(r.id) + " x" + (r.qty || 1);
      if (r.type === "medal") return getMedalName(r.id);
      return "";
    };
    const loadRefData = async () => {
      const [it, md, cd] = await Promise.all([
        GetAdminItemListAPI(),
        GetAdminMedalListAPI(),
        GetCreditDefsAPI(),
      ]);
      if (it.status === 200) itemList.value = it.data.records || [];
      if (md.status === 200) medalList.value = md.data.records || [];
      if (cd.status === 200) creditDefList.value = cd.data || [];
    };
    loadRefData();
    const rewardLabel = (t: any) => {
      if (t.rewardType === "random") {
        const p = parseRandomPool(t.rewardRandom);
        return "随机(" + p.length + "种)";
      }
      const parts = [];
      if (t.rewardType && t.rewardValue)
        parts.push(getCreditName(t.rewardType) + "+" + t.rewardValue);
      if (t.rewardItemId)
        parts.push(
          getItemName(t.rewardItemId) + " x" + (t.rewardItemQuantity || 1)
        );
      return parts.join(" + ") || "无";
    };
    const getPercent = (item: any) =>
      item.progress
        ? Math.min(
            100,
            Math.floor(
              ((item.progress.progress || 0) / item.task.conditionValue) * 100
            )
          )
        : 0;

    const fetch = async () => {
      loading.value = true;
      const r = await GetTaskListAPI();
      if (r.status === 200) tasks.value = r.data || [];
      const rc = await GetCompletedTasksAPI();
      if (rc.status === 200) completedTasks.value = rc.data || [];
      loading.value = false;
    };
    const doAccept = async (id: number) => {
      const r = await AcceptTaskAPI(id);
      if (r.status === 200) {
        ElMessage.success(String(r.data || "已接受"));
        fetch();
      } else ElMessage.error(String(r.data || r.msg || "操作失败"));
    };
    const doCancel = async (id: number) => {
      const r = await CancelTaskAPI(id);
      if (r.status === 200) {
        ElMessage.success("已取消");
        fetch();
      } else ElMessage.error(String(r.data || r.msg || "操作失败"));
    };
    const doComplete = async (id: number) => {
      const r = await CompleteTaskAPI(id);
      if (r.status === 200) {
        ElMessage.success(String(r.data || "已提交"));
        fetch();
      } else ElMessage.error(String(r.data || r.msg || "操作失败"));
    };
    const doClaim = async (id: number) => {
      const r = await ClaimTaskRewardAPI(id);
      if (r.status === 200) {
        ElMessage.success("奖励已领取");
        fetch();
      } else ElMessage.error(String(r.data || r.msg || "操作失败"));
    };

    fetch();
    return {
      loading,
      tasks,
      completedTasks,
      filterCycle,
      filteredTasks,
      cycles,
      cycleLabel,
      conditionLabel,
      rewardLabel,
      getPercent,
      doAccept,
      doCancel,
      doComplete,
      doClaim,
      parseRandomPool,
      getItemIcon,
      getMedalIcon,
      randomRewardText,
      fmtTime,
    };
  },
});
</script>

<style scoped>
.task-page {
  margin: 10px 5px;
  padding: 20px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  color: #728567;
}
h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #728567;
}
.cycle-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.cycle-tab {
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 8px;
  background: rgba(114, 133, 103, 0.15);
  color: #728567;
  cursor: pointer;
  transition: 0.2s;
}
.cycle-tab.active {
  background: #f6ad47;
  color: #fff;
}
.task-card {
  background: #fff;
  border: 1px solid rgba(246, 173, 71, 0.15);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}
.task-title {
  font-weight: 600;
  font-size: 15px;
  color: #728567;
}
.task-tag {
  font-size: 13px;
  padding: 1px 2px;
  font-weight: 600;
  background: rgba(114, 133, 103, 0.8);
  color: rgba(255, 255, 255, 1);
  margin: 0px 5px;
  padding: 2px 6px;
  border-radius: 4px;
}
.task-desc {
  font-size: 13px;
  color: rgba(114, 133, 103, 0.8);
  margin-bottom: 6px;
}
.task-meta {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.7);
  margin-bottom: 6px;
  display: flex;
  gap: 12px;
}
.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #f6ad47;
  border-radius: 3px;
  transition: width 0.3s;
}
.progress-text {
  font-size: 11px;
  color: #728567;
  white-space: nowrap;
}
.task-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.status-text {
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
}
.status-text.pending {
  background: rgba(246, 173, 71, 0.15);
  color: #f6ad47;
}
.status-text.done {
  background: rgba(114, 133, 103, 0.12);
  color: #728567;
}
.status-text.cancelled {
  background: #fef0f0;
  color: #f56c6c;
}
.loading {
  padding: 50px 0;
  text-align: center;
}
.completed-section {
  margin-top: 16px;
}
.completed-card {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(114, 133, 103, 0.08);
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}
.completed-title {
  color: #728567;
}
.completed-time {
  color: rgba(114, 133, 103, 0.6);
  font-size: 12px;
}
.random-reward-box {
  margin-top: 6px;
}
.random-reward-toggle {
  font-size: 12px;
  color: #f6ad47;
  cursor: pointer;
  padding: 4px 8px;
  background: #fcf9e0;
  border-radius: 4px;
  display: inline-block;
}
.random-reward-list {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.random-reward-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  background: rgba(246, 173, 71, 0.06);
  border-radius: 4px;
  font-size: 12px;
  color: #728567;
}
.random-icon {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  object-fit: cover;
}
.random-reward-name {
  flex: 1;
}
.random-reward-prob {
  color: #f6ad47;
  font-weight: 600;
  font-size: 11px;
}

/* 已完成/已取消任务 */
.task-card.task-done {
  background: #f5f5f5;
  border-color: #e0e0e0;
  opacity: 0.75;
}
.task-card.task-done .task-title {
  text-decoration: line-through;
  color: #b0b0b0;
}
.task-card.task-done .task-desc,
.task-card.task-done .task-meta {
  color: #c0c0c0;
}
.task-card.task-done .task-tag {
  background: rgba(180, 180, 180, 0.6);
}
.done-btn {
  background: #e0e0e0 !important;
  border-color: #d0d0d0 !important;
  color: #a0a0a0 !important;
  cursor: not-allowed;
}
</style>
