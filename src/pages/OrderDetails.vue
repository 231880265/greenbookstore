<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HeaderBar from "../components/HeaderBar.vue";
import BreadcrumbBar from "../components/BreadcrumbBar.vue";
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

// 控制物流信息的展开和收起（暂无使用）

// 新增：用于控制进度条动态展示的变量
const displayedStep = ref(-1) // 当前已经展示到的步骤索引（动画过程中增长）
const selectedStep = ref<number>(-1) // 仅在动画到达目标后显示对应的详情
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
  // 如果目标小于等于当前已展示，则直接设定并返回（同时显示详情）
  if (target <= displayedStep.value) {
    displayedStep.value = target
    if (cancelled) isCanceled.value = true
    selectedStep.value = target
    return
  }

  const stepDelay = 400
  const start = Math.max(0, displayedStep.value + 1)
  for (let step = start; step <= target; step++) {
    const t = setTimeout(() => {
      displayedStep.value = step
      // 仅当到达目标时才展示详情（避免动画过程中切换详情）
      if (step === target) {
        if (cancelled) isCanceled.value = true
        selectedStep.value = target
        clearAnimation()
      }
    }, stepDelay * (step - start + 1))
    timers.push(t)
  }
}

// 格式化时间，供界面显示
const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)

  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 新增：步骤文本数组（用于渲染节点）
const steps = computed(() =>
    orderDetails.value?.status === 'CANCELLED'
        ? ['拍下宝贝', '取消订单']
        : ['拍下宝贝', '买家付款', '卖家发货', '确认收货']
);

