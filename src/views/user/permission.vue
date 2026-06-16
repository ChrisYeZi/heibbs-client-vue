<template>
  <div class="permission-container">
    <!-- 加载状态 -->
    <div class="loading" v-if="isLoading">
      <van-loading color="#1989fa" size="24" />
      <span class="loading-text">加载用户组数据中...</span>
    </div>

    <!-- 错误状态 -->
    <div class="error-state" v-else-if="errorMsg">
      <van-icon name="warning-o" color="#ff4d4f" size="24" />
      <span class="error-text">{{ errorMsg }}</span>
    </div>

    <!-- 数据展示 -->
    <div v-else class="group-list-wrapper">
      <!-- 禁言解除 -->
      <div class="mute-card" v-if="muteStatus && muteStatus.status===1">
        <div class="card-header">
          <van-icon name="warning-o" color="#e8743a" />
          <span class="card-title">禁言状态</span>
        </div>
        <div style="padding:10px 14px;font-size:13px;color:#728567">
          <p>禁言截止：{{ fmtMuteDate(muteStatus.muteUntil) }}</p>
          <p>原因：{{ muteStatus.reason || '无' }}</p>
          <el-button v-if="canLiftMute" size="small" type="warning" @click="doLiftMute" style="margin-top:6px">申请解除</el-button>
          <span v-else style="font-size:11px;color:#e8743a">禁言期未满，{{ remainDays }}天后可申请解除</span>
        </div>
      </div>
      <!-- 晋升提示 -->
      <div class="promotion-card" v-if="nextPromotion">
        <div class="card-header">
          <van-icon name="upgrade-o" color="#F6AD47" />
          <span class="card-title">可晋升到：{{ nextPromotion.gname }}</span>
        </div>
        <div class="promotion-progress">
          <div class="progress-item">
            <span
              >积分：{{ userWeightedCredits }} /
              {{ nextPromotion.credits }}</span
            >
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width:
                    Math.min(
                      100,
                      (userWeightedCredits / nextPromotion.credits) * 100
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
          <div
            class="progress-item"
            v-if="nextPromotion.promotionType === 'item'"
          >
            <span
              >物品：{{ nextPromoItemName }} {{ promoItemCount }}/{{
                nextPromotion.promotionItemQty || 1
              }}</span
            >
            <div class="progress-bar">
              <div
                class="progress-fill item"
                :style="{
                  width:
                    Math.min(
                      100,
                      (promoItemCount / (nextPromotion.promotionItemQty || 1)) *
                        100
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
          <div
            class="progress-item"
            v-if="nextPromotion.promotionType === 'credits'"
          >
            <span
              >消耗积分：{{ promoCreditName }} {{ promoCreditBalance }}/{{
                nextPromotion.promotionCreditAmount || 0
              }}</span
            >
            <div class="progress-bar">
              <div
                class="progress-fill credits"
                :style="{
                  width:
                    Math.min(
                      100,
                      (promoCreditBalance /
                        (nextPromotion.promotionCreditAmount || 1)) *
                        100
                    ) + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
        <div class="promotion-actions">
          <el-button
            v-if="canPromote"
            type="warning"
            size="small"
            @click="doPromote"
            >晋升</el-button
          >
          <el-button v-else type="warning" size="small" disabled
            >条件不足</el-button
          >
        </div>
      </div>
      <!-- 普通用户组 -->
      <div class="group-card">
        <div class="card-header">
          <van-icon name="user-o" color="#D4780D" />
          <span class="card-title">普通用户组</span>
        </div>
        <div class="card-content">
          <div
            class="group-item"
            v-for="(group, idx) in groupDo"
            :key="group.gid"
          >
            <!-- 等级标识 -->
            <div
              class="level-tag"
              :style="{
                backgroundColor: group.color,
              }"
            >
              {{ idx - 1 }}级
            </div>
            <!-- 组信息 -->
            <div class="group-info">
              <div class="group-name">
                <span class="name-text">{{ group.gname }}</span>
                <!-- 特殊标签 -->
                <van-tag
                  size="mini"
                  color="#ff9f43"
                  v-if="idx === userdata?.user?.groupid - 1"
                  >当前等级</van-tag
                >
                <van-tag size="mini" color="#ff9f43" v-if="idx === 2"
                  >初始等级</van-tag
                >
              </div>
              <div class="group-meta">
                <span class="meta-item">
                  <van-icon name="credit-o" size="14" color="#ff6b35" />
                  所需积分：{{
                    group.credits === 0 ? "无要求" : group.credits + " 积分"
                  }}
                </span>
                <span class="meta-item" v-if="promotionLabel(group)">
                  <van-icon name="upgrade-o" size="14" color="#F6AD47" />
                  晋升条件：{{ promotionLabel(group) }}
                </span>
                <span class="meta-item">
                  <van-icon name="key-o" size="14" color="#86909c" />
                  权限：{{ group.permission || "默认权限" }}
                </span>
                <span class="meta-item">
                  <van-icon name="info-o" size="14" color="#86909c" />
                  描述：{{ group.description || "无描述" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 特殊用户组 -->
      <div class="group-card" v-if="extgroupDo.length">
        <div class="card-header">
          <van-icon name="shield-o" color="#ff6b35" />
          <span class="card-title">特殊用户组</span>
        </div>
        <div class="card-content">
          <div class="group-item" v-for="group in extgroupDo" :key="group.gid">
            <div
              class="level-tag"
              :style="{
                backgroundColor: group.color,
              }"
            >
              特殊
            </div>
            <div class="group-info">
              <div class="group-name">
                <span class="name-text">{{ group.gname }}</span>
                <van-tag
                  size="mini"
                  color="#ff4d4f"
                  v-if="group.gid === userdata?.user?.extgroupids"
                  >当前</van-tag
                >
                <van-tag size="mini" color="#ff4d4f" v-if="group.gtype === 1"
                  >管理员</van-tag
                >
              </div>
              <div class="group-meta">
                <span class="meta-item">
                  <van-icon name="tag-o" size="14" color="#86909c" />
                  组类型：{{ group.gtype === 1 ? "系统管理组" : "自定义组" }}
                </span>
                <span class="meta-item">
                  <van-icon name="key-o" size="14" color="#ff6b35" />
                  权限：{{
                    group.permission
                      ? group.permission.split(",").join("、")
                      : "无特殊权限"
                  }}
                </span>
                <span class="meta-item">
                  <van-icon name="info-o" size="14" color="#86909c" />
                  描述：{{ group.description || "无描述" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent, onMounted } from "vue";
import store from "@/store";
import {
  GetGroupListAPI,
  GetAdminItemListAPI,
  GetCreditDefsAPI,
  GetMyCountAPI,
  DirectPromoteAPI,
  GetMuteStatusAPI,
  LiftMuteAPI,
} from "@/api/index";
import { Loading, Icon, Tag } from "vant";
import { ElMessage } from "element-plus";

// 定义接口（精准匹配返回数据结构）
interface GroupDoItem {
  gid: number;
  gname: string;
  permission: string | null;
  credits: number;
  description: string | null;
  color: String;
  promotionType?: string;
  promotionItemId?: number;
  promotionItemQty?: number;
  promotionCreditType?: string;
  promotionCreditAmount?: number;
}

interface ExtGroupDoItem {
  gid: number;
  gname: string;
  permission: string | null;
  description: string | null;
  gtype: number;
  color: String;
}

interface GroupResponseData {
  groupDo: GroupDoItem[];
  extgroupDo: ExtGroupDoItem[];
}

export default defineComponent({
  name: "UserGroupPermission",
  components: {
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
  },
  setup() {
    // 状态管理
    const isLoading = ref<boolean>(true);
    const errorMsg = ref<string>("");
    const groupDo = ref<GroupDoItem[]>([]); // 普通用户组
    const extgroupDo = ref<ExtGroupDoItem[]>([]); // 特殊用户组
    const userdata = store.state.user?.info;
    const allItems = ref<any[]>([]);
    const creditDefs = ref<any[]>([]);
    const promoItemCount = ref(0);
    const promoItemName = ref("");
    const promoCreditBalance = ref(0);
    const promoCreditName = ref("");
    const userWeightedCredits = ref(0);
    const userCount = ref<any>({});
    const muteStatus = ref<any>(null);
    const canLiftMute = computed(() => muteStatus.value && muteStatus.value.status === 1 && muteStatus.value.muteUntil && Date.now()/1000 >= muteStatus.value.muteUntil);
    const remainDays = computed(() => muteStatus.value?.muteUntil ? Math.ceil((muteStatus.value.muteUntil - Date.now()/1000)/86400) : 0);
    const fmtMuteDate = (ts: number) => ts ? new Date(ts*1000).toLocaleDateString() : '';
    const doLiftMute = async () => { const r = await LiftMuteAPI(); if (r.status===200) { ElMessage.success("禁言已解除"); muteStatus.value = null; } else ElMessage.error(String(r.data||"操作失败")); };
    const nextPromotion = computed(() => {
      if (!groupDo.value.length || !userdata?.user) return null;
      const currentGid = userdata.user?.groupid;
      const sorted = [...groupDo.value].sort((a, b) => a.credits - b.credits);
      for (const g of sorted) {
        if (
          g.credits > 0 &&
          g.credits <= userWeightedCredits.value &&
          g.gid !== currentGid &&
          g.credits >
            (groupDo.value.find((x) => x.gid === currentGid)?.credits || 0)
        )
          return g;
      }
      return null;
    });
    const canPromote = computed(() => {
      if (!nextPromotion.value) return false;
      const np = nextPromotion.value;
      if (!np.promotionType || np.promotionType === "unconditional")
        return true;
      if (np.promotionType === "item")
        return promoItemCount.value >= (np.promotionItemQty || 1);
      if (np.promotionType === "credits")
        return promoCreditBalance.value >= (np.promotionCreditAmount || 0);
      return false;
    });
    const doPromote = async () => {
      if (!nextPromotion.value) return;
      const r = await DirectPromoteAPI(nextPromotion.value.gid);
      if (r.status === 200) { ElMessage.success("晋升成功！"); location.reload(); }
      else ElMessage.error("晋升失败：" + (r.data || r.msg || "条件未满足"));
    };
    const promotionLabel = (g: GroupDoItem) => {
      const t = g.promotionType;
      if (!t || t === "unconditional" || t === "无条件") return "自动晋升";
      if (t === "item") {
        const it = allItems.value.find((i) => i.id === g.promotionItemId);
        return (
          "需消耗：" +
          (it ? it.name : "物品#" + g.promotionItemId) +
          " x" +
          (g.promotionItemQty || 1)
        );
      }
      if (t === "credits") {
        const cd = creditDefs.value.find(
          (d) => d.extcredits === g.promotionCreditType
        );
        return (
          "需消耗积分：" +
          (cd ? cd.extcreditsName : g.promotionCreditType) +
          " x" +
          (g.promotionCreditAmount || 0)
        );
      }
      return "";
    };
    // 获取用户组数据
    const getGroupData = async () => {
      try {
        isLoading.value = true;
        const res: any = await GetGroupListAPI();

        if (res.status === 200 && res.data) {
          const data = res.data as GroupResponseData;
          groupDo.value = data.groupDo || [];
          extgroupDo.value = data.extgroupDo || [];
        } else {
          errorMsg.value = res.data || "获取用户组数据失败";
        }
      } catch (err: any) {
        errorMsg.value = "网络错误，无法加载用户组数据";
        console.error("用户组数据请求失败:", err);
      } finally {
        isLoading.value = false;
      }
    };

    // 页面挂载时加载数据
    const loadUserCount = async () => {
      try {
        const uid = userdata?.user?.uid;
        if (!uid) return;
        const countRes = await GetMyCountAPI();
        if (countRes.status === 200) {
          userCount.value = countRes.data;
          let total = 0;
          for (const def of creditDefs.value) {
            if (!def.extcreditsEnable) continue;
            const rule = parseInt(def.extcreditsRule) || 0;
            if (rule <= 0) continue;
            total += (countRes.data[def.extcredits] || 0) * rule;
          }
          userWeightedCredits.value = total;
        }
        if (nextPromotion.value?.promotionType === "item" && uid) {
          const it = allItems.value.find(
            (i: any) => i.id === nextPromotion.value!.promotionItemId
          );
          promoItemName.value = it
            ? it.name
            : "物品#" + nextPromotion.value.promotionItemId;
          try {
            const resp = await fetch("/api/item/mylist", {
              headers: {
                Authorization: localStorage.getItem("heibbs.token") || "",
              },
            });
            const data = await resp.json();
            if (data.data) {
              for (const entry of data.data) {
                if (entry.item?.id === nextPromotion.value!.promotionItemId) {
                  promoItemCount.value = entry.userItem?.quantity || 0;
                  break;
                }
              }
            }
          } catch (e) {}
        }
        if (nextPromotion.value?.promotionType === "credits") {
          const cd = creditDefs.value.find(
            (d: any) =>
              d.extcredits === nextPromotion.value!.promotionCreditType
          );
          promoCreditName.value = cd
            ? cd.extcreditsName
            : nextPromotion.value.promotionCreditType;
          promoCreditBalance.value = parseInt(
            countRes.data[nextPromotion.value.promotionCreditType] || "0"
          );
        }
      } catch (e) {}
    };

    onMounted(async () => {
      await getGroupData();
      const [itRes, cdRes] = await Promise.all([
        GetAdminItemListAPI()
          .then((r) => {
            if (r.status === 200) allItems.value = r.data.records || [];
          })
          .catch(() => {}),
        GetCreditDefsAPI()
          .then((r) => {
            if (r.status === 200) creditDefs.value = r.data || [];
          })
          .catch(() => {}),
      ]);
      await loadUserCount();
      const uid = userdata?.user?.uid;
      if (uid) { GetMuteStatusAPI(uid).then(r => { if (r.status===200) muteStatus.value = r.data; }).catch(()=>{}); }
    });

    return {
      userdata,
      isLoading,
      errorMsg,
      groupDo,
      extgroupDo,
      promotionLabel,
      nextPromotion,
      canPromote,
      doPromote,
      userWeightedCredits,
      promoItemCount,
      promoItemName,
      promoCreditBalance,
      muteStatus,
      canLiftMute,
      remainDays,
      doLiftMute,
      fmtMuteDate,
      promoCreditName,
    };
  },
});
</script>

<style lang="scss" scoped>
.permission-container {
  padding: 16px;
  min-height: calc(100vh - 70px); // 适配顶部导航栏高度
}

// 加载状态
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  flex-direction: column;
  gap: 8px;

  .loading-text {
    font-size: 14px;
    color: #86909c;
  }
}

// 错误状态
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  gap: 8px;

  .error-text {
    font-size: 14px;
    color: #ff4d4f;
  }
}

// 用户组卡片容器
.group-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 卡片样式
.group-card {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

// 卡片头部
.card-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #ebeef5;
  gap: 8px;

  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: #1d2129;
  }
}

