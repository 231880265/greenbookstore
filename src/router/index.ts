import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/home.vue'
import Order from "../pages/Order.vue";
import OrderDetails from "../pages/OrderDetails.vue";
import ProductDetail from "../pages/ProductDetail.vue";
import UserProfile from "../pages/UserProfile.vue";
import UsedBookOrder from "../pages/UsedBookOrder.vue";
import ProductList from "../pages/ProductList.vue";
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: ProductList
    },
    {
        path: '/orders',
        component: Order
    },
    {
        path: '/orderDetails',
        component: OrderDetails
    },
    {
        path: '/product-detail/:id',
        component: ProductDetail
    },
    {
        path:'/product-list',
        component: ProductList
    }

]
const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router