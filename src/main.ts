import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { TextEllipsis, Divider, Checkbox, Stepper, Button, Skeleton, SkeletonImage } from 'vant';
import 'vant/lib/index.css';

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(TextEllipsis)
app.use(Divider)
app.use(Checkbox)
app.use(Stepper)
app.use(Button)
app.use(Skeleton)
app.use(SkeletonImage)
app.mount('#app')
