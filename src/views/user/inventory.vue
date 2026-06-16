<template>
  <div class="inventory-page">
    <van-loading v-if="loading" class="loading" />
    <van-empty
      v-if="!loading && items.length === 0"
      description="暂无物品"
      :image="require('@/assets/img/404.png')"
      image-size="45%"
    />
    <div class="item-grid">
      <div
        v-for="entry in items"
        :key="entry.userItem?.id || 'L' + entry.listing?.id"
        class="item-card"
        :class="[rarityClass(entry.item?.rarity), { listed: entry.listing }]"
      >
        <div class="item-icon-wrap">
          <img
            v-if="entry.item?.icon"
            :src="entry.item.icon"
            class="item-icon"
          />
          <span v-else class="item-icon-placeholder">📦</span>
        </div>
        <div class="item-name">{{ entry.item?.name || "未知物品" }}</div>
        <div class="item-qty" v-if="entry.userItem">
          x{{ entry.userItem.quantity }}
        </div>
        <div v-if="entry.listing" class="listed-badge">
          <span class="listed-tag">{{
            entry.listing.type === "auction" ? "拍卖中" : "出售中"
          }}</span>
          <div class="listed-price">{{ entry.listing.price }}妖灵币</div>
          <el-button
            size="small"
            type="danger"
            @click="doCancel(entry.listing.id)"
            >下架</el-button
          >
        </div>
        <el-button v-else size="small" @click="showSell(entry)">出售</el-button>
      </div>
    </div>

    <el-dialog v-model="sellDlg" title="上架出售" width="360px">
      <el-form label-width="70px">
        <el-form-item label="数量"
          ><el-input-number
            v-model="sellForm.quantity"
            :min="1"
            :max="sellForm.maxQty"
        /></el-form-item>
        <el-form-item label="价格"
          ><el-input-number v-model="sellForm.price" :min="1" />
          <span style="font-size: 12px; color: #909399"
            >妖灵币</span
          ></el-form-item
        >
        <el-form-item label="方式">
          <el-radio-group v-model="sellForm.type"
            ><el-radio value="fixed">一口价</el-radio
            ><el-radio value="auction">拍卖</el-radio></el-radio-group
          >
        </el-form-item>
        <el-form-item label="拍卖天数" v-if="sellForm.type === 'auction'">
          <el-select v-model="sellForm.auctionDays"
            ><el-option :value="1" label="1天" /><el-option
              :value="2"
              label="2天" /><el-option :value="3" label="3天"
          /></el-select>
        </el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="sellDlg = false">取消</el-button
        ><el-button type="primary" @click="doSell">上架</el-button></template
      >
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ref, reactive, defineComponent } from "vue";
import { GetMyItemsAPI, SellItemAPI, CancelListingAPI } from "@/api/index";
import { ElMessage } from "element-plus";
import { Loading, Empty } from "vant";

const rarityColors: Record<number, string> = {
  0: "common",
  1: "rare",
  2: "epic",
  3: "legendary",
};
const rarityClass = (r: any) => rarityColors[r] || "common";

export default defineComponent({
  name: "inventory",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const loading = ref(true),
      items = ref<any[]>([]),
      sellDlg = ref(false);
    const sellForm = reactive({
      userItemId: 0,
      maxQty: 1,
      quantity: 1,
      price: 1,
      type: "fixed",
      auctionDays: 1,
    });
    const fetch = async () => {
      loading.value = true;
      const r = await GetMyItemsAPI();
      if (r.status === 200) items.value = r.data || [];
      loading.value = false;
    };
    const showSell = (entry: any) => {
      sellForm.userItemId = entry.userItem.id;
      sellForm.maxQty = entry.userItem.quantity;
      sellForm.quantity = 1;
      sellForm.price = 1;
      sellForm.type = "fixed";
      sellForm.auctionDays = 1;
      sellDlg.value = true;
    };
    const doSell = async () => {
      const r = await SellItemAPI(sellForm);
      if (r.status === 200) {
        ElMessage.success(String(r.data || "上架成功"));
        sellDlg.value = false;
        fetch();
      } else ElMessage.error(String(r.data));
    };
    const doCancel = async (listingId: number) => {
      const r = await CancelListingAPI(listingId);
      if (r.status === 200) {
        ElMessage.success("已下架，物品已退还");
        fetch();
      } else ElMessage.error(String(r.data));
    };
    fetch();
    return {
      loading,
      items,
      rarityClass,
      sellDlg,
      sellForm,
      showSell,
      doSell,
      doCancel,
    };
  },
});
</script>
<style scoped>
.inventory-page {
  margin: 10px 5px;
  padding: 20px 15px;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
}
h2 {
  font-size: 18px;
  margin-bottom: 16px;
}
.item-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.item-card {
  background: #fafafa;
  border: 2px solid #dcdfe6;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}
.item-card.common {
  border-color: #dcdfe6;
  background: #fafafa;
}
.item-card.rare {
  border-color: #409eff;
  background: #ecf5ff;
}
.item-card.epic {
  border-color: #a855f7;
  background: #faf5ff;
}
.item-card.legendary {
  border-color: #f4a400;
  background: #fffdf0;
}
.item-card.listed {
  border-style: dashed;
  opacity: 0.85;
}
.item-icon-wrap {
  width: 48px;
  height: 48px;
  margin: 0 auto 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-icon {
  max-width: 48px;
  max-height: 48px;
  border-radius: 6px;
  object-fit: contain;
}
.item-icon-placeholder {
  font-size: 32px;
}
.item-name {
  font-size: 12px;
  font-weight: 500;
  margin: 4px 0;
}
.item-qty {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
}
.listed-badge {
  margin-top: 2px;
}
.listed-tag {
  font-size: 11px;
  background: #fdf6ec;
  color: #e6a23c;
  padding: 1px 6px;
  border-radius: 4px;
}
.listed-price {
  font-size: 12px;
  color: #f56c6c;
  margin: 2px 0;
}
.loading {
  padding: 50px 0;
  text-align: center;
}
</style>
