import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from './store'

const app = createApp(App)

import vant from 'vant'
import 'vant/lib/index.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import axios from 'axios'
app.config.globalProperties.$axios = axios
app.config.globalProperties.$version = "alpha-0.1.0"

app.use(store).use(router).use(vant).use(ElementPlus).mount('#app')

// ============ 移动端原生功能 ============

// 1. 硬件返回键：路由返回上一级，根目录双击退出
let backPressed = 0
document.addEventListener('backbutton', (e: any) => {
  const path = router.currentRoute.value.path
  if (path === '/index' || path === '/') {
    const now = Date.now()
    if (now - backPressed < 2000) {
      (navigator as any).app?.exitApp?.()
    } else {
      backPressed = now;
      (window as any).Toast?.fail?.('再按一次退出')
    }
  } else {
    router.back()
  }
  e.preventDefault()
}, false)

// 2. 状态栏（Cordova deviceready）
let statusBarReady = false
document.addEventListener('deviceready', () => {
  try {
    const win = window as any
    if (win.StatusBar) {
      win.StatusBar.overlaysWebView(false)
      win.StatusBar.styleDefault()
      win.StatusBar.backgroundColorByHexString('#FCF9E0')
      statusBarReady = true
    }
  } catch (e) { /* ignore */ }
  // 处理deeplink
  try {
    const UniversalLinks = (window as any).handleOpenURL
    if (typeof UniversalLinks !== 'undefined') {
      UniversalLinks.subscribe(null, (eventData: any) => {
        handleDeepLink(eventData.url)
      })
    }
  } catch (e) {}
}, false)

// 3. 禁用双指缩放
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
document.addEventListener('gestureend', (e) => e.preventDefault())
document.addEventListener('touchmove', (e: any) => {
  if (e.touches && e.touches.length > 1) e.preventDefault()
}, { passive: false })

// 4. 处理deeplink/分享链接跳转
function handleDeepLink(url: string) {
  try {
    const match = url.match(/post\/(\d+)/)
    if (match) {
      const pid = match[1]
      const goToPost = () => {
        router.push('/post/' + pid)
      }
      // 兼容Cordova确认弹窗
      if ((window as any).navigator?.notification?.confirm) {
        (window as any).navigator.notification.confirm(
          `是否跳转到帖子 #${pid}？`, goToPost, '站内链接', ['是', '否']
        )
      } else {
        if (confirm(`是否跳转到帖子 #${pid}？`)) goToPost()
      }
    }
  } catch (e) {}
}

// 监听Cordova URL变化
;(window as any).handleOpenURL = (url: string) => handleDeepLink(url)

// 启动时检查冷启动URL
try {
  const UniversalLinks = (window as any).UniversalLinks
  if (typeof UniversalLinks !== 'undefined') {
    UniversalLinks.subscribe(null, (eventData: any) => {
      handleDeepLink(eventData.url)
    })
  }
} catch (e) {}
