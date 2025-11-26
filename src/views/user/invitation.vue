<template>
  <div class="invitationBox">
    <!-- 创建邀请码按钮 -->
    <div class="createInvitation-submit" @click="createInvitation()">
      <van-icon name="ticket-o" class="btn-icon" />
      创建邀请码
    </div>

    <!-- 登机牌风格邀请码列表 -->
    <div class="invitationList" v-if="invitation && invitation.length">
      <!-- 登机牌主体 -->
      <div
        class="boarding-pass"
        v-for="(item, index) in invitation"
        :key="index"
      >
        <!-- 登机牌头部 -->
        <div class="pass-header">
          <div class="pass-logo">
            <van-icon name="airplane" class="logo-icon"
              ><img
                src="../../assets/img/login-bg.png"
                alt="罗小黑妖灵论坛Logo"
            /></van-icon>
            <span class="logo-text">罗小黑妖灵论坛</span>
          </div>
          <div class="pass-tag">邀请凭证</div>
        </div>

        <!-- 撕裂线 -->
        <div class="tear-line">
          <span v-for="(i, idx) in 15" :key="idx" class="tear-dot"></span>
        </div>

        <!-- 登机牌内容区 -->
        <div class="pass-content">
          <!-- 邀请码 -->
          <div class="pass-field code-field">
            <label class="field-label">邀请码</label>
            <div class="field-value code-container">
              <span v-if="!item.usetime" class="code-text">{{
                item.code
              }}</span>
              <span v-if="item.usetime" class="code-text used-time">{{
                item.code
              }}</span>
              <van-button
                size="mini"
                type="primary"
                color="#f4aa29"
                @click.stop="copyCode(item.code)"
                class="copy-btn"
                v-if="!item.usetime"
              >
                复制
              </van-button>
            </div>
          </div>

          <!-- 创建时间 -->
          <div class="pass-field">
            <label class="field-label">创建时间</label>
            <span class="field-value">{{
              formatTimestamp(item.createtime)
            }}</span>
          </div>

          <!-- 使用人（可选） -->
          <div class="pass-field" v-if="item.recipient != 0">
            <label class="field-label">使用人</label>
            <span class="field-value">{{ item.recipient }}</span>
          </div>

          <!-- 使用时间（可选，标记已使用状态） -->
          <div class="pass-field" v-if="item.usetime">
            <label class="field-label">使用时间</label>
            <span class="field-value">{{ formatTimestamp(item.usetime) }}</span>
          </div>
        </div>

        <!-- 登机牌底部：模拟条码区域 -->
        <div class="pass-footer">
          <div class="barcode-placeholder">
            <!-- 模拟条码（可用真实条码组件替换，此处用渐变模拟） -->
            <div class="barcode-lines">
              <div class="barcode-code">heibbs - {{ item.code }}</div>
            </div>
          </div>
          <div class="footer-text">有效期至：未使用永久有效</div>
        </div>
      </div>
    </div>

    <!-- 空状态（适配风格） -->
    <div class="noInvitation" v-else-if="invitation !== null">
      <van-empty
        image="http://www.heibbs.net:8081/api/attachment/200000/404.png"
        :image-size="[250, 280]"
        description="暂无邀请码"
        class="empty-style"
      />
    </div>

    <!-- 弹出框（保持原有逻辑） -->
    <van-toast
      v-model:show="msgShow"
      style="padding: 0; background: rgba(0, 0, 0, 0)"
    >
      <template #message>
        <messagebar-vue :content="content"></messagebar-vue>
      </template>
    </van-toast>

    <!-- 复制结果提示（适配色调） -->
    <van-toast
      v-model:show="copyToast.show"
      :message="copyToast.message"
      :type="copyToast.type"
      duration="2000"
      :color="copyToast.type === 'success' ? '#ff6b35' : '#ff4d4f'"
    />
  </div>
</template>

<script>
import { showConfirmDialog, Toast, Icon } from "vant"; // 引入Icon组件
import config from "@/config/index";
import MessagebarVue from "@/components/common/Messagebar.vue";
import { ElMessage } from 'element-plus'
import { GetUserInvitationAPI, CreateInvitationAPI } from "../../api/index";

