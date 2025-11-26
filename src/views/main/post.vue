<template>
  <!-- 保持原有模板不变 -->
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
      <!-- 板块名称（可点击跳转） -->
      <div
        class="post-block"
        @click="gotoBlock(mainPost.fid)"
        :class="{ clickable: !!mainPost.fid }"
      >
        <span class="post-block-tag">{{ getBlockName(mainPost.fid) }} </span>
        <van-icon name="arrow-right" size="14" v-if="!!mainPost.fid" />
      </div>

      <!-- 主帖 -->
      <div class="main-post">
        <!-- 主帖内容保持不变 -->
        <div class="post-header">
          <div class="author-info">
            <el-avatar
              class="author-avatar"
              src="http://www.heibbs.net:8081/api/attachment/200000/logo.png"
              @click="gotoInfo(mainPost.authorid)"
            />
            <div class="author-details">
              <div class="author-name">
                <span
                  class="post-meta-group"
                  :style="{
                    backgroundColor:
                      groupList.groupDo[mainPost?.groupid - 1]?.color,
                  }"
                  v-if="mainPost.extgroupid == 0"
                  >{{ groupList.groupDo[mainPost?.groupid - 1]?.gname }}</span
                >
                <span
                  class="post-meta-admingroup"
                  v-if="mainPost?.extgroupid != 0"
                  >{{
                    groupList.extgroupDo[mainPost?.extgroupid - 1]?.gname
                  }}</span
                >
                {{ mainPost.author }}
              </div>
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
            <div
              v-for="attach in mainPost.attachments"
              :key="attach.aid"
              class="attach-item"
            >
              <van-image
                v-if="attach.isimage === 1"
                :src="getAttachUrl(attach)"
                :alt="attach.filename"
                :class="attachSubmit ? 'attach-image-open' : 'attach-image'"
                preview-group
                @click.stop
              />
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

      <!-- 主帖操作按钮（使用原生下拉菜单替代Element Plus） -->
      <div class="post-actions-container">
        <el-button type="info" text @click="showPostReply = true">回复</el-button>
        <el-button type="info" text>评分</el-button>
        
        <!-- 使用原生下拉菜单 -->
        <div class="dropdown-container">
          <button class="dropdown-btn" @click="(e) => toggleMainPostDropdown(e)">
            更多
            <span class="dropdown-icon">▼</span>
          </button>
          <div class="dropdown-menu" v-if="showMainPostDropdown">
            <div class="dropdown-item" @click="handleMainPostAction('operate')">操作</div>
            <div class="dropdown-item" @click="handleMainPostAction('report')">举报</div>
            <div class="dropdown-item" @click="handleMainPostAction('share')">分享</div>
            <div class="dropdown-divider" v-if="judgmentPermission(mainPost.authorid)"></div>
            <div class="dropdown-item" v-if="judgmentPermission(mainPost.authorid)" @click="handleMainPostAction('edit')">编辑</div>
            <div class="dropdown-item danger" v-if="judgmentPermission(mainPost.authorid)" @click="handleMainPostAction('delete')">删除</div>
          </div>
        </div>
      </div>

      <!-- 主帖回复框 -->
      <div class="reply-container" v-if="showPostReply">
        <textarea
          v-model="replyContent"
          class="reply-textarea"
          placeholder="请输入回复内容..."
          rows="4"
        ></textarea>
        <div class="reply-actions">
          <el-button type="warning" @click="submitPostReply">回复</el-button>
          <el-button @click="cancelReply">取消</el-button>
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
            v-for="(comment, index) in comments"
            :key="comment.pid"
          >
            <!-- 评论内容保持不变 -->
            <div class="comment-header">
              <el-avatar
                class="comment-avatar"
                src=""
                @click="gotoInfo(comment.authorid)"
              />
              <div class="comment-author-info">
                <div class="comment-author">
                  <span
                    class="comment-meta-group"
                    :style="{
                      backgroundColor:
                        groupList.groupDo[comment?.groupid - 1]?.color,
                    }"
                    v-if="comment.extgroupid == 0"
                    >{{ groupList.groupDo[comment?.groupid - 1]?.gname }}</span
                  >
                  <span
                    class="comment-meta-admingroup"
                    :style="{
                      backgroundColor:
                        groupList.extgroupDo[comment?.extgroupid - 1]?.color,
                    }"
                    v-if="comment?.extgroupid != 0"
                    >{{
                      groupList.extgroupDo[comment?.extgroupid - 1]?.gname
                    }}</span
                  >
                  {{ comment.author }}
                </div>
                <div class="comment-time">{{ comment.formattedCreateTime }}</div>
              </div>
            </div>

            <div v-if="editCommentId !== comment.pid" class="comment-content">
              <div v-html="parsedContent.parsedContent(comment.message)"></div>
            </div>
            <div v-else class="comment-edit-container">
              <textarea
                v-model="editContent"
                class="comment-edit-textarea"
                placeholder="请输入评论内容..."
                rows="4"
              ></textarea>
              <div class="comment-edit-actions">
                <el-button
                  type="warning"
                  size="small"
                  @click="handleSubmitEdit(comment)"
                  >修改</el-button
                >
                <el-button size="small" @click="cancelEdit">取消</el-button>
                <el-button type="primary" size="small" @click="gotoAdvancedEdit(comment.pid)"
                  >高级编辑</el-button
                >
              </div>
            </div>

            <!-- 评论附件展示 -->
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

            <!-- 评论操作按钮（使用原生下拉菜单） -->
            <div class="comment-actions-container">
              <el-button type="info" text @click="showCommentReply(comment, index)">回复</el-button>
              <el-button type="info" text>评分</el-button>
              
              <div class="dropdown-container">
                <button class="dropdown-btn" @click="(e) => toggleCommentDropdown(index, e)">
                  更多
                  <span class="dropdown-icon">▼</span>
                </button>
                <div class="dropdown-menu" v-if="showCommentDropdown === index">
                  <div class="dropdown-item" @click="handleCommentAction('operate', comment)">操作</div>
                  <div class="dropdown-item" @click="handleCommentAction('report', comment)">举报</div>
                  <div class="dropdown-item" @click="handleCommentAction('share', comment)">分享</div>
                  <div class="dropdown-divider" v-if="judgmentPermission(comment.authorid)"></div>
                  <div class="dropdown-item" v-if="judgmentPermission(comment.authorid)" @click="handleCommentAction('edit', comment)">编辑</div>
                  <div class="dropdown-item danger" v-if="judgmentPermission(comment.authorid)" @click="handleCommentAction('delete', comment)">删除</div>
                </div>
              </div>
            </div>

            <!-- 评论回复框 -->
            <div class="reply-container" v-if="replyToComment && replyToIndex === index">
              <div class="quote-content" v-if="replyToComment">
                <div class="quote-header">
                  @{{ replyToComment.author }} {{ replyToComment.formattedCreateTime }}
                </div>
                <div class="quote-text">
                  {{ getShortContent(replyToComment.message) }}
                </div>
              </div>
              <textarea
                v-model="replyContent"
                class="reply-textarea"
                placeholder="请输入回复内容..."
                rows="4"
              ></textarea>
              <div class="reply-actions">
                <el-button type="warning" @click="submitCommentReply">回复</el-button>
                <el-button @click="cancelReply">取消</el-button>
              </div>
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
    </div>

    <!-- 点击外部关闭下拉菜单 -->
    <div class="dropdown-backdrop" v-if="showMainPostDropdown || showCommentDropdown !== null" @click="closeAllDropdowns"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import store from "@/store";
