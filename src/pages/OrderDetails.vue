<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeaderBar from "../components/HeaderBar.vue";
import Footer from "../components/Footer.vue";
import { getMyOrderById, getAddressList } from '@/api/index'

// 订单数据类型定义
interface OrderItem {
  ubId: number;
  title: string;
  writer: string;
  publisher: string;
  cover: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface AddressItem {
  id: number
  name: string
  telephone: string
  province: string
  city: string
  district: string
  detail: string
}

interface OrderDetails {
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createTime: string;
  adId: number | string; // 可能是地址 id（数字）或字符串
  orderItems: OrderItem[];
  // 后端可能返回以下可选字段（为了展示而声明）
  trackingNumber?: string;
  courier?: string;
  payTime?: string;
  shipTime?: string;
  completeTime?: string;
  leaf?: number;
  cover?: string;
}

// 响应式订单数据
const route = useRoute()
const router = useRouter()
const orderIdParam = Number(route.params.orderId || route.query.orderId || 0)
const orderDetails = ref<OrderDetails | null>(null);
// 选中的地址详情
const selectedAddress = ref<any | null>(null)

// 格式化地址显示
const formattedAddress = computed(() => {
  console.log('格式化地址', orderDetails.value?.adId)
  const a = selectedAddress.value
  if (!a) return orderDetails.value?.adId ? `地址ID: ${orderDetails.value?.adId}` : '—'
  // 可能字段：province, city, district, detail, name, phone
  const parts = [a.province, a.city, a.district, a.detail].filter(Boolean)
  return `${parts.join(' ')} ${a.name ? ' 联系人:' + a.name : ''} ${a.phone ? a.phone : ''}`.trim()
})

// 控制物流信息的展开和收起
const isLogisticsOpen = ref(false);

// 新增：用于控制进度条动态展示的变量
const displayedStep = ref(-1) // 当前已经展示到的步骤索引（动画过程中增长）
const isCanceled = ref(false) // 标记是否已取消

// 根据订单状态决定目标步骤索引（PENDING=0, PAID=1, SHIPPED=2, COMPLETED=3）
const mapStatusToStep = (status: string | undefined) => {
  if (!status) return 0
  switch (status) {
    case 'PENDING': return 0
    case 'PAID': return 1
    case 'SHIPPED': return 2
    case 'COMPLETED': return 3
    case 'CANCELLED': return 1 // 取消显示为第 1 步（已取消）
    default: return 0
  }
}

// 动画：逐步推进 displayedStep 到目标位置
let timers: Array<ReturnType<typeof setTimeout>> = []
const clearAnimation = () => {
  if (timers.length) {
    for (const t of timers) clearTimeout(t)
    timers = []
  }
}

const animateTo = (target: number, cancelled = false) => {
  clearAnimation()
  // 如果目标小于等于当前已展示，则直接设定并返回
  if (target <= displayedStep.value) {
    displayedStep.value = target
    if (cancelled) isCanceled.value = true
    return
  }

  const stepDelay = 400
  const start = Math.max(0, displayedStep.value + 1)
  for (let step = start; step <= target; step++) {
    const t = setTimeout(() => {
      displayedStep.value = step
      if (step === target) {
        if (cancelled) isCanceled.value = true
        clearAnimation()
      }
    }, stepDelay * (step - start + 1))
    timers.push(t)
  }
}

// 新增：步骤文本数组（用于渲染节点）
const steps = computed(() =>
    orderDetails.value?.status === 'CANCELLED'
        ? ['拍下宝贝', '取消订单']
        : ['拍下宝贝', '买家付款', '卖家发货', '确认收货']
);


// 获取订单详情（调用后端新接口）
const makePlaceholder = (): OrderDetails => ({
  orderId: String(orderIdParam || 10001),
  totalAmount: 120.0,
  paymentMethod: 'ALIPAY',
  status: 'PAID',
  createTime: '2025-04-12T14:30:00',
  adId: 0,
  orderItems: [
    {
      ubId: 1,
      title: '示例商品：计算机网络教材（回收版）',
      writer: '示例商家',
      publisher: '示例店铺',
      cover: '/src/assets/book1.jpg',
      quantity: 1,
      price: 60.0,
      totalPrice: 60.0,
    },
  ],
  trackingNumber: 'YT123456789',
  courier: '中通快递',
  payTime: '2025-11-02 10:12:00',
  shipTime: '2025-11-05 08:20:00',
  completeTime: '2025-11-21 12:53:23',
  leaf: 0,
  cover: '/src/assets/book1.jpg'
})

const selectedStep = ref<number>(-1)

const fetchOrderDetails = async () => {
  try {
    if (!orderIdParam) {
      orderDetails.value = makePlaceholder()
      const target = mapStatusToStep(orderDetails.value?.status)
      animateTo(target)
      return
    }

    const res: any = await getMyOrderById(orderIdParam)
    const data = res?.data || res?.data?.data || res
    if (!data) {
      orderDetails.value = makePlaceholder()
    } else {
      console.log(data)
      // 若有 adId，去 /api/address 获取地址详情并匹配
      if (orderDetails.value?.adId) {
        try {
          console.log('获取地址列表')
          const addrRes: any = await getAddressList()
          const list: AddressItem[] = addrRes?.data || []
          selectedAddress.value =
              list.find(a => Number(a.id) === Number(orderDetails.value!.adId)) || null
          console.log('匹配到的地址', selectedAddress.value)
        } catch (e) {
          console.error('获取地址列表失败', e)
          selectedAddress.value = null
        }
      }
      // 直接使用后端返回的字段（兼容性合并占位字段），并映射常见命名差异
      const merged: any = {  ...data }
      // 后端可能返回 paymentTime 字段
      merged.payTime = data.paymentTime ?? data.payTime ?? merged.payTime
      merged.createTime = data.createTime ?? merged.createTime
      merged.leaf = typeof data.leaf !== 'undefined' ? data.leaf : merged.leaf
      merged.cover = data.cover ?? merged.cover
      // 保证 adId 为数字或原值
      merged.adId = typeof data.adId !== 'undefined' ? data.adId : merged.adId

      orderDetails.value = merged
    }

    const target = mapStatusToStep(orderDetails.value?.status)
    displayedStep.value = -1
    animateTo(target)
    selectedStep.value = target   // 👈 默认选中当前节点
  } catch (e) {
    console.error('获取订单详情失败', e)
    orderDetails.value = makePlaceholder()
    const target = mapStatusToStep(orderDetails.value?.status)
    displayedStep.value = -1
    animateTo(target)
  }
}

const handleStepClick = (idx: number) => {
  if (displayedStep.value >= idx) {
    selectedStep.value = idx
  }
}

onMounted(() => {
  fetchOrderDetails()
})

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  clearAnimation()
})

