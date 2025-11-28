<template>
  <div class="newpost">
    <div class="newpost-form">
      <!-- 所在板块显示 -->
      <div class="current-block">
        <span class="block-label">所在板块：</span>
        <span class="block-name">{{ currentBlockName || "未知板块" }}</span>
      </div>

      <el-form
        label-position="right"
        label-width="auto"
        :model="postForm"
        style="max-width: 100%"
      >
        <el-form-item label="帖子标题" label-position="right" required>
          <el-input
            v-model="postForm.subject"
            placeholder="请输入帖子标题（最多80字）"
            maxlength="80"
            @input="validateForm"
          />
          <div class="input-tip">{{ postForm.subject.length }}/80</div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 编辑器/代码视图容器 -->
    <div class="newpost-box">
      <!-- 工具栏切换按钮 -->
      <div class="editor-toolbar">
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          :mode="mode"
        />
      </div>
      <el-button
        type="text"
        size="small"
        @click="toggleCodeView"
        :disabled="isSubmitting"
        class="code-view-btn"
      >
        {{ isCodeView ? "可视化视图" : "查看代码视图" }}
      </el-button>
      <!-- 可视化编辑视图 -->
      <Editor
        v-if="!isCodeView"
        style="min-height: 100px; overflow-y: hidden"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @error="handleEditorError"
        @change="validateForm"
      />

      <!-- 代码视图 -->
      <div v-else class="code-view-container">
        <pre class="code-view-pre">
          <textarea
            v-model="codeContent"
            class="code-view-textarea"
            :disabled="isSubmitting"
            placeholder="此处可直接编辑HTML代码..."
            @input="validateForm"
          ></textarea>
        </pre>
      </div>
    </div>

    <div class="newpost-footer">
      <el-button type="default" @click="handleCancel" :disabled="isSubmitting">
        取消
      </el-button>
      <el-button
        type="primary"
        color="#F6AD47"
        @click="handleSubmit"
        :loading="isSubmitting"
        :disabled="!isFormValid || isSubmitting"
      >
        发布帖子
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  defineComponent,
  computed,
  onErrorCaptured,
  onMounted,
} from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import { InsertPostAPI, GetBlockListAPI } from "@/api/index";

// 发帖请求参数类型
interface InsertPostQuery {
  fid: number;
  tid?: number;
  subject?: string;
  message: string;
}

// 板块信息类型
interface BlockItem {
  id?: number;
  name?: string;
}

