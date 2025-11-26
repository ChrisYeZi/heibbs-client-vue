<template>
  <div class="editpost">
    <div class="editpost-form">
      <el-form
        label-position="right"
        label-width="auto"
        :model="postData"
        style="max-width: 100%"
      >
        <el-form-item label="帖子名称" label-position="right">
          <el-input
            v-model="postData.subject"
            :disabled="postData.first === undefined || postData.first !== 1"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 编辑器/代码视图容器 -->
    <div class="editpost-box">
      <!-- 工具栏 + 切换按钮 -->
      <div class="editor-toolbar">
        <!-- 原 WangEditor 工具栏（仅可视化视图显示） -->
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          :mode="mode"
        />
        <!-- 代码视图切换按钮（始终显示） -->
        <el-button
          type="text"
          size="small"
          @click="toggleCodeView"
          :disabled="isSubmitting"
          class="code-view-btn"
        >
          {{ isCodeView ? "可视化视图" : "查看代码视图" }}
        </el-button>
      </div>

      <!-- 1. 可视化编辑视图（默认显示） -->
      <Editor
        v-if="!isCodeView"
        style="height: 70vh; overflow-y: hidden"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @error="handleEditorError"
      />

      <!-- 2. 代码视图（切换后显示） -->
      <div v-else class="code-view-container">
        <pre class="code-view-pre">
          <textarea
            v-model="codeContent"
            class="code-view-textarea"
            :disabled="isSubmitting"
            placeholder="此处显示编辑器原始 HTML 代码，可直接编辑..."
          ></textarea>
        </pre>
      </div>
    </div>

    <div class="editpost-footer">
      <el-button
        type="primary"
        color="#4775F0"
        @click="handleSubmit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        提交编辑
      </el-button>
      <el-button
        type="text"
        color="#4775F0"
        @click="handleCancel"
        :disabled="isSubmitting"
        style="margin-left: 10px"
      >
        取消
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import parsedContent from "@/assets/js/parsedContent";
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  defineComponent,
  onErrorCaptured,
  watch,
} from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { GetPostDataAPI, EditPostDataAPI } from "@/api/index";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

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
  viewCount: number;
  formattedCreateTime: string;
  replyCount?: number;
  groupid?: number;
  extgroupid?: number;
}