</script>

<template>
  <div class="order-details-page">
    <HeaderBar />

    <!-- 面包屑 -->
    <nav class="breadcrumb">
      <span class="crumb" @click.prevent="router.push('/')">首页</span>
      <span class="sep">|</span>
      <span class="crumb" @click.prevent="router.push('/orders')">购书订单</span>
      <span class="sep">|</span>
      <span class="crumb current">订单详情</span>
    </nav>

    <div class="order-details-layout">
      <!-- 左侧主内容 -->
      <div class="main-content">

        <!-- 替换：使用横向步骤条（模仿 UbRecycleOrderDetails 的逐步动画逻辑） -->
        <div class="recruit-steps horizontal">
          <!-- 横向节点行 -->
          <div class="steps-row">
            <template v-for="(label, idx) in steps" :key="idx">
              <div
                  class="h-node"
                  :class="{ active: displayedStep >= idx, current: selectedStep === idx, 'cancel-node': label === '取消订单' }"
                  @click="handleStepClick(idx)"
              >
                <div class="h-dot">{{ (displayedStep > idx || displayedStep === idx) ? '' : (idx + 1) }}</div>
                <div class="h-label">{{ label }}</div>
              </div>

              <div v-if="idx < steps.length - 1" class="h-connector" :class="{ filled: displayedStep > idx }"></div>
            </template>
          </div>

          <!-- 步骤对应的详细信息（保持原有条件渲染） -->
          <div class="steps-details">
            <div v-if="selectedStep === 0" class="detail-card">
              <h3>订单已提交，等待付款</h3>
              <p class="muted">订单号：20251121001　|　下单时间：{{ orderDetails?.createTime }}</p>
              <ul>
                <li>收货信息：
                  <span v-if="selectedAddress">
                    {{ selectedAddress.name }} {{ selectedAddress.telephone }}<br />
                    {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}
                    {{ selectedAddress.detail }}
                  </span>
                </li>
                <li>订单金额：¥{{ orderDetails?.totalAmount }}</li>
                <li>配送方式：中通快递（标快）</li>
                <li>预计发货：付款后 24 小时内</li>
                <li>自动取消：2025-11-22 09:12:34 前未付款将自动关闭订单</li>
              </ul>
            </div>

            <div v-if="selectedStep === 1" class="detail-card">
              <h3>付款成功，等待商家发货</h3>
              <ul>
                <li>支付方式：{{ orderDetails?.paymentMethod }}</li>
                <li>支付时间：{{ orderDetails?.payTime ?? orderDetails?.createTime }}</li>
                <li>发票类型：电子普通发票（个人）</li>
                <li>商家承诺：付款后 24 小时内发货，超时自动赔付 3 元优惠券</li>
              </ul>
            </div>

            <div v-if="selectedStep === 2" class="detail-card">
              <h3>已发货，快递运输中</h3>
              <p class="muted">中通快递　运单号：{{ orderDetails?.trackingNumber ?? 'YT123456789' }}（可点击复制）</p>
              <div class="shipping-summary">
                <div><strong>承运网点：</strong>苏州园区一部（0512-6666 8888）</div>
                <div><strong>揽件员：</strong>王师傅 138****1234</div>
                <div><strong>发货时间：</strong>{{ orderDetails?.shipTime ?? '2025-11-05 08:20:00' }}</div>
                <div><strong>预计到达：</strong>2-4 个工作日</div>
              </div>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="time">2025-11-21 14:30</div>
                  <div class="desc">【苏州市】快件已由苏州园区一部揽收</div>
                </div>
                <div class="timeline-item">
                  <div class="time">2025-11-21 20:15</div>
                  <div class="desc">【苏州市】快件已到达 苏州转运中心</div>
                </div>
                <div class="timeline-item">
                  <div class="time">2025-11-22 03:42</div>
                  <div class="desc">【无锡市】快件已发车前往 南京分拨中心（车牌苏E·D12345）</div>
                </div>
                <div class="timeline-item">
                  <div class="time">2025-11-22 08:06</div>
                  <div class="desc">【南京市】快件已到达 南京分拨中心，正在分拣</div>
                </div>
                <div class="timeline-item">
                  <div class="time">2025-11-22 12:30</div>
                  <div class="desc">【南京市】快件已装车，发往 苏州虎丘区（车牌苏A·B67890）</div>
                </div>
                <div class="timeline-item">
                  <div class="time">2025-11-23 07:55</div>
                  <div class="desc">【苏州市】快件已到达 虎丘区营业部</div>
                </div>
                <div class="timeline-item">
                  <div class="time">2025-11-23 09:10</div>
                  <div class="desc">【苏州市】快递员 李师傅 138****9876 正在派送</div>
                </div>
              </div>

              <p class="note">📱 快递短信：【中通快递】您的包裹 7730... 正在派送，请保持电话畅通。</p>
            </div>

            <div v-if="selectedStep === 3" class="detail-card">
              <h3>已签收，交易完成</h3>
              <p class="muted">签收时间：{{ orderDetails?.completeTime ?? orderDetails?.createTime }}　|　签收人：本人（前台代收）</p>
              <ul>
                <li>签收地址：江苏省苏州市虎丘区竹园路 209 号 3 栋 2 单元 801</li>
                <li>包裹状态：完好无损，已拍照留档</li>
                <li>售后服务：7 天无理由退货（运费险已生效）</li>
                <li>评价奖励：晒图返 2 元红包 + 10 积分</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      <!-- 右侧信息栏 -->
      <div class="sidebar">
        <!-- 商品信息 -->
        <div class="product-info">
          <div class="store-badge">
            <span class="badge">订单商品</span>
          </div>

          <div class="product-item">
            <img :src="orderDetails?.orderItems[0]?.cover" alt="Product" class="product-img" />
            <div class="product-details">
              <h3>{{ orderDetails?.orderItems[0]?.title }}</h3>
              <p class="price">¥{{ orderDetails?.orderItems[0]?.totalPrice }}</p>
              <p class="quantity">x{{ orderDetails?.orderItems[0]?.quantity }}</p>
            </div>
          </div>
        </div>
        <!-- 分割线 -->
        <div class="divider"></div>
        <div class="section">
          <h3>付款详情</h3>
          <ul>
            <li><span>商品总价：</span> ¥{{ orderDetails?.totalAmount }}</li>
            <li><span>实付款：</span> ¥{{ orderDetails?.totalAmount }}</li>
          </ul>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <div class="section">
          <h3>订单信息</h3>
          <ul>
            <li><span>收货信息：</span>
              <span v-if="selectedAddress">
                {{ selectedAddress.name }} {{ selectedAddress.telephone }}<br />
                {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}
                {{ selectedAddress.detail }}
              </span>
              <span v-else>—</span>
            </li>
            <li><span>创建时间：</span> {{ orderDetails?.createTime }}</li>
            <li><span>付款时间：</span> {{ orderDetails?.payTime ?? orderDetails?.createTime }}</li>
            <li><span>小绿叶：</span> {{ orderDetails?.leaf ?? 0 }}片</li>
          </ul>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <div class="section">
          <h3>订单服务</h3>
          <p>包含退货宝等服务</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.order-details-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f5ef;
}

