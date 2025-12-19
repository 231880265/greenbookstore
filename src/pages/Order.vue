<template>
  <!-- 面包屑 -->
  <BreadcrumbBar :items="[{ label: '购书订单' }]" />

  <!-- 页面标题 -->
  <div class="page-title-section">
    <h2 class="page-title">购书订单</h2>
  </div>

  <div class="tabs-sticky">
    <div class="tabs-container">
      <div class="status-tabs">
        <span
          v-for="tab in statusTabs"
          :key="tab.value"
          :class="['tab', activeStatus === tab.value && 'active']"
          @click="changeStatus(tab.value)"
        >
          {{ tab.label }}
        </span>
      </div>
    </div>
  </div>
  <div class="order-page">
    <!-- <h2 class="page-title">我的订单</h2> -->

    <!-- 状态筛选 -->

    <!-- 表头 -->
    <div class="table-header">
      <span class="col-product">商品信息</span>
      <span class="col-price">单价</span>
      <span class="col-qty">数量</span>
      <span class="col-total">小计</span>
    </div>

    <!-- 订单 -->
    <div 
        v-for="order in orders" 
        :key="order.orderId" 
        class="order-block clickable"
        @click="goOrderDetail(order.orderId)"
    >
      <!-- 订单头 -->
      <div class="order-header">
        <span>订单号：{{ order.orderId }}</span>
        <span>下单时间：{{ formatTime(order.createTime) }}</span>
        <span class="status">{{ statusText[order.status] }}</span>
      </div>

      <!-- 商品行 -->
      <div
        v-for="item in order.orderItems"
        :key="item.id"
        class="order-row"
      >
        <div class="col-product product">
          <img :src="item.cover" />
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="meta">
              {{ item.writer }} · {{ item.publisher }}
            </div>
          </div>
        </div>

        <div class="col-price">¥{{ item.price }}</div>
        <div class="col-qty">x{{ item.quantity }}</div>
        <div class="col-total">¥{{ item.totalPrice }}</div>
      </div>

      <!-- 订单底部 -->
      <div class="order-footer">
        <span>
          共 {{ order.orderItems.length }} 件商品，
          订单合计：
          <strong class="total-amount">¥{{ order.totalAmount }}</strong>
        </span>
      </div>
    </div>

    <div v-if="!orders.length" class="empty">
      暂无订单
    </div>
  </div>
</template>


<script setup lang="ts">
import BreadcrumbBar from '@/components/BreadcrumbBar.vue';
import { ref, onMounted } from 'vue'
import { getMyOrders } from '@/api/index' // 暂时注释掉，使用本地假数据调试
import type { OrderStatus } from '@/api/types'
import type { OrderVO } from '@/api/types'
import book2Img from "../assets/book2.jpg" ;
import book3Img from "../assets/book3.jpg";
import book4Img from "../assets/book4.jpg"; 
import { useRouter } from 'vue-router'

const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)

  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}
          ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const router = useRouter()

const goOrderDetail = (orderId: number) => {
  router.push({
    name: 'OrderDetails',
    params:{ orderId: orderId }
  })
}


const orders = ref<OrderVO[]>([])
const activeStatus = ref<OrderStatus | undefined>(undefined)


