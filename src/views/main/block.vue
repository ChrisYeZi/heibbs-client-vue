<template>
  <div class="block" ref="scrollContainer">
    <!-- 板块头部区域 -->
    <div class="block-box">
      <!-- 板块图标 -->
      <div class="block-icon">
        <img
          :src="currentBlock.imgUrl || slides.imageUrl"
          :alt="currentBlock.name || slides.altText"
          class="icon-image"
        />
        <!-- 板块名称 -->
        <div class="block-title">{{ currentBlock.name || "未知板块" }}</div>
      </div>

      <!-- 横幅图片 -->
      <div class="block-banner">
        <img
          src="https://i.imgs.ovh/2025/10/08/7DBO24.png"
          alt="板块横幅"
          class="banner-image"
        />
      </div>

      <!-- 板块管理者 -->
      <div class="block-managers" v-if="blockManagers.length">
        <span class="manager-label">馆长：</span>
        <span
          class="manager-name"
          v-for="manager in blockManagers"
          :key="manager"
          @click="gotoManagerInfo(manager)"
        >
          {{ manager }}
        </span>
      </div>

      <!-- 功能按钮区域 -->
      <div class="block-buttons">
        <!-- 修改会馆发帖按钮，确保有板块ID时才显示 -->
        <van-button
          type="primary"
          size="normal"
          @click="gotoNewPost"
          v-if="validBlockId"
          >会馆发帖</van-button
        >
        <van-button
          type="default"
          size="normal"
          @click="placeholder('加入会馆')"
          >加入会馆</van-button
        >
        <van-button
          type="warning"
          size="normal"
          @click="placeholder('管理会馆')"
          v-if="isManagerOrAdmin"
          >管理会馆</van-button
        >
      </div>
    </div>

    <!-- 其余模板内容保持不变 -->
    <van-notice-bar
      left-icon="volume-o"
      text="罗小黑妖灵论坛测试开发中，登录账户请注意账户安全"
    />

    <!-- 帖子列表 -->
    <div v-if="postList.records && postList.records.length">
      <!-- 置顶帖 -->
      <div class="index-post-top">
        <div
          class="index-post"
          v-for="(item, index) in postTopList"
          :key="item.pid || index"
          @click="PostClick(item)"
        >
          <div class="index-post-title">
            <span class="index-post-title-block-top">置顶 </span
            >{{ item.subject }}
          </div>
        </div>
      </div>

      <div
        class="index-post"
        v-for="(item, index) in postList.records"
        :key="item.pid || index"
        @click="PostClick(item)"
      >
        <!-- 会馆 -->
        <div class="index-post-title">
          <span class="index-post-title-block-top" v-if="item?.state == 5"
            >会馆置顶 </span
          ><span class="index-post-title-block" v-if="item?.state != 5"
            >{{ getBlockName(item.fid) }} </span
          >{{ item.subject }}
        </div>
        <div class="index-post-meta">
          <span>
            <!-- 用户组 -->
            <span
              class="index-post-meta-group"
              v-if="item.extgroupid == 0"
              :style="{
                backgroundColor: groupList.groupDo[item?.groupid - 1]?.color,
              }"
              >{{ groupList.groupDo[item.groupid - 1]?.gname }}</span
            >
            <span
              class="index-post-meta-admingroup"
              v-if="item.extgroupid != 0"
              :style="{
                backgroundColor:
                  groupList.extgroupDo[item?.extgroupid - 1]?.color,
              }"
              >{{ groupList.extgroupDo[item.extgroupid - 1]?.gname }}</span
            >
            {{ item.author }}
            <van-icon
              name="http://www.heibbs.net:8081/api/attachment/default/xz001.png"
              size="15px"
          /></span>
          <span>{{ item.formattedCreateTime }}</span>
        </div>
        <div
          class="post-content"
          v-html="parsedContent.parsedIndexContent(item.message)"
          v-if="item?.state != 4"
        ></div>

        <!-- 帖子互动信息 -->
        <div class="post-actions" v-if="item?.state != 4">
          <span class="action-item"
            ><van-icon name="eye-o" /> {{ item.viewCount || 0 }}</span
          >
          <span class="action-item"
            ><van-icon name="chat-o" /> {{ item.replyCount || 0 }}</span
          >
        </div>
      </div>
    </div>

    <!-- 加载状态和空状态 -->
    <van-loading
      v-if="isLoading && postList.records.length === 0"
      color="#1989fa"
      class="loading-indicator"
    />
    <van-empty
      image="http://www.heibbs.net:8081/api/attachment/200000/404.png"
      :image-size="[200, 220]"
      v-if="!isLoading && (!postList.records || postList.records.length === 0)"
      description="暂无帖子内容"
    />

    <!-- 加载更多提示 -->
    <div
      v-if="postList.records && postList.records.length > 0"
      class="load-more"
    >
      <van-loading v-if="isLoadingMore" size="16" color="#1989fa" />
      <span v-else-if="hasMore">上拉加载更多</span>
      <span v-else>已显示全部内容</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import PostbarVue from "@/components/common/Postbar.vue";
