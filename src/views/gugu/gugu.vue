<template>
  <div class="gugu">
    <van-loading v-if="loading" class="loading" />

    <template v-if="!loading && mainEps.length">
      <!-- 统计 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ stats.avgDays }}</div>
          <div class="stat-label">平均间隔(天)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.sinceLast }}</div>
          <div class="stat-label">距上次更新</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.fastest }}</div>
          <div class="stat-label">最快(天)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.slowest }}</div>
          <div class="stat-label">最慢(天)</div>
        </div>
      </div>

      <div class="predict-card" v-if="stats.nextDate">
        <span
          >预计下一集: <strong>{{ stats.nextDate }}</strong
          >（距今 {{ stats.daysUntil }} 天）</span
        >
      </div>

      <!-- 日历 -->
      <h3 class="section-title">更新日历</h3>
      <div class="calendar">
        <div class="cal-header">
          <span class="cal-nav" @click="prevMonth">&#8249;</span>
          <span class="cal-month">{{ calYear }}年{{ calMonth }}月</span>
          <span class="cal-nav" @click="nextMonth">&#8250;</span>
        </div>
        <div class="cal-weekdays">
          <span v-for="(d, k) in weekDays" :key="k">{{ d }}</span>
        </div>
        <div class="cal-grid">
          <div
            v-for="(d, i) in calDays"
            :key="i"
            class="cal-day"
            :class="{
              empty: !d,
              today: d?.today,
              ep: d?.ep,
              predict: d?.predict,
            }"
          >
            <span v-if="d" class="day-num">{{ d.num }}</span>
          </div>
        </div>
        <div class="cal-legend">
          <span><i class="dot ep"></i>已更新</span>
          <span><i class="dot today"></i>今天</span>
          <span><i class="dot predict"></i>预计</span>
        </div>
      </div>

      <!-- 列表 -->
      <h3 class="section-title">更新记录</h3>
      <div class="ep-list">
        <div v-for="ep in episodes" :key="ep.id" class="ep-row">
          <span class="ep-title">{{ ep.show_title || ep.long_title }}</span>
          <span class="ep-date">{{ ep.dateStr }}</span>
          <span class="ep-gap" v-if="ep.gap != null">{{ ep.gap }}天</span>
        </div>
      </div>
    </template>

    <van-empty v-if="!loading && !mainEps.length" description="暂无数据" />
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, defineComponent } from "vue";
import { Loading, Empty } from "vant";
import { GetGuguEpisodesAPI } from "@/api/index";

interface Ep {
  id: number;
  title: string;
  dateStr: string;
  ts: number;
  gap: number | null;
  show_title?: string;
  long_title?: string;
}

