import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { TextEllipsis, Divider } from 'vant';
import 'vant/lib/index.css';

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(TextEllipsis)
app.use(Divider)
app.mount('#app')
