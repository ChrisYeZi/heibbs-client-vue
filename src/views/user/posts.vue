<template>
  <div class="user-posts">
    <div class="tabs">
      <span
        :class="{ active: tab === 'topics' }"
        @click="
          tab = 'topics';
          page = 1;
          fetch();
        "
        >主题帖</span
      >
      <span
        :class="{ active: tab === 'replies' }"
        @click="
          tab = 'replies';
          page = 1;
          fetch();
        "
        >回复贴</span
      >
    </div>
    <van-loading v-if="loading" class="loading" />
    <van-empty v-if="!loading && list.length === 0" description="暂无帖子" />

    <div
      v-for="item in list"
      :key="item.pid"
      class="post-item"
      @click="router.push('/post/' + (tab === 'topics' ? item.pid : item.tid))"
    >
      <div class="post-subject">{{ item.subject || "(无标题)" }}</div>
      <div class="post-meta">
        <span>{{ item.formattedCreateTime }}</span>
        <span v-if="tab === 'topics'"
          >{{ item.replyCount || 0 }} 回复 ·
          {{ item.viewCount || 0 }} 浏览</span
        >
      </div>
      <div
        class="post-msg"
        v-if="tab === 'replies'"
        v-html="truncate(item.message)"
      ></div>
    </div>

    <div
      v-if="hasMore && list.length"
      class="load-more"
      @click="
        page++;
        fetch();
      "
    >
      <span v-if="!loadingMore">加载更多</span>
      <van-loading v-else size="16" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { GetUserTopicsAPI, GetUserRepliesAPI } from "@/api/index";
import { Loading, Empty } from "vant";

export default defineComponent({
  name: "user-posts",
  components: { VanLoading: Loading, VanEmpty: Empty },
  setup() {
    const router = useRouter();
    const tab = ref("topics"),
      loading = ref(true),
      loadingMore = ref(false),
      list = ref<any[]>([]),
      page = ref(1),
      hasMore = ref(true);

    const fetch = async () => {
      if (page.value === 1) loading.value = true;
      else loadingMore.value = true;
      const api = tab.value === "topics" ? GetUserTopicsAPI : GetUserRepliesAPI;
      const r = await api({ current: page.value, size: 20 });
      if (r.status === 200) {
        const records = r.data.records || [];
        if (page.value === 1) list.value = records;
        else list.value.push(...records);
        hasMore.value = records.length === 20;
      }
      loading.value = false;
      loadingMore.value = false;
    };
    const truncate = (msg: string) =>
      msg
        ? msg.replace(/<[^>]*>/g, "").slice(0, 80) +
          (msg.length > 80 ? "..." : "")
        : "";

    fetch();
    return {
      tab,
      loading,
      loadingMore,
      list,
      page,
      hasMore,
      router,
      truncate,
      fetch,
    };
  },
});
</script>

<style scoped>
.user-posts {
  margin: 10px 5px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  color: #728567;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.tabs span {
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 14px;
  background: rgba(114, 133, 103, 0.15);
  color: #728567;
  cursor: pointer;
  transition: 0.2s;
}
.tabs span.active {
  background: #f6ad47;
  color: #fff;
}
.post-item {
  background: rgba(252, 249, 224, 0.1);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid rgba(246, 173, 71, 0.2);
  transition: box-shadow 0.2s;
}
.post-item:active {
  box-shadow: 0 2px 8px rgba(246, 173, 71, 0.15);
}
.post-subject {
  font-size: 15px;
  font-weight: 500;
  color: #728567;
  margin-bottom: 4px;
}
.post-meta {
  font-size: 12px;
  color: rgba(114, 133, 103, 0.7);
  display: flex;
  gap: 12px;
}
.post-msg {
  font-size: 13px;
  color: rgba(114, 133, 103, 0.8);
  margin-top: 6px;
  line-height: 1.5;
}
.loading {
  padding: 60px 0;
  text-align: center;
}
.load-more {
  text-align: center;
  padding: 12px;
  color: #f6ad47;
  font-size: 13px;
  cursor: pointer;
}
</style>
