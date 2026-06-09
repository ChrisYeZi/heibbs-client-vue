<template>
  <div class="search-page">
    <van-search
      v-model="keyword"
      placeholder="搜索帖子标题或用户名"
      @search="fetch"
      background="transparent"
    />
    <div class="sort-row">
      <span
        :class="{ active: sort === 'dateline_desc' }"
        @click="
          sort = 'dateline_desc';
          fetch();
        "
        >最新发帖</span
      >
      <span
        :class="{ active: sort === 'dateline_asc' }"
        @click="
          sort = 'dateline_asc';
          fetch();
        "
        >最早发帖</span
      >
    </div>
    <van-loading v-if="loading" class="loading" />
    <van-empty
      v-if="!loading && list.length === 0"
      description="未找到相关帖子"
    />
    <div
      v-for="item in list"
      :key="item.pid"
      class="post-item"
      @click="router.push('/post/' + item.pid)"
    >
      <div class="post-subject">{{ item.subject }}</div>
      <div class="post-meta">
        {{ item.author }} · {{ item.formattedCreateTime }} ·
        {{ item.replyCount || 0 }}回复
      </div>
    </div>
    <el-pagination
      v-if="total > pageSize"
      layout="prev,pager,next"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="
        (p) => {
          page = p;
          fetch();
        }
      "
      size="small"
      style="justify-content: center; margin-top: 10px"
    />
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import instance from "@/config/request/request";
import { Loading, Empty, Search } from "vant";

export default defineComponent({
  name: "search",
  components: { VanLoading: Loading, VanEmpty: Empty, [Search.name]: Search },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true),
      list = ref<any[]>([]),
      keyword = ref(""),
      sort = ref("dateline_desc"),
      page = ref(1),
      pageSize = ref(20),
      total = ref(0);
    const fetch = async () => {
      if (!keyword.value.trim()) return;
      loading.value = true;
      const r = await instance.get("/post/searchPost", {
        params: {
          keyword: keyword.value.trim(),
          pageNum: page.value,
          pageSize: pageSize.value,
          sort: sort.value,
        },
      });
      if (r.status === 200) {
        list.value = r.data.records || [];
        total.value = r.data.total || 0;
      }
      loading.value = false;
    };
    onMounted(() => {
      const q = route.query.keyword as string;
      if (q) {
        keyword.value = q;
        fetch();
      }
    });
    return {
      loading,
      list,
      keyword,
      sort,
      page,
      pageSize,
      total,
      fetch,
      router,
    };
  },
});
</script>

<style scoped>
.search-page {
  margin-top: 60px;
  padding: 10px 20px;
  min-height: 100vh;
  background: rgba(255,255,255,0.9);
  border-radius: 0 0 10px 10px;
}
.sort-row {
  display: flex;
  gap: 10px;
  margin: 0 16px 10px;
}
.sort-row span {
  font-size: 13px;
  color: #728567;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 14px;
  background: rgba(114, 133, 103, 0.1);
}
.sort-row span.active {
  background: #f6ad47;
  color: #fff;
}
.post-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid rgba(114, 133, 103, 0.2);

}
.post-subject {
  font-size: 15px;
  font-weight: 500;
  color: #677185;
}
.post-meta {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.7);
  margin-top: 4px;
}
.loading {
  padding: 60px 0;
  text-align: center;
}
</style>