// 获取订单详情（调用后端新接口）
const fetchOrderDetails = async () => {
  try {

    const res: any = await getMyOrderById(orderIdParam)
    console.log('获取订单详情', res)
    // 优先取常见封装层 data.data -> data -> res
    const data = res?.data?.data ?? res?.data ?? res

    if (!data) {
      // 接口无数据时保持为空，不使用本地死数据
      orderDetails.value = null
    } else {
      // 兼容字段名：如果后端返回 paymentTime，映射到 payTime
      if (typeof data.paymentTime !== 'undefined' && typeof data.payTime === 'undefined') {
        data.payTime = data.paymentTime
      }

      // 直接使用后端返回的原始数据（不与占位数据合并）
      orderDetails.value = data as OrderDetails

      // 若有 adId，查询地址列表并匹配（在 orderDetails 赋值后再去查）
      if (orderDetails.value?.adId) {
        try {
          const addrRes: any = await getAddressList()
          const list: AddressItem[] = addrRes?.data || []
          selectedAddress.value = list.find(a => Number(a.id) === Number(orderDetails.value!.adId)) || null
        } catch (e) {
          console.error('获取地址列表失败', e)
          selectedAddress.value = null
        }
      }
    }

    const target = mapStatusToStep(orderDetails.value?.status as string | undefined)
    displayedStep.value = -1
    animateTo(target)
  } catch (e) {
    console.error('获取订单详情失败', e)
    // 出错时置空数据，不使用占位数据
    orderDetails.value = null
    const target = mapStatusToStep(orderDetails.value?.status as string | undefined)
    displayedStep.value = -1
    animateTo(target)
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
    <BreadcrumbBar :items="[{ label: '购书订单', path: '/orders' }, { label: '订单详情' }]" />

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
                  :class="{ active: displayedStep >= idx, current: displayedStep === idx, 'cancel-node': label === '取消订单' }"
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
              <p class="muted">订单号：20251121001　|　下单时间：{{ formatTime(orderDetails?.createTime) }}</p>
              <ul>
                <li>收货信息：
                  <div v-if="selectedAddress" class="address-lines">
                    <div class="line">{{ selectedAddress.name }}　{{ selectedAddress.telephone || selectedAddress.phone }}</div>
                    <div class="line">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}</div>
                    <div class="line">{{ selectedAddress.detail }}</div>
                  </div>
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
                <li>支付时间：{{ formatTime(orderDetails?.payTime ?? orderDetails?.createTime) }}</li>
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
                <div><strong>发货时间：</strong>{{ formatTime(orderDetails?.shipTime ?? '2025-11-05T08:20:00') }}</div>
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

            <div v-if="selectedStep === 3" class="detail-card done-card">
              <!-- 顶部状态 -->
              <div class="done-header">
                <div>
                  <h3>已签收，交易完成</h3>
                  <p class="done-sub">签收人：本人（前台代收） · {{ formatTime(orderDetails?.completeTime || orderDetails?.shipTime) }}</p>
                </div>
              </div>

              <!-- 收货信息 -->
              <div class="done-section">
                <div class="sec-title">收货信息</div>
                <div class="address-box">
                  <span class="name">{{ selectedAddress.name }}</span>
                  <span class="phone">{{ selectedAddress.telephone || selectedAddress.phone }}</span>
                  <div class="addr">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detail }}</div>
                </div>
              </div>

              <!-- 包裹 & 售后 -->
              <div class="done-grid">
                <div class="grid-item">
                  <div class="label">包裹状态</div>
                  <div class="value">完好无损，已拍照留档</div>
                </div>
                <div class="grid-item">
                  <div class="label">售后服务</div>
                  <div class="value">7 天无理由退货（运费险已生效）</div>
                </div>
                <div class="grid-item">
                  <div class="label">评价奖励</div>
                  <div class="value highlight">晒图返 2 元红包 + 10 积分</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="divider"></div>
        <!-- 商品信息 -->
        <div class="product-info">

          <div v-if="!(orderDetails?.orderItems?.length)" class="no-data">
            <p>暂无商品信息</p>
          </div>

          <div v-else class="product-list">
            <div class="product-item" v-for="item in (orderDetails?.orderItems ?? [])" :key="item.ubId  || item.title">
              <img :src="item.cover" alt="Product" class="product-img" />
              <div class="product-info">
                <h3 class="title">{{ item.title }}</h3>
                <div class="meta">{{ item.writer }} <span class="sep">|</span> {{ item.publisher }}</div>
              </div>
              <div class="product-nums">
                <div class="num-cell">
                  <span class="label">单价</span>
                  <span class="value">¥{{ item.price?.toFixed ? item.price.toFixed(2) : item.price }}</span>
                </div>
                <div class="num-cell">
                  <span class="label">数量</span>
                  <span class="value">x{{ item.quantity }}</span>
                </div>
                <div class="num-cell">
                  <span class="label">小计</span>
                  <span class="value highlight">¥{{ item.totalPrice?.toFixed ? item.totalPrice.toFixed(2) : item.totalPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 右侧信息栏 -->
      <div class="sidebar">
        <div class="section">
          <h3>付款详情</h3>
          <ul>
            <li><span>商品总价：</span> ¥{{ orderDetails?.totalAmount }}</li>
            <li><span>小绿叶：</span> {{ orderDetails?.leaf }}片</li>
          </ul>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <div class="section">
          <h3>订单信息</h3>
          <ul>
            <li><span>订单编号：</span> 2817912794342151{{ orderDetails?.orderId}}</li>
            <li><span>收获信息：</span>
              <div v-if="selectedAddress" class="address-lines">
                <div class="line">{{ selectedAddress.name }},{{ selectedAddress.telephone || selectedAddress.phone }}</div>
                <div class="line">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}</div>
                <div class="line">{{ selectedAddress.detail }}</div>
              </div>
            </li>
            <li><span>创建时间：</span> {{ formatTime(orderDetails?.createTime) }}</li>
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
  background-color: #fcfbf8;
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

.recruit-steps { display:flex; gap:24px; }
.step.active .dot { background: #214d17; color:#fff; transform: scale(1.05); }
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

.divider {
  margin: 20px 0;
  border-top: 1px solid rgba(14, 14, 14, 0.57);
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
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.product-info {
  min-width: 0;
}

.product-info .title {
  margin: 0 0 6px;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info .meta {
  font-size: 13px;
  color: #666;
}

.product-nums {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 32px;
  text-align: right;
  white-space: nowrap;
}

.num-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.num-cell .label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.num-cell .value {
  font-size: 14px;
  color: #333;
}

.num-cell .highlight {
  font-weight: 600;
  color: #d40000;
}


.product-details h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
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
.h-node.active .h-dot {
  background: #3d6b40;
  color:#fff;
  transform:scale(1.05)
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
.h-node.current .h-dot {
  transform:scale(1.18);
  box-shadow:0 8px 20px rgba(45,88,63,0.16)
}
.h-label { margin-top:8px; font-size:13px; color:#333 }
.h-connector {
  height: 8px;
  flex: 1.5;
  /* background: #e6e6e6; */
  margin: 0 0 20px 0;
  border-radius: 4px;
  transition: background 240ms ease;
}
.h-connector.filled { background: #3d6b40
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

.steps-details { width:100%; max-width:1100px }

.address-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.line {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

/* ===== 已签收卡片 ===== */
.done-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.done-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.done-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2d583f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.done-header h3 {
  margin: 0;
  font-size: 18px;
  color: #222;
}

.done-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
}

/* 收货信息 */
.done-section {
  margin-bottom: 20px;
}

.sec-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.address-box {
  background: #f7f7f7;
  border-radius: 6px;
  padding: 12px 16px;
  line-height: 1.6;
}

.address-box .name {
  font-weight: 600;
  margin-right: 8px;
}

.address-box .phone {
  color: #666;
}

.address-box .addr {
  color: #444;
  margin-top: 2px;
}

/* 网格信息 */
.done-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.grid-item .label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.grid-item .value {
  font-size: 14px;
  color: #333;
}

.grid-item .highlight {
  color: #d40000;
  font-weight: 600;
}

/* 按钮 */
.done-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  border-color: #2d583f;
  color: #2d583f;
}

.btn.primary {
  background: #2d583f;
  color: #fff;
  border-color: #2d583f;
}

.btn.primary:hover {
  background: #214d17;
}

/* ========= 右侧“订单信息”卡片纯美化 ========= */
.sidebar .section:nth-of-type(2) {   /* 第二个 section 就是订单信息 */
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.sidebar .section:nth-of-type(2) h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.sidebar .section:nth-of-type(2) ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar .section:nth-of-type(2) li {
  margin: 0 0 12px;
  display: flex;
  align-items: baseline;
  line-height: 1.6;
  font-size: 14px;
  color: #333;
}

/* 让“收货信息”那一行整行占满并换行 */
.sidebar .section:nth-of-type(2) li:last-child {
  display: block;
}

.sidebar .section:nth-of-type(2) li > span:first-child {
  flex-shrink: 0;
  width: 72px;
  margin-right: 12px;
  font-size: 13px;
  color: #666;
  font-weight: normal;
}

/* 地址内部再微调 */
.sidebar .section:nth-of-type(2) .address-lines {
  margin-top: 6px;
  padding-left: 84px;   /* 72+12 与标签对齐 */
}

.sidebar .section:nth-of-type(2) .address-lines .line {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

/* 订单编号用等宽字体更专业 */
.sidebar .section:nth-of-type(2) li:first-child .line:last-child,
.sidebar .section:nth-of-type(2) li:first-child span:last-child {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  color: #222;
}
</style>