// 卡片内容区
.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 单个用户组项
.group-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ebe9db;
  }
}

// 等级标签
.level-tag {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

// 组信息区
.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// 组名称
.group-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .name-text {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
  }
}

// 组元数据（积分、权限等）
.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #4e5969;
}

// 元数据项
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.mute-card {
  background: #FFF5F0;
  border: 1px solid rgba(232,116,58,0.3);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  .card-header { padding: 10px 14px; display:flex; align-items:center; gap:8px; }
  .card-title { font-size: 15px; font-weight: 500; color: #e8743a; }
}
.promotion-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border: 1px solid rgba(246, 173, 71, 0.3);
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  .card-header {
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card-title {
    font-size: 15px;
    font-weight: 500;
    color: #728567;
  }
  .promotion-progress {
    padding: 10px 14px 10px;
  }
  .progress-item {
    margin-bottom: 6px;
    font-size: 12px;
    color: #728567;
  }
  .progress-bar {
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 2px;
  }
  .progress-fill {
    height: 100%;
    background: #f6ad47;
    border-radius: 4px;
    transition: width 0.3s;
  }
  .progress-fill.item {
    background: #728567;
  }
  .progress-fill.credits {
    background: #e8743a;
  }
  .promotion-actions {
    padding: 8px 14px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>