<template>
  <div class="post-detail">
    <!-- 加载状态 -->
    <van-loading v-if="isLoading" color="#1989fa" class="loading-indicator" />

    <!-- 空状态 -->
    <van-empty
      image="http://www.heibbs.net:8081/api/attachment/200000/404.png"
      :image-size="[250, 280]"
      v-if="!isLoading && !replyPage?.records?.length"
      :description="postUnknow || '暂无帖子数据'"
      class="empty-state"
    />

    <!-- 帖子内容 -->
    <div v-if="!isLoading && mainPost">
      <div class="post-block">
        <span class="post-block-tag"
          >{{ blockList[mainPost.fid - 1].name }}
        </span>
      </div>
      <!-- 主帖 -->
      <div class="main-post">
        <div class="post-header">
          <div class="author-info">
            <!-- 头像 -->
            <el-avatar
              class="author-avatar"
              src="http://www.heibbs.net:8081/api/attachment/200000/logo.png"
            />
            <div class="author-details">
              <!-- 作者 -->
              <div class="author-name">
                <!-- 用户组 -->
                <span class="post-meta-group" v-if="mainPost.extgroupid == 0">{{
                  groupList.groupDo[mainPost?.groupid - 1]?.gname
                }}</span>
                <span
                  class="post-meta-admingroup"
                  v-if="mainPost?.extgroupid != 0"
                  >{{
                    groupList.extgroupDo[mainPost?.extgroupid - 1]?.gname
                  }}</span
                >
                {{ mainPost.author }}
              </div>
              <!-- 时间 -->
              <div class="post-time">{{ mainPost.formattedCreateTime }}</div>
            </div>
          </div>
          <div class="post-tag">
            <van-tag v-if="mainPost.first === 1" color="rgba(200, 140, 20, 0.3)"
              >查看({{ mainPost.viewCount }})</van-tag
            >&nbsp;
            <van-tag v-if="mainPost.first === 1" color="rgba(200, 140, 20, 0.3)"
              >楼主</van-tag
            >
          </div>
        </div>

        <div class="post-title">
          {{ mainPost.subject }}
        </div>

        <div
          class="post-content"
          v-html="parsedContent.parsedContent(mainPost.message)"
        ></div>

        <!-- 主帖附件展示 -->
        <div
          class="attachments"
          v-if="mainPost.attachments && mainPost.attachments.length"
        >
          <div class="attach-title">
            附件
            <span
              class="attach-title-submit"
              @click="handleAttachSubmit"
              v-if="!attachSubmit"
              >[展开]</span
            >
            <span
              class="attach-title-submit"
              @click="handleAttachSubmit"
              v-if="attachSubmit"
              >[收缩]</span
            >
          </div>
          <div class="attach-list">
            <!-- 遍历所有附件 -->
            <div
              v-for="attach in mainPost.attachments"
              :key="attach.aid"
              class="attach-item"
            >
              <!-- 图片类型 -->
              <van-image
                v-if="attach.isimage === 1"
                :src="getAttachUrl(attach)"
                :alt="attach.filename"
                :class="attachSubmit ? 'attach-image-open' : 'attach-image'"
                preview-group
                @click.stop
              />

              <!-- 非图片类型（视频、压缩包等） -->
              <a
                v-else
                :href="getAttachUrl(attach)"
                class="file-attach"
                download
                @click.stop
              >
                <van-icon
                  :name="getAttachIcon(attach.filename)"
                  class="file-icon"
                />
                <div class="file-info">
                  <div class="file-name">{{ attach.filename }}</div>
                  <div class="file-size">
                    {{ formatFileSize(attach.filesize) }}
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-section">
        <div class="comments-title">
          <van-icon name="message-o" />
          <span>评论 ({{ replyPage.total - 1 }})</span>
        </div>

        <div class="comment-list">
          <div
            class="comment-item"
            v-for="comment in comments"
            :key="comment.pid"
          >
            <div class="comment-header">
              <el-avatar
                class="comment-avatar"
                src="http://127.0.0.1:8081/api/attachment/200000/logo.png"
              />
              <div class="comment-author-info">
                <div class="comment-author">{{ comment.author }}</div>
                <div class="comment-time">
                  {{ comment.formattedCreateTime }}
                </div>
              </div>
            </div>
            <div
              class="comment-content"
              v-html="parsedContent.parsedContent(comment.message)"
            ></div>

            <!-- 评论附件展示 -->
            <!-- 评论附件展示（同样修改） -->
            <div
              class="attachments"
              v-if="comment.attachments && comment.attachments.length"
            >
              <span
                class="attach-title-submit"
                @click="handleAttachSubmit"
                v-if="!attachSubmit"
                >[展开]</span
              >
              <span
                class="attach-title-submit"
                @click="handleAttachSubmit"
                v-if="attachSubmit"
                >[收缩]</span
              >
              <div class="attach-list">
                <div
                  v-for="attach in comment.attachments"
                  :key="attach.aid"
                  class="attach-item comment-attach-item"
                >
                  <van-image
                    v-if="attach.isimage === 1"
                    :src="getAttachUrl(attach)"
                    :alt="attach.filename"
                    :class="attachSubmit ? 'attach-image-open' : 'attach-image'"
                    class="comment-attach"
                    preview-group
                    @click.stop
                  />

                  <a
                    v-else
                    :href="getAttachUrl(attach)"
                    class="file-attach comment-file-attach"
                    download
                    @click.stop
                  >
                    <van-icon
                      :name="getAttachIcon(attach.filename)"
                      class="file-icon"
                    />
                    <div class="file-info">
                      <div class="file-name">{{ attach.filename }}</div>
                      <div class="file-size">
                        {{ formatFileSize(attach.filesize) }}
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div class="comment-actions">
              <button class="action-btn">
                <van-icon name="star-o" size="16" />
                <span>评分</span>
              </button>
              <button class="action-btn">
                <van-icon name="reply-o" size="16" />
                <span>回复</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div class="pagination" v-if="replyPage.pages > 1">
          <van-pagination
            v-model="currentPage"
            :total-items="replyPage.total"
            :items-per-page="pageSize"
            :show-page-size="false"
            @change="handlePageChange"
          />
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="post-actions">
        <button class="action-button">
          <van-icon name="star-o" />
          <span>评分</span>
        </button>
        <button class="action-button">
          <van-icon name="chat-o" />
          <span>评论</span>
        </button>
        <button class="action-button">
          <van-icon name="share-o" />
          <span>分享</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Empty, Loading, Icon, Tag, Image as VanImage, Pagination } from "vant";

