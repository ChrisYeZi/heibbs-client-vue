<template>
  <div class="index" ref="scrollContainer">
    <!-- 轮播图区域 -->
    <van-swipe 
      v-if="slides.length" 
      class="my-swipe" 
      :autoplay="3000" 
      indicator-color="white"
    >
      <van-swipe-item 
        v-for="(slide, index) in slides" 
        :key="slide.id || index"
        @click="handleBannerClick(slide)"
      >
        <img :src="slide.url" :alt="slide.title" class="swipe-image" />
      </van-swipe-item>
    </van-swipe>

    <van-notice-bar
      left-icon="volume-o"
      text="罗小黑妖灵论坛测试开发中，登录账户请注意账户安全"
    />

    <div class="index-post-rule">最新发帖 最新回复</div>

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

      <!-- 正常帖 -->
      <div
        class="index-post"
        v-for="(item, index) in postList.records"
        :key="item.pid || index"
        @click="PostClick(item)"
      >
        <!-- 会馆 -->
        <div class="index-post-title">
          <span class="index-post-title-block">{{
            getBlockName(item.fid)
          }}</span>
          {{ item.subject }}
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
            <!-- 用户名  @click="gotoInfo(item.authorid)" 暂时不在首页跳转-->
            <span class="post-username">{{ item.author }}</span>
            <!-- 勋章占位 -->
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
      :image-size="[250, 280]"
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
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import PostbarVue from "@/components/common/Postbar.vue";
import {
  GetPostListAPI,
  GetBlockListAPI,
  GetGroupListAPI,
  GetPostTopAPI,
  GetAdminBannerAPI // 导入Banner接口
} from "@/api/index";
import { Swipe, SwipeItem, Grid, GridItem, Empty, Loading, Icon } from "vant";
import parsedContent from "@/assets/js/parsedContent";
import router from "@/router";

// 定义帖子项的接口
interface PostItem {
  pid?: string | number;
  fid?: number;
  subject: string;
  formattedCreateTime: string;
  author: string;
  authorid: number;
  message: string;
  viewCount?: number;
  replyCount?: number;
  groupid?: number;
  extgroupid?: number;
  // 其他可能的字段
}

// 定义分页结果接口
interface PageResult<T> {
  records: T[]; // 数据列表
  total?: number; // 总条数
  size?: number; // 每页条数
  current?: number; // 当前页
  pages?: number; // 总页数
}

// 定义帖子列表响应的接口
type PostListResponse = PageResult<PostItem>;
type PostTopResponse = PostItem[];

// Banner轮播图接口（对应BannerDo）
interface BannerItem {
  id: number; // 主键ID
  title: string; // Banner标题
  pid?: number; // 跳转目标帖ID
  url: string; // 展示图片地址
  status: number; // 是否启用（0-禁用，1-启用）
  bindex: number; // 排序优先级（数值越高越靠前）
}

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

interface GroupItem {
  groupDo?: [];
  extgroupDo?: [];
}