export default defineComponent({
  components: { Editor, Toolbar },
  setup() {
    const editorRef = shallowRef();
    const route = useRoute();
    const router = useRouter();
    const isSubmitting = ref(false);
    const isCodeView = ref(false); // 代码视图状态
    const valueHtml = ref("<p></p>"); // 编辑器内容
    const codeContent = ref(""); // 代码视图内容
    const blockList = ref<BlockItem[]>([]);
    const currentBlockName = ref("");

    // 发帖表单数据
    const postForm = ref<InsertPostQuery>({
      fid: Number(route.params.bid) || 0, // 从路由获取板块ID
      subject: "",
      message: "",
    });

    // 表单验证：标题和内容不能为空
    const isFormValid = computed(() => {
      const hasSubject = postForm.value.subject?.trim().length > 0;
      let hasContent = false;

      if (isCodeView.value) {
        hasContent = codeContent.value?.trim().length > 0;
      } else {
        hasContent = valueHtml.value?.replace(/<[^>]*>/g, "").trim().length > 0;
      }

      return hasSubject && hasContent;
    });

    // 验证表单（实时触发）
    const validateForm = () => {
      // 仅触发计算属性更新，无需额外逻辑
    };

    // 切换代码视图/可视化视图
    const toggleCodeView = () => {
      if (isCodeView.value) {
        // 退出代码视图：同步内容到编辑器
        if (editorRef.value) {
          editorRef.value.setHtml(codeContent.value);
          valueHtml.value = codeContent.value;
        }
      } else {
        // 进入代码视图：从编辑器获取HTML
        if (editorRef.value) {
          codeContent.value = editorRef.value.getHtml();
        } else {
          codeContent.value = valueHtml.value;
        }
      }
      isCodeView.value = !isCodeView.value;
    };

    // 获取板块名称
    const getBlockName = async () => {
      try {
        const res: any = await GetBlockListAPI();
        if (res.status === 200 && res.data) {
          blockList.value = res.data;
          const currentBlock = blockList.value.find(
            (block) => block.id === postForm.value.fid
          );
          currentBlockName.value = currentBlock?.name || "未知板块";
        }
      } catch (err) {
        console.error("获取板块信息失败：", err);
        currentBlockName.value = "未知板块";
      }
    };

    // 提交发帖
    const handleSubmit = async () => {
      if (!isFormValid.value) {
        ElMessage.warning("标题和内容不能为空！");
        return;
      }

      // 构造提交数据
      const submitData: InsertPostQuery = {
        fid: postForm.value.fid,
        subject: postForm.value.subject.trim(),
        message: isCodeView.value
          ? codeContent.value.trim()
          : editorRef.value?.getHtml() || valueHtml.value.trim(),
      };

      try {
        isSubmitting.value = true;
        const res: any = await InsertPostAPI(submitData);

        if (res.status === 200) {
          ElMessage.success("帖子发布成功！");
          // 发布成功后跳转：可选跳转到板块页或新帖子页
          setTimeout(() => {
            router.push(`/block/${postForm.value.fid}`);
            // 如果接口返回帖子ID，可跳转到帖子详情页：
            // router.push(`/post/${res.data.pid}`);
          }, 1000);
        } else {
          ElMessage.error(`发布失败：${res.msg || "服务器错误"}`);
        }
      } catch (err: any) {
        console.error("发帖请求失败：", err);
        ElMessage.error(`发布失败：${err.message || "网络异常"}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 取消发帖
    const handleCancel = () => {
      // 如果有未保存内容，提示确认
      if (
        postForm.value.subject ||
        (isCodeView.value ? codeContent.value : valueHtml.value) !== "<p></p>"
      ) {
        ElMessageBox.confirm("您有未保存的内容，确定要放弃发布吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          router.go(-1);
        });
      } else {
        router.go(-1);
      }
    };

    // 编辑器配置
    const toolbarConfig = {};
    const editorConfig = {
      placeholder: "请输入帖子内容...",
      MENU_CONF: {
        // 可自定义编辑器菜单配置，比如上传图片等
        uploadImage: {
          server: "/api/upload/image", // 替换为实际的图片上传接口
          fieldName: "file",
          headers: {
            Authorization: localStorage.getItem("token") || "",
          },
        },
      },
    };

    // 编辑器初始化
    const handleCreated = (editor: any) => {
      editorRef.value = editor;
    };

    // 编辑器错误处理
    const handleEditorError = (err: Error) => {
      console.error("编辑器错误：", err);
      ElMessage.error("编辑器加载失败，请刷新页面");
    };

    // 销毁编辑器
    onBeforeUnmount(() => {
      if (editorRef.value && typeof editorRef.value.destroy === "function") {
        editorRef.value.destroy();
        editorRef.value = null;
      }
    });

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error("组件内错误：", err, info);
      return false;
    });

    // 初始化
    onMounted(() => {
      // 确保fid正确获取
      const bid = Number(route.params.bid);
      if (!isNaN(bid) && bid > 0) {
        postForm.value.fid = bid;
      }
      getBlockName();
    });

    return {
      editorRef,
      mode: "default",
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleEditorError,
      valueHtml,
      postForm,
      handleSubmit,
      handleCancel,
      isSubmitting,
      isCodeView,
      codeContent,
      toggleCodeView,
      isFormValid,
      validateForm,
      currentBlockName,
    };
  },
});
</script>

<style lang="scss" scoped>
.newpost {
  margin-top: 60px;
  padding: 0 20px;
  padding-bottom: 20px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  background: rgba(255, 255, 255, 1);

  .newpost-form {
    padding-top: 20px;
    background: rgba(255, 255, 255, 0.9);

    // 所在板块样式
    .current-block {
      margin-bottom: 15px;
      padding: 10px 15px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 14px;

      .block-label {
        color: #666;
        font-weight: 500;
      }

      .block-name {
        color: #f6ad47;
        font-weight: bold;
        background: #fff8e6;
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 5px;
      }
    }

    .input-tip {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
      text-align: right;
    }
  }

  .newpost-box {
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
  }

  /* 代码视图切换按钮 */
  .code-view-btn {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    color: #d69034 !important;
    margin: 0 !important;
    padding: 8px 0 !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }

  /* 代码视图容器 */
  .code-view-container {
    overflow: hidden;
    // height: 70vh;
    min-height: 100px;
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
    background: #ffffff;
  }

  .newpost-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding-right: 10px;
  }
}
</style>