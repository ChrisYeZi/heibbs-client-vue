<template>
  <!-- 加载状态 -->
  <van-loading v-if="isLoading" color="#1989fa" class="loading-indicator" />

  <!-- 空状态 -->
  <van-empty
    image="http://www.heibbs.net:8081/api/attachment/200000/404.png"
    :image-size="[250, 280]"
    v-if="!isLoading && !blockList"
    :description="blockUnknow || '暂无帖子数据'"
    class="empty-state"
  />
  <div v-if="!isLoading" class="block">
    <img src="../../assets/img/block-banner.png" alt="罗小黑妖灵论坛会馆列表" />
    <div
      class="block-list"
      v-for="(item, index) in blockList"
      :key="index"
      @click="gotoBlock(item?.id)"
    >
      <div class="block-head">
        <div class="block-head-avatar">
          <el-avatar
            class="author-avatar"
            :src="item?.imgUrl"
          />
        </div>
        <div class="block-head-title">
          {{ item?.name }}
        </div>
      </div>
      <div class="block-content">
        <div class="block-content-icon">
          <van-icon name="manager-o">馆长: {{ item?.management }}</van-icon>
        </div>
        <div class="block-content-icon">
          <van-icon name="gold-coin-o">妖灵币: {{ item?.finance }}</van-icon>
        </div>
        简单占位，还不想写
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { GetBlockListAPI } from "@/api/index";
import router from "@/router";
import { ref, defineComponent } from "vue";

interface BlockItem {
  id?: number;
  name?: string;
  management?: [];
  license?: boolean;
  type?: number;
  repost?: boolean;
  finance?: number;
  taxRate?: number;
  title?: [];
  imgUrl?: string;
}

export default defineComponent({
  name: "BlockList",
  components: {},
  setup() {
    const blockList = ref<BlockItem>(null);
    const isLoading = ref(true);
    const blockUnknow = ref("");

    // 获取板块信息
    const getBlockData = async () => {
      const res: any = await GetBlockListAPI();
      if (res.status == 200) {
        blockList.value = res.data;
        isLoading.value = false;
      } else {
        isLoading.value = false;
        blockUnknow.value = res.msg;
        console.error("获取板块数据失败:", res.msg);
      }
    };

    const gotoBlock = (id: number) => {
      router.push({ path: `/block/${id}` });
    };

    // 初始化加载数据
    getBlockData();

    return {
      blockList,
      isLoading,
      blockUnknow,
      gotoBlock,
    };
  },
});
</script>

<style lang="scss" scoped>
.block {
  margin: -80px 0px 0px 0px;
  background: rgba(255, 255, 255, 0.8);
  padding-top: 150px;
  padding-bottom: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  cursor: default;
  img {
    width: 100vw;
    max-width: 800px;
  }
  .block-list {
    width: 45%;
    min-width: 320px;
    padding: 5px 10px;
    border-radius: 7px;
    border: solid 1px rgba(0, 0, 0, 0.05);
    line-height: 1.75em;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;

    .block-head {
      display: flex;
      line-height: 1.25em;
      margin-bottom: 5px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      .block-head-avatar {
      }
      .block-head-title {
        margin-left: 10px;
        line-height: 2.5em;
        font-size: 16px;
      }
    }
    .block-content {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      color: rgba(124, 123, 91, 0.7);
      font-size: 14px;
      line-height: 1.5em;
      .block-content-icon {
        width: 50%;
      }
    }
  }
}
</style>
