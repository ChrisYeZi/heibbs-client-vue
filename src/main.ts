import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入vant plus UI框架
import vant from 'vant'
// vant plus UI框架样式导入
import 'vant/lib/index.css';

createApp(App).use(store).use(router).use(vant).mount('#app')