export default {
  name: "invitation",
  components: { MessagebarVue, [Icon.name]: Icon }, // 注册Icon组件
  data() {
    return {
      imgUrl: config.imgUrl,
      invitation: null,
      msgShow: false,
      content: "",
      copyToast: {
        show: false,
        message: "",
        type: "success",
      },
    };
  },
  created() {
    this.getInvitationData();
  },
  methods: {
    // 时间格式化（保持原有逻辑，微调文案）
    formatTimestamp(timestamp) {
      if (!timestamp || isNaN(timestamp)) {
        return "----年--月--日";
      }
      const date = new Date(
        timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
      );
      const year = String(date.getFullYear()); // 登机牌风格用完整年份更正式
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}年${month}月${day}日`;
    },

    // 创建邀请码（保持原有逻辑）
    createInvitation() {
      showConfirmDialog({
        message:
          "注意: 请您对受邀请用户尽到相关法规制度的告知义务,否则受邀请用户的违规行为可能会导致您被会馆追责。 ( 创建邀请码需花费200妖灵币 )",
        confirmButtonColor: "#ff6b35", // 适配登机牌主色调
        cancelButtonColor: "#999",
      })
        .then(() => {
          CreateInvitationAPI({})
            .then((res) => {
              if (res.status == 200) {
                this.content = res.data;
                this.getInvitationData();
              } else {
                this.content = res.data;
              }
              this.msgShow = true;
            })
            .catch((err) => {
              this.content = "创建失败，请稍后重试";
              this.msgShow = true;
            });
        })
        .catch(() => {});
    },

    // 获取邀请码列表（保持原有逻辑）
    getInvitationData() {
      GetUserInvitationAPI({})
        .then((res) => {
          if (res.status == 200) {
            this.invitation = Array.isArray(res.data) ? res.data : [];
          } else {
            this.content = res.msg || "获取邀请码失败";
            this.msgShow = true;
            this.invitation = [];
          }
        })
        .catch((err) => {
          this.content = "网络错误，获取邀请码失败";
          this.msgShow = true;
          this.invitation = [];
        });
    },

    // 复制邀请码（保持原有逻辑）
    async copyCode(code) {
      if (!code) {
        this.showCopyToast("邀请码为空，无法复制", "error");
        return;
      }
      try {
        await navigator.clipboard.writeText(code);
        this.showCopyToast("复制成功");
      } catch (err) {
        console.error("复制失败", err);
        this.fallbackCopyCode(code);
      }
    },

    // 降级复制方案（保持原有逻辑）
    fallbackCopyCode(code) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        successful
          ? this.showCopyToast("复制成功")
          : this.showCopyToast("复制失败，请手动复制", "error");
      } catch (err) {
        console.error("降级复制失败", err);
        this.showCopyToast("复制失败，请手动复制", "error");
      }
    },

    // 显示复制提示（保持原有逻辑）
    showCopyToast(message, type = "success") {
      this.copyToast = { show: true, message, type };
    },
  },
};
</script>

<style lang="scss" scoped>
// 全局容器样式
.invitationBox {
  margin-top: 70px;
  padding: 0 15px;

  // 创建按钮
  .createInvitation-submit {
    width: 85%;
    max-width: 400px;
    margin: 20px auto;
    padding: 14px 10px;
    background: #f4aa29; // 渐变主色调
    border-radius: 8px;
    text-align: center;
    color: #fff;
    font-weight: 550;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(255, 167, 53, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .btn-icon {
      font-size: 18px;
    }

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 4px rgba(255, 107, 53, 0.2);
    }
  }

  // 空状态样式优化
  .noInvitation {
    padding: 50px 0;
    .empty-style {
      .van-empty__description {
        color: #886f58; // 复古文字色
        font-size: 14px;
      }
    }
  }
}
.invitationList {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
// 登机牌核心样式：复古卡片+分层效果
.boarding-pass {
  max-width: 400px;
  width: 90%;
  max-height: 400px;
  background-color: #fffefb; // 米白色，模拟纸质登机牌
  border: 1px solid #ffe3a8; // 浅橙色边框
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(255, 170, 80, 0.15); // 柔和阴影
  overflow: hidden;
  margin-bottom: 16px;
  font-family: "Arial", "Microsoft YaHei", sans-serif; // 模拟印刷字体
}

// 登机牌头部：航司标识区域
.pass-header {
  padding: 12px 16px;
  background-color: #fff9ed; // 浅橙色背景
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #ffc299; // 虚线分隔

  .pass-logo {
    display: flex;
    align-items: center;
    gap: 3px;
    .logo-icon {
      img {
        width: 30px;
      }
    }
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #c7850a; // 深橙色文字，模拟航司标识
    }
  }

  .pass-tag {
    font-size: 12px;
    color: #ffb835;
    background-color: #fff0e6;
    padding: 3px 8px;
    border-radius: 12px;
    border: 1px solid #ffd699;
  }
}

// 撕裂线
.tear-line {
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  height: 7px;
  background-color: #fff9ed;
  border-bottom: 1px dashed #ffdb99;

  .tear-dot {
    display: inline-block;
    width: 4px;
    height: 12px;
    background-color: #fffefb;
    border-radius: 0 0 50% 50%;
  }
}

// 登机牌内容区
.pass-content {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  // 字段通用样式
  .pass-field {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .field-label {
      font-size: 12px;
      color: #886f58;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field-value {
      font-size: 15px;
      color: rgba(0, 0, 0, 0.7);
    }

    // 邀请码字段特殊样式
    &.code-field {
      .field-value {
        font-size: 16px;
        font-weight: 500;
      }
    }

    // 已使用时间特殊样式
    .used-time {
      text-decoration: line-through; // 横线标记已使用
    }
  }

  // 邀请码容器（保持复制按钮布局）
  .code-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;

    .code-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 1px; // 字符间距放大，增强邀请码辨识度
      color: rgba(0, 0, 0, 0.7);
    }

    .copy-btn {
      flex-shrink: 0;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 12px;
    }
  }
}

// 登机牌底部：模拟条码区域
.pass-footer {
  padding: 12px 16px;
  background-color: #fff9ed;
  border-top: 1px dashed #ffd699;

  // 模拟条码（渐变+竖线）
  .barcode-placeholder {
    height: 65px;
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .barcode-lines {
      width: 80%;
      height: 50px;
      background: url("../../assets/img/heibbsBC.png");
      background-repeat: repeat-x;
      background-position: center 17px;
      /* 保持图片原始尺寸（避免拉伸导致模糊） */
      background-size: auto 100%;
      opacity: 0.7;
      .barcode-code {
        width: 95%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }

  // 底部文字
  .footer-text {
    font-size: 11px;
    color: #886f58;
    text-align: center;
    letter-spacing: 0.3px;
  }
}

// 修复vant组件样式冲突（可选）
::v-deep .van-cell-group {
  background-color: transparent !important; // 清除vant默认背景，避免覆盖登机牌样式
}
</style>