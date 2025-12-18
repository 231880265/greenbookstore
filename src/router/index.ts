import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../pages/home.vue'
import Order from '../pages/Order.vue'
import OrderDetails from '../pages/OrderDetails.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import UserProfile from '../pages/UserProfile.vue'
import UsedBookOrder from '../pages/UsedBookOrder.vue'
import SellBook from '../pages/SellBook.vue'
import ProductList from '../pages/ProductList.vue'
import Cart from "../pages/cart.vue";
import MyCollections from "../pages/MyCollections.vue";
import UbRecycleOrderDetails from "../pages/UbRecycleOrderDetails.vue";
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/orders',
    component: Order,
  },
  {
    path: '/orderDetails/:orderId',
    name: 'OrderDetails',
    component: OrderDetails,
  },
  {
    path: '/usedBook/orders',
    component: UsedBookOrder,
  },
  {
    path: '/usedBookRecycleOrderDetails/:orderId',
    name: 'UbRecycleOrderDetails',
    component: UbRecycleOrderDetails,
  },
  {
    path: '/product-detail/:id',
    component: ProductDetail,
  },
  {
    path: '/profile',
    component: UserProfile,
  },
  {
    path: '/sell',
    component: SellBook,
  },
  {
    path: '/product-list',
    component: ProductList,
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router