<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import router from "@/router";
import { GetLatestVersionAPI } from "@/api/index";

export default defineComponent({
  name: "App",
  setup() {
    // 强制更新检查
    onMounted(async () => {
      try {
        const res = await GetLatestVersionAPI();
        if (res.status === 200 && res.data) {
          const ver = res.data;
          const currentVer = (window as any).$version || "0.0.0";
          // 推送 + 强制更新 + 版本号大于当前版本
          if (ver.push === 0 && ver.state === 0 && ver.downloadUrl && compareVersion(ver.version, currentVer) > 0) {
            const { showDialog } = await import("vant");
            showDialog({
              title: "强制更新",
              message: `检测到新版本 ${ver.version}，必须更新后才能继续使用\n\n${ver.message || ""}`,
              confirmButtonText: "立即更新",
              showCancelButton: false,
              closeOnClickOverlay: false,
              allowHtml: true,
            }).then(() => {
              window.open(ver.downloadUrl, '_blank');
            });
          }
        }
      } catch (e) { /* ignore */ }
    });

    function compareVersion(v1: string, v2: string): number {
      const a = v1.split('.').map(Number);
      const b = v2.split('.').map(Number);
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    }

    // 移动端右边缘滑动返回上一级（拦截系统退出行为）
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener("touchend", (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const screenWidth = window.innerWidth;

        // 检测右边缘滑动：起始点靠近右边缘 + 向左滑动距离>50px + 水平滑动为主
        if (
          touchStartX > screenWidth - 30 &&
          deltaX < -50 &&
          Math.abs(deltaX) > Math.abs(deltaY) * 1.5
        ) {
          // 仅在非首页时返回上一级
          if (router.currentRoute.value.path !== "/index") {
            router.back();
          }
          // 阻止默认行为防止退出APP
          e.preventDefault();
        }
      }
    }, { passive: false });

    // 初始化状态栏（移动端）
    initStatusBar();

    function initStatusBar() {
      // 检测是否在移动端WebView环境中
      const ua = navigator.userAgent.toLowerCase();
      const isApp = ua.includes("cordova") || ua.includes("capacitor") || ua.includes("heibbs");

      if (isApp) {
        // 设置页面body的padding-top以适配状态栏
        document.body.style.paddingTop = "env(safe-area-inset-top, 20px)";
        document.body.style.paddingBottom = "env(safe-area-inset-bottom, 0px)";

        // 如果存在Cordova StatusBar插件
        try {
          const win = window as any;
          if (win.StatusBar) {
            win.StatusBar.overlaysWebView(false);
            win.StatusBar.styleDefault();
            win.StatusBar.backgroundColorByHexString("#FFF8E2");
          }
        } catch (e) {
          // 插件不可用
        }
      }
    }

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
  --van-text-color: rgba(83,76,49, 1);
}
body {
  color: rgba(124, 123, 91, 1);
  background: rgb(255, 248, 226);
  -webkit-app-region: drag;
  /* 安全区域适配 - iOS刘海屏和底部Home Indicator */
  padding-top: constant(safe-area-inset-top);    /* iOS 11.0 */
  padding-top: env(safe-area-inset-top);          /* iOS 11.2+ */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: constant(safe-area-inset-left);
  padding-left: env(safe-area-inset-left);
  padding-right: constant(safe-area-inset-right);
  padding-right: env(safe-area-inset-right);
}
::-webkit-scrollbar {
  display: none;
}
/* 防止长按选择和文本选择导致的页面跳动 */
.w-e-text-container {
  overflow-anchor: none;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
