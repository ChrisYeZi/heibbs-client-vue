<template>
  <div class="medal-page">
    <van-loading v-if="loading" class="loading" />

    <!-- 已获得勋章（顶部独立区域） -->
    <div class="owned-section" v-if="ownedMedals.length > 0">
      <h3 class="section-title">我的勋章 ({{ ownedMedals.length }})</h3>
      <div class="owned-grid">
        <div
          v-for="m in ownedMedals"
          :key="'o' + m.id"
          class="owned-card"
          :class="{ primary: m.isPrimary }"
          @click="m.categoryId === 1 ? setPrimary(m) : null"
        >
          <img :src="m.imageUrl" :alt="m.name" class="owned-img" />
          <div class="owned-name">{{ m.name }}</div>
          <div class="owned-badge" v-if="m.isPrimary">主展示</div>
        </div>
      </div>
    </div>

    <van-empty
      v-if="!loading && ownedMedals.length === 0 && allFlat.length === 0"
      description="暂无勋章"
    />

    <!-- 全部勋章 -->
    <div v-for="cat in allCategories" :key="cat.key" class="medal-section">
      <h3 class="section-title">
        {{ cat.key === 1 ? " 传奇勋章" : " 普通勋章" }}
      </h3>
      <div class="medal-grid">
        <div
          v-for="m in cat.medals"
          :key="m.id"
          class="medal-card"
          :class="{ owned: m.owned }"
          @click="handleMedalClick(m)"
        >
          <img
            :src="m.imageUrl"
            :alt="m.name"
            class="medal-img"
            :class="{ gray: !m.owned }"
          />
          <div class="medal-name">{{ m.name }}</div>
          <div class="medal-status owned-tag" v-if="m.owned">已获得</div>
          <div
            class="medal-status price-tag"
            v-else-if="m.acquireType === 'credit' && m.creditPrice > 0"
            @click.stop="buyMedal(m)"
          >
            {{ creditName(m.creditType) }}{{ m.creditPrice }}
          </div>
          <div class="medal-status manual-tag" v-else>条件获取</div>
        </div>
      </div>
    </div>

    <!-- 最近获得记录 -->
    <div class="recent-section" v-if="recentLogs.length > 0">
      <h3 class="section-title">最近获得</h3>
      <div class="recent-list">
        <div v-for="log in recentLogs" :key="log.id" class="recent-item">
          <img :src="log.medalImage" :alt="log.medalName" class="recent-img" />
          <span class="recent-user">{{ log.username }}</span>
          <span class="recent-name">{{ log.medalName }}</span>
          <span class="recent-type">{{
            log.acquireType === "purchase" ? "积分购买" : "发放"
          }}</span>
          <span class="recent-time">{{ fmtTime(log.dateline) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from "vue";
import {
  GetAllMedalsAPI,
  SetPrimaryMedalAPI,
  PurchaseMedalAPI,
  GetRecentMedalLogsAPI,
} from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading, Empty } from "vant";

interface MedalItem {
  id: number;
  name: string;
  imageUrl: string;
  categoryId: number;
  owned: boolean;
  userMedalId?: number;
  isPrimary?: boolean;
  acquireType: string;
  creditType: string;
  creditPrice: number;
}

export default defineComponent({
  name: "medal-page",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const loading = ref(true);
    const allCategories = ref<{ key: number; medals: MedalItem[] }[]>([]);
    const recentLogs = ref<any[]>([]);

    const ownedMedals = computed(() => {
      const result: MedalItem[] = [];
      for (const cat of allCategories.value)
        for (const m of cat.medals) if (m.owned) result.push(m);
      return result;
    });
    const allFlat = computed(() => {
      const arr: MedalItem[] = [];
      for (const cat of allCategories.value) arr.push(...cat.medals);
      return arr;
    });

    const creditName = (t: string) => {
      const m: Record<string, string> = {
        extcredits1: "灵气",
        extcredits2: "妖灵币",
        extcredits3: "值钱玉佩",
        extcredits4: "天明珠",
      };
      return m[t] || "积分";
    };
    const fmtTime = (ts: number) => {
      if (!ts) return "";
      const d = new Date(ts * 1000);
      return (
        d.getMonth() +
        1 +
        "/" +
        d.getDate() +
        " " +
        d.getHours() +
        ":" +
        String(d.getMinutes()).padStart(2, "0")
      );
    };

    const fetch = async () => {
      loading.value = true;
      try {
        const [medalRes, logRes] = await Promise.all([
          GetAllMedalsAPI(),
          GetRecentMedalLogsAPI(),
        ]);
        if (medalRes.status === 200 && medalRes.data) {
          const cats: { key: number; medals: MedalItem[] }[] = [];
          for (const [k, v] of Object.entries(medalRes.data))
            cats.push({ key: Number(k), medals: v as MedalItem[] });
          cats.sort((a, b) => a.key - b.key);
          allCategories.value = cats;
        }
        if (logRes.status === 200) recentLogs.value = logRes.data || [];
      } catch (e) {}
      loading.value = false;
    };

    const setPrimary = async (m: MedalItem) => {
      if (!m.userMedalId) return;
      const r = await SetPrimaryMedalAPI(m.userMedalId);
      if (r.status === 200) {
        ElMessage.success("已设为首页展示");
        fetch();
      } else ElMessage.error(String(r.data || "操作失败"));
    };

    const handleMedalClick = (m: MedalItem) => {
      if (!m.owned && m.acquireType === "credit" && m.creditPrice > 0)
        buyMedal(m);
    };

    const buyMedal = async (m: MedalItem) => {
      try {
        await ElMessageBox.confirm(
          `花费 ${creditName(m.creditType)}${m.creditPrice} 购买「${
            m.name
          }」？`,
          "购买勋章"
        );
      } catch {
        return;
      }
      const r = await PurchaseMedalAPI(m.id);
      if (r.status === 200) {
        ElMessage.success("购买成功");
        fetch();
      } else ElMessage.error(String(r.data || "购买失败"));
    };

    fetch();
    return {
      loading,
      allCategories,
      recentLogs,
      ownedMedals,
      allFlat,
      creditName,
      fmtTime,
      setPrimary,
      handleMedalClick,
      buyMedal,
    };
  },
});
</script>

