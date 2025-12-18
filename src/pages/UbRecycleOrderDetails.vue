<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import Footer from '../components/Footer.vue'
import { getUsedBookOrderById } from '../api/index'
import type { UsedBookOrderVO } from '../api/types'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.orderId || route.query.orderId || 0)
// loosen type to any because UI accesses demo-only fields not present in API type
const order = ref<any | null>(null)
const status = ref<string>('')
const logistics = ref<Array<{ time: string; status: string; location?: string }>>([])

// 进度步骤定义（与 UI 一一对应）
const steps = ['审核中', '运输中', '已完成']

// 动画控制：已展示到的步骤索引，初始 -1 表示还未开始
const displayedStep = ref<number>(-1)
let timers: Array<ReturnType<typeof setTimeout>> = []

const clearAnimation = () => {
  if (timers.length) {
    for (const t of timers) clearTimeout(t)
    timers = []
  }
}

const animateTo = (target: number) => {
  clearAnimation()
  // 如果目标小于等于当前已展示，则直接设定并返回
  if (target <= displayedStep.value) {
    displayedStep.value = target
    return
  }

  const stepDelay = 350
  const start = Math.max(0, displayedStep.value + 1)
  for (let step = start; step <= target; step++) {
    const t = setTimeout(() => {
      displayedStep.value = step
      if (step === target) clearAnimation()
    }, stepDelay * (step - start + 1))
    timers.push(t)
  }
}

onBeforeUnmount(() => {
  clearAnimation()
})

const makePlaceholder = (orderId: number) => ({
  id: orderId || 0,
  sellerId: 0,
  adId: 0,
  status: 'CHECKING',
  price: 42,
  listPrice: 60,
  cover: '/src/assets/book1.jpg',
  title: '示例回收书：计算机网络（第7版）',
  writer: '谢希仁',
  usedDegree: 3,
  isbn: '9787115281234',
  // 补充演示时使用的额外字段
  logisticsCarrier: '圆通速递',
  trackingNumber: 'YT123456789CN',
  eta: '2-4 个工作日',
  storageId: 'RK20251121-0001',
  completedAt: '2025-11-21 12:53',
  txId: 'TX20251121ABCD1234',
  leafReward: 5,
  createdAt: '2025-11-01 09:00',
  address: '苏州市虎丘区某街道 12 号',
  payMethod: '平台余额'
} as any)

const fetchOrder = async () => {
  try {
    if (!id) {
      console.warn('缺少 orderId，使用占位数据')
      order.value = makePlaceholder(0)
      status.value = order.value.status
      // 触发动画到对应步骤
      const target = statusToStep(status.value)
      animateTo(target)
      return
    }

    const res: any = await getUsedBookOrderById(id)
    const data: UsedBookOrderVO | undefined = res?.data?.data || res?.data || res
    order.value = data || null

    if (!order.value) {
      order.value = makePlaceholder(id)
    }

    // 如果后端返回的对象没有我们演示需要的字段，补充默认值
    order.value = { ...makePlaceholder(order.value?.id ?? id), ...order.value }

    status.value = order.value?.status ?? ''

    // 根据状态触发进度动画
    const target = statusToStep(status.value)
    displayedStep.value = -1
    animateTo(target)
    selectedStep.value = target // 👈 默认选中当前节点

    // 根据状态构建物流/进度详情（示例数据）
    if (status.value === 'CHECKING') {
      logistics.value = [
        { time: '2025-11-01 09:00', status: '提交回收申请，等待系统分配审核' },
        { time: '2025-11-01 10:12', status: '质量审核进行中：工作人员正在核查书籍成色' },
        { time: '2025-11-01 11:03', status: '价格审核进行中：系统估价与人工复核' }
      ]
    } else if (status.value === 'SHIPPED') {
      logistics.value = [
        { time: '2025-11-05 08:20', status: '卖家已发货，快递已揽件', location: '苏州发货中心' },
        { time: '2025-11-06 13:45', status: '运输中，已到达中转站', location: '无锡中转' },
        { time: '2025-11-07 09:30', status: '派送中，快递员正在派送', location: '虎丘区' }
      ]
    } else if (status.value === 'COMPLETED') {
      logistics.value = [
        { time: '2025-11-21 12:53', status: '已入库，回收完成；金额已到账；小绿叶已发放' }
      ]
    } else {
      logistics.value = []
    }
  } catch (e) {
    console.error('获取回收订单失败', e)
    order.value = makePlaceholder(id)
    status.value = order.value.status
    logistics.value = []
    const target = statusToStep(status.value)
    displayedStep.value = -1
    animateTo(target)
  }
}

