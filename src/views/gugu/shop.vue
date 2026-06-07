<template>
  <div class="shop-page">
    <h2>集市</h2>
    <div class="shop-tabs">
      <span :class="{active:filterType===''}" @click="filterType='';fetch()">全部</span>
      <span :class="{active:filterType==='fixed'}" @click="filterType='fixed';fetch()">一口价</span>
      <span :class="{active:filterType==='auction'}" @click="filterType='auction';fetch()">拍卖</span>
    </div>
    <van-loading v-if="loading" class="loading"/>
    <van-empty v-if="!loading && list.length===0" description="集市暂无商品"/>
    <div class="listing-grid">
      <div v-for="item in list" :key="item.id" class="listing-card" :class="rarityClass(item.itemRarity)">
        <div class="listing-header">
          <img v-if="item.itemIcon" :src="item.itemIcon" class="listing-icon"/>
          <span v-else class="listing-icon-placeholder">📦</span>
          <div class="listing-info">
            <div class="listing-name">{{ item.itemName }}</div>
            <div class="listing-seller">{{ item.sellerName }} · x{{ item.quantity }}</div>
          </div>
          <span class="listing-type-tag" :class="item.type">{{ item.type==='fixed'?'一口价':'拍卖' }}</span>
        </div>
        <div class="listing-footer">
          <span class="listing-price">{{ item.type==='auction'&&item.highestBid? '当前:'+item.highestBid : item.price }} 妖灵币</span>
          <span v-if="item.type==='auction'" class="listing-bids">{{ item.bidCount||0 }}次出价</span>
          <el-button v-if="item.type==='fixed'" size="small" type="primary" @click="buyFixed(item)">购买</el-button>
          <el-button v-else size="small" type="warning" @click="showBid(item)">出价</el-button>
        </div>
      </div>
    </div>
    <el-pagination v-if="total>pageSize" layout="prev,pager,next" :total="total" :page-size="pageSize" :current-page="page" @current-change="p=>{page=p;fetch()}"/>
    <el-dialog v-model="bidDlg" title="拍卖出价" width="320px">
      <p>当前最高: <b>{{ bidTarget.highestBid||bidTarget.price }}</b> 妖灵币</p>
      <el-input-number v-model="bidAmount" :min="(bidTarget.highestBid||bidTarget.price)+1" style="width:100%"/>
      <template #footer><el-button @click="bidDlg=false">取消</el-button><el-button type="primary" @click="doBid">出价</el-button></template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { GetShopListingsAPI, BuyFixedAPI, PlaceBidAPI } from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading, Empty } from "vant";

const rarityColors: Record<number,string> = { 0:'common', 1:'rare', 2:'epic', 3:'legendary' };

export default defineComponent({
  name:"shop", components:{VanLoading:Loading,VanEmpty:Empty},
  setup(){
    const loading=ref(true),list=ref<any[]>([]),page=ref(1),pageSize=ref(20),total=ref(0),filterType=ref('');
    const bidDlg=ref(false),bidTarget=ref<any>({}),bidAmount=ref(0);
    const rarityClass=(r:any)=>rarityColors[r]||'common';
    const fetch=async()=>{loading.value=true;const r=await GetShopListingsAPI({pageNum:page.value,pageSize:pageSize.value,type:filterType.value||undefined});if(r.status===200){list.value=r.data.records||[];total.value=r.data.total||0}loading.value=false};
    const buyFixed=async(item:any)=>{try{await ElMessageBox.confirm(`花费 ${item.price} 妖灵币购买「${item.itemName}」？`,'确认购买')}catch{return}const r=await BuyFixedAPI(item.id);if(r.status===200){ElMessage.success('购买成功');fetch()}else ElMessage.error(String(r.msg))};
    const showBid=(item:any)=>{bidTarget.value=item;bidAmount.value=(item.highestBid||item.price)+1;bidDlg.value=true};
    const doBid=async()=>{const r=await PlaceBidAPI(bidTarget.value.id,bidAmount.value);if(r.status===200){ElMessage.success('出价成功');bidDlg.value=false;fetch()}else ElMessage.error(String(r.msg))};
    fetch();return{loading,list,page,pageSize,total,filterType,fetch,rarityClass,buyFixed,showBid,doBid,bidDlg,bidTarget,bidAmount};
  }
});
</script>

<style scoped>
.shop-page{margin-top:60px;padding:10px 20px;min-height:100vh;background:rgba(255,255,255,.9);border-radius:10px}
h2{font-size:18px;margin-bottom:10px}
.shop-tabs{display:flex;gap:8px;margin-bottom:14px}
.shop-tabs span{font-size:13px;padding:4px 14px;border-radius:14px;background:#f0f0f0;color:#666;cursor:pointer}
.shop-tabs span.active{background:#409eff;color:#fff}
.listing-grid{display:flex;flex-direction:column;gap:10px}
.listing-card{border:2px solid #dcdfe6;border-radius:10px;padding:10px;background:#fafafa}
.listing-card.rare{border-color:#409eff;background:#ecf5ff}
.listing-card.epic{border-color:#a855f7;background:#faf5ff}
.listing-card.legendary{border-color:#f4a400;background:#fffdf0}
.listing-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.listing-icon{width:40px;height:40px;border-radius:6px;object-fit:contain}
.listing-icon-placeholder{font-size:28px}
.listing-info{flex:1}
.listing-name{font-size:14px;font-weight:500}
.listing-seller{font-size:12px;color:#909399}
.listing-type-tag{font-size:11px;padding:2px 8px;border-radius:4px}
.listing-type-tag.fixed{background:#ecf5ff;color:#409eff}
.listing-type-tag.auction{background:#fdf6ec;color:#e6a23c}
.listing-footer{display:flex;align-items:center;gap:10px}
.listing-price{font-size:15px;font-weight:600;color:#f56c6c;flex:1}
.listing-bids{font-size:12px;color:#909399}
.loading{padding:50px 0;text-align:center}
</style>