const statusTabs: { label: string; value?: OrderStatus }[] = [
  { label: '全部', value: undefined },
  { label: '待支付', value: 'PENDING' },
  { label: '已支付', value: 'PAID' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' }
]

const statusText = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

// 本地假数据，替代后端接口以便本地调试
// const mockOrders: OrderVO[] = [
//   {
//     orderId: 100001,
//     adId: 1,
//     userId: 1,
//     leaf: 0,
//     status: 'PENDING',
//     totalAmount: 88,
//     cover: '/assets/sample-cover.jpg',
//     createTime: '2025-12-01 10:00:00',
//     paymentTime: '',
//     paymentMethod: '',
//     tradeNo: '',
//     orderItems: [
//       {
//         id: 1,
//         ubId: 101,
//         title: '示例图书 A',
//         writer: '作者 A',
//         publisher: '出版社 A',
//         quantity: 1,
//         price: 88,
//         totalPrice: 88,
//         cover: 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/a791/a7914f6ff8bc1e97e320171caaafb623_0_1_300_300.jpg'
//       },
//       {
//         id: 2,
//         ubId: 102,
//         title: '示例图书 B',
//         writer: '作者 B',
//         publisher: '出版社 B',
//         quantity: 2,
//         price: 60,
//         totalPrice: 120,
//         cover: book2Img
//       }
//     ]
//   },
//   {
//     orderId: 100002,
//     userId: 1,
//     adId: 0,
//     leaf: 0,
//     status: 'COMPLETED',
//     totalAmount: 120,
//     cover: '/assets/sample-cover-2.jpg',
//     createTime: '2025-11-20 14:30:00',
//     paymentTime: '2025-11-20 14:35:00',
//     paymentMethod: '支付宝',
//     tradeNo: 'TRADE123',
//     orderItems: [
//       {
//         id: 2,
//         ubId: 102,
//         title: '示例图书 B',
//         writer: '作者 B',
//         publisher: '出版社 B',
//         quantity: 2,
//         price: 60,
//         totalPrice: 120,
//         cover: book3Img
//       }
//     ]
//   }
// ]

const loadOrders = async () => {
  // 原先调用接口的代码（注释）：
  const res = await getMyOrders(activeStatus.value)
  orders.value = res.data
  // const filtered = mockOrders.filter(o => !activeStatus.value || o.status === activeStatus.value)
  // orders.value = filtered
}

const changeStatus = (status?: OrderStatus) => {
  activeStatus.value = status
  loadOrders()
}

onMounted(loadOrders)
</script>

<style scoped>
/* 页面标题 */
.page-title-section {
  width: 80%;
  margin: 0 auto;
  padding: 20px 20px 10px;
}

.page-title {
  color: #2d583f;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.order-page {
  width: 80%;
  margin: 0 auto;
  padding: 10px 0 48px;
  background: #fff;
}

.status-tabs {
  /* border-bottom: 2px solid #f0f0f0; */
  margin-bottom: 20px;
  padding-left: 5px;
}

.tabs-container {
    width: 80%;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
}

.tabs-sticky {
  position: sticky;
  /* 将 top 设置为 HeaderBar 的高度，避免被顶部 header 遮挡 */
  top: 55.5px;
  /* 提高层级以确保可见（HeaderBar 的 z-index 为 1000） */
  z-index: 1001;
  background: #fff;
  transition: box-shadow 0.25s ease;
  height: 56px;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid #eee;
}

.tabs-sticky::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  /* background: #eee; */
}

.tab {
  margin-right: 36px;
  padding-bottom: 12px;
  cursor: pointer;
  color: #666;
  position: relative;
  transition: color 0.25s;
}

.tab::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2px;
  background: #1b5e20;
  transform: scaleX(0);
  transition: transform 0.25s ease;
}

.tab:hover {
  color: #1b5e20;
}

.tab:hover::after {
  transform: scaleX(0.4);
}

.tab.active {
  color: #1b5e20;
  font-weight: 600;
}

.tab.active::after {
  transform: scaleX(1);
}


.table-header {
  display: flex;
  padding: 12px 16px;
  background: #fafafa;
  color: #999;
  font-size: 14px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.col-product { flex: 4; }
.col-price { flex: 1; text-align: center; }
.col-qty { flex: 1; text-align: center; }
.col-total { flex: 1; text-align: center; }

.total-amount {
  color: #1b5e20;
  /* font-size: 18px;
  margin-left: 4px; */
}

.order-block.clickable {
  cursor: pointer;
}

.order-block.clickable:hover {
  border-color: #d8e3dc;
}

.order-block {
  border: 1px solid #eee;
  margin-bottom: 20px;
  transition: box-shadow 0.25s;
  border-radius: 6px;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease,
    border-color 0.25s ease;
}

.order-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  border-color: #cfe1d6;
}

.order-block:hover .order-row {
  background: #f8faf8;
}

/* .order-block:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
} */

.order-header {
  padding: 10px 16px;
  background: #f7f9f7;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666
}

.order-header .status {
  color: #1b5e20;
}

.order-row {
  display: flex;
  padding: 24px 16px;
  border-top: 1px solid #eee;
  align-items: center;
  background: #fff;

  transition:
    background-color 0.2s ease,
}


.product {
  display: flex;
}

.product img {
  width: 92px;
  height: 120px;
  object-fit: cover;
  margin-right: 16px;
  border-radius: 2px;

  transition: transform 0.20s ease;
}

.order-row:hover .product img {
  transform: scale(1.03);
}

.order-row:hover .info .title {
  color: #1b5e20;
}


.info .title {
  font-weight: 500;
  font-size: 15px;
  line-height: 1.6
}

.info .meta {
  font-size: 14px;
  color: #999;
  margin-top: 6px;
}

.order-footer {
  padding: 12px 16px;
  text-align: right;
  background: #fafafa;
  font-size: 15px;
}

.empty {
  text-align: center;
  color: #999;
  padding: 80px 0;
}
</style>
