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
import Checkout from '@/pages/Checkout.vue'
import MyCollections from '../pages/MyCollections.vue'
import UbRecycleOrderDetails from "../pages/UbRecycleOrderDetails.vue";
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/orders',
    component: Order,
    meta: { requiresAuth: true },
  },
  {
    path: '/orderDetails/:orderId',
    name: 'OrderDetails',
    component: OrderDetails,
  },
  {
    path: '/usedBook/orders',
    component: UsedBookOrder,
    meta: { requiresAuth: true },
  },
  {
    path: '/usedBookRecycleOrderDetails/:orderId',
    name: 'UbRecycleOrderDetails',
    component: UbRecycleOrderDetails,
    meta: { requiresAuth: true },
  },
  {
    path: '/product-detail/:id',
    component: ProductDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/sell',
    component: SellBook,
    meta: { requiresAuth: true },
  },
  {
    path: '/cart',
    component: Cart,
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout',
    component: Checkout,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-collections',
    component: MyCollections,
    meta: { requiresAuth: true },
  },
  {
    path: '/product-list/:category?',
    component: ProductList,
    meta: { requiresAuth: true },
    props: true,
  }

]



const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 浏览器前进 / 后退
    if (savedPosition) {
      return savedPosition
    }

    // 其它情况（跳转新页面） → 回到顶部
    return { top: 0 }
  },
})



// 全局路由守卫：对于需要登录的路由，若无 token 则重定向到首页并告诉 HeaderBar 打开登录弹窗
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta && (r.meta as any).requiresAuth);
  if (!requiresAuth) return next();

  const token = localStorage.getItem('GB_TOKEN');
  if (token) {
    return next();
  }

  // 未登录，重定向到首页并通过 query 请求打开登录弹窗，登录后可跳回原页面
  next({ path: '/', query: { openAuth: 'login', redirect: to.fullPath } });
});
export default router