export default defineComponent({
  name: "gugu",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const loading = ref(true),
      episodes = ref<Ep[]>([]),
      calYear = ref(2026),
      calMonth = ref(6);
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

    const fetchData = async () => {
      try {
        const r = await GetGuguEpisodesAPI(32374);
        const json = typeof r === "string" ? JSON.parse(r as any) : r;
        if (json.code !== 0) throw new Error(json.message);
        let raw = json.result.episodes || [];
        // 按 pub_time 排序
        raw.sort((a: any, b: any) => (a.pub_time || 0) - (b.pub_time || 0));
        const result: Ep[] = [];
        for (let i = 0; i < raw.length; i++) {
          const e = raw[i];
          const ts: number = e.pub_time || 0;
          const d = new Date(ts * 1000);
          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
          let gap: number | null = null;
          if (i > 0) {
            const prevTs = raw[i - 1].pub_time || 0;
            if (prevTs > 0) gap = Math.round((ts - prevTs) / 86400);
          }
          result.push({
            id: e.id,
            title: e.title,
            dateStr: ds,
            ts,
            gap,
            show_title: e.show_title,
            long_title: e.long_title,
          });
        }
        episodes.value = result;
        if (result.length) {
          const last = result[result.length - 1];
          calYear.value = new Date(last.ts * 1000).getFullYear();
          calMonth.value = new Date(last.ts * 1000).getMonth() + 1;
        }
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    // 仅主编号集（title为纯整数，排除番外MV）
    const mainEps = computed(() =>
      episodes.value.filter((e) => /^\d+$/.test(e.title || ""))
    );

    const stats = computed(() => {
      const eps = mainEps.value;
      if (eps.length < 2)
        return {
          avgDays: "?",
          sinceLast: "?",
          fastest: "?",
          slowest: "?",
          nextDate: "",
          daysUntil: "?",
        };
      const gaps: number[] = [];
      for (let i = 1; i < eps.length; i++) {
        const g = eps[i].gap;
        if (g != null && g >= 1) gaps.push(g);
      }
      const avg = gaps.length
        ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1)
        : "?";
      const fastest = gaps.length ? Math.min(...gaps) : "?";
      const slowest = gaps.length ? Math.max(...gaps) : "?";
      const last = eps[eps.length - 1];
      const now = Math.floor(Date.now() / 1000);
      const since = last.ts ? Math.floor((now - last.ts) / 86400) : "?";
      const avgN = parseFloat(avg as string);
      const next =
        last.ts && !isNaN(avgN) && avgN > 0
          ? new Date((last.ts + avgN * 86400) * 1000).toISOString().slice(0, 10)
          : "?";
      const until =
        last.ts && !isNaN(avgN) && avgN > 0
          ? Math.max(0, Math.floor((last.ts + avgN * 86400 - now) / 86400))
          : "?";
      return {
        avgDays: avg,
        sinceLast: since,
        fastest,
        slowest,
        nextDate: next,
        daysUntil: until,
      };
    });

    const calDays = computed(() => {
      const y = calYear.value,
        m = calMonth.value;
      const first = new Date(y, m - 1, 1).getDay(),
        daysIn = new Date(y, m, 0).getDate();
      const today = new Date().toISOString().slice(0, 10);
      const epset = new Set(episodes.value.map((e) => e.dateStr));
      const arr: any[] = [];
      for (let i = 0; i < first; i++) arr.push(null);
      for (let d = 1; d <= daysIn; d++) {
        const ds = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
          2,
          "0"
        )}`;
        arr.push({
          num: d,
          today: ds === today,
          ep: epset.has(ds),
          predict: ds === stats.value.nextDate,
        });
      }
      return arr;
    });

    const prevMonth = () => {
      if (calMonth.value === 1) {
        calYear.value--;
        calMonth.value = 12;
      } else calMonth.value--;
    };
    const nextMonth = () => {
      if (calMonth.value === 12) {
        calYear.value++;
        calMonth.value = 1;
      } else calMonth.value++;
    };

    onMounted(fetchData);
    return {
      loading,
      episodes,
      mainEps,
      calYear,
      calMonth,
      calDays,
      stats,
      weekDays,
      prevMonth,
      nextMonth,
    };
  },
});
</script>

<style lang="scss" scoped>
.gugu {
  padding: 10px 10px;
  background: #fcf9e0;
  border-radius: 0 0 10px 10px;
  color: #728567;
}
.page-title {
  font-size: 18px;
  margin-bottom: 14px;
  color: #728567;
}
.loading {
  padding: 60px 0;
  text-align: center;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.stat-card {
  background: #fff;
  border: 1px solid rgba(246, 173, 71, 0.3);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #f6ad47;
}
.stat-label {
  font-size: 11px;
  color: #728567;
  margin-top: 2px;
}

.predict-card {
  background: linear-gradient(135deg, #f6ad47, #fccb74);
  color: #fff;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 14px;
  font-size: 14px;
}

.section-title {
  font-size: 15px;
  color: #728567;
  margin: 14px 0 8px;
}

.calendar {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(246, 173, 71, 0.2);
}
.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.cal-nav {
  font-size: 22px;
  cursor: pointer;
  color: #f6ad47;
  padding: 0 8px;
  user-select: none;
}
.cal-month {
  font-size: 16px;
  font-weight: 600;
  color: #728567;
}
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 6px;
}
.cal-day.empty {
  background: transparent;
}
.cal-day.today {
  background: #728567;
  color: #fff;
  font-weight: 600;
}
.cal-day.ep {
  background: rgba(246, 173, 71, 0.2);
  color: #f6ad47;
  font-weight: 600;
}
.cal-day.predict {
  background: rgba(246, 173, 71, 0.35);
  border: 1px dashed #f6ad47;
}
.cal-legend {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 8px;
  font-size: 11px;
  color: #728567;
  align-items: center;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.dot.ep {
  background: rgba(246, 173, 71, 0.6);
}
.dot.today {
  background: #728567;
}
.dot.predict {
  border: 1px dashed #f6ad47;
  background: rgba(246, 173, 71, 0.35);
}

.ep-list {
  max-height: 360px;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
}
.ep-row {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(114, 133, 103, 0.1);
  font-size: 13px;
  align-items: center;
}
.ep-row:last-child {
  border-bottom: none;
}
.ep-title {
  flex: 1;
  color: #728567;
}
.ep-date {
  color: #f6ad47;
  margin-right: 10px;
}
.ep-gap {
  font-size: 11px;
  color: #aaa;
}
</style>
