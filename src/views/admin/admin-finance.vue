<template>
  <div class="admin-finance">
    <h2 class="page-title">会馆财政管理</h2>

    <!-- 财政管理 -->
    <el-card class="section-card" shadow="never">
      <template #header>
        <span class="card-header">财政管理</span>
      </template>
      <div class="admin-row">
        <el-input-number
          v-model="adminAmt"
          :min="-999999"
          :precision="2"
          placeholder="正=存入 负=取出"
          style="width: 180px"
        />
        <el-input
          v-model="adminDesc"
          placeholder="备注说明"
          style="width: 200px; margin-left: 12px"
        />
        <el-button
          type="primary"
          @click="doAdminTransact"
          :loading="transacting"
          style="margin-left: 12px"
        >
          执行存取
        </el-button>
      </div>
      <div class="hint">正数存入财政，负数从财政取出</div>
    </el-card>

    <!-- 交易开关 -->
    <el-card class="section-card" shadow="never">
      <template #header>
        <span class="card-header">交易开关</span>
      </template>
      <div class="toggle-row">
        <div class="toggle-item">
          <span class="toggle-label">银行交易</span>
          <el-switch
            v-model="bankEnabled"
            @change="toggleSingle('bank_enabled', $event)"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>
        <div class="toggle-item">
          <span class="toggle-label">股市交易</span>
          <el-switch
            v-model="stockEnabled"
            @change="toggleSingle('stock_enabled', $event)"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>
      </div>
    </el-card>

    <!-- 交易时间设置 -->
    <el-card class="section-card" shadow="never">
      <template #header>
        <span class="card-header">交易时间设置</span>
      </template>
      <div class="time-section">
        <div class="time-label">上午交易时段</div>
        <div class="time-row">
          <el-time-picker
            v-model="tradeAmStart"
            format="HH:mm"
            placeholder="开始时间"
            style="width: 140px"
          />
          <span class="time-sep">至</span>
          <el-time-picker
            v-model="tradeAmEnd"
            format="HH:mm"
            placeholder="结束时间"
            style="width: 140px"
          />
        </div>
      </div>
      <div class="time-section">
        <div class="time-label">下午交易时段</div>
        <div class="time-row">
          <el-time-picker
            v-model="tradePmStart"
            format="HH:mm"
            placeholder="开始时间"
            style="width: 140px"
          />
          <span class="time-sep">至</span>
          <el-time-picker
            v-model="tradePmEnd"
            format="HH:mm"
            placeholder="结束时间"
            style="width: 140px"
          />
        </div>
      </div>
      <el-button type="primary" @click="saveTimeConfig" :loading="saving" style="margin-top: 8px">
        保存交易时间
      </el-button>
    </el-card>

    <!-- 涨跌幅限制 -->
    <el-card class="section-card" shadow="never">
      <template #header>
        <span class="card-header">涨跌幅限制</span>
      </template>
      <div class="limit-row">
        <span class="limit-label">涨跌幅限制：±</span>
        <el-input-number
          v-model="priceLimitPct"
          :min="0.1"
          :max="100"
          :precision="1"
          style="width: 120px"
        />
        <span class="limit-unit">%</span>
        <el-button type="primary" @click="saveLimitConfig" :loading="savingLimit" style="margin-left: 12px">
          保存
        </el-button>
      </div>
      <div class="hint">
        当股价相对昨收涨跌幅达到该限制时触发涨跌停：
        涨停时只能卖不能买，跌停时只能买不能卖
      </div>
    </el-card>

    <!-- T+n 交收规则 -->
    <el-card class="section-card" shadow="never">
      <template #header>
        <span class="card-header">T+n 交收规则</span>
      </template>
      <div class="tplus-row">
        <div class="toggle-item">
          <span class="toggle-label">启用 T+n</span>
          <el-switch
            v-model="tPlusEnabled"
            @change="toggleSingle('stock_t_plus_enabled', $event)"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>
      </div>
      <div class="tplus-row" style="margin-top: 12px">
        <span class="limit-label">交收天数 n =</span>
        <el-input-number
          v-model="tPlusDays"
          :min="1"
          :max="7"
          :precision="0"
          style="width: 100px"
        />
        <span class="limit-unit">天</span>
        <el-button type="primary" @click="saveTPlusConfig" :loading="savingTPlus" style="margin-left: 12px">
          保存
        </el-button>
      </div>
      <div class="hint">
        开启后，买入股票需持有 n 天后才能卖出。
        例如 T+1：今天买入，明天才能卖出。
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import { ElMessage } from "element-plus";
import {
  AdminFinanceTransactAPI,
  GetStockConfigAPI,
  SaveStockConfigAPI,
} from "@/api/index";

/** "HH:mm" 字符串 → Date（今天，仅取时分） */
const parseTime = (hhmm: string): Date => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};

