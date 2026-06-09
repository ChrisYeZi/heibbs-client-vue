<template>
  <div class="credits-page">
    <van-loading v-if="loading" class="loading" />

    <template v-if="!loading">
      <!-- 积分卡片 -->
      <div class="credit-cards">
        <div class="credit-card">
          <div class="cc-val">{{ count?.extcredits1 || 0 }}</div>
          <div class="cc-label">灵气</div>
        </div>
        <div class="credit-card">
          <div class="cc-val">{{ count?.extcredits2 || 0 }}</div>
          <div class="cc-label">妖灵币</div>
        </div>
        <div class="credit-card">
          <div class="cc-val">{{ count?.extcredits3 || 0 }}</div>
          <div class="cc-label">值钱玉佩</div>
        </div>
        <div class="credit-card">
          <div class="cc-val">{{ count?.extcredits4 || 0 }}</div>
          <div class="cc-label">天明珠</div>
        </div>
      </div>

      <!-- 明细列表 -->
      <van-empty v-if="!records.length" description="暂无记录" />
      <div class="record-list">
        <div v-for="r in records" :key="r.id" class="record-item">
          <div class="rec-left">
            <div class="rec-msg">{{ r.message || "评分" }}</div>
            <div class="rec-pid">帖子#{{ r.pid }}</div>
          </div>
          <div class="rec-changes">
            <span
              v-for="(t, i) in getChanges(r)"
              :key="i"
              :class="{ neg: t.v < 0 }"
              >{{ t.v > 0 ? "+" : "" }}{{ t.v }} {{ t.n }}</span
            >
          </div>
          <div class="rec-time">{{ fmtTime(r.time) }}</div>
        </div>
      </div>
      <el-pagination v-if="recTotal>11" layout="prev,pager,next" :total="recTotal"
        :page-size="11" :current-page="recPage" @current-change="p=>{recPage=p;fetch()}" size="small"
        style="justify-content:center;margin-top:11px"/>
    </template>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from "vue";
import { GetCreditDetailAPI } from "@/api/index";
import { Loading, Empty } from "vant";

export default defineComponent({
  name: "credits",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const loading = ref(true),
      count = ref<any>(null),
      records = ref<any[]>([]),
      recPage = ref(1), recTotal = ref(0);
    const names = ["灵气", "妖灵币", "值钱玉佩", "天明珠"];

    const getChanges = (r: any) => {
      const arr: any[] = [];
      [r.extcredits1, r.extcredits2, r.extcredits3, r.extcredits4].forEach(
        (v, i) => {
          if (v) arr.push({ v, n: names[i] });
        }
      );
      return arr;
    };
    const fmtTime = (t: any) => {
      if (!t) return "";
      const d = new Date(Number(t) * 1000);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    };

    const fetch = async () => {
      loading.value = true;
      const r = await GetCreditDetailAPI({pageNum:recPage.value,pageSize:11});
      if (r.status === 200) {
        count.value = r.data.count;
        records.value = r.data.records || [];
        recTotal.value = r.data.total || 0;
      }
      loading.value = false;
    };
    onMounted(fetch);
    return { loading, count, records, recPage, recTotal, fetch, getChanges, fmtTime };
  },
});
</script>

<style scoped>
.credits-page {
  margin: 10px 5px;
  padding: 11px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 11px;
}
h2 {
  font-size: 18px;
  margin-bottom: 14px;
}
.credit-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.credit-card {
  background: linear-gradient(135deg, #ffc169, #fccb74);
  color: #fff;
  border-radius: 11px;
  padding: 11px 8px;
  text-align: center;
}
.cc-val {
  font-size: 22px;
  font-weight: 700;
}
.cc-label {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
}
.section-title {
  font-size: 11px;
  margin-bottom: 8px;
  color: #666;
}
.record-list {
  background: #fff;
  border-radius: 11px;
}
.record-item {
  display: flex;
  align-items: center;
  padding: 11px 11px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  gap: 8px;
}
.record-item:last-child {
  border-bottom: none;
}
.rec-left {
  flex: 1;
  min-width: 0;
}
.rec-msg {
  color: #303133;
}
.rec-pid {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.rec-changes {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 11px;
  white-space: nowrap;
}
.rec-changes span {
  color: #67c23a;
}
.rec-changes span.neg {
  color: #e8743a;
}
.rec-time {
  font-size: 11px;
  color: #c0c4cc;
  white-space: nowrap;
}
.loading {
  padding: 60px 0;
  text-align: center;
}
</style>
