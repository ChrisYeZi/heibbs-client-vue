<template>
  <div class="settingBox">
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

    <!-- 版本列表 -->
    <div class="versionList">
      <div class="listTitle">版本历史</div>
      <van-cell-group border inset>
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
import { ChangeUserPassword } from "@/api/index";
import { GetVersionListAPI } from "@/api/index"; // 导入版本列表接口
import config from "@/config/index"; // 导入配置文件

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
      versionDetailShow: false, // 版本详情弹窗显示
      currentDetailVersion: null, // 当前查看的版本详情
    };
  },
  mounted() {
    // 获取当前版本
    this.currentVersion = this.$version || "未知版本";
    // 获取版本列表
    this.getVersionList();
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
      const downloadUrl = version.downloadUrl || `${config.avatarUrl}/default/version/${version.version}.apk`;
      if (!version.downloadUrl) {
        showToast({ message: "暂无下载地址，请联系管理员", duration: 2000 });
        return;
      }
      window.open(downloadUrl, '_blank');
      showToast({ message: `开始下载 ${version.version} 版本...`, duration: 2000 });
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
          showToast(res.msg || "密码修改失败");
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
  },
};
</script>

<style lang="scss" scoped>
.settingBox {
  margin-top: 70px;
  padding: 0 15px;

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