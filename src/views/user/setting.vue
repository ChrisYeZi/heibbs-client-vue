<template>
  <div class="settingBox">
    <!-- 头像上传 -->
    <div class="avatarUpload">
      <div class="listTitle">头像设置</div>
      <div class="avatar-preview-row">
        <img :src="currentAvatarUrl" class="avatar-preview-img" alt="头像" />
        <div class="avatar-actions">
          <input
            type="file"
            ref="avatarInput"
            accept="image/*"
            style="display: none"
            @change="onAvatarFileSelected"
          />
          <van-button
            size="small"
            type="primary"
            @click="$refs.avatarInput.click()"
            >选择图片</van-button
          >
        </div>
      </div>
    </div>

    <!-- 头像裁剪对话框 -->
    <van-dialog
      v-model:show="cropDlgVisible"
      title="裁剪头像（1:1）"
      width="90%"
      :show-cancel-button="false"
      :show-confirm-button="false"
    >
      <div class="crop-container">
        <div class="crop-canvas-wrap">
          <canvas
            ref="cropCanvas"
            width="300"
            height="300"
            style="
              width: 300px;
              height: 300px;
              border: 2px dashed #f6ad47;
              border-radius: 4px;
              touch-action: none;
              cursor: move;
            "
            @mousedown="cropDragStart"
            @mousemove="cropDragMove"
            @mouseup="cropDragEnd"
            @mouseleave="cropDragEnd"
            @touchstart.prevent="cropDragStart"
            @touchmove.prevent="cropDragMove"
            @touchend="cropDragEnd"
            @wheel.prevent="cropWheel"
          />
        </div>
        <div class="crop-zoom-row">
          <van-button
            size="small"
            icon="minus"
            @click="cropZoom(-0.2)"
            :disabled="cropScale <= 0.5"
            >-</van-button
          >
          <span
            style="
              font-size: 13px;
              color: #728567;
              min-width: 50px;
              text-align: center;
            "
            >{{ Math.round(cropScale * 100) }}%</span
          >
          <van-button
            size="small"
            icon="plus"
            @click="cropZoom(0.2)"
            :disabled="cropScale >= 4"
            >+</van-button
          >
        </div>
        <div class="crop-actions">
          <van-button size="small" @click="cropDlgVisible = false"
            >取消</van-button
          >
          <van-button
            size="small"
            type="primary"
            @click="doCropAndUpload"
            style="background: #f6ad47; border-color: #f6ad47"
            >裁剪并上传</van-button
          >
        </div>
      </div>
    </van-dialog>

    <!-- 水印设置开关 -->
    <div class="watermarkToggle">
      <div class="listTitle">上传相关设置</div>
      <div class="toggle-row">
        <span style="font-size: 14px; color: #728567"
          >上传的帖子图片自动添加作者水印</span
        >
        <van-switch
          v-model="watermarkEnabled"
          @change="toggleWatermark"
          active-color="#F6AD47"
        />
      </div>
    </div>

    <!-- 修改密码表单 -->
    <div class="passwordModify">
      <van-cell-group border inset>
        <van-field
          v-model="form.oldPassword"
          type="password"
          label="旧密码"
          placeholder="请输入当前密码"
          :rules="[{ required: true, message: '请输入旧密码' }]"
          clearable
        />
        <van-field
          v-model="form.newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码（至少6位）"
          :rules="[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '新密码至少6位字符' },
          ]"
          clearable
        />
        <van-field
          v-model="form.confirmPassword"
          type="password"
          label="确认新密码"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请确认新密码' },
            {
              validator: validateConfirmPassword,
              message: '两次密码输入不一致',
            },
          ]"
          clearable
        />
      </van-cell-group>
      <van-button
        class="submitBtn"
        type="primary"
        @click="handleModifyPassword"
        :loading="isLoading"
      >
        确认修改
      </van-button>
    </div>

    <!-- 当前版本信息 -->
    <div class="currentVersion">
      <span>当前版本：{{ currentVersion }}</span>
      <span
        v-if="latestVersionInfo"
        class="latestTag"
        :class="{ needUpdate: isNeedUpdate }"
      >
        {{
          isNeedUpdate
            ? `最新版本：${latestVersionInfo.version}`
            : "已是最新版本"
        }}
      </span>
    </div>

    <!-- 版本列表（可折叠） -->
    <div class="versionList">
      <div
        class="listTitle"
        @click="versionListExpanded = !versionListExpanded"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        "
      >
        <span>版本历史 ({{ versionList.length }})</span>
        <span style="font-size: 12px; color: #728567">{{
          versionListExpanded ? "▲ 收起" : "▼ 展开"
        }}</span>
      </div>
      <van-cell-group border inset v-show="versionListExpanded">
        <van-cell
          v-for="version in versionList"
          :key="version.id"
          :title="`版本 ${version.version}`"
          :label="`发布时间：${formatTime(version.time)}`"
          is-link
          @click="showVersionDetail(version)"
        >
          <template #right-icon>
            <span
              v-if="version.id === latestVersionInfo?.id"
              class="latestBadge"
              >最新</span
            >
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 更新按钮 -->
    <div v-if="isNeedUpdate" class="updateBtnBox">
      <van-button
        type="primary"
        size="large"
        @click="handleUpdate"
        class="updateBtn"
      >
        立即更新到 {{ latestVersionInfo.version }}
      </van-button>
    </div>

    <div class="settingList">其他设置预留区域</div>
    <div class="quitLogin" @click="quit()">退出登录</div>
  </div>

  <!-- 版本详情弹窗 -->
  <van-dialog v-model:show="versionDetailShow" title="版本详情" width="85%">
    <div class="versionDetail">
      <p><strong>版本号：</strong>{{ currentDetailVersion?.version }}</p>
      <p>
        <strong>发布时间：</strong>{{ formatTime(currentDetailVersion?.time) }}
      </p>
      <p>
        <strong>更新说明：</strong>{{ currentDetailVersion?.message || "无" }}
      </p>
      <p v-if="currentDetailVersion?.state === 0">
        <strong>强制更新：</strong>是
      </p>
      <p v-else><strong>强制更新：</strong>否</p>
    </div>
    <template #footer>
      <van-button @click="versionDetailShow = false">关闭</van-button>
      <van-button
        type="primary"
        @click="handleDownload(currentDetailVersion)"
        v-if="
          currentDetailVersion?.id === latestVersionInfo?.id && isNeedUpdate
        "
      >
        下载更新
      </van-button>
    </template>
  </van-dialog>

  <!-- 弹出框 -->
  <van-toast
    v-model:show="msgShow"
    style="padding: 0; background: rgba(0, 0, 0, 0)"
  >
    <template #message>
      <messagebar-vue :content="content"></messagebar-vue>
    </template>
  </van-toast>
