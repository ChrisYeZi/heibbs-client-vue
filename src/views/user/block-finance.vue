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
            }}%，每月上午8点结算，取出需整笔取出。
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

        <!-- 我的资产 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">我的资产</div>
          <div class="asset-grid">
            <div class="asset-item">
              <div class="asset-label">可用资金</div>
              <div class="asset-val">
                {{ summary ? fmtNum(summary.availableCash) : "--" }}
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-label">持仓市值</div>
              <div class="asset-val">
                {{ summary ? summary.positionValue : "--" }}
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-label">银行存款</div>
              <div class="asset-val">
                {{ summary ? fmtNum(summary.bankTotal) : "--" }}
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-label">总资产</div>
              <div class="asset-val total">
                {{ summary ? summary.totalAssets : "--" }}
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-label">盈亏总额</div>
              <div class="asset-val" :class="pnlClass(summary?.totalPnL)">
                {{ summary ? formatPnL(summary.totalPnL) : "--" }}
              </div>
            </div>
            <div class="asset-item">
              <div class="asset-label">当日盈亏</div>
              <div class="asset-val" :class="pnlClass(summary?.dailyPnL)">
                {{ summary ? formatPnL(summary.dailyPnL) : "--" }}
              </div>
            </div>
          </div>
        </div>

        <!-- 交易时间 -->
        <div class="card" style="margin-top: 10px">
          <div class="card-title">交易时间</div>
          <div class="trade-status">
            <span
              class="status-dot"
              :class="realtime?.isInTradingHours ? 'open' : 'closed'"
            ></span>
            <span
              :style="{
                color: realtime?.isInTradingHours ? '#67c23a' : '#e8743a',
              }"
            >
              {{ realtime?.isInTradingHours ? "交易中" : "休市中" }}
            </span>
          </div>
          <div class="trade-sessions" v-if="realtime?.tradingHours">
            {{ realtime.tradingHours }}
          </div>
        </div>

        <!-- 股票实时行情 -->
        <div class="card" style="margin-top: 14px">
          <div class="card-title">会馆股票</div>
          <!-- 当前价 -->
          <div class="rt-price-row">
            <span class="rt-current">{{ realtime?.currentPrice || "--" }}</span>
            <span class="rt-unit">妖灵币/股</span>
          </div>
          <!-- 涨跌 -->
          <div class="rt-change-row" v-if="realtime">
            <span :class="changeClass(realtime.changeAmount)">
              {{ formatChange(realtime.changeAmount) }}
            </span>
            <span
              :class="changeClass(realtime.changeAmount)"
              style="margin-left: 8px"
            >
              {{ formatChangePercent(realtime.changePercent) }}
            </span>
          </div>
          <!-- 涨跌停标记 -->
          <div class="rt-limit-tags" v-if="realtime">
            <el-tag v-if="realtime.isLimitUp" type="danger" size="small"
              >涨停</el-tag
            >
            <el-tag v-if="realtime.isLimitDown" type="success" size="small"
              >跌停</el-tag
            >
            <el-tag v-if="!realtime.isInTradingHours" type="info" size="small"
              >非交易时间</el-tag
            >
          </div>
          <!-- OHLCV 网格 -->
          <div class="rt-ohlcv" v-if="realtime">
            <div class="ohlcv-item">
              <span class="ohlcv-label">昨收</span>
              <span class="ohlcv-val">{{ realtime.prevClose }}</span>
            </div>
            <div class="ohlcv-item">
              <span class="ohlcv-label">今开</span>
              <span class="ohlcv-val" :class="openVsPrevClass()">{{
                realtime.openPrice
              }}</span>
            </div>
            <div class="ohlcv-item">
              <span class="ohlcv-label">最高</span>
              <span class="ohlcv-val up">{{ realtime.highPrice }}</span>
            </div>
            <div class="ohlcv-item">
              <span class="ohlcv-label">最低</span>
              <span class="ohlcv-val down">{{ realtime.lowPrice }}</span>
            </div>
            <div class="ohlcv-item">
              <span class="ohlcv-label">成交量</span>
              <span class="ohlcv-val">{{ realtime.volume }}股</span>
            </div>
            <div class="ohlcv-item">
              <span class="ohlcv-label">成交额</span>
              <span class="ohlcv-val">{{ realtime.amount }}</span>
            </div>
          </div>
          <!-- T+n 锁定期提示（汇总） -->
          <div
            class="tplus-lock"
            v-if="stockLots?.tPlusEnabled && hasLockedLots"
          >
            <el-tag type="warning" size="small">
              T+{{ stockLots.tPlusDays }} 锁定期 · 部分持仓锁定中
            </el-tag>
          </div>

          <!-- 汇总持仓 -->
          <div class="stock-hold" v-if="stockLots?.stock">
            总持仓: {{ stockLots.stock.shares || 0 }} 股 | 本周买入:
            {{ stockLots.stock.buyThisMonth || 0 }}/1000股 | 本周卖出:
            {{ stockLots.stock.sellThisWeek || 0 }}/1000股
          </div>

          <!-- 买入 -->
          <div class="stock-actions">
            <el-input-number
              v-model="buyAmt"
              :min="1"
              :max="1000"
              size="small"
              style="width: 120px"
              :disabled="realtime?.isLimitUp"
            />
            <el-button
              size="small"
              type="warning"
              @click="doBuy"
              :disabled="realtime?.isLimitUp"
            >
              {{ realtime?.isLimitUp ? "涨停禁买" : "买入" }}
            </el-button>
          </div>
          <div class="limit-hint" v-if="realtime?.limitPct">
            涨跌幅限制: ±{{ realtime.limitPct }}% | 当前价:
            {{ realtime.currentPrice }}
          </div>

          <!-- 持仓明细列表 -->
          <div class="lot-section" v-if="stockLots?.lots?.length">
            <div class="lot-title">持仓明细</div>
            <div class="lot-item" v-for="lot in stockLots.lots" :key="lot.id">
              <div class="lot-row1">
                <span class="lot-shares">{{ lot.shares }} 股</span>
                <span class="lot-price"
                  >买入价 {{ lot.buyPrice.toFixed(2) }}</span
                >
                <el-tag v-if="lot.locked" type="warning" size="small">
                  T+{{ stockLots.tPlusDays }}锁定 {{ lot.lockRemainDays }}天{{
                    lot.lockRemainHours
                  }}时
                </el-tag>
              </div>
              <div class="lot-row2">
                <span class="lot-cost">成本 {{ lot.costBasis }}</span>
                <span class="lot-mkt">市值 {{ lot.marketValue }}</span>
                <span class="lot-pnl" :class="pnlClass(lot.floatingPnL)">
                  浮盈 {{ formatPnL(lot.floatingPnL) }} ({{
                    formatChangePercent(lot.floatingPnLPct)
                  }})
                </span>
              </div>
              <div class="lot-row3">
                <span class="lot-time">{{ fmt(lot.buyTime) }}</span>
                <div class="lot-sell-row" v-if="!lot.locked">
                  <el-input-number
                    v-model="lotSellAmts[lot.id]"
                    :min="1"
                    :max="lot.shares"
                    size="small"
                    style="width: 80px"
                    placeholder="卖出"
                  />
                  <el-button
                    size="small"
                    type="danger"
                    :disabled="realtime?.isLimitDown || !lotSellAmts[lot.id]"
                    @click="doSellLot(lot.id, lotSellAmts[lot.id])"
                  >
                    卖出
                  </el-button>
                </div>
                <el-tag v-else type="info" size="small">锁定中</el-tag>
              </div>
            </div>
            <!-- 分页 -->
            <el-pagination
              v-if="stockLots.total > 10"
              layout="prev,pager,next"
              :total="stockLots.total"
              :page-size="10"
              :current-page="lotPage"
              @current-change="
                (p) => {
                  lotPage = p;
                  fetchLots();
                }
              "
              size="small"
              style="justify-content: center; margin-top: 8px"
            />
          </div>
          <div
            class="lot-empty"
            v-else-if="stockLots && !stockLots.lots?.length"
          >
            暂无持仓
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
  GetStockRealtimeAPI,
  GetFinanceSummaryAPI,
  GetMyStockLotsAPI,
} from "@/api/index";
import instance from "@/config/request/request";
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
      buyAmt = ref(1);
    const realtime = ref<any>(null);
    const summary = ref<any>(null);
    const bankBalance = ref(0),
      bankDailyInterest = ref("0"),
      bankRate = ref(0.05),
      bankAmt = ref(1);
    const bankDeposits = ref<any[]>([]);

    // 持仓明细
    const stockLots = ref<any>(null);
    const lotPage = ref(1);
    const lotSellAmts = ref<Record<number, number>>({});

    // 是否有被锁定的持仓
    const hasLockedLots = computed(() => {
      return stockLots.value?.lots?.some((l: any) => l.locked) || false;
    });

    // 走势图计算
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
      const seen: Record<string, boolean> = {};
      const result: any[] = [];
      for (let i = prices.value.length - 1; i >= 0; i--) {
        const key = shortDate(prices.value[i].dateline);
        if (!seen[key]) {
          seen[key] = true;
          result.unshift(prices.value[i]);
        }
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

    // 涨跌颜色
    const changeClass = (val: any) => {
      const v = parseFloat(val);
      if (v > 0) return "up";
      if (v < 0) return "down";
      return "";
    };
    const formatChange = (val: any) => {
      const v = parseFloat(val);
      if (isNaN(v)) return "--";
      return v > 0 ? "+" + v.toFixed(2) : v.toFixed(2);
    };
    const formatChangePercent = (val: any) => {
      const v = parseFloat(val);
      if (isNaN(v)) return "--";
      return v > 0 ? "+" + v.toFixed(2) + "%" : v.toFixed(2) + "%";
    };
    const pnlClass = (val: any) => {
      const v = parseFloat(val);
      if (isNaN(v)) return "";
      return v > 0 ? "up" : v < 0 ? "down" : "";
    };
    const formatPnL = (val: any) => {
      const v = parseFloat(val);
      if (isNaN(v)) return "--";
      return v > 0 ? "+" + v.toFixed(2) : v.toFixed(2);
    };
    const openVsPrevClass = () => {
      if (!realtime.value) return "";
      const o = parseFloat(realtime.value.openPrice);
      const p = parseFloat(realtime.value.prevClose);
      if (isNaN(o) || isNaN(p)) return "";
      return o > p ? "up" : o < p ? "down" : "";
    };

    // API 调用
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
    const fetchLots = async () => {
      const r = await GetMyStockLotsAPI(lotPage.value, 10);
      if (r.status === 200) {
        stockLots.value = r.data;
        // 保持旧的 stock 引用兼容
        stock.value = r.data.stock;
      }
    };
    const fetch = async () => {
      loading.value = true;
      const [_, sr, br, rtr, smr] = await Promise.all([
        fetchLogs(),
        GetMyStockAPI(),
        instance.get("/block-finance/bank/my"),
        GetStockRealtimeAPI(),
        GetFinanceSummaryAPI(),
        fetchLots(),
      ]);
      if (sr.status === 200) {
        stock.value = sr.data.stock;
        const allPrices = (sr.data.prices || []).slice().reverse();
        const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
        prices.value = allPrices.filter((p: any) => p.dateline >= sevenDaysAgo);
      }
      if (br.status === 200) {
        bankBalance.value = br.data.totalBalance || 0;
        bankDeposits.value = br.data.deposits || [];
        bankDailyInterest.value = br.data.dailyInterest || "0";
        bankRate.value = br.data.taxRate || 0.05;
      }
      if (rtr.status === 200) {
        realtime.value = rtr.data;
      }
      if (smr.status === 200) {
        summary.value = smr.data;
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
    const doSellLot = async (lotId: number, shares: number) => {
      if (!shares || shares < 1) return;
      const r = await SellStockAPI(lotId, shares);
      ElMessage[r.status === 200 ? "success" : "error"](String(r.data || ""));
      if (r.status === 200) {
        lotSellAmts.value[lotId] = 0;
        await fetch();
      }
    };

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
      realtime,
      summary,
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
      changeClass,
      formatChange,
      formatChangePercent,
      pnlClass,
      formatPnL,
      openVsPrevClass,
      doBuy,
      doSellLot,
      stockLots,
      lotPage,
      lotSellAmts,
      hasLockedLots,
      fetchLots,
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

<style lang="scss" scoped>
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

// 交易时间
.trade-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  margin-bottom: 4px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  &.open {
    background: #67c23a;
    box-shadow: 0 0 4px rgba(103, 194, 58, 0.5);
  }
  &.closed {
    background: #e8743a;
  }
}
.trade-sessions {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.6);
}

// 资产网格
.asset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.asset-item {
  background: rgba(252, 249, 224, 0.4);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
}
.asset-label {
  font-size: 11px;
  color: rgba(114, 133, 103, 0.7);
  margin-bottom: 2px;
}
.asset-val {
  font-size: 16px;
  font-weight: 600;
  color: #728567;
  &.total {
    color: #f6ad47;
  }
  &.up {
    color: #67c23a;
  }
  &.down {
    color: #e8743a;
  }
}

// 实时行情
.rt-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 2px;
}
.rt-current {
  font-size: 28px;
  font-weight: 700;
  color: #f6ad47;
}
.rt-unit {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.6);
}
.rt-change-row {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  .up {
    color: #67c23a;
  }
  .down {
    color: #e8743a;
  }
}
.rt-limit-tags {
  margin-bottom: 8px;
  display: flex;
  gap: 6px;
}
.tplus-lock {
  margin-bottom: 8px;
}
.rt-ohlcv {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  margin-bottom: 10px;
}
.ohlcv-item {
  background: rgba(252, 249, 224, 0.3);
  border-radius: 6px;
  padding: 6px 8px;
  text-align: center;
}
.ohlcv-label {
  display: block;
  font-size: 10px;
  color: rgba(114, 133, 103, 0.6);
}
.ohlcv-val {
  font-size: 13px;
  font-weight: 500;
  color: #728567;
  &.up {
    color: #67c23a;
  }
  &.down {
    color: #e8743a;
  }
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
  margin-bottom: 4px;
}
.limit-hint {
  font-size: 11px;
  color: rgba(114, 133, 103, 0.5);
  margin-bottom: 8px;
}