export default defineComponent({
  components: { Editor, Toolbar },

  setup() {
    const editorRef = shallowRef();
    const postData = ref<PostItem>({
      pid: 0,
      fid: 0,
      tid: 0,
      authorid: 0,
      formattedCreateTime: "",
      dateline: 0,
      subject: "",
      author: "",
      message: "加载中...",
      first: 0,
      groupid: 0,
      extgroupid: 0,
      state: 0,
      viewCount: 0,
    });
    const route = useRoute();
    const router = useRouter();
    const valueHtml = ref("<p>加载中...</p>");
    const isSubmitting = ref(false);

    // 核心：代码视图状态管理
    const isCodeView = ref(false); // 是否显示代码视图
    const codeContent = ref(""); // 代码视图的 HTML 内容

    // 1. 切换代码视图/可视化视图
    const toggleCodeView = () => {
      if (isCodeView.value) {
        // 退出代码视图：将 codeContent 同步回编辑器
        if (editorRef.value) {
          editorRef.value.setHtml(codeContent.value); // 用编辑器 API 设值
          valueHtml.value = codeContent.value; // 同步 v-model
        }
      } else {
        // 进入代码视图：从编辑器获取原始 HTML
        if (editorRef.value) {
          const rawHtml = editorRef.value.getHtml(); // 获取编辑器原始 HTML
          codeContent.value = rawHtml; // 赋值给代码视图
        } else {
          // 编辑器未初始化时，用当前 valueHtml 兜底
          codeContent.value = valueHtml.value;
        }
      }
      isCodeView.value = !isCodeView.value; // 切换状态
    };

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error("组件内未处理错误：", err);
      console.error("错误来源：", instance);
      console.error("错误信息：", info);
      return false;
    });

    // 获取帖子数据
    const getPostData = async () => {
      try {
        const pid = Number(route.params.pid);
        if (isNaN(pid)) {
          throw new Error(`无效的帖子ID：${route.params.pid}`);
        }

        const res: any = await GetPostDataAPI({ pid });
        if (!res || res.status !== 200 || !res.data) {
          throw new Error(`接口请求失败：状态码 ${res?.status || "未知"}`);
        }

        const { data } = res;
        if (!data.message) {
          throw new Error("接口返回数据结构不完整");
        }

        postData.value = { ...data, first: Number(data.first) };
        const parsedHtml = parsedContent.parsedContent(data.message || "");
        valueHtml.value = parsedHtml;
        // 初始代码视图内容兜底
        if (isCodeView.value) codeContent.value = parsedHtml;
      } catch (err) {
        console.error("获取帖子数据失败：", err);
        postData.value.message = "数据加载失败，请刷新重试";
        valueHtml.value = "<p>数据加载失败，请刷新重试</p>";
        if (isCodeView.value) codeContent.value = valueHtml.value;
        ElMessage.error("加载帖子失败，请重试");
      }
    };

    // 提交编辑：优先用代码视图内容（如果处于代码视图）
    const handleSubmit = async () => {
      // 1. 标题验证
      if (!postData.value.subject?.trim()) {
        ElMessage.warning("请输入帖子标题");
        return;
      }

      // 2. 内容获取：代码视图优先
      let finalContent = "";
      if (isCodeView.value) {
        finalContent = codeContent.value.trim();
      } else {
        finalContent = editorRef.value
          ? editorRef.value.getHtml().trim()
          : valueHtml.value.trim();
      }

      // 3. 内容验证
      if (!finalContent) {
        ElMessage.warning("请输入帖子内容");
        return;
      }

      // 4. 提交数据
      const submitData = {
        pid: Number(postData.value.pid),
        fid: Number(postData.value.fid) || 0,
        tid: Number(postData.value.tid) || 0,
        first: postData.value.first || 0,
        author: postData.value.author,
        authorid: Number(postData.value.authorid) || 0,
        subject: postData.value.subject,
        message: finalContent, // 用最终内容（代码视图/可视化视图）
        state: postData.value.state || 0,
        dateline: postData.value.dateline || 0,
        viewCount: postData.value.viewCount || 0,
      };

      try {
        isSubmitting.value = true;
        const res: any = await EditPostDataAPI(submitData);

        if (res.status === 200) {
          ElMessage.success("编辑成功");
          setTimeout(() => router.go(-1), 800);
        } else {
          ElMessage.error(`编辑失败：${res.data || "未知错误"}`);
        }
      } catch (err: any) {
        console.error("提交编辑失败：", err);
        ElMessage.error(`提交失败：${err.data || "网络错误"}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 取消编辑
    const handleCancel = () => router.go(-1);

    // 编辑器配置（保持默认，可按需添加功能）
    const toolbarConfig = {};
    const editorConfig = { placeholder: "请输入内容..." };

    // 编辑器初始化
    const handleCreated = (editor: any) => {
      try {
        if (!editor || !editor.getEditableContainer) {
          throw new Error("获取编辑器实例失败");
        }
        editorRef.value = editor;
        // 初始同步代码视图内容（如果默认是代码视图）
        if (isCodeView.value) codeContent.value = editor.getHtml();
      } catch (err) {
        console.error("编辑器创建失败：", err);
        ElMessage.error("编辑器初始化失败");
      }
    };

    // 编辑器错误处理
    const handleEditorError = (err: Error) => {
      console.error("编辑器错误：", err);
      ElMessage.error("编辑器加载失败，请刷新页面");
    };

    // 组件销毁：销毁编辑器
    onBeforeUnmount(() => {
      if (editorRef.value && typeof editorRef.value.destroy === "function") {
        editorRef.value.destroy();
        editorRef.value = null;
      }
    });

    // 初始化数据
    getPostData();

    return {
      editorRef,
      mode: "default",
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleEditorError,
      valueHtml,
      postData,
      handleSubmit,
      handleCancel,
      isSubmitting,
      // 代码视图相关
      isCodeView,
      codeContent,
      toggleCodeView,
      parsedContent,
    };
  },
});
</script>

<style lang="scss" scoped>
.editpost {
  margin-top: 60px;
  padding: 0 20px;
  padding-bottom: 20px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  background: rgba(255, 255, 255, 1);

  .editpost-form {
    padding-top: 20px;
    background: rgba(255, 255, 255, 0.9);
  }

  .editpost-box {
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 15px;
    overflow: hidden;
    margin: 20px 0;
  }

  /* 工具栏 + 切换按钮容器 */
  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    padding-right: 16px;
  }

  /* 代码视图切换按钮 */
  .code-view-btn {
    color: #4775f0 !important;
    margin: 0 !important;
    padding: 8px 0 !important;
  }

  /* 代码视图容器 */
  .code-view-container {
    overflow: hidden;
    height: 70vh;
  }

  .code-view-pre {
    margin: 0;
    height: 100%;
    border: none;
    overflow: hidden;
    display: flex;
  }

  .code-view-textarea {
    width: 100%;
    height: 100%;
    padding: 12px;
    border: none;
    font-family: "Consolas", "Monaco", monospace;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }

  .editpost-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding-right: 10px;
  }
}
</style>