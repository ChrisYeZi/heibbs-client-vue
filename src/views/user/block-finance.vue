<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <div class="bf-page">
      <van-loading v-if="loading" class="loading" />

      <template v-if="!loading">
        <!-- 财政概况 -->
        <div class="card">
          <div class="card-title">会馆财政</div>
          <div class="finance-val">{{ fmtNum(finance) }} 妖灵币</div>
          <div class="finance-sub">累计收支明细</div>
        </div>

        <!-- 管理员存取 -->
        <div class="card admin-card" v-if="isAdmin" style="margin-top: 10px">
          <div class="card-title">财政管理（管理员）</div>
          <div class="admin-row">
            <el-input-number
              v-model="adminAmt"
              :min="-999999"
              :precision="2"
              size="small"
              style="width: 140px"
              placeholder="正=存入 负=取出"
            />
            <el-input
              v-model="adminDesc"
              size="small"
              placeholder="备注"
              style="width: 140px; margin-left: 8px"
            />
            <el-button
              size="small"
              type="primary"
              @click="doAdminTransact"
              style="margin-left: 8px"
              >执行</el-button
            >
          </div>
          <div
            class="admin-toggles"
            style="margin-top: 10px; display: flex; gap: 20px"
          >
            <span
              >银行交易
              <el-switch
                v-model="bankEnabled"
                @change="toggleConfig('bank_enabled', $event)"
                size="small"
            /></span>
            <span
              >股市交易
              <el-switch
                v-model="stockEnabled"
                @change="toggleConfig('stock_enabled', $event)"
                size="small"
            /></span>
          </div>
        </div>

        <!-- 银行 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">会馆银行</div>
          <div class="bank-balance">
            存款总额: <strong>{{ fmtNum(bankBalance) }}</strong> 妖灵币 |
            日息约: {{ bankDailyInterest }} 妖灵币
          </div>
          <div class="stock-actions">
            <el-input-number
              v-model="bankAmt"
              :min="1"
              size="small"
              style="width: 120px"
            />
            <el-button size="small" type="warning" @click="doDeposit"
              >存入</el-button
            >
          </div>
          <div class="bank-tip">
            日息
            {{
              ((bankRate * 100) / 30).toFixed(3)
            }}%，每月上午8点结算，利息直接到账。取出需整笔取出，利息在取出时一并结算。
          </div>
          <!-- 存款明细 -->
          <div
            class="deposit-list"
            v-if="bankDeposits.length"
            style="margin-top: 10px"
          >
            <div v-for="d in bankDeposits" :key="d.id" class="deposit-item">
              <span>{{ fmtNum(d.amount) }} 妖灵币</span>
              <span style="font-size: 11px; color: #999">{{
                fmt(d.depositTime)
              }}</span>
              <span
                v-if="d.status === 1"
                style="font-size: 11px; color: #67c23a"
                >存款中</span
              >
              <span v-else style="font-size: 11px; color: #909399"
                >已取出 {{ d.withdrawTime ? fmt(d.withdrawTime) : "" }}</span
              >
              <el-button
                v-if="d.status === 1"
                size="small"
                type="danger"
                @click="doWithdraw(d.id)"
                >取出</el-button
              >
            </div>
          </div>
        </div>

        <!-- 股票 -->
        <div class="card" style="margin-top: 14px">
          <div class="card-title">会馆股票</div>
          <div class="stock-price">当前股价: {{ currentPrice }} 妖灵币/股</div>
          <div class="stock-hold" v-if="stock">
            持仓: {{ stock.shares || 0 }} 股 | 本周买入:
            {{ stock.buyThisMonth || 0 }}/1000股 | 本周卖出:
            {{ stock.sellThisWeek || 0 }}/1000股
          </div>
          <div class="stock-actions">
            <el-input-number
              v-model="buyAmt"
              :min="1"
              :max="1000"
              size="small"
              style="width: 120px"
            />
            <el-button size="small" type="warning" @click="doBuy"
              >买入</el-button
            >
            <el-input-number
              v-model="sellAmt"
              :min="1"
              :max="1000"
              size="small"
              style="width: 120px; margin-left: 8px"
            />
            <el-button size="small" type="danger" @click="doSell"
              >卖出</el-button
            >
          </div>

          <!-- 股价走势图 -->
          <div class="chart" v-if="prices.length > 0">
            <svg
              viewBox="0 0 100 70"
              style="width: 100%; max-height: 120px; display: block"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#F6AD47" stop-opacity="100" />
                  <stop offset="100%" stop-color="#F6AD47" stop-opacity="0" />
                </linearGradient>
              </defs>
              <line
                v-for="i in 4"
                :key="'g' + i"
                :x1="0"
                :y1="i * 15"
                :x2="100"
                :y2="i * 15"
                stroke="rgba(114,133,103,.15)"
                stroke-width="0.3"
              />
              <text
                v-for="(l, i) in yLabels"
                :key="'y' + i"
                x="-10"
                :y="i * 15 + 10"
                font-size="7"
                fill="#728567"
              >
                {{ l }}
              </text>
              <polygon
                v-if="prices.length > 1"
                :points="areaPoints"
                fill="url(#areaGrad)"
              />
              <polyline
                :points="linePoints"
                fill="none"
                stroke="#F6AD47"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
              <text
                v-for="(p, di) in dateLabels"
                :key="'d' + di"
                :x="chartX(prices.indexOf(p))"
                y="70"
                font-size="6"
                fill="#728567"
                text-anchor="middle"
              >
                {{ shortDate(p.dateline) }}
              </text>
            </svg>
          </div>
        </div>
        <!-- 财政日志 -->
        <div class="log-list" v-if="logs.length">
          <div v-for="l in logs" :key="l.id" class="log-item">
            <span :class="l.amount > 0 ? 'up' : 'down'">{{
              l.amount > 0 ? "+" + fmtNum(l.amount) : fmtNum(l.amount)
            }}</span>
            <span class="log-type">{{ typeLabel(l.type) }}</span>
            <span class="log-desc">{{ l.description }}</span>
            <span class="log-time">{{ fmt(l.dateline) }}</span>
          </div>
          <el-pagination
            v-if="logTotal > 10"
            layout="prev,pager,next"
            :total="logTotal"
            :page-size="10"
            :current-page="logPage"
            @current-change="
              (p) => {
                logPage = p;
                fetchLogs();
              }
            "
            size="small"
            style="justify-content: center; margin-top: 8px"
          />
        </div>
      </template>
    </div>
  </van-pull-refresh>
