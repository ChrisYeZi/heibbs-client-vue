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
app.config.globalProperties.$version = "beta-0.05.000"

app.use(store).use(router).use(vant).use(ElementPlus).mount('#app')

// ====== UniApp 返回键处理 ======
document.addEventListener('plusready', () => {
  let first: any = null
  const webview = (window as any).plus?.webview?.currentWebview()
  if (!webview) return
  ;(window as any).plus.key.addEventListener('backbutton', () => {
    webview.canBack((e: any) => {
      if (e.canBack) {
        webview.back()
      } else {
        if (!first) {
          first = new Date().getTime()
          ;(window as any).plus?.nativeUI?.toast?.('再按一次退出应用', { duration: 'short' })
          setTimeout(() => { first = null }, 1000)
        } else {
          if (new Date().getTime() - first < 1000) {
            ;(window as any).plus?.runtime?.quit?.()
          }
        }
      }
    })
  })
}, false)

// Deeplink
document.addEventListener('deviceready', () => {
  try {
    const ul = (window as any).handleOpenURL
    if (typeof ul !== 'undefined') ul.subscribe(null, (ev: any) => handleDeepLink(ev.url))
  } catch (e) { /* ignore */ }
}, false)

// 禁用双指缩放
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
document.addEventListener('gestureend', (e) => e.preventDefault())
document.addEventListener('touchmove', (e: any) => {
  if (e.touches && e.touches.length > 1) e.preventDefault()
}, { passive: false })

// Deeplink 跳转
function handleDeepLink(url: string) {
  try {
    const m = url.match(/post\/(\d+)/)
    if (m) {
      const pid = m[1]
      const go = () => router.push('/post/' + pid)
      if ((window as any).navigator?.notification?.confirm) {
        ;(window as any).navigator.notification.confirm(`跳转到帖子 #${pid}？`, go, '站内链接', ['是', '否'])
      } else {
        if (confirm(`跳转到帖子 #${pid}？`)) go()
      }
    }
  } catch (e) { /* ignore */ }
}
;(window as any).handleOpenURL = (url: string) => handleDeepLink(url)
try {
  const ul = (window as any).UniversalLinks
  if (typeof ul !== 'undefined') ul.subscribe(null, (ev: any) => handleDeepLink(ev.url))
} catch (e) { /* ignore */ }