import {
  GetBlockPostListAPI,
  GetBlockListAPI,
  GetGroupListAPI,
  GetPostTopAPI,
  GetUsernameInformationAPI, // 导入用户名获取用户信息API
} from "@/api/index";
import {
  Swipe,
  SwipeItem,
  Grid,
  GridItem,
  Empty,
  Loading,
  Icon,
  Button,
} from "vant";
import { ElMessage } from "element-plus"; // 导入ElMessage
import parsedContent from "@/assets/js/parsedContent";
import router from "@/router";

// 定义接口
interface PostItem {
  pid?: string | number;
  fid?: number;
  subject: string;
  formattedCreateTime: string;
  author: string;
  message: string;
  viewCount?: number;
  replyCount?: number;
  groupid?: number;
  extgroupid?: number;
  state?: number;
}


interface PageResult<T> {
  records: T[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

type PostListResponse = PageResult<PostItem>;
type PostTopResponse = PostItem[];

interface SlideItem {
  imageUrl: string;
  altText: string;
  link?: string;
}

interface BlockItem {
  id?: number;
  name?: string;
  management?: string;
  license?: number;
  type?: number;
  repost?: boolean;
  finance?: number;
  taxRate?: number;
  title?: string;
  imgUrl?: string;
  bindex?: number;
  bannerurl?: string | null;
  players?: string | null;
}

interface GroupItem {
  groupDo?: any[];
  extgroupDo?: any[];
}

type BlockList = BlockItem[];

// 管理员用户组ID（根据实际业务定义）
const ADMIN_GROUP_IDS = [1, 8]; // 假设1是禁灵（管理员），8是神灵（超级管理员）

export default defineComponent({
  name: "Index",
  components: {
    PostbarVue,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Empty.name]: Empty,
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Button.name]: Button,
  },
  setup() {
    const scrollContainer = ref<HTMLDivElement>(null);
    const route = useRoute();
    const store = useStore();
    const router = useRouter(); // 确保获取router实例

    const postList = ref<PostListResponse>({ records: [] });
    const postTopList = ref<PostTopResponse>(null);
    const blockList = ref<BlockList>([]);
    const groupList = ref<GroupItem>(null);

    const isLoading = ref(true);
    const isLoadingMore = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const hasMore = ref(true);
    const isRequesting = ref(false); // 请求锁，防止并发请求

    // 确保blockid有默认值
    const blockid = ref<number>(Number(route.params.id) || 0);

    const slides = ref<SlideItem>({
      imageUrl: "https://i.imgs.ovh/2025/10/08/7DBO24.png",
      altText: "寒霜",
    });

    // 当前用户信息
    const currentUser = computed(() => {
      return store.state.user?.info?.user || {};
    });

    // 当前用户ID
    const currentUserId = computed(() => {
      return store.state.user?.info?.user?.uid;
    });

    // 当前板块信息
    const currentBlock = computed(() => {
      return blockList.value.find((block) => block.id === blockid.value) || {};
    });

    // 验证板块ID是否有效
    const validBlockId = computed(() => {
      return !isNaN(blockid.value) && blockid.value > 0;
    });

    // 板块管理者列表
    const blockManagers = computed(() => {
      if (!currentBlock.value.management) return [];
      return currentBlock.value.management.split(",").map((m) => m.trim());
    });

    // 判断是否是板块管理者或管理员用户组
    const isManagerOrAdmin = computed(() => {
      const username = currentUser.value.username;
      if (!username) return false;

      // 检查是否是板块管理者
      const isBlockManager = blockManagers.value.includes(username);

      // 检查是否是管理员用户组
      const userGroupId = currentUser.value.groupid;
      const userExtGroupId = currentUser.value.extgroupids;
      const isAdminGroup =
        ADMIN_GROUP_IDS.includes(userGroupId) ||
        (userExtGroupId && ADMIN_GROUP_IDS.includes(userExtGroupId));

      return isBlockManager || isAdminGroup;
    });

    // 跳转到发帖页面
    const gotoNewPost = () => {
      // 获取板块ID
      const bid =
        currentBlock.value.id || blockid.value || Number(route.params.id);

      if (bid && !isNaN(bid) && bid > 0) {
        router.push({
          path: `/newpost/${bid}`,
          name: "newpost",
          params: { bid: bid },
        });
      } else {
        ElMessage.error("无效的板块ID，无法发帖");
        console.error("板块ID无效:", bid);
      }
    };

    // 按钮占位函数
    const placeholder = (action: string) => {
      console.log(`${action}功能开发中...`);
    };

    // 跳转管理者个人页面
    const gotoManagerInfo = async (username: string) => {
      try {
        // 如果是当前用户自己，直接用当前用户ID跳转
        if (username === currentUser.value.username && currentUserId.value) {
          gotoInfo(currentUserId.value);
          return;
        }

        // 调用API获取用户信息
        const res = await GetUsernameInformationAPI({ username });
        if (res.status === 200 && res.data?.user?.uid) {
          gotoInfo(res.data.user.uid);
        } else {
          console.error("获取用户信息失败:", res.msg);
          alert("获取用户信息失败");
        }
      } catch (error) {
        console.error("获取用户信息出错:", error);
        alert("获取用户信息失败，请重试");
      }
    };

    // 跳转用户信息页面
    const gotoInfo = (id: number) => {
      router.push({
        path: `/info/${id}`,
      });
    };

    // 滚动事件处理
    const handleScroll = () => {
      // 无容器/加载中/无更多数据/请求中/无数据 → 直接返回
      if (
        !scrollContainer.value ||
        isLoading.value ||
        isLoadingMore.value ||
        !hasMore.value ||
        isRequesting.value ||
        !postList.value.records ||
        postList.value.records.length === 0
      ) {
        return;
      }

      const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;

      // 只有内容高度大于容器高度且滚动到底部200px内才触发
      if (
        scrollHeight > clientHeight &&
        scrollHeight - scrollTop - clientHeight <= 200
      ) {
        loadNextPage();
      }
    };

    // 获取数据方法（增加请求锁和严格的hasMore判断）
    const getData = async (page: number = 1, isAppend: boolean = false) => {
      // 验证板块ID
      if (!validBlockId.value) {
        isLoading.value = false;
        ElMessage.error("无效的板块ID");
        return;
      }

      // 请求锁：已有请求在处理时直接返回
      if (isRequesting.value) return;

      try {
        isRequesting.value = true; // 上锁

        if (isAppend) {
          isLoadingMore.value = true;
        } else {
          isLoading.value = true;
        }

        const res: any = await GetBlockPostListAPI({
          bid: blockid.value,
          current: page,
          size: pageSize.value,
        });

        if (res.status === 200) {
          const newData = res.data || {
            records: [],
            total: 0,
            pages: 0,
            current: page,
          };
          const records = newData.records || [];

          // 严格判断是否还有更多数据
          const currentPageNum = newData.current || page;
          const totalPages =
            newData.pages ||
            Math.ceil((newData.total || 0) / pageSize.value) ||
            0;

          // 更新hasMore：当前页 < 总页数 且 返回数据不为空
          hasMore.value = currentPageNum < totalPages && records.length > 0;

          if (isAppend && postList.value.records) {
            // 加载更多：合并数据
            postList.value = {
              ...newData,
              records: [...postList.value.records, ...records],
            };
          } else {
            // 首次加载：直接赋值
            postList.value = newData;
          }

          currentPage.value = currentPageNum;
        } else {
          console.error("获取帖子列表失败:", res.msg);
          hasMore.value = false; // 请求失败时设为无更多数据
        }
      } catch (error) {
        console.error("获取帖子列表出错:", error);
        hasMore.value = false; // 请求异常时设为无更多数据
      } finally {
        isRequesting.value = false; // 解锁
        isLoading.value = false;
        isLoadingMore.value = false;
      }
    };

    const getPostTopData = async () => {
      const res: any = await GetPostTopAPI();
      if (res.status == 200) {
        postTopList.value = res.data;
      } else {
        console.error("置顶数据获取失败");
      }
    };

    const loadNextPage = () => {
      // 防护：无更多数据或请求中时不执行
      if (!hasMore.value || isRequesting.value) return;

      const nextPage = currentPage.value + 1;
      getData(nextPage, true);
    };

    const getBlockData = async () => {
      const res: any = await GetBlockListAPI();
      if (res.status == 200) {
        blockList.value = res.data;

        // 如果板块ID无效，尝试使用第一个板块ID
        if (!validBlockId.value && blockList.value.length > 0) {
          blockid.value = blockList.value[0].id || 0;
        }
      } else {
        console.error("获取板块数据失败:", res.msg);
      }
    };

    const getGroupData = async () => {
      const res: any = await GetGroupListAPI();
      if (res.status == 200) {
        groupList.value = res.data;
      } else {
        console.error("获取用户组数据失败:", res.msg);
      }
    };

    const getBlockName = (fid: number): string => {
      const matchedBlock = blockList.value.find((block) => block.id === fid);
      return matchedBlock ? matchedBlock.name : "未知板块";
    };

    // 初始化数据
    const initData = async () => {
      try {
        await Promise.all([getBlockData(), getGroupData(), getPostTopData()]);

        // 确保板块ID有效后再获取数据
        if (validBlockId.value) {
          await getData();
        } else {
          isLoading.value = false;
          ElMessage.warning("无法获取有效的板块信息");
        }
      } catch (error) {
        console.error("初始化数据失败:", error);
        isLoading.value = false;
        hasMore.value = false; // 初始化失败时设为无更多数据
      }
    };

    // 监听路由参数变化
    onMounted(() => {
      // 初始化blockid
      const routeId = Number(route.params.id);
      if (!isNaN(routeId) && routeId > 0) {
        blockid.value = routeId;
      }

      initData();

      if (scrollContainer.value) {
        scrollContainer.value.addEventListener("scroll", handleScroll);
      }
    });

    onUnmounted(() => {
      if (scrollContainer.value) {
        scrollContainer.value.removeEventListener("scroll", handleScroll);
      }
    });

    return {
      postList,
      blockList,
      groupList,
      isLoading,
      isLoadingMore,
      hasMore,
      slides,
      parsedContent,
      scrollContainer,
      blockid,
      postTopList,
      getBlockName,
      currentBlock,
      blockManagers,
      isManagerOrAdmin,
      placeholder,
      gotoManagerInfo,
      gotoInfo,
      currentUser,
      currentUserId,
      gotoNewPost,
      validBlockId, // 暴露验证结果
    };
  },
  methods: {
    PostClick(item: PostItem) {
      router.push("/post/" + item.pid);
    },
  },
});
</script>

