import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from './store'

// 创建对象
const app = createApp(App)

// 引入vant plus UI框架
import vant from 'vant'
// vant plus UI框架样式导入
import 'vant/lib/index.css';

// 引入Axios
import axios from 'axios'
// 设置axios基础访问路径
// axios.defaults.baseURL = 'https://127.0.0.1:8081/api'
// 配置axios全局
app.config.globalProperties.$axios = axios


createApp(App).use(store).use(router).use(vant).mount('#app')