type BlockList = BlockItem[];

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
  },
  setup() {
    const router = useRouter();
    const scrollContainer = ref<HTMLDivElement>(null);

    const postList = ref<PostListResponse>({ records: [] });
    const postTopList = ref<PostTopResponse>(null);
    const blockList = ref<BlockList>([]);
    const groupList = ref<GroupItem>(null);
    const slides = ref<BannerItem[]>([]); // 修改为BannerItem类型

    const isLoading = ref(true);
    const isLoadingMore = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const hasMore = ref(true);

    // 处理Banner点击事件
    const handleBannerClick = (banner: BannerItem) => {
      if (banner.pid) {
        // 跳转到对应的帖子详情页
        router.push(`/post/${banner.pid}`);
      }
      // 如果需要支持其他链接类型，可以在这里扩展
    };

    // 获取Banner数据
    const getBannerData = async () => {
      try {
        const res: any = await GetAdminBannerAPI();
        if (res.status === 200 && res.data) {
          // 过滤启用的Banner，按index降序排序
          const activeBanners = res.data
            .filter((banner: BannerItem) => banner.status === 1)
            .sort((a: BannerItem, b: BannerItem) => b.bindex - a.bindex);
          
          slides.value = activeBanners;
        }
      } catch (error) {
        console.error("获取Banner数据失败:", error);
      }
    };

    // 滚动事件处理函数
    const handleScroll = () => {
      if (
        !scrollContainer.value ||
        isLoading.value ||
        isLoadingMore.value ||
        !hasMore.value
      ) {
        return;
      }

      const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;

      // 当滚动到距离底部200px以内时加载下一页
      if (scrollHeight - scrollTop - clientHeight <= 200) {
        loadNextPage();
      }
    };

    // 获取帖子列表数据
    const getData = async (page: number = 1, isAppend: boolean = false) => {
      try {
        // 如果是加载更多，设置isLoadingMore
        if (isAppend) {
          isLoadingMore.value = true;
        } else {
          isLoading.value = true;
        }

        const res: any = await GetPostListAPI({
          current: page,
          size: pageSize.value,
        });

        if (res.status === 200) {
          const newData = res.data;

          // 判断是否还有更多数据
          hasMore.value = (newData.current || 0) < (newData.pages || Infinity);

          // 如果是加载更多，追加数据；否则替换数据
          if (isAppend && postList.value.records) {
            postList.value = {
              ...newData,
              records: [...postList.value.records, ...newData.records],
            };
          } else {
            postList.value = newData;
          }

          // 更新当前页码
          currentPage.value = newData.current || page;
        } else {
          console.error("获取帖子列表失败:", res.msg);
          hasMore.value = false;
        }
      } catch (error) {
        console.error("获取帖子列表出错:", error);
        hasMore.value = false;
      } finally {
        isLoading.value = false;
        isLoadingMore.value = false;
      }
    };

    // 获取置顶帖数据
    const getPostTopData = async () => {
      const res: any = await GetPostTopAPI();
      if (res.status == 200) {
        postTopList.value = res.data;
      } else {
        console.error("置顶数据获取失败");
      }
    };

    // 加载下一页数据
    const loadNextPage = () => {
      if (hasMore.value) {
        getData(currentPage.value + 1, true);
      }
    };

    // 获取板块信息
    const getBlockData = async () => {
      const res: any = await GetBlockListAPI();
      if (res.status == 200) {
        blockList.value = res.data;
      } else {
        console.error("获取板块数据失败:", res.msg);
      }
    };

    // 获取用户组信息
    const getGroupData = async () => {
      const res: any = await GetGroupListAPI();
      if (res.status == 200) {
        groupList.value = res.data;
      } else {
        console.error("获取用户组数据失败:", res.msg);
      }
    };

    /**
     * 根据fid获取板块名称
     * @param fid 帖子的板块ID（对应 BlockItem 的 id）
     * @param blockList 板块数组（必须是数组类型）
     * @returns 匹配的板块名称，未找到则返回“未知板块”
     */
    const getBlockName = (fid: number): string => {
      // 在板块列表中查找id等于fid的板块
      const matchedBlock = blockList.value.find((block) => block.id === fid);
      // 找到返回名称，未找到返回"未知板块"
      return matchedBlock ? matchedBlock.name : "未知板块";
    };

    /**
     * 罗小黑妖灵论坛跳转用户信息页面
     * @param id 用户id
     */
    const gotoInfo = (id: number) => {
      router.push({
        path: `/info/${id}`,
      });
    };

    // 初始化加载数据
    const initData = async () => {
      await Promise.all([
        getBannerData(),    // 获取Banner数据
        getBlockData(),     // 获取板块数据
        getGroupData(),     // 获取用户组数据
        getPostTopData()    // 获取置顶帖数据
      ]);
      await getData();     // 获取帖子列表数据
    };

    // 监听滚动事件
    onMounted(() => {
      initData(); // 初始化所有数据
      if (scrollContainer.value) {
        scrollContainer.value.addEventListener("scroll", handleScroll);
      }
    });

    // 移除滚动事件监听
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
      postTopList,
      getBlockName,
      gotoInfo,
      handleBannerClick // 导出Banner点击处理方法
    };
  },
  methods: {
    PostClick(item: PostItem) {
      router.push("/post/" + item.pid);
    },
  },
});
</script>

<style lang="scss" scoped>
.index {
  background: rgba(255, 255, 255, 0.9);
  margin-top: 50px;
  margin-bottom: 60px;
  margin: 50px 10px 60px 10px;
  padding: 15px 10px;
  line-height: 1.5em;
  height: calc(100vh - 140px);
  overflow-y: auto;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 15px 0;
    color: rgba(0, 0, 0, 0.7);
    padding-left: 5px;
  }

  .my-swipe {
    border-radius: 10px;
    overflow: hidden;
    height: 180px;
    margin: 15px 5px;

    .van-swipe-item {
      position: relative;
      background-color: #f5f5f5;
      cursor: pointer; // 添加指针光标提示可点击

      .swipe-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .post-list {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 20px;
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
      }
      .index-post-title-block-top {
        color: rgba(255, 255, 255, 1);
        background: rgba(244, 48, 41, 0.7);
        font-weight: 500;
        margin-right: 5px;
        border-radius: 5px;
        padding: 2px 4px;
      }
    }

    .index-post-meta {
      color: #888;
      font-size: 12px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      .index-post-meta-group {
        color: rgba(255, 255, 255, 1);
        margin-right: 5px;
        border-radius: 5px;
        padding: 2px 4px;
      }
      .index-post-meta-admingroup {
        color: rgba(255, 255, 255, 1);
        margin-right: 5px;
        border-radius: 5px;
        padding: 2px 4px;
      }
    }

    .post-content {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      max-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;

      // 自定义标签样式
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