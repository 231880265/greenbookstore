<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import HeaderBar from "../components/HeaderBar.vue";
import Footer from "../components/Footer.vue";

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

interface OrderDetails {
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createTime: string;
  adId: string;
  orderItems: OrderItem[];
}

// 响应式订单数据
const orderDetails = ref<OrderDetails | null>(null);
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
    case 'CANCELLED': return 0 // 取消视为在第 0 步之后中断
    default: return 0
  }
}

// 动画：逐步推进 displayedStep 到目标位置
const animateTo = (target: number, cancelled = false) => {
  displayedStep.value = -1
  isCanceled.value = false
  const stepDelay = 500 // 增大延迟以便观察动画
  let i = -1
  const tick = () => {
    i++
    if (i > target) {
      if (cancelled) {
        // 在到达第 0 步后短延迟显示取消状态
        setTimeout(() => {
          isCanceled.value = true
        }, 200)
      }
      return
    }
    displayedStep.value = i
    setTimeout(tick, stepDelay)
  }
  tick()
}

// 新增：步骤文本数组（用于渲染节点）
const steps = ['拍下宝贝', '买家付款', '卖家发货', '确认收货']

// 进度条百分比（用于横向进度动画），4 步：0..3
const progressPercent = computed(() => {
  if (displayedStep.value < 0) return 0
  const stepsCount = steps.length
  return Math.round(((displayedStep.value + 1) / stepsCount) * 100)
})

// 获取订单详情（演示数据或真实接口）
const fetchOrderDetails = async () => {
  try {
    // 真实接口处可替换为 axios.get('/api/orders/my/' + orderId)
    // 这里使用模拟数据
    orderDetails.value = {
      orderId: '10001',
      totalAmount: 120.00,
      paymentMethod: 'ALIPAY',
      status: 'PAID',
      createTime: '2025-04-12T14:30:00',
      adId: '江苏省 苏州市 虎丘区 东渚街道 东渚街道太湖大道1520号南京大学东校区（邮政快递服务中心）',
      orderItems: [
        {
          ubId: 1,
          title: '【小猴子同款】INSBAHA原色波塔眼线胶笔砍刀卧蚕笔持久不易晕',
          writer: 'INSBAHA',
          publisher: 'INSBAHA旗舰店',
          cover: 'https://example.com/images/product.jpg',
          quantity: 1,
          price: 60.00,
          totalPrice: 60.00
        }
      ]
    };
  } catch (error) {
    console.error('Failed to fetch order details:', error);
  }
};

onMounted(() => {
  // 模拟获取数据
  fetchOrderDetails()
});

// 监听订单数据变化，触发进度条动画
watch(orderDetails, (val) => {
  const target = mapStatusToStep(val?.status)
  if (val?.status === 'CANCELLED') {
    // 取消：先动画到第 0 步，再显示中断 ❌
    animateTo(target, true)
  } else {
    animateTo(target, false)
  }
})

</script>

