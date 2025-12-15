import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/home.vue'
import Order from "../pages/Order.vue";
import OrderDetails from "../pages/OrderDetails.vue";
import ProductDetail from "../pages/ProductDetail.vue";
    import UserProfile from "../pages/UserProfile.vue";
    import UsedBookOrder from "../pages/UsedBookOrder.vue";
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/orders',
        component: Order
    },
    {
        path: '/usedBook/orders',
        component: UsedBookOrder
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
        path: '/profile',
        component: UserProfile
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router