import { GetPostAPI, GetBlockListAPI, GetGroupListAPI } from "@/api/index";
import parsedContent from "@/assets/js/parsedContent";

// 定义附件接口
interface Attachment {
  aid: number;
  tid: number;
  pid: number;
  uid: number;
  dateline: number;
  filename: string;
  filesize: number;
  attachment: string;
  isimage: number;
  formattedDateline: string;
  // 其他附件字段...
}

// 定义帖子数据接口
interface PostItem {
  pid: number;
  fid: number;
  tid: number;
  first: number | null;
  author: string;
  authorid: number;
  subject: string | null;
  dateline: number;
  message: string;
  state: number;
  attachments: Attachment[];
  formattedCreateTime: string;
  viewCount: number;
  groupid?: number;
  extgroupid?: number;
}

// 定义分页响应接口
interface ReplyPage {
  records: PostItem[];
  total: number;
  size: number;
  current: number;
  pages: number;
  // 其他分页字段...
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

export default defineComponent({
  name: "PostDetail",
  components: {
    [Empty.name]: Empty,
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
    [VanImage.name]: VanImage,
    [Pagination.name]: Pagination,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isLoading = ref(true);
    const attachSubmit = ref(false);
    const blockList = ref<BlockItem>(null);
    const groupList = ref<GroupItem>(null);
    const postUnknow = ref("");
    const mainPost = ref<PostItem | null>(null);
    const replyPage = ref<ReplyPage>({
      records: [],
      total: 0,
      size: 10,
      current: 1,
      pages: 0,
    });
    const currentPage = ref(1);
    const pageSize = ref(10);

    // 获取帖子ID
    const pidParam = route.params.pid;
    const postId = Array.isArray(pidParam) ? pidParam[0] : pidParam;

    // 过滤评论列表（排除主帖）
    const comments = computed(() => {
      return replyPage.value.records.filter((item) => item.first !== 1);
    });

    // // 生成附件图片URL（根据实际项目的附件路径规则调整）
    // const getAttachUrl = (attach: Attachment) => {
    //   // 假设附件存储在项目的/static/attachments/路径下
    //   return `/attachments/${attach.attachment}`;
    // };

    // 获取帖子数据（支持分页）
    const getData = async () => {
      try {
        isLoading.value = true;

        if (!postId || typeof postId !== "string") {
          throw new Error("无效的帖子ID");
        }

        // 调用接口时传入分页参数
        const res: any = await GetPostAPI({
          pid: postId,
          current: currentPage.value,
          size: pageSize.value,
        });

        if (res.status === 200 && res.data) {
          mainPost.value = res.data.mainPost;
          replyPage.value = res.data.replyPage;

          // 更新当前页码（同步接口返回的current）
          currentPage.value = res.data.replyPage.current;

          // 设置页面标题
          const pageTitle = mainPost.value?.subject || "帖子详情";
          document.title = pageTitle + " - 罗小黑妖灵论坛 ʕ•͡-•ʔฅ ~ heibbs.net";
          router.currentRoute.value.meta.title = pageTitle;
        } else {
          console.error("获取帖子失败:", res.data);
          postUnknow.value = res.data || "获取帖子失败";
        }
      } catch (error: any) {
        console.error("获取帖子出错:", error);
        postUnknow.value = error.message || "加载失败，请重试";
      } finally {
        isLoading.value = false;
      }
    };

    // 处理图片列表展开收缩
    const handleAttachSubmit = () => {
      attachSubmit.value = !attachSubmit.value;
    };

    // 处理分页变化
    const handlePageChange = (page: number) => {
      currentPage.value = page;
      getData(); // 重新加载当前页数据
    };

    // 根据文件名获取对应的图标
    const getAttachIcon = (filename: string) => {
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      // 视频类型
      if (["mp4", "avi", "mov", "mkv", "flv"].includes(ext)) {
        return "video-o";
      }
      // 压缩包类型
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return "file-zip-o";
      }
      // 文档类型
      if (
        ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "txt"].includes(
          ext
        )
      ) {
        return "file-text-o";
      }
      // 默认文件图标
      return "file-o";
    };

    // 生成附件URL（使用正确的基础路径）
    const getAttachUrl = (attach: Attachment) => {
      // 基础URL（实际项目中建议放在环境变量中）
      const baseUrl = "http://127.0.0.1:8081/api/attachment/";
      // 拼接附件路径（假设attach.attachment已经包含日期目录部分，如"202001/21/xxx.jpg"）
      return baseUrl + attach.attachment;
    };

    const getImgUrl = (url: any) => {
      // 基础URL（实际项目中建议放在环境变量中）
      const baseUrl = "http://127.0.0.1:8081/api/attachment/";
      // 拼接附件路径（假设attach.attachment已经包含日期目录部分，如"202001/21/xxx.jpg"）
      return baseUrl + url;
    };

    // 格式化文件大小（字节转KB/MB）
    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) {
        return `${bytes} B`;
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

    // 初始化加载数据
    getData();
    getBlockData();
    getGroupData();

    return {
      blockList,
      groupList,
      isLoading,
      mainPost,
      replyPage,
      comments,
      currentPage,
      pageSize,
      attachSubmit,
      parsedContent,
      postUnknow,
      getAttachUrl,
      handlePageChange,
      getAttachIcon,
      formatFileSize,
      handleAttachSubmit,
      getImgUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.post-detail {
  background: rgba(255, 255, 255, 0.9);
  min-height: calc(100vh - 730px);
  padding: 15px 10px;
  border-radius: 10px;
  line-height: 1.6em;
  margin: 70px 10px 0px 10px;
}

.loading-indicator {
  padding: 50px 0;
  text-align: center;
}

.empty-state {
  padding: 50px 0;
}
.post-block {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  .post-block-tag {
    color: rgba(255, 255, 255, 1);
    font-weight: 500;
    margin-right: 5px;
    border-radius: 5px;
    padding: 2px 4px;
    font-size: 16px;
  }
}

// 主帖样式
.main-post {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .author-info {
      display: flex;
      align-items: center;

      .author-avatar {
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }

      .author-details {
        .author-name {
          font-weight: 500;
          color: #2c2c2c;
          .post-meta-group {
            color: rgba(255, 255, 255, 1);
            background: rgba(41, 146, 244, 0.7);
            border-radius: 5px;
            padding: 2px 4px;
          }
          .post-meta-admingroup {
            color: rgba(255, 255, 255, 1);
            background: rgba(244, 41, 41, 0.7);
            border-radius: 5px;
            padding: 2px 4px;
          }
        }

        .post-time {
          font-size: 12px;
          color: #888;
        }
      }
    }
  }

  .post-title {
    font-size: 18px;
    font-weight: bold;
    color: #4b4b4b;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f5f5f5;
  }
  .discuz-img {
    max-width: 100% !important; // 关键：图片最大宽度 = 容器宽度
    height: auto !important; // 高度随宽度等比例缩放，避免变形
    border-radius: 4px; // 可选：优化视觉效果
  }
  .post-content {
    color: #555;
    font-size: 15px;
    margin-bottom: 15px;
    // 允许长文本在任意字符处换行（解决无空格长URL问题）
    word-break: break-all;
    // 同时兼容中文/英文换行（备选，根据内容调整）
    word-wrap: break-word;

    .post-image {
      max-width: 100%;
      border-radius: 4px;
      margin: 10px 0;
    }

    .quote-box {
      border-left: 3px solid #ddd;
      padding-left: 10px;
      margin: 10px 0;
      color: #666;
      font-size: 14px;
    }
  }
}

// 附件样式
.attachments {
  margin-top: 15px;

  .attach-title {
    font-size: 14px;
    color: #888;
    margin-bottom: 8px;
    font-weight: 500;
  }
  .attach-title-submit {
    cursor: pointer;
  }
  .attach-title-submit:hover {
    color: rgba(0, 0, 0, 0.7);
  }

  .attach-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .attach-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #f0f0f0;
  }
  .attach-image-open {
    /* 宽度自适应父容器 */
    width: 100%;
    /* 高度自动，根据图片原有比例计算，避免固定正方形 */
    height: auto;
    /* 确保图片完整显示，不被裁剪（可选，根据需求调整） */
    object-fit: contain;
    /* 可选：限制最大宽度，避免图片过宽 */
    max-width: 100%;
  }

  .comment-attach {
    width: 80px;
    height: 80px;
  }
}

// 评论区样式
.comments-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 15px;

