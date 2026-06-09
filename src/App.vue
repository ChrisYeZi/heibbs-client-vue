<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import router from "@/router";
import store from "@/store";
import { GetLatestVersionAPI } from "@/api/index";

export default defineComponent({
  name: "App",
  setup() {
    // 状态栏背景色（跟随 App 背景 #FCF9E0）
    const setStatusBar = () => {
      try {
        const plus = (window as any).plus;
        if (plus?.navigator?.setStatusBarBackground) {
          plus.navigator.setStatusBarBackground("#FCF9E0");
        }
      } catch (e) {
        /* ignore */
      }
    };
    document.addEventListener("plusready", setStatusBar, false);
    // 页面每次回到前台也重新设置
    document.addEventListener("resume", setStatusBar, false);

    // 强制更新检查
    onMounted(async () => {
      try {
        const res = await GetLatestVersionAPI();
        if (res.status === 200 && res.data) {
          const ver = res.data;
          const currentVer = (window as any).$version || "0.0.0";
          // 推送 + 强制更新 + 版本号大于当前版本
          if (
            ver.push === 0 &&
            ver.state === 0 &&
            ver.downloadUrl &&
            compareVersion(ver.version, currentVer) > 0
          ) {
            const { showDialog } = await import("vant");
            showDialog({
              title: "强制更新",
              message: `检测到新版本 ${
                ver.version
              }，必须更新后才能继续使用\n\n${ver.message || ""}`,
              confirmButtonText: "立即更新",
              showCancelButton: false,
              closeOnClickOverlay: false,
              allowHtml: true,
            }).then(() => {
              window.open(ver.downloadUrl, "_blank");
            });
          }
        }
      } catch (e) {
        /* ignore */
      }
    });

    function compareVersion(v1: string, v2: string): number {
      const a = v1.split(".").map(Number);
      const b = v2.split(".").map(Number);
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    }

    // 移动端右边缘滑动返回上一级（拦截系统退出行为）
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (e: TouchEvent) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          const screenWidth = window.innerWidth;
          const absDx = Math.abs(deltaX);
          const absDy = Math.abs(deltaY);
          if (absDx < 50 || absDx < absDy) return;

          // 全屏左向右滑 → 打开 NavbarUser（侧边栏）
          if (deltaX > 50 && touchStartX < screenWidth * 0.7) {
            store.commit("system/SET_NAVBARUSER_SHOW", true);
            e.preventDefault();
            return;
          }

          // 右边缘向左滑 → 返回上一级（非首页）
          if (deltaX < -50 && touchStartX > screenWidth - 30) {
            if (router.currentRoute.value.path !== "/index") {
              router.back();
            }
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );

    // 为代码块注入复制按钮（MutationObserver 监听 DOM 变化）
    const injectCodeButtons = () => {
      document.querySelectorAll("code:not(.has-copy)").forEach((el: any) => {
        el.classList.add("has-copy");
        el.style.position = el.style.position || "relative";
        const btn = document.createElement("button");
        btn.className = "code-copy-btn";
        btn.textContent = "复制";
        btn.onclick = (e: Event) => {
          e.stopPropagation();
          navigator.clipboard.writeText(el.textContent || "").then(() => {
            btn.textContent = "已复制";
            setTimeout(() => {
              btn.textContent = "复制";
            }, 1500);
          });
        };
        el.appendChild(btn);
      });
    };
    const codeObserver = new MutationObserver(() => injectCodeButtons());
    codeObserver.observe(document.body, { childList: true, subtree: true });
    injectCodeButtons();

    return {};
  },
});
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
}
:root:root {
  --van-cell-background: rgba(255, 248, 226, 0);
  --van-cell-active-color: rgba(0, 0, 0, 0.05);
  --van-button-default-background: rgba(244, 170, 41, 0);
  --van-button-primary-background: rgba(244, 170, 41, 0.7);
  --van-button-primary-border-color: rgba(0, 0, 0, 0);
  --van-button-default-color: rgba(124, 123, 91, 1);
  --van-button-primary-color: rgba(255, 255, 255, 0.9);
  --van-dialog-background: rgb(255, 248, 226);
  --van-cell-text-color: rgba(124, 123, 91, 1);
  --van-text-color: rgba(83, 76, 49, 1);
}
body {
  color: rgba(124, 123, 91, 1);
  background: rgb(255, 248, 226);
  -webkit-app-region: drag;
  /* UniApp 状态栏高度（由 HBuilder 设置非全屏沉浸式后自动注入） */
  padding-top: var(--status-bar-height, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
::-webkit-scrollbar {
  display: none;
}
/* 帖子内图片自适应 */
.post-content img,
.comment-content img,
.post-detail img {
  max-width: 100%;
  height: auto;
}
/* 代码块样式 */
.post-content code,
.comment-content code,
.post-detail code {
  display: block;
  background: #2d2d2d;
  color: #e0e0e0;
  padding: 12px 40px 12px 16px;
  border-radius: 6px;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-break: break-all;
}
.code-copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: #ccc;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
}
.code-copy-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}
/* 防止长按选择和文本选择导致的页面跳动 */
.w-e-text-container {
  overflow-anchor: none;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