</template>

<script lang="ts">
import { ref, computed, defineComponent, onMounted } from "vue";
import {
  GetBlockFinanceAPI,
  GetMyStockAPI,
  BuyStockAPI,
  SellStockAPI,
} from "@/api/index";
import instance from "@/config/request/request";
import store from "@/store";
import { ElMessage } from "element-plus";
import { Loading, PullRefresh } from "vant";

export default defineComponent({
  name: "block-finance",
  components: { VanLoading: Loading, [PullRefresh.name]: PullRefresh },
  setup() {
    const loading = ref(true),
      refreshing = ref(false),
      finance = ref(0),
      logs = ref<any[]>([]),
      logPage = ref(1),
      logTotal = ref(0);
    const stock = ref<any>(null),
      prices = ref<any[]>([]),
      buyAmt = ref(1),
      sellAmt = ref(1);
    const isAdmin = ref(false);
    const adminAmt = ref(0),
      adminDesc = ref("");
    const bankEnabled = ref(true),
      stockEnabled = ref(true);
    const bankBalance = ref(0),
      bankDailyInterest = ref("0"),
      bankRate = ref(0.05),
      bankAmt = ref(1);
    const bankDeposits = ref<any[]>([]);

    const realtimePrice = ref("1.00");
    const currentPrice = computed(() => realtimePrice.value);
    // 使用百分比坐标系 0-100 宽度，等距分布数据点
    const priceMax = computed(() =>
      Math.max(...prices.value.map((p: any) => p.price), 1)
    );
    const yLabels = computed(() => {
      const m = priceMax.value;
      return [
        m.toFixed(1),
        (m * 0.75).toFixed(1),
        (m * 0.5).toFixed(1),
        (m * 0.25).toFixed(1),
      ];
    });
    const n = () => prices.value.length;
    const chartX = (i: number) => (n() <= 1 ? 50 : 5 + (i / (n() - 1)) * 90);
    const chartY = (price: number) => 75 - (price / priceMax.value) * 60;
    const linePoints = computed(() =>
      prices.value
        .map((p: any, i: number) => `${chartX(i)},${chartY(p.price)}`)
        .join(" ")
    );
    const areaPoints = computed(
      () => `${5},75 ${linePoints.value} ${n() <= 1 ? 95 : chartX(n() - 1)},75`
    );
    const dateLabels = computed(() => {
      // 每个日期只显示一个标签，避免同一天多个数据点标签重叠
      const seen: Record<string, boolean> = {};
      const result: any[] = [];
      for (let i = prices.value.length - 1; i >= 0; i--) {
        const key = shortDate(prices.value[i].dateline);
        if (!seen[key]) { seen[key] = true; result.unshift(prices.value[i]); }
      }
      return result;
    });
    const shortDate = (ts: number) => {
      const d = new Date(ts * 1000);
      return d.getMonth() + 1 + "/" + d.getDate();
    };

    const typeLabel = (t: string) =>
      ((
        {
          post_tax: "发帖税",
          rating_tax: "评分税",
          medal_tax: "勋章税",
          bank_interest: "利息支出",
          item_tax: "交易税",
          invitation_tax: "邀请码",
          stock_buy: "股票买入",
          stock_sell: "股票卖出",
          admin_deposit: "管理员存入",
          admin_withdraw: "管理员取出",
          bank_deposit: "银行存款",
          bank_withdraw: "银行取款",
        } as any
      )[t] || t);
    const fmt = (ts: number) =>
      ts ? new Date(ts * 1000).toLocaleString() : "";
    const fmtNum = (n: any) => (n != null ? Number(n).toFixed(2) : "0.00");

    const fetchLogs = async () => {
      const fr = await GetBlockFinanceAPI(1, {
        pageNum: logPage.value,
        pageSize: 10,
      });
      if (fr.status === 200) {
        finance.value = fr.data.block?.finance || 0;
        logs.value = fr.data.logs || [];
        logTotal.value = fr.data.total || 0;
      }
    };
    const fetch = async () => {
      loading.value = true;
      const [_, sr, br] = await Promise.all([
        fetchLogs(),
        GetMyStockAPI(),
        instance.get("/block-finance/bank/my"),
      ]);
      if (sr.status === 200) {
        stock.value = sr.data.stock;
        const allPrices = (sr.data.prices || []).slice().reverse();
        const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
        prices.value = allPrices.filter((p: any) => p.dateline >= sevenDaysAgo);
        realtimePrice.value = sr.data.currentPrice
          ? Number(sr.data.currentPrice).toFixed(2)
          : "1.00";
      }
      if (br.status === 200) {
        bankBalance.value = br.data.totalBalance || 0;
        bankDeposits.value = br.data.deposits || [];
        bankDailyInterest.value = br.data.dailyInterest || "0";
        bankRate.value = br.data.taxRate || 0.05;
      }
      loading.value = false;
    };
    const doDeposit = async () => {
      const r: any = await instance.post("/block-finance/bank/deposit", {
        amount: bankAmt.value,
      });
      ElMessage[r.status === 200 ? "success" : "error"](String(r.data || ""));
      fetch();
    };
    const doWithdraw = async (bankId: number) => {
      const r: any = await instance.post("/block-finance/bank/withdraw", {
        bankId,
      });
      ElMessage[r.status === 200 ? "success" : "error"](String(r.data || ""));
      fetch();
    };
    const doBuy = async () => {
      const r = await BuyStockAPI(buyAmt.value);
      ElMessage[r.status === 200 ? "success" : "error"](String(r.data || ""));
      fetch();
    };
    const doSell = async () => {
      const r = await SellStockAPI(sellAmt.value);
      ElMessage[r.status === 200 ? "success" : "error"](String(r.data || ""));
      fetch();
    };
    const doAdminTransact = async () => {
      const r: any = await instance.post("/block-finance/admin-transact", {
        amount: adminAmt.value,
        description: adminDesc.value,
      });
      ElMessage[r.status === 200 ? "success" : "error"](String(r.data || ""));
      fetch();
    };
    const u = store.state.user?.info?.user;
    isAdmin.value = u?.extgroupids > 0 || u?.groupid >= 8;
    const toggleConfig = async (key: string, val: boolean) => {
      await instance.post("/admin/config/set", {
        key,
        value: val ? "true" : "false",
      });
    };
    const loadConfig = async () => {
      const r: any = await instance.get("/admin/config/all");
      if (r.status === 200) {
        bankEnabled.value = r.data.bank_enabled !== "false";
        stockEnabled.value = r.data.stock_enabled !== "false";
      }
    };
    if (isAdmin.value) loadConfig();

    const onRefresh = async () => {
      refreshing.value = true;
      await fetch();
      refreshing.value = false;
    };

    onMounted(fetch);
    return {
      refreshing,
      onRefresh,
      loading,
      finance,
      logs,
      logPage,
      logTotal,
      fetchLogs,
      stock,
      prices,
      buyAmt,
      sellAmt,
      currentPrice,
      yLabels,
      chartX,
      chartY,
      linePoints,
      areaPoints,
      shortDate,
      dateLabels,
      typeLabel,
      fmt,
      fmtNum,
      doBuy,
      doSell,
      isAdmin,
      adminAmt,
      adminDesc,
      doAdminTransact,
      bankEnabled,
      stockEnabled,
      toggleConfig,
      bankBalance,
      bankRate,
      bankDailyInterest,
      bankDeposits,
      bankAmt,
      doDeposit,
      doWithdraw,
    };
  },
});
</script>