<!-- 样式部分保持不变 -->
<style lang="scss" scoped>
.block {
  background: rgba(255, 255, 255, 0.9);
  margin-top: 50px;
  margin-bottom: 0px;
  margin: 50px 10px 60px 10px;
  padding: 15px 10px;
  height: calc(100vh - 0px);
  overflow-y: auto;

  .block-box {
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    margin-bottom: 10px;
    background: #fff;
    position: relative;

    // 板块图标（叠加在横幅上方）
    .block-icon {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;

      .icon-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 4px solid #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        object-fit: cover;
      }
    }

    // 横幅图片
    .block-banner {
      width: 100%;
      height: 220px;
      padding-top: 5px;
      overflow: hidden;
      text-align: center;
      .banner-image {
        width: 95%;
        height: 95%;
        object-fit: cover;
        border-radius: 10px;
      }
    }

    .block-title {
      padding: 10px 0 10px; // 留出图标空间
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #f7f7f7;
      letter-spacing: 1px;
    }

    // 板块管理者
    .block-managers {
      text-align: center;
      padding: 5px 0 15px;
      font-size: 14px;
      color: #666;

      .manager-label {
        margin-right: 5px;
        color: #888;
      }

      .manager-name {
        margin: 0 5px;
        color: #1989fa;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }

        &:not(:last-child)::after {
          content: "|";
          color: #ccc;
          margin-left: 8px;
        }
      }
    }

    .block-buttons {
      display: flex;
      gap: 12px;
      padding: 0 15px 15px;
      justify-content: center;

      .van-button {
        flex: 1;
        max-width: 120px;
        border-radius: 8px;
        font-size: 14px;
      }
    }
  }

  .van-notice-bar {
    margin-bottom: 15px;
    --background-color: #fef7e3;
    --color: #ed8936;
  }

  .index-post-top {
    margin-bottom: 10px;
  }

  .index-post {
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    margin-top: 15px;
    padding: 15px;
    background-color: #fff;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .index-post-title {
      font-weight: 550;
      font-size: 16px;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.7);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;

      .index-post-title-block {
        color: rgba(255, 255, 255, 1);
        background: rgba(244, 170, 41, 0.7);
        font-weight: 500;
        margin-right: 5px;
        border-radius: 5px;
        padding: 2px 4px;
        font-size: 12px;
      }

      .index-post-title-block-top {
        color: rgba(255, 255, 255, 1);
        background: rgba(244, 48, 41, 0.7);
        font-weight: 500;
        margin-right: 5px;
        border-radius: 5px;
        padding: 2px 4px;
        font-size: 12px;
      }
    }

    .index-post-meta {
      color: #888;
      font-size: 12px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;

      .index-post-meta-group,
      .index-post-meta-admingroup {
        color: rgba(255, 255, 255, 1);
        margin-right: 5px;
        border-radius: 5px;
        padding: 2px 4px;
        font-size: 11px;
      }
    }

    .post-content {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      max-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;

      .bili-link {
        color: #fb7299;
        text-decoration: none;
      }

      .edited-tag {
        color: #888;
        font-size: 0.8em;
        margin-right: 5px;
        font-style: italic;
      }

      strong {
        font-weight: bold;
      }
    }

    .post-actions {
      display: flex;
      justify-content: flex-end;
      font-size: 12px;
      color: #888;
      padding-top: 8px;
      border-top: 1px solid #f5f5f5;

      .action-item {
        margin-left: 15px;
        display: flex;
        align-items: center;

        .van-icon {
          margin-right: 3px;
          font-size: 14px;
        }
      }
    }
  }

  .loading-indicator {
    padding: 30px 0;
    text-align: center;
  }

  .load-more {
    padding: 20px 0;
    text-align: center;
    font-size: 14px;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;

    .van-loading {
      margin-right: 8px;
    }
  }
}
</style>