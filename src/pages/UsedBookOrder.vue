<template>
  <HeaderBar />

  <!-- 面包屑 -->
  <BreadcrumbBar :items="[{ label: '卖书记录' }]" />

  <!-- 页面标题 -->
  <div class="page-title-section">
    <h2 class="page-title">卖书记录</h2>
  </div>

  <!-- 吸顶状态 Tabs -->
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
    <!-- 表头 -->
    <div class="table-header">
      <span class="col-book">书籍信息</span>
      <span class="col-meta">书籍参数</span>
      <span class="col-price">回收价格</span>
      <span class="col-status">状态</span>
    </div>

    <!-- 回收订单 -->
    <div
      v-for="order in usedOrders"
      :key="order.id"
      class="order-block clickable"
      @click="goOrderDetail(order.id)"
    >
    <!-- TODO -->
      <!-- 订单头 -->
      <div class="order-header">
        <span>回收单号：{{ order.id }}</span>
      </div>

      <!-- 内容行 -->
      <div class="order-row">
        <!-- 书籍信息 -->
        <div class="col-book book">
          <img :src="order.cover" />
          <div class="info">
            <div class="title">{{ order.title }}</div>
            <div class="author">{{ order.writer }}</div>
          </div>
        </div>

        <!-- 书籍参数 -->
        <div class="col-meta meta">
          <div><span>ISBN：</span>{{ order.isbn }}</div>
          <div><span>成色：</span>{{ order.usedDegree }} 成新</div>
          <div><span>标价：</span>¥{{ order.listPrice }}</div>
        </div>

        <!-- 价格 -->
        <div class="col-price price">
          <div class="recycle">¥{{ order.price }}</div>
        </div>

        <!-- 状态 -->
        <div class="col-status status">
          {{ statusText[order.status] }}
        </div>
      </div>
    </div>

    <div v-if="!usedOrders.length" class="empty">
      暂无回收订单
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import BreadcrumbBar from '@/components/BreadcrumbBar.vue'
import { getUsedBookOrders } from '@/api/index'
import type { UsedBookOrderVO, UsedBookOrderStatus } from '@/api/types'
import book1 from "../assets/book1.jpg";
import book2 from "../assets/book2.jpg";
import book3 from "../assets/book3.jpg";
import { useRouter } from 'vue-router'

const router = useRouter()

const goOrderDetail = (orderId: number) => {
  router.push({
    name: 'UbRecycleOrderDetails',
    params: { orderId: orderId }
  })
}

/** 回收订单列表 */
const usedOrders = ref<UsedBookOrderVO[]>([])

/** 当前选中的状态 */
const activeStatus = ref<UsedBookOrderStatus | undefined>(undefined)

/** 状态 Tabs */
const statusTabs: { label: string; value?: UsedBookOrderStatus }[] = [
  { label: '全部', value: undefined },
  { label: '审核中', value: 'CHECKING' },
  { label: '已寄出', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' }
]

/** 状态文本映射 */
const statusText: Record<UsedBookOrderStatus, string> = {
  CHECKING: '审核中',
  SHIPPED: '已寄出',
  COMPLETED: '已完成'
}

/** 加载回收订单 */
const loadUsedOrders = async () => {
  try {
    const res = await getUsedBookOrders(activeStatus.value)
    console.log('加载不同状态', activeStatus.value, res)
    usedOrders.value = res.data
  } catch (err) {
    console.error('获取回收订单失败', err)
    usedOrders.value = []
  }
  // 使用本地假数据替代接口，便于离线调试
  const mockUsedOrders: UsedBookOrderVO[] = [
    {
      id: 9001,
      sellerId: 11,
      adId: 5001,
      status: 'CHECKING',
      price: 45,
      listPrice: 80,
      cover: book1,
      title: '二手书示例：JavaScript 深入',
      writer: '张三',
      usedDegree: 8,
      isbn: '978-7-111-00001-0'
    },
    {
      id: 9002,
      sellerId: 12,
      adId: 5002,
      status: 'SHIPPED',
      price: 30,
      listPrice: 60,
      cover: book2,
      title: '二手书示例：Vue 实战',
      writer: '李四',
      usedDegree: 7,
      isbn: '978-7-111-00002-7'
    },
    {
      id: 9003,
      sellerId: 13,
      adId: 5003,
      status: 'COMPLETED',
      price: 120,
      listPrice: 200,
      cover: book3,
      title: '二手书示例：算法导论',
      writer: '王五',
      usedDegree: 9,
      isbn: '978-7-111-00003-4'
    }
  ]

  // const filtered = mockUsedOrders.filter(o => !activeStatus.value || o.status === activeStatus.value)
  // usedOrders.value = filtered
}

/** 切换状态 */
const changeStatus = (status?: UsedBookOrderStatus) => {
  activeStatus.value = status
  loadUsedOrders()
}

onMounted(loadUsedOrders)
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

/* 表头 */
.table-header {
  display: flex;
  padding: 12px 16px;
  background: #fafafa;
  color: #999;
  font-size: 14px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.col-book { flex: 3; }
.col-meta { flex: 2; }
.col-price { flex: 1.5; text-align: center; }
.col-status { flex: 1; text-align: center; }

/* 订单块 */
.order-block {
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 20px;
  transition: box-shadow 0.25s;
  cursor: pointer;
}

.order-block:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
}

.order-header {
  padding: 10px 16px;
  background: #f7f9f7;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

/* 内容行 */
.order-row {
  display: flex;
  padding: 28px 16px;
  align-items: center;
}

/* 左：书 */
.book {
  display: flex;
}

.book img {
  width: 96px;
  height: 128px;
  object-fit: cover;
  margin-right: 18px;
  border-radius: 2px;

  transition: transform 0.20s ease;
}

.order-row:hover .book img {
  transform: scale(1.03);
}

.order-row:hover .info .title {
  color: #1b5e20;
}

.info .title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
}

.info .author {
  margin-top: 6px;
  font-size: 15px;
  color: #777;
}

/* 中：参数 */
.meta {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
}

.meta span {
  color: #999;
}

/* 右：价格 */
.price .recycle {
  font-size: 18px;
  font-weight: 600;
  color: #1b5e20;
}

.price {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* 状态 */
.status {
  font-size: 14px;
  color: #1b5e20;
}

/* 空态 */
.empty {
  text-align: center;
  color: #999;
  padding: 80px 0;
}
</style>