  .comments-title {
    display: flex;
    align-items: center;
    color: #333;
    font-weight: 500;
    padding-bottom: 10px;
    margin-bottom: 15px;
    border-bottom: 1px solid #f5f5f5;

    .van-icon {
      margin-right: 5px;
      color: #1989fa;
    }
  }

  // 评论
  .comment-list {
    .comment-item {
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .comment-header {
        display: flex;
        margin-bottom: 8px;

        .comment-avatar {
          width: 36px;
          height: 36px;
          margin-right: 10px;
        }

        .comment-author-info {
          .comment-author {
            font-size: 14px;
            font-weight: 500;
            color: #333;
          }

          .comment-time {
            font-size: 12px;
            color: #888;
          }
        }
      }

      .comment-content {
        font-size: 14px;
        color: #555;
        margin-bottom: 8px;
        padding-left: 46px;
        // 允许长文本在任意字符处换行（解决无空格长URL问题）
        word-break: break-all;
        // 同时兼容中文/英文换行（备选，根据内容调整）
        word-wrap: break-word;
      }

      .comment-actions {
        display: flex;
        padding-left: 46px;

        .action-btn {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: #888;
          font-size: 12px;
          margin-right: 15px;
          cursor: pointer;

          .van-icon {
            margin-right: 3px;
          }

          &:hover {
            color: #1989fa;
          }
        }
      }
    }
  }

  // 分页样式
  .pagination {
    margin-top: 20px;
    text-align: center;
    padding: 10px 0;
  }
}

// 底部操作栏
.post-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);

  .action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    color: #666;
    font-size: 12px;
    cursor: pointer;

    .van-icon {
      font-size: 20px;
      margin-bottom: 3px;
    }

    &:hover {
      color: #1989fa;
    }
  }

  .attach-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .attach-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  // 文件类型附件样式
  .file-attach {
    display: flex;
    align-items: center;
    width: 100px;
    height: 100px;
    padding: 8px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    text-decoration: none;
    color: #666;
    background-color: #fafafa;

    .file-icon {
      font-size: 24px;
      margin-right: 8px;
      color: #888;
    }

    .file-info {
      flex: 1;
      overflow: hidden;

      .file-name {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }

      .file-size {
        font-size: 11px;
        color: #aaa;
      }
    }
  }

  // 评论区附件调整
  .comment-attach-item {
    width: 80px;
    height: 80px;
  }

  .comment-file-attach {
    width: 80px;
    height: 80px;
    font-size: 11px;

    .file-icon {
      font-size: 18px;
    }
  }
}
</style>