.order-details-layout {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  margin-bottom: 20px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  /* 保持容器居中，但内部两列宽度固定 */
}

/* 将主内容区设为固定宽度，避免因进度条伸长导致整体布局拉伸 */
.main-content {
  flex: 0 0 820px; /* 固定主栏宽度 */
  width: 820px;
  padding: 0 20px;
  min-height: 0;
}

/* 右侧固定宽度面板 */
.sidebar {
  width: 30%;
  margin-left: auto;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background-color: #ffffff;
  justify-content: flex-end; /* 内容靠右 */
  height: 700px;
}

/* 调整横向步骤条在固定主栏内的最大宽度，不再影响左右栏 */
.steps-row { display:flex; align-items:center; justify-content:space-between; width:100%; max-width:100%; padding: 12px 12px; box-sizing:border-box }
.steps-details { width:100%; max-width:100% }

/* 面包屑：左对齐，取消居中 */
.breadcrumb {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  color: #666;
  max-width: none; /* 不限制宽度，以便靠左对齐 */
  margin: 12px 0 0 24px; /* 左对齐，不再居中 */
}

.page-title {
  margin: -40px 0 0 0;
  color: #2D583F;
  font-size: 15px;
  font-weight: bold;
}

.recruit-steps { display:flex; gap:24px; }
.steps-left { width:140px; display:flex; flex-direction:column; align-items:flex-start; padding-left: 8px }
.step { position:relative; display:flex; flex-direction:column; align-items:flex-start; margin:12px 0; }
.dot { width:40px; height:40px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:bold; transition: background 240ms ease, transform 240ms ease, color 240ms ease; }
.step.active .dot { background:#b5dcc7; color:#fff; transform: scale(1.05); }
.label { margin-top:8px; font-size:13px; color:#333; margin-left:8px }
.connector { width:4px; height:40px; background:#e6e6e6; margin:8px 0 8px 18px; transition: background 240ms ease; }
.connector.filled { background:#b5dcc7; }
.steps-right { flex:1; min-width: 0 }
.detail-card { background:#fff; padding:16px; border-radius:6px; margin-bottom:12px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }

/* 交易成功提示样式 */
.transaction-success {
  margin: 20px 0;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
}

.transaction-success h2 {
  margin: 0 0 10px;
  color: #2D583F;
  font-size: 20px;
}

.transaction-success .note {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.transaction-success .address {
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.expanded-logistics {
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(200, 177, 150, 0.18);
  border-left: 3px solid #ffffff;
  border-radius: 4px;
  font-size: 14px;
}

.link {
  color: #5fa262;
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.divider {
  margin: 20px 0;
  border-top: 1px solid rgba(14, 14, 14, 0.57);
}

.btn-primary {
  background-color: #B5DCC7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.product-info {
  margin: 10px 0;
}

.store-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.badge {
  background-color: #ff9900;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.store-name {
  font-weight: bold;
  color: #333;
}

.view-fast {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.product-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.product-details {
  flex-grow: 1;
}

.product-details h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
}

.price {
  font-size: 18px;
  color: #d40000;
  font-weight: bold;
}

.quantity {
  color: #666;
  font-size: 14px;
}

.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.section h3 {
  margin: 0 0 10px;
  color: #333;
  font-size: 18px;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section li {
  margin: 8px 0;
  display: flex;
  gap: 10px;
}

.section span {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.section p {
  margin: 8px 0;
  color: #666;
}

.breadcrumb {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  color: #666;
  max-width: none; /* 不限制宽度，以便靠左对齐 */
  margin: 12px 0 0 24px; /* 左对齐，不再居中 */
}
.crumb { cursor: pointer; transition: color 0.2s; }
.crumb:hover { color: #2d583f; }
.crumb.current { color: #222; font-weight: 600 }
.sep { color: #bbb }

/* 复用现有进度条样式，新增小调整以保证细节展示 */
.muted { color:#666; margin-bottom:8px }
.shipping-summary { display:flex; flex-direction:column; gap:6px; margin:12px 0 }
.result-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-top:12px }
.timeline { margin-top:8px; }
.timeline-item { padding:8px 0; border-bottom:1px dashed #eee; }
.timeline-item .time { font-size:12px; color:#888 }

/* 新增横向步骤条样式 */
.recruit-steps.horizontal { display:flex; flex-direction:column; gap:18px; align-items:center }

.steps-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;          /* 原来是 1100px，改为 100% */
  padding: 12px 12px;          /* 去掉左右 16px，让线贴边 */
  box-sizing: border-box;
}
.h-node { display:flex; flex-direction:column; align-items:center; width:120px; text-align:center }
.h-dot { position:relative; width:48px; height:48px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:bold; transition: background 240ms ease, transform 240ms ease, color 240ms ease }
.h-node.active .h-dot { background:#b5dcc7; color:#fff; transform:scale(1.05) }
.h-node.current .h-dot { transform:scale(1.18); box-shadow:0 8px 20px rgba(45,88,63,0.16) }
.h-label { margin-top:8px; font-size:13px; color:#333 }
.h-connector { height:8px; flex:1; background:#e6e6e6; margin:0 28px; border-radius:4px; transition:background 240ms ease }
.h-connector.filled { background:#b5dcc7 }
.steps-details { width:100%; max-width:1100px }

/* 在已有样式后追加 */
.h-node.active .h-dot {
  background: #b5dcc7;
  color: transparent;          /* 隐藏数字 */
}
.h-node.active .h-dot::after {
  content: '✓';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 18px;
  line-height: 1;
}

/* 取消节点样式 */
.h-node.cancel-node .h-dot {
  background: #c4c4c4;
  color: transparent;
}
.h-node.cancel-node .h-dot::after {
  content: '✕';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 18px;
  line-height: 1;
}
</style>