<style scoped>
.medal-page {
  margin: 10px 5px;
  padding: 10px 20px;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
}
h2 {
  font-size: 18px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 15px;
  margin: 14px 0 8px;
}
.owned-section {
  margin-bottom: 8px;
}
.owned-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.owned-card {
  background: #fffdf0;
  border: 2px solid #f4a400;
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  min-width: 70px;
}
.owned-card.primary {
  background: #fff8d0;
}
.owned-img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: contain;
}
.owned-name {
  font-size: 11px;
  margin-top: 2px;
}
.owned-badge {
  font-size: 9px;
  color: #f4a400;
  font-weight: 600;
}
.medal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.medal-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  width: 90px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: transform 0.1s;
}
.medal-card:active {
  transform: scale(0.95);
}
.medal-card.owned {
  background: #f0faf0;
  border-color: #c0e0c0;
}
.medal-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
}
.medal-img.gray {
  filter: grayscale(1);
  opacity: 0.4;
}
.medal-name {
  font-size: 11px;
  margin-top: 4px;
  word-break: break-all;
  color: #303133;
}
.medal-status {
  font-size: 10px;
  margin-top: 2px;
  border-radius: 4px;
  padding: 1px 4px;
  display: inline-block;
}
.owned-tag {
  background: #e6f7e6;
  color: #67c23a;
}
.price-tag {
  background: #ecf5ff;
  color: #409eff;
  cursor: pointer;
}
.price-tag:hover {
  background: #409eff;
  color: #fff;
}
.manual-tag {
  color: #c0c4cc;
}
.loading {
  padding: 50px 0;
  text-align: center;
}
.recent-section {
  margin-top: 20px;
}
.recent-list {
  background: #fafafa;
  border-radius: 10px;
  padding: 8px 12px;
}
.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.recent-item:last-child {
  border-bottom: none;
}
.recent-img {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
  flex-shrink: 0;
}
.recent-user {
  color: #303133;
  font-weight: 500;
}
.recent-name {
  color: #909399;
  flex: 1;
}
.recent-type {
  font-size: 11px;
  color: #409eff;
  background: #ecf5ff;
  padding: 1px 5px;
  border-radius: 3px;
}
.recent-time {
  font-size: 11px;
  color: #c0c4cc;
  white-space: nowrap;
}
</style>