</template>

<script>
import { showConfirmDialog, showToast, showDialog } from "vant";
import router from "@/router";
import store from "@/store";
import MessagebarVue from "@/components/common/Messagebar.vue";
import {
  ChangeUserPassword,
  UploadAvatarAPI,
  GetUserAvatarAPI,
  GetSystemConfigAPI,
  SetSystemConfigAPI,
} from "@/api/index";
import { GetVersionListAPI } from "@/api/index";
import config from "@/config/index";

export default {
  name: "setting",
  components: {
    MessagebarVue,
  },
  data() {
    return {
      msgShow: false,
      content: "",
      isLoading: false,
      form: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      // 版本相关数据
      versionList: [], // 版本列表
      currentVersion: "", // 当前版本
      latestVersionInfo: null, // 最新版本信息
      isNeedUpdate: false, // 是否需要更新
      versionListExpanded: false,
      versionDetailShow: false,
      currentDetailVersion: null,
      // 头像相关
      currentAvatarUrl: config.avatarUrl + "/user/avatar/default.png",
      cropDlgVisible: false,
      cropImage: null,
      cropScale: 1,
      cropPanX: 0,
      cropPanY: 0,
      cropDragging: false,
      cropDragLastX: 0,
      cropDragLastY: 0,
      // 水印开关
      watermarkEnabled: true,
    };
  },
  mounted() {
    this.currentVersion = this.$version || "未知版本";
    this.getVersionList();
    this.loadCurrentAvatar();
    this.loadWatermarkConfig();
  },
  beforeUnmount() {
    this.cropDragging = false;
    document.removeEventListener("mousemove", this._docMouseMove);
    document.removeEventListener("mouseup", this._docMouseUp);
    document.removeEventListener("touchmove", this._docTouchMove);
    document.removeEventListener("touchend", this._docTouchUp);
  },
  methods: {
    // 时间格式化（秒级时间戳转日期）
    formatTime(timeStr) {
      if (!timeStr) return "未知时间";
      try {
        const timestamp = Number(timeStr) * 1000;
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      } catch (e) {
        return "未知时间";
      }
    },

    // 获取版本列表
    async getVersionList() {
      try {
        const res = await GetVersionListAPI();
        if (res.status === 200 && res.data?.records) {
          this.versionList = res.data.records;
          // 找到最新版本（按id降序或时间戳降序）
          this.latestVersionInfo = this.versionList.sort(
            (a, b) => b.id - a.id
          )[0];
          // 判断是否需要更新（当前版本与最新版本对比，且已推送）
          this.isNeedUpdate =
            this.latestVersionInfo.push === 0 &&
            this.currentVersion !== this.latestVersionInfo.version;
        }
      } catch (error) {
        console.error("获取版本列表失败:", error);
        showToast("获取版本信息失败");
      }
    },

    // 显示版本详情
    showVersionDetail(version) {
      this.currentDetailVersion = version;
      this.versionDetailShow = true;
    },

    // 处理更新逻辑
    handleUpdate() {
      showConfirmDialog({
        title: "版本更新",
        message: `检测到最新版本 ${
          this.latestVersionInfo.version
        }，是否立即下载更新？\n\n更新说明：${
          this.latestVersionInfo.message || "无"
        }`,
        confirmButtonText: "立即下载",
        cancelButtonText: "稍后更新",
        confirmButtonColor: "#f7ba1e",
      }).then(() => {
        this.handleDownload(this.latestVersionInfo);
      });
    },

    // 下载更新包
    handleDownload(version) {
      if (!version?.version) return;
      // 优先使用后台配置的下载地址，否则生成默认地址
      const downloadUrl =
        version.downloadUrl ||
        `${config.avatarUrl}/default/version/${version.version}.apk`;
      if (!version.downloadUrl) {
        showToast({ message: "暂无下载地址，请联系管理员", duration: 2000 });
        return;
      }
      window.open(downloadUrl, "_blank");
      showToast({
        message: `开始下载 ${version.version} 版本...`,
        duration: 2000,
      });
      if (version.state === 0) {
        showDialog({
          title: "强制更新",
          message: "此版本为强制更新，下载完成后请安装并重新打开应用",
          confirmButtonText: "我知道了",
          showCancelButton: false,
        });
      }
      this.versionDetailShow = false;
    },

    // 验证确认密码
    validateConfirmPassword(rule, value) {
      return value === this.form.newPassword;
    },

    // 修改密码逻辑
    async handleModifyPassword() {
      try {
        // 简单表单验证
        if (!this.form.oldPassword) {
          showToast("请输入旧密码");
          return;
        }
        if (this.form.newPassword.length < 6) {
          showToast("新密码至少6位字符");
          return;
        }
        if (this.form.newPassword !== this.form.confirmPassword) {
          showToast("两次密码输入不一致");
          return;
        }

        this.isLoading = true;
        // 调用修改密码接口
        const res = await ChangeUserPassword({
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
        });

        // 处理接口响应
        if (res.status === 200) {
          this.content = "密码修改成功，请重新登录";
          this.msgShow = true;
          // 清空表单
          this.form = { oldPassword: "", newPassword: "", confirmPassword: "" };
          // 延迟退出登录
          setTimeout(() => {
            localStorage.clear();
            store.commit("user/SET_USERLOGIN", false);
            store.commit("user/SET_USERINFO", {});
            router.push("/login");
          }, 1500);
        } else {
          showToast(res.data || "密码修改失败");
        }
      } catch (error) {
        console.error("修改密码失败:", error);
        showToast("网络错误，修改失败");
      } finally {
        this.isLoading = false;
      }
    },

    // 退出登录
    quit() {
      showConfirmDialog({
        message:
          "你真的要退出吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗吗？？？？？？？？？？？？？？？？？？？？？？？？？？",
        confirmButtonColor: "rgba(251, 107, 107, 1)",
      })
        .then(() => {
          localStorage.clear();
          this.content = "成功退出登录";
          store.commit("user/SET_USERLOGIN", false);
          store.commit("user/SET_USERINFO", {});
          this.msgShow = true;
          setTimeout(() => {
            router.push("/login");
          }, 1000);
        })
        .catch(() => {
          // on cancel
        });
    },
    // 头像选择
    onAvatarFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          this.cropImage = img;
          this.cropScale = 1;
          this.cropPanX = 0;
          this.cropPanY = 0;
          this.cropDlgVisible = true;
          this.$nextTick(() => this.drawCropPreview());
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    drawCropPreview() {
      const canvas = this.$refs.cropCanvas;
      if (!canvas || !this.cropImage) return;
      const ctx = canvas.getContext("2d");
      const img = this.cropImage;
      ctx.clearRect(0, 0, 300, 300);
      const srcSize = Math.round(
        Math.min(img.width, img.height) / this.cropScale
      );
      const cx = Math.round(img.width / 2 + this.cropPanX);
      const cy = Math.round(img.height / 2 + this.cropPanY);
      let sx = Math.round(cx - srcSize / 2);
      let sy = Math.round(cy - srcSize / 2);
      if (sx < 0) sx = 0;
      if (sy < 0) sy = 0;
      if (sx + srcSize > img.width) sx = img.width - srcSize;
      if (sy + srcSize > img.height) sy = img.height - srcSize;
      ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, 300, 300);
    },
    cropZoom(delta) {
      this.cropScale = Math.max(0.5, Math.min(4, this.cropScale + delta));
      this.drawCropPreview();
    },
    cropWheel(e) {
      this.cropZoom(e.deltaY > 0 ? -0.15 : 0.15);
    },
    cropDragStart(e) {
      this.cropDragging = true;
      const pt = e.touches ? e.touches[0] : e;
      this.cropDragLastX = pt.clientX;
      this.cropDragLastY = pt.clientY;
      // 在 document 上监听移动和释放，确保拖出 canvas 也能继续
      document.addEventListener("mousemove", this._docMouseMove);
      document.addEventListener("mouseup", this._docMouseUp);
      document.addEventListener("touchmove", this._docTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", this._docTouchUp);
    },
    _docMouseMove(e) {
      this.cropDragMove(e);
    },
    _docMouseUp() {
      this.cropDragEnd();
    },
    _docTouchMove(e) {
      this.cropDragMove(e);
    },
    _docTouchUp() {
      this.cropDragEnd();
    },
    cropDragMove(e) {
      if (!this.cropDragging || !this.cropImage) return;
      const pt = e.touches ? e.touches[0] : e;
      const dx = pt.clientX - this.cropDragLastX;
      const dy = pt.clientY - this.cropDragLastY;
      this.cropDragLastX = pt.clientX;
      this.cropDragLastY = pt.clientY;
      const srcSize =
        Math.min(this.cropImage.width, this.cropImage.height) / this.cropScale;
      // 反向：拖拽方向 = 图片移动方向（鼠标右移→看左边，cropPanX减小）
      this.cropPanX -= dx * (srcSize / 300);
      this.cropPanY -= dy * (srcSize / 300);
      this.drawCropPreview();
    },
    cropDragEnd() {
      this.cropDragging = false;
      document.removeEventListener("mousemove", this._docMouseMove);
      document.removeEventListener("mouseup", this._docMouseUp);
      document.removeEventListener("touchmove", this._docTouchMove);
      document.removeEventListener("touchend", this._docTouchUp);
    },
    doCropAndUpload() {
      const canvas = this.$refs.cropCanvas;
      if (!canvas || !this.cropImage) return;
      canvas.toBlob(
        async (blob) => {
          const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          const r = await UploadAvatarAPI(file);
          if (r.status === 200) {
            this.currentAvatarUrl = config.avatarUrl + r.data;
            showToast("头像上传成功");
            this.cropDlgVisible = false;
          } else {
            showToast("上传失败: " + (r.data || r.msg || ""));
          }
        },
        "image/jpeg",
        0.9
      );
    },
    loadCurrentAvatar() {
      const uid = store.state.user?.info?.user?.uid;
      if (!uid) return;
      GetUserAvatarAPI(uid)
        .then((res) => {
          if (res.status === 200 && res.data)
            this.currentAvatarUrl = config.avatarUrl + res.data;
        })
        .catch(() => {});
    },
    async loadWatermarkConfig() {
      try {
        const r = await GetSystemConfigAPI();
        if (r.status === 200)
          this.watermarkEnabled = r.data.watermark_enabled !== "false";
      } catch (e) {}
    },
    async toggleWatermark(val) {
      const r = await SetSystemConfigAPI(
        "watermark_enabled",
        val ? "true" : "false"
      );
      if (r.status !== 200) {
        this.watermarkEnabled = !val;
        showToast("设置失败");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.settingBox {
  margin-top: 10px;
  padding: 0 10px;

  // 当前版本样式
  .currentVersion {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    margin-bottom: 15px;

    .latestTag {
      font-size: 14px;

      &.needUpdate {
        color: #f7ba1e;
        font-weight: 500;
      }
    }
  }

  // 版本列表样式
  .versionList {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;

    .listTitle {
    }

    .latestBadge {
      background: #f7ba1e;
      color: #fff;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 5px;
      line-height: 3.5em;
    }
  }

  // 更新按钮样式
  .updateBtnBox {
    margin-bottom: 15px;

    .updateBtn {
      width: 100%;
      background: #f7ba1e;
      border: none;
    }
  }

  // 修改密码表单样式
  .avatarUpload {
    background: rgba(255, 255, 255, 1);
    margin: 14px 0px;
    border-radius: 10px;
    padding: 10px;
    .avatar-preview-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(246, 173, 71, 0.25);
      margin-top: 8px;
    }
    .avatar-preview-img {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid #f6ad47;
      object-fit: cover;
    }
    .avatar-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
  .crop-container {
    padding: 10px;
    .crop-canvas-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 10px;
    }
    .crop-zoom-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 8px 0;
    }
    .crop-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }

  .watermarkToggle {
    margin: 10px 0px;
    background: rgba(255, 255, 255, 1);
    border-radius: 10px;
    padding: 10px;
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(246, 173, 71, 0.25);
      margin-top: 8px;
    }
  }

  .passwordModify {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;

    .submitBtn {
      width: 100%;
      margin-top: 20px;
      background: rgba(244, 170, 41, 0.8);
      border: none;

      &:active {
        background: rgba(255, 209, 130, 0.9);
      }
    }
  }

  .settingList {
    padding: 20px 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    margin-bottom: 20px;
    text-align: center;
    color: #999;
  }

  .quitLogin {
    padding: 20px 10px;
    background: rgba(244, 170, 41, 0.7);
    border-radius: 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 550;
  }

  .quitLogin:active {
    transition: 0.05s;
    background: rgba(255, 209, 130, 0.9);
  }
}

// 版本详情弹窗样式
.versionDetail {
  padding: 10px 30px;
  p {
    margin: 8px 0;
    line-height: 1.5;
  }
}
</style>