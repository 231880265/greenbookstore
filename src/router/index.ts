import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/home.vue'
import OrderDetails from "../pages/OrderDetails.vue";
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Home
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router