import { Empty, Loading, Icon, Tag, Image as VanImage, Pagination } from "vant";
import { ElMessage, ElMessageBox, ElAvatar, ElButton } from "element-plus";

import {
  GetPostAPI,
  GetBlockListAPI,
  GetGroupListAPI,
  EditPostDataAPI,
  InsertPostAPI // 导入回复接口
} from "@/api/index";
import parsedContent from "@/assets/js/parsedContent";

// 定义接口保持不变
interface PostDo {
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
  viewCount: number;
}

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
}

interface PostItem extends PostDo {
  attachments: Attachment[];
  formattedCreateTime: string;
  groupid?: number;
  extgroupid?: number;
}

interface ReplyPage {
  records: PostItem[];
  total: number;
  size: number;
  current: number;
  pages: number;
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

type BlockList = BlockItem[];

interface GroupItem {
  groupDo?: [];
  extgroupDo?: [];
}

// 回复接口参数类型
interface InsertPostQuery {
  // 板块id（必填）
  fid: number;
  // 主题id，带tid即为回复，不带即为发帖（可选）
  tid?: number;
  // 标题，不带标题为回复，带标题为发帖（可选）
  subject?: string;
  // 发帖内容（必填）
  message: string;
}

const userData = store.state.user?.info?.user;

export default defineComponent({
  name: "PostDetail",
  components: {
    [Empty.name]: Empty,
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
    [VanImage.name]: VanImage,
    [Pagination.name]: Pagination,
    ElAvatar,
    ElButton
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isLoading = ref(true);
    const attachSubmit = ref(false);
    const blockList = ref<BlockList>([]);
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
    const editCommentId = ref<number | null>(null);
    const editContent = ref<string>("");

    // 回复相关状态
    const showPostReply = ref(false);
    const replyToComment = ref<PostItem | null>(null);
    const replyToIndex = ref<number | null>(null);
    const replyContent = ref("");
    const isSubmitting = ref(false); // 防止重复提交

    // 下拉菜单状态
    const showMainPostDropdown = ref(false);
    const showCommentDropdown = ref<number | null>(null); // 使用索引标识当前打开的评论下拉菜单

    const pidParam = route.params.pid;
    const postId = Array.isArray(pidParam) ? pidParam[0] : pidParam;

    const comments = computed(() => {
      return replyPage.value.records.filter((item) => item.first !== 1);
    });

    // 获取简短内容（用于引用）
    const getShortContent = (content: string) => {
      // 移除HTML标签
      const text = content.replace(/<[^>]*>/g, '');
      // 如果内容过长，截取前50个字符
      return text.length > 50 ? text.substring(0, 50) + '...' : text;
    };

    // 显示评论回复框
    const showCommentReply = (comment: PostItem, index: number) => {
      replyToComment.value = comment;
      replyToIndex.value = index;
      // 构造引用内容
      const quotedContent = `[quote]@${comment.author} ${comment.formattedCreateTime}\n${getShortContent(comment.message)}[/quote]\n`;
      replyContent.value = quotedContent;
    };

    // 提交主帖回复
    const submitPostReply = async () => {
      if (!mainPost.value) return;
      if (!replyContent.value.trim()) {
        ElMessage.warning("回复内容不能为空");
        return;
      }
      if (isSubmitting.value) return;

      try {
        isSubmitting.value = true;
        
        // 构造回复参数
        const postData: InsertPostQuery = {
          fid: mainPost.value.fid,
          tid: mainPost.value.tid || mainPost.value.pid, // 使用主帖的tid或pid作为主题ID
          message: replyContent.value.trim()
        };

        // 调用回复接口
        const res = await InsertPostAPI(postData);
        
        if (res.status === 200) {
          ElMessage.success("回复成功！");
          showPostReply.value = false;
          replyContent.value = "";
          
          // 刷新评论列表
          await getData();
          // 跳转到最后一页
          if (replyPage.value.pages > 1) {
            currentPage.value = replyPage.value.pages;
            await getData();
          }
        } else {
          ElMessage.error(`回复失败: ${res.msg || "服务器错误"}`);
        }
      } catch (error: any) {
        console.error("提交回复失败:", error);
        ElMessage.error(`回复失败: ${error.message || "网络错误"}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 提交评论回复
    const submitCommentReply = async () => {
      if (!mainPost.value || !replyToComment.value) return;
      if (!replyContent.value.trim()) {
        ElMessage.warning("回复内容不能为空");
        return;
      }
      if (isSubmitting.value) return;

      try {
        isSubmitting.value = true;
        
        // 构造回复参数
        const postData: InsertPostQuery = {
          fid: mainPost.value.fid,
          tid: mainPost.value.tid || mainPost.value.pid, // 使用主帖的tid或pid作为主题ID
          message: replyContent.value.trim()
        };

        // 调用回复接口
        const res = await InsertPostAPI(postData);
        
        if (res.status === 200) {
          ElMessage.success("回复成功！");
          replyToComment.value = null;
          replyToIndex.value = null;
          replyContent.value = "";
          
          // 刷新评论列表
          await getData();
          // 跳转到最后一页
          if (replyPage.value.pages > 1) {
            currentPage.value = replyPage.value.pages;
            await getData();
          }
        } else {
          ElMessage.error(`回复失败: ${res.msg || "服务器错误"}`);
        }
      } catch (error: any) {
        console.error("提交回复失败:", error);
        ElMessage.error(`回复失败: ${error.message || "网络错误"}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 取消回复
    const cancelReply = () => {
      showPostReply.value = false;
      replyToComment.value = null;
      replyToIndex.value = null;
      replyContent.value = "";
    };

    // 切换主帖下拉菜单
    const toggleMainPostDropdown = (e: Event) => {
      if (e) {
        e.stopPropagation();
      }
      showMainPostDropdown.value = !showMainPostDropdown.value;
      showCommentDropdown.value = null; // 关闭其他下拉菜单
    };

    // 切换评论下拉菜单
    const toggleCommentDropdown = (index: number, e: Event) => {
      if (e) {
        e.stopPropagation();
      }
      if (showCommentDropdown.value === index) {
        showCommentDropdown.value = null;
      } else {
        showCommentDropdown.value = index;
        showMainPostDropdown.value = false; // 关闭其他下拉菜单
      }
    };

    // 关闭所有下拉菜单
    const closeAllDropdowns = () => {
      showMainPostDropdown.value = false;
      showCommentDropdown.value = null;
    };

    // 处理主帖操作
    const handleMainPostAction = (action: string) => {
      closeAllDropdowns();
      
      if (!mainPost.value) return;
      
      switch (action) {
        case 'operate':
          ElMessage.info('执行主帖操作功能');
          break;
        case 'report':
          ElMessage.info('举报主帖功能已触发');
          break;
        case 'share':
          navigator.clipboard.writeText(window.location.href)
            .then(() => ElMessage.success('分享链接已复制到剪贴板'))
            .catch(() => ElMessage.success('主帖链接已复制'));
          break;
        case 'edit':
          PostClick(mainPost.value.pid);
          break;
        case 'delete':
          ElMessageBox.confirm(
            '此操作将永久删除该帖子，是否继续？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
            // 这里可以添加实际的删除API调用
          }).catch(() => {
            ElMessage({
              type: 'info',
              message: '已取消删除'
            });
          });
          break;
      }
    };

    // 处理评论操作
    const handleCommentAction = (action: string, comment: PostItem) => {
      closeAllDropdowns();
      
      switch (action) {
        case 'operate':
          ElMessage.info('执行评论操作功能');
          break;
        case 'report':
          ElMessage.info('举报评论功能已触发');
          break;
        case 'share':
          const commentUrl = `${window.location.href}#comment-${comment.pid}`;
          navigator.clipboard.writeText(commentUrl)
            .then(() => ElMessage.success('评论链接已复制到剪贴板'))
            .catch(() => ElMessage.success('评论链接已复制'));
          break;
        case 'edit':
          handleEditComment(comment);
          break;
        case 'delete':
          ElMessageBox.confirm(
            '此操作将永久删除该评论，是否继续？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            ElMessage({
              type: 'success',
              message: '删除成功!'
            });
            // 这里可以添加实际的删除API调用
          }).catch(() => {
            ElMessage({
              type: 'info',
              message: '已取消删除'
            });
          });
          break;
      }
    };

    // 其他方法保持不变
    const gotoBlock = (fid: number) => {
      if (fid) {
        router.push({
          path: `/block/${fid}`,
        });
      }
    };

    const getData = async () => {
      try {
        isLoading.value = true;

        if (!postId || typeof postId !== "string") {
          throw new Error("无效的帖子ID");
        }

        const res: any = await GetPostAPI({
          pid: postId,
          current: currentPage.value,
          size: pageSize.value,
        });

        if (res.status === 200 && res.data) {
          mainPost.value = res.data.mainPost;
          replyPage.value = res.data.replyPage;
          currentPage.value = res.data.replyPage.current;

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

    const handleAttachSubmit = () => {
      attachSubmit.value = !attachSubmit.value;
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      updateRouteParams();
      getData();
    };

    const judgmentPermission = (authorid: number) => {
      if (userData?.extgroupids == 1 || userData?.extgroupids == 2) {
        return true;
      }
      if (userData?.uid == authorid) {
        return true;
      }
      return false;
    };

    const getAttachIcon = (filename: string) => {
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      if (["mp4", "avi", "mov", "mkv", "flv"].includes(ext)) {
        return "video-o";
      }
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        return "file-zip-o";
      }
      if (
        ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "txt"].includes(
          ext
        )
      ) {
        return "file-text-o";
      }
      return "file-o";
    };

    const getAttachUrl = (attach: Attachment) => {
      const baseUrl = "http://127.0.0.1:8081/api/attachment/";
      return baseUrl + attach.attachment;
    };

    const getImgUrl = (url: any) => {
      const baseUrl = "http://127.0.0.1:8081/api/attachment/";
      return baseUrl + url;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) {
        return `${bytes} B`;
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    };

    const getBlockData = async () => {
      const res: any = await GetBlockListAPI();
      if (res.status == 200) {
        blockList.value = res.data;
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

    const PostClick = (pid: number) => {
      router.push("/editpost/" + pid);
    };

    const initFromRoute = () => {
      const { current, size } = route.query;
      if (current && !isNaN(Number(current))) {
        currentPage.value = Number(current);
      }
      if (size && !isNaN(Number(size))) {
        pageSize.value = Number(size);
      }
    };

    const updateRouteParams = () => {
      router.push({
        path: route.path,
        query: {
          ...route.query,
          current: currentPage.value,
          size: pageSize.value,
        },
      });
    };

    const gotoInfo = (id: number) => {
      router.push({
        path: `/info/${id}`,
      });
    };

    const handleEditComment = (comment: PostItem) => {
      editCommentId.value = comment.pid;
      editContent.value = comment.message;
    };

    const cancelEdit = () => {
      editCommentId.value = null;
      editContent.value = "";
    };

    const handleSubmitEdit = async (comment: PostItem) => {
      if (!editContent.value.trim()) {
        ElMessage.warning("评论内容不能为空");
        return;
      }

      try {
        const postData: PostDo = {
          pid: comment.pid,
          fid: comment.fid,
          tid: comment.tid,
          first: comment.first,
          author: comment.author,
          authorid: comment.authorid,
          subject: comment.subject,
          dateline: comment.dateline,
          message: editContent.value,
          state: comment.state,
          viewCount: comment.viewCount,
        };

        const res = await EditPostDataAPI(postData);

        if (res.status === 200) {
          const commentIndex = replyPage.value.records.findIndex(
            (item) => item.pid === comment.pid
          );
          if (commentIndex !== -1) {
            replyPage.value.records[commentIndex].message = editContent.value;
          }

          ElMessage.success("评论修改成功");
          cancelEdit();
        } else {
          ElMessage.error(`修改失败: ${res.msg || "服务器错误"}`);
        }
      } catch (error) {
        console.error("编辑评论失败:", error);
        ElMessage.error("修改失败，请重试");
      }
    };

    const gotoAdvancedEdit = (pid: number) => {
      router.push(`/editpost/${pid}`);
      cancelEdit();
    };

    // 初始化数据
    getData();
    getBlockData();
    getGroupData();

    watch(
      () => [route.query.current, route.query.size],
      () => {
        initFromRoute();
        getData();
      },
      { immediate: true }
    );

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
      userData,
      getAttachUrl,
      handlePageChange,
      getAttachIcon,
      formatFileSize,
      handleAttachSubmit,
      getImgUrl,
      getBlockName,
      judgmentPermission,
      PostClick,
      gotoInfo,
      gotoBlock,
      editCommentId,
      editContent,
      handleEditComment,
      cancelEdit,
      handleSubmitEdit,
      gotoAdvancedEdit,
      // 下拉菜单相关
      showMainPostDropdown,
      showCommentDropdown,
      toggleMainPostDropdown,
      toggleCommentDropdown,
      closeAllDropdowns,
      handleMainPostAction,
      handleCommentAction,
      // 回复相关
      showPostReply,
      replyToComment,
      replyToIndex,
      replyContent,
      isSubmitting,
      showCommentReply,
      submitPostReply,
      submitCommentReply,
      cancelReply,
      getShortContent
    };
  },
});
</script>

<style lang="scss" scoped>
/* 原有样式保持不变 */
.post-detail {
  background: rgba(255, 255, 255, 0.9);
  min-height: calc(100vh - 730px);
  padding: 15px 10px;
  border-radius: 10px;
  line-height: 1.6em;
  margin: 70px 10px 0px 10px;
  position: relative;
  z-index: 1;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &.clickable {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(25, 137, 250, 0.05);
    }
  }

  .post-block-tag {
    color: rgb(94, 91, 86);
    font-weight: 500;
    margin-right: 5px;
    border-radius: 5px;
    padding: 2px 4px;
    font-size: 18px;
    font-weight: 550;
  }
}

.main-post {
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .author-info {
      display: flex;
      align-items: center;
      cursor: pointer;

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
    max-width: 100% !important;
    height: auto !important;
    border-radius: 4px;
  }
  .post-content {
    color: #555;
    font-size: 15px;
    margin-bottom: 15px;
    word-break: break-all;
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

// 操作按钮容器
.post-actions-container,
.comment-actions-container {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: flex-end;
  margin-bottom: 30px;
  padding: 5px 10px;
  
  &.comment-actions-container {
    margin-bottom: 0;
    padding-left: 46px;
    margin-top: 8px;
  }
}

// 自定义下拉菜单样式
.dropdown-container {
  position: relative;
  display: inline-block;
  
  .dropdown-btn {
    background: transparent;
    border: none;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    border-radius: 4px;
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.1);
    }
    
    .dropdown-icon {
      font-size: 12px;
      transition: transform 0.2s;
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    min-width: 120px;
    z-index: 1000;
    margin-top: 5px;
    
    .dropdown-item {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.danger {
        color: #f56c6c;
      }
    }
    
    .dropdown-divider {
      height: 1px;
      background-color: #e6e6e6;
      margin: 4px 0;
    }
  }
}

// 下拉菜单背景层
.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
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
    width: 100%;
    height: auto;
    object-fit: contain;
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
        cursor: pointer;

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
            .comment-meta-group {
              color: rgba(255, 255, 255, 1);
              border-radius: 5px;
              padding: 2px 4px;
            }
            .comment-meta-admingroup {
              color: rgba(255, 255, 255, 1);
              background: rgba(244, 41, 41, 0.7);
              border-radius: 5px;
              padding: 2px 4px;
            }
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
        word-break: break-all;
        word-wrap: break-word;
      }

      .comment-edit-container {
        padding-left: 46px;
        margin-bottom: 8px;

        .comment-edit-textarea {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          transition: border-color 0.2s;

          &:focus {
            outline: none;
            border-color: #1989fa;
            box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.1);
          }
        }

        .comment-edit-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          justify-content: flex-end;
        }
      }
    }
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
    padding: 10px 0;
  }
}

// 回复框样式
.reply-container {
  margin: 15px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  
  .quote-content {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
    
    .quote-header {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .quote-text {
      font-size: 13px;
      color: #888;
      line-height: 1.4;
    }
  }
  
  .reply-textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
  }
  
  .reply-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
}

// 提交按钮禁用状态
.el-button.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
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