/** Date → "HH:mm" 字符串 */
const fmtTime = (d: Date | null): string => {
  if (!d) return "";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

export default defineComponent({
  name: "admin-finance",
  setup() {
    const adminAmt = ref(0);
    const adminDesc = ref("");
    const transacting = ref(false);
    const saving = ref(false);
    const savingLimit = ref(false);
    const savingTPlus = ref(false);

    const bankEnabled = ref(true);
    const stockEnabled = ref(true);

    // v-model 必须为 Date 对象，el-time-picker 才能正常工作
    const tradeAmStart = ref<Date>(parseTime("09:30"));
    const tradeAmEnd = ref<Date>(parseTime("11:30"));
    const tradePmStart = ref<Date>(parseTime("13:00"));
    const tradePmEnd = ref<Date>(parseTime("15:00"));
    const priceLimitPct = ref(10);
    const tPlusEnabled = ref(true);
    const tPlusDays = ref(1);

    // 加载配置
    const loadConfig = async () => {
      try {
        const r = await GetStockConfigAPI();
        if (r.status === 200 && r.data) {
          const d = r.data;
          bankEnabled.value = d.bank_enabled !== "false";
          stockEnabled.value = d.stock_enabled !== "false";
          if (d.stock_trade_am_start) tradeAmStart.value = parseTime(d.stock_trade_am_start);
          if (d.stock_trade_am_end) tradeAmEnd.value = parseTime(d.stock_trade_am_end);
          if (d.stock_trade_pm_start) tradePmStart.value = parseTime(d.stock_trade_pm_start);
          if (d.stock_trade_pm_end) tradePmEnd.value = parseTime(d.stock_trade_pm_end);
          if (d.stock_price_limit_pct) priceLimitPct.value = Number(d.stock_price_limit_pct);
          if (d.stock_t_plus_enabled !== undefined) tPlusEnabled.value = d.stock_t_plus_enabled !== "false";
          if (d.stock_t_plus_days) tPlusDays.value = Number(d.stock_t_plus_days);
        }
      } catch (e) {
        console.error("加载配置失败", e);
      }
    };

    // 管理员存取
    const doAdminTransact = async () => {
      transacting.value = true;
      try {
        const r = await AdminFinanceTransactAPI({
          amount: adminAmt.value,
          description: adminDesc.value,
        });
        ElMessage[r.status === 200 ? "success" : "error"](
          String(r.data || "")
        );
        if (r.status === 200) {
          adminAmt.value = 0;
          adminDesc.value = "";
        }
      } catch (e) {
        ElMessage.error("操作失败");
      }
      transacting.value = false;
    };

    // 单个开关切换
    const toggleSingle = async (key: string, val: boolean) => {
      await SaveStockConfigAPI({ [key]: val ? "true" : "false" });
      ElMessage.success("已更新");
    };

    // 保存交易时间
    const saveTimeConfig = async () => {
      saving.value = true;
      try {
        const r = await SaveStockConfigAPI({
          stock_trade_am_start: fmtTime(tradeAmStart.value) || "09:30",
          stock_trade_am_end: fmtTime(tradeAmEnd.value) || "11:30",
          stock_trade_pm_start: fmtTime(tradePmStart.value) || "13:00",
          stock_trade_pm_end: fmtTime(tradePmEnd.value) || "15:00",
        });
        ElMessage[r.status === 200 ? "success" : "error"](
          r.status === 200 ? "交易时间保存成功" : String(r.data || "保存失败")
        );
      } catch (e) {
        ElMessage.error("保存失败");
      }
      saving.value = false;
    };

    // 保存涨跌幅
    const saveLimitConfig = async () => {
      savingLimit.value = true;
      try {
        const r = await SaveStockConfigAPI({
          stock_price_limit_pct: String(priceLimitPct.value),
        });
        ElMessage[r.status === 200 ? "success" : "error"](
          r.status === 200 ? "涨跌幅限制保存成功" : String(r.data || "保存失败")
        );
      } catch (e) {
        ElMessage.error("保存失败");
      }
      savingLimit.value = false;
    };

    // 保存T+n配置
    const saveTPlusConfig = async () => {
      savingTPlus.value = true;
      try {
        const r = await SaveStockConfigAPI({
          stock_t_plus_days: String(tPlusDays.value),
        });
        ElMessage[r.status === 200 ? "success" : "error"](
          r.status === 200 ? "T+n配置保存成功" : String(r.data || "保存失败")
        );
      } catch (e) {
        ElMessage.error("保存失败");
      }
      savingTPlus.value = false;
    };

    onMounted(() => {
      loadConfig();
    });

    return {
      adminAmt,
      adminDesc,
      transacting,
      saving,
      savingLimit,
      bankEnabled,
      stockEnabled,
      tradeAmStart,
      tradeAmEnd,
      tradePmStart,
      tradePmEnd,
      priceLimitPct,
      tPlusEnabled,
      tPlusDays,
      savingTPlus,
      saveTPlusConfig,
      doAdminTransact,
      toggleSingle,
      saveTimeConfig,
      saveLimitConfig,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin-finance {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.section-card {
  margin-bottom: 16px;
  border: 1px solid rgba(246, 173, 71, 0.2);
  border-radius: 10px;

  :deep(.el-card__header) {
    background: #fcf9e0;
    border-bottom: 1px solid rgba(246, 173, 71, 0.15);
    padding: 12px 16px;
  }
}

.card-header {
  font-size: 15px;
  font-weight: 600;
  color: #728567;
}

.admin-row {
  display: flex;
  align-items: center;
}

.toggle-row {
  display: flex;
  gap: 40px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  font-size: 14px;
  color: #728567;
  min-width: 60px;
}

.time-section {
  margin-bottom: 12px;
}

.time-label {
  font-size: 13px;
  color: #728567;
  margin-bottom: 6px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-sep {
  color: #728567;
}

.limit-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.limit-label {
  font-size: 14px;
  color: #728567;
}

.limit-unit {
  font-size: 14px;
  color: #728567;
}

.hint {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.6);
  margin-top: 8px;
}
</style>
