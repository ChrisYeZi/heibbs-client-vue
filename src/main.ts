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

// 注册所有插件
app.use(store)
   .use(router)
   .use(vant)
   .use(ElementPlus)  // 注册 Element Plus（新增）
   .mount('#app')
