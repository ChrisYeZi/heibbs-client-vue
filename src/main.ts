import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from './store'

// 创建应用实例
const app = createApp(App)

// 引入 Vant UI
import vant from 'vant'
import 'vant/lib/index.css'

// 引入 Element Plus（新增）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'  // Element Plus 样式

// 引入 Axios
import axios from 'axios'
// axios.defaults.baseURL = 'https://127.0.0.1:8081/api'  // 按需开启
app.config.globalProperties.$axios = axios
app.config.globalProperties.$version = "alpha-0.1.0"

// 注册所有插件
app.use(store)
   .use(router)
   .use(vant)
   .use(ElementPlus)
   .mount('#app')

// ====== 移动端硬件返回键处理 + 状态栏 ======
let backPressed = 0
document.addEventListener('backbutton', (e) => {
  const currentRoute = router.currentRoute.value
  const isRoot = currentRoute.path === '/index' || currentRoute.path === '/' || currentRoute.path === '/login'

  if (isRoot) {
    const now = Date.now()
    if (now - backPressed < 2000) {
      (navigator as any).app?.exitApp?.() // Cordova
    } else {
      backPressed = now
      // 提示再按一次退出（可选：用Toast提示）
    }
  } else {
    router.back()
  }
  e.preventDefault()
}, false)

// 状态栏（Cordova）
document.addEventListener('deviceready', () => {
  try {
    const win = window as any
    if (win.StatusBar) {
      win.StatusBar.overlaysWebView(false)
      win.StatusBar.styleDefault()
      win.StatusBar.backgroundColorByHexString('#FCF9E0')
    }
  } catch (e) { /* ignore */ }
}, false)
