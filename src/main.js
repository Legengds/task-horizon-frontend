import { createApp } from 'vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'  // 确保导入路由配置

const app = createApp(App)
app.use(router)  // 启用路由
app.mount('#app')
// app.use(ElementPlus)