// 走势图
.chart {
  background: rgba(246, 173, 71, 0.05);
  border-radius: 8px;
  margin-top: 8px;
  padding: 8px 4px;
  width: 100%;
  overflow: hidden;
}

// 银行
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

// 日志
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
.loading {
  padding: 60px 0;
  text-align: center;
}

// 持仓明细
.lot-section {
  margin-top: 10px;
}
.lot-title {
  font-size: 13px;
  font-weight: 600;
  color: #728567;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(246, 173, 71, 0.15);
}
.lot-item {
  background: rgba(252, 249, 224, 0.3);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.lot-row1 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.lot-shares {
  font-size: 15px;
  font-weight: 600;
  color: #f6ad47;
}
.lot-price {
  font-size: 12px;
  color: #728567;
}
.lot-row2 {
  display: flex;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 4px;
}
.lot-cost {
  color: rgba(114, 133, 103, 0.7);
}
.lot-mkt {
  color: #728567;
}
.lot-pnl {
  font-weight: 500;
  &.up {
    color: #67c23a;
  }
  &.down {
    color: #e8743a;
  }
}
.lot-row3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}
.lot-time {
  color: rgba(114, 133, 103, 0.5);
}
.lot-sell-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.lot-empty {
  text-align: center;
  font-size: 12px;
  color: rgba(114, 133, 103, 0.5);
  padding: 10px 0;
}
</style>