onMounted(() => {
  fetchOrder()
})

const statusToStep = (st?: string) => {
  switch (st) {
    case 'CHECKING': return 0
    case 'SHIPPED': return 1
    case 'COMPLETED': return 2
    default: return 0
  }
}


// 人性化状态文本
const statusLabel = computed(() => {
  switch (status.value) {
    case 'CHECKING': return '审核中'
    case 'SHIPPED': return '运输中'
    case 'COMPLETED': return '已完成'
    default: return status.value || '未知'
  }
})

const selectedStep = ref<number>(-1)
const handleStepClick = (idx: number) => {
  if (displayedStep.value >= idx) {
    selectedStep.value = idx
  }
}
</script>

<template>
  <div class="recycle-order-page">
    <HeaderBar />

    <!-- 面包屑：与站内其他页面样式一致 -->
    <nav class="breadcrumb">
      <span class="crumb" @click.prevent="router.push('/')">首页</span>
      <span class="sep">|</span>
      <span class="crumb" @click.prevent="router.push('/usedBook/orders')">回收订单</span>
      <span class="sep">|</span>
      <span class="crumb current">订单详情</span>
    </nav>

    <div class="order-details-layout">
      <div class="main-content">
        <!-- 改为横向步骤条（参考 OrderDetails.vue 实现） -->
        <div class="recruit-steps horizontal">
          <!-- 横向节点行 -->
          <div class="steps-row">
            <template v-for="(label, idx) in steps" :key="idx">
              <div
                  class="h-node"
                  :class="{ active: displayedStep >= idx, current: selectedStep === idx }"
                  @click="handleStepClick(idx)"
              >
                <div class="h-dot">{{ (displayedStep > idx || displayedStep === idx) ? '' : (idx + 1) }}</div>
                <div class="h-label">{{ label }}</div>
              </div>

              <div v-if="idx < steps.length - 1" class="h-connector" :class="{ filled: displayedStep > idx }"></div>
            </template>
          </div>

          <div class="steps-details">
            <div v-if="selectedStep === 0" class="detail-card">
              <h3>审核中 — 详细进展</h3>
              <p class="muted">当前状态：{{ statusLabel }}</p>
              <ul>
                <li>质量审核：工作人员正在核查纸张、破损、水渍、涂写等情况。</li>
                <li>价格审核：系统估价 + 人工复核，通常在 24 小时内完成。</li>
                <li>卖家信誉审核：核验回收来源与用户历史。</li>
              </ul>
              <div class="timeline">
                <div v-for="item in logistics" :key="item.time" class="timeline-item">
                  <div class="time">{{ item.time }}</div>
                  <div class="desc">{{ item.status }}</div>
                </div>
              </div>
            </div>

            <div v-if="selectedStep === 1" class="detail-card">
              <h3>运输中 — 物流轨迹</h3>
              <p class="muted">当前状态：{{ statusLabel }}</p>
              <div class="shipping-summary">
                <div><strong>快递公司：</strong>{{ order?.logisticsCarrier || '圆通速递' }}</div>
                <div><strong>运单号：</strong>{{ order?.trackingNumber ?? 'YT123456789CN' }}</div>
                <div><strong>发货时间：</strong>{{ logistics[0]?.time ?? '2025-11-05 08:20' }}</div>
                <div><strong>预计签收：</strong>{{ order?.eta ?? '2-4 个工作日' }}</div>
              </div>
            </div>

            <div v-if="selectedStep === 2" class="detail-card">
              <h3>已完成 — 回收结果</h3>
              <p class="muted">当前状态：{{ statusLabel }}</p>
              <ul>
                <li>已入库：书籍已成功入库。</li>
                <li>金额到账：回收款项已发放至您的账户。</li>
                <li>小绿叶奖励：已发放对应积分/小绿叶。</li>
              </ul>
              <div class="timeline">
                <div v-for="item in logistics" :key="item.time" class="timeline-item">
                  <div class="time">{{ item.time }}</div>
                  <div class="desc">{{ item.status }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧订单信息面板 -->
      </div>

      <aside class="sidebar">
        <div class="order-card">
          <!-- 上排：左封面 + 右核心信息 -->
          <div class="top-row">
            <img :src="order?.cover" alt="cover" class="cover" />

            <div class="meta">
              <h3 class="title">{{ order?.title }}</h3>
              <p class="writer">作者：{{ order?.writer }}</p>
              <p class="isbn">ISBN：{{ order?.isbn }}</p>
              <p class="status-line"><strong>订单状态：</strong>{{ statusLabel }}</p>
              <p class="price">
                回收价：¥{{ order?.price }}
                <span class="list">原价 ¥{{ order?.listPrice }}</span>
              </p>
              <p>成色等级：{{ order?.usedDegree }}成新</p>
            </div>
          </div>

          <!-- 下排：移到下方的字段 -->
          <div class="bottom-row">
            <p>下单时间：{{ order?.createdAt ?? '2025-11-01 09:00' }}</p>
            <p>寄回地址：{{ order?.address ?? '苏州市虎丘区某街道 12 号' }}</p>
            <p>快递单号：{{ order?.trackingNumber ?? 'YT123456789CN' }}</p>
            <p>收款方式：{{ order?.payMethod ?? '平台余额' }}</p>
          </div>
        </div>

      </aside>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
/* 替换为 OrderDetails.vue 中的完整样式，以保证横向进度条与布局一致 */
.recycle-order-page { display:flex; flex-direction:column; min-height:100vh; background-color: #f8f5ef}
.order-details-layout { display:flex; gap:20px; margin-top:40px; margin-bottom:20px; max-width:1400px; margin-left:auto; margin-right:auto;}
.main-content { flex:0 0 820px; width:820px; padding:0 20px; min-height:0 }
.sidebar { flex:0 0 360px; width:360px; margin-left:auto; padding:20px; box-sizing:border-box }
.steps-row { display:flex; align-items:center; justify-content:space-between; width:100%; max-width:100%; padding:12px 12px; box-sizing:border-box }
.steps-details { width:100%; max-width:100% }
.breadcrumb { position:relative; display:flex; align-items:center; gap:8px; padding:12px 24px; font-size:14px; color:#666; max-width:none; margin:12px 0 0 24px }
.recruit-steps { display:flex; gap:24px }
.steps-left { width:140px; display:flex; flex-direction:column; align-items:flex-start; padding-left:8px }
.step { position:relative; display:flex; flex-direction:column; align-items:flex-start; margin:12px 0 }
.dot { width:40px; height:40px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:bold; transition: background 240ms ease, transform 240ms ease, color 240ms ease }
.step.active .dot { background:#b5dcc7; color:#fff; transform: scale(1.05) }
.label { margin-top:8px; font-size:13px; color:#333; margin-left:8px }
.connector { width:4px; height:40px; background:#e6e6e6; margin:8px 0 8px 18px; transition: background 240ms ease }
.connector.filled { background:#b5dcc7 }
.steps-right { flex:1; min-width:0 }
.detail-card { background:#fff; padding:16px; border-radius:6px; margin-bottom:12px; box-shadow:0 1px 4px rgba(0,0,0,0.06) }
.transaction-success { margin:20px 0; padding:15px; background-color:#ffffff; border-radius:8px }
.transaction-success h2 { margin:0 0 10px; color:#2D583F; font-size:20px }
.transaction-success .note { margin:10px 0; font-size:14px; line-height:1.5; color:#333 }
.transaction-success .address { margin:10px 0; font-size:14px; color:#666 }
.product-details h3 { margin:0 0 8px; font-size:16px; color:#333 }
.price { font-size:18px; color:#d40000; font-weight:bold }
.quantity { color:#666; font-size:14px }
.sidebar { width:30%; margin-left:auto; padding:20px; border:1px solid #eaeaea; border-radius:8px; background-color:#ffffff; justify-content:flex-end; max-height:600px }
.section { margin-bottom:20px }
.section h3 { margin:0 0 10px; color:#333; font-size:18px }
.section ul { list-style:none; padding:0 }
.section li { margin:8px 0; display:flex; gap:10px }
.section span { font-weight:bold; color:#666; min-width:80px }
.section p { margin:8px 0; color:#666 }
.breadcrumb { position:relative; display:flex; align-items:center; gap:8px; padding:12px 24px; font-size:14px; color:#666; max-width:none; margin:12px 0 0 24px }
.crumb { cursor:pointer; transition: color 0.2s }
.crumb:hover { color:#2d583f }
.crumb.current { color:#222; font-weight:600 }
.sep { color:#bbb }
.muted { color:#666; margin-bottom:8px }
.shipping-summary { display:flex; flex-direction:column; gap:6px; margin:12px 0 }
.result-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-top:12px }
.timeline { margin-top:8px }
.timeline-item { padding:8px 0; border-bottom:1px dashed #eee }
.timeline-item .time { font-size:12px; color:#888 }
.recruit-steps.horizontal { display:flex; flex-direction:column; gap:18px; align-items:center }
.steps-details { width:100%; max-width:1100px }
.h-connector { height:8px; flex:1; background:#e6e6e6; margin:0 28px; border-radius:4px; transition:background 240ms ease }
.h-connector.filled { background:#b5dcc7 }
.h-node { display:flex; flex-direction:column; align-items:center; width:120px; text-align:center }
.h-dot { position:relative; width:48px; height:48px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:bold; transition: background 240ms ease, transform 240ms ease, color 240ms ease }
.h-label { margin-top:8px; font-size:13px; color:#333 }
.h-node.active .h-dot { background:#b5dcc7; color:#fff; transform:scale(1.05) }
.h-node.active .h-dot::after { content: '✓'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); color:#fff; font-size:18px; line-height:1 }
.h-node.current .h-dot { /* 你想要的任何颜色 */
  transform: scale(1.18);
  box-shadow: 0 0 3px 3px rgba(107, 137, 107, 0.5);
}
.h-node.cancel-node .h-dot { background:#c4c4c4; color:transparent }
.h-node.cancel-node .h-dot::after { content:'✕'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); color:#fff; font-size:18px; line-height:1 }
/* 保留原有封面/面板样式 */
/* 让卡片整体纵向排列 */
.order-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 6px;
}

/* 上排：封面 + 核心信息 左右分布 */
.top-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cover {
  width: 100px;
  height: 130px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  margin-right:10px;
}

.meta {
  flex: 1;
}

/* 下排：灰色小字，可换行 */
.bottom-row {
  border-top: 1px dashed #e0e0e0;
  padding-top: 12px;
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.bottom-row p {
  margin: 4px 0;
}
.title { margin:0 0 6px 0 }
.price { color:#d32; font-weight:bold }
.price .list { color:#999; font-size:12px; margin-left:8px }
.info-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:12px }
.shipping-summary { display:flex; flex-direction:column; gap:6px; margin:12px 0 }
.result-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-top:12px }
.timeline { margin-top:8px }
.timeline-item { padding:8px 0; border-bottom:1px dashed #eee }
.timeline-item .time { font-size:12px; color:#888 }
.muted { color:#666; margin-bottom:8px }
.note { margin-top:8px; font-size:13px; color:#aa704a }

@media (max-width: 640px) {
  .order-details-layout { flex-direction:column }
  .main-content { width:100% }
  .sidebar { width:100% }
}
</style>