<style scoped>
.bf-page {
  padding: 10px 5px;
  border-radius: 0 0 10px 10px;
  color: #728567;
}
h2 {
  font-size: 18px;
  margin-bottom: 14px;
}
.card {
  background: #fff;
  border: 1px solid rgba(246, 173, 71, 0.2);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}
.finance-val {
  font-size: 28px;
  font-weight: 700;
  color: #f6ad47;
}
.finance-sub {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.6);
}
.log-list {
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
}
.log-item {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 12px;
  align-items: center;
}
.log-item:last-child {
  border-bottom: none;
}
.log-item .up {
  color: #67c23a;
  font-weight: 600;
}
.log-item .down {
  color: #e8743a;
  font-weight: 600;
}
.log-type {
  color: #728567;
  min-width: 50px;
}
.log-desc {
  flex: 1;
  color: #666;
}
.log-time {
  color: #ccc;
  white-space: nowrap;
}
.stock-price {
  font-size: 20px;
  font-weight: 600;
  color: #f6ad47;
  margin-bottom: 4px;
}
.stock-hold {
  font-size: 12px;
  color: #728567;
  margin-bottom: 8px;
}
.stock-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.chart {
  background: rgba(246, 173, 71, 0.05);
  border-radius: 8px;
  margin-top: 8px;
  padding: 8px 4px;
  width: 100%;
  overflow: hidden;
}
.deposit-list {
  margin-top: 8px;
}
.deposit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.deposit-item:last-child {
  border-bottom: none;
}
.bank-balance {
  font-size: 14px;
  margin-bottom: 6px;
  color: #728567;
}
.bank-balance strong {
  color: #f6ad47;
}
.bank-tip {
  font-size: 11px;
  color: rgba(114, 133, 103, 0.5);
  margin-top: 4px;
}
.loading {
  padding: 60px 0;
  text-align: center;
}
</style>
