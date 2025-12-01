import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/home.vue'
import OrderDetails from "../pages/OrderDetails.vue";
import ProductDetail from "../pages/productDetail.vue";
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/product-detail/:id',
        component: ProductDetail
    }

]
const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router