<template>
  <div class="order-details-page">
    <HeaderBar />
    <div class="order-details-layout">
      <!-- 左侧主内容 -->
      <div class="main-content">
        <!-- 页面标题 -->
        <div class="page-title">
          <h1>小绿书 - 订单详情</h1>
        </div>

        <!-- 改造后的进度条：节点在进度条上 -->
        <div class="progress-bar">
          <div class="progress-track">
            <div class="progress-line" aria-hidden="true" :style="{ '--filled': progressPercent + '%' }">
              <div class="progress-inner" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="nodes">
              <div
                v-for="(label, idx) in steps"
                :key="idx"
                class="node"
                :class="{ active: displayedStep >= idx, current: displayedStep === idx, cancelled: isCanceled && idx === (displayedStep + 1) }
                "
                :style="{ left: (idx / (steps.length - 1) * 100) + '%' }"
              >
                <div class="node-circle">
                  <span class="node-mark">{{ displayedStep > idx ? '✓' : (isCanceled && idx === displayedStep + 1 ? '❌' : (displayedStep === idx ? '' : idx + 1)) }}</span>
                </div>
                <div class="node-label">{{ label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 交易成功提示 -->
        <div class="transaction-success">
          <h2>交易成功</h2>
          <div class="note">
            <p>
              <span class="icon">📦</span> 已签收 您的快件已在代收点取出签收，如遇问题请联系快递员【姜长霞：18020275037】，无需找商家/平台。签收代收点：代收点-南京大学苏州校区东区邮局，网点电话：0512-87821834，投诉电话：18020272107。关注“中通快递”官方微信公众号反馈问题，处理更快速！
              <a href="#" class="link" @click.prevent="isLogisticsOpen = !isLogisticsOpen">
                {{ isLogisticsOpen ? '收起' : '查看物流详情' }}
              </a>
            </p>
            <div v-if="isLogisticsOpen" class="expanded-logistics">
              <p><strong>快递公司：</strong>中通快递</p>
              <p><strong>快递单号：</strong>YT123456789</p>
              <p><strong>当前状态：</strong>已签收</p>
              <p><strong>预计送达：</strong>2025-11-21</p>
            </div>
          </div>
          <p class="address">
            <span class="icon">📍</span> 江苏省 苏州市 虎丘区 东渚街道 东渚街道太湖大道1520号南京大学东校区（邮政快递服务中心）
            <br />
            彭馨怡 86-182****5810
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-primary">评价</button>
          <button class="btn-secondary">再买一单</button>
          <button class="btn-secondary">查看物流</button>
          <button class="btn-secondary">加入购物车</button>
          <button class="btn-secondary">申请开票</button>
          <button class="btn-secondary">删除订单</button>
          <button class="btn-secondary">打印</button>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <!-- 商品信息 -->
        <div class="product-info">
          <div class="store-badge">
            <span class="badge">天猫</span>
            <span class="store-name">INSBAHA原色波塔旗舰店</span>
            <button class="view-fast">查看交易快照</button>
          </div>

          <div class="product-item">
            <img :src="orderDetails?.orderItems[0]?.cover" alt="Product" class="product-img" />
            <div class="product-details">
              <h3>{{ orderDetails?.orderItems[0]?.title }}</h3>
              <p class="price">¥{{ orderDetails?.orderItems[0]?.totalPrice }}</p>
              <p class="quantity">x1</p>
              <div class="actions">
                <button class="btn-secondary">申请售后</button>
                <button class="btn-secondary">加入购物车</button>
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
            <li><span>运费(快递)：</span> ¥0.00</li>
            <li><span>店铺优惠：</span> -¥20.00</li>
            <li><span>实付款：</span> ¥{{ orderDetails?.totalAmount }}</li>
          </ul>
        </div>

        <!-- 分割线 -->
        <div class="divider"></div>

        <div class="section">
          <h3>订单信息</h3>
          <ul>
            <li><span>订单编号：</span> {{ orderDetails?.orderId }}</li>
            <li><span>收货信息：</span> {{ orderDetails?.adId }}</li>
            <li><span>创建时间：</span> {{ orderDetails?.createTime }}</li>
            <li><span>付款时间：</span> {{ orderDetails?.createTime }}</li>
            <li><span>发货时间：</span> 2025-11-11 12:53:18</li>
            <li><span>成交时间：</span> 2025-11-21 12:53:23</li>
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
  margin-left: auto; /* 左侧留白 */
  margin-right: auto; /* 居中对齐 */
}

.main-content {
  flex-grow: 1;
  width: 70%;
  padding: 0 20px;
  min-height: 0;
}

.page-title {
  margin: -40px 0 0 0;
  color: #2D583F;
  font-size: 15px;
  font-weight: bold;
}

.progress-bar {
  padding: 20px 0 6px;
}

.progress-track {
  position: relative;
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
}

.progress-line {
  height: 12px;
  background: #e8efe6;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg,#b5dcc7,#2d583f);
  width: 0%;
  transition: width 0.6s cubic-bezier(.22,.9,.3,1);
}

.nodes {
  position: absolute;
  top: -14px;
  left: 0;
  right: 0;
  height: 48px;
  pointer-events: none;
}

.node {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  pointer-events: auto;
}

.node-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f6ef;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow: 0 2px 6px rgba(45,88,63,0.08);
  transition: transform 300ms cubic-bezier(.2,.9,.3,1), background-color 300ms ease, box-shadow 300ms ease;
}

.node-mark {
  font-weight: 600;
  color:#4b5b4b;
  transition: color 200ms ease;
}

.node-label {
  margin-top:8px;
  font-size:12px;
  color:#666;
  width:120px;
  text-align:center;
}

/* 激活态：进度到达或超过该节点 */
.node.active .node-circle {
  background: linear-gradient(180deg,#cfe8d4,#8fc996);
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(45,88,63,0.18);
}

.node.active .node-mark {
  color: #fff;
}

/* 当前节点：更明显的放大效果，表现注入能量 */
.node.current .node-circle {
  transform: scale(1.28);
  box-shadow: 0 10px 26px rgba(45,88,63,0.28);
}

/* 取消态：灰色并显示 ❌ （由模板逻辑控制显示） */
.node.cancelled .node-circle {
  background: #d8d8d8;
}

.node.cancelled .node-mark {
  color: #fff;
}

/* 连接线根据进度改变：用渐变遮罩来表现能量注入 */
.progress-line::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(181,220,199,0.85) 0%, rgba(181,220,199,0.85) var(--filled), rgba(232,239,230,0.5) var(--filled));
  mix-blend-mode: normal;
}

/* 兼容旧连接样式，提供更平滑视觉 */
@media (max-width: 960px) {
  .node-label { font-size:11px; width:90px }
}

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
  margin: 20px 0;
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

.sidebar {
  width: 30%;
  margin-left: auto;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background-color: #ffffff;
  justify-content: flex-end; /* 内容靠右 */
  max-height: 600px;
}

.section {
  margin-bottom: 20px;
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
</style>
