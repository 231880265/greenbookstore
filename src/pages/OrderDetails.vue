<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import HeaderBar from "../components/HeaderBar.vue";

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

// 获取订单详情
const fetchOrderDetails = async (orderId: string) => {
  try {
    const response = await axios.get(`/api/orders/my/${orderId}`, {
      headers: { token: 'your-token-here' },
      params: { userId: 123 }, // 请替换为真实的 userId
    });
    orderDetails.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch order details:', error);
  }
};

// onMounted(() => {
//   // 模拟订单ID为 '10001' 获取数据
//   fetchOrderDetails('10001');
// });

onMounted(() => {
  // 模拟订单详情数据
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
});

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
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="step-item">
            <div class="step-icon completed">✓</div>
            <div class="step-text">拍下宝贝</div>
          </div>
          <div class="step-item">
            <div class="step-icon completed">✓</div>
            <div class="step-text">买家付款</div>
          </div>
          <div class="step-item">
            <div class="step-icon completed">✓</div>
            <div class="step-text">卖家发货</div>
          </div>
          <div class="step-item">
            <div class="step-icon completed">✓</div>
            <div class="step-text">确认收货</div>
          </div>
        </div>

        <!-- 交易成功提示 -->
        <div class="transaction-success">
          <h2>交易成功</h2>
          <p class="note">
            <span class="icon">📦</span> 已签收 您的快件已在代收点取出签收，如遇问题请联系快递员【姜长霞：18020275037】，无需找商家/平台。签收代收点：代收点-南京大学苏州校区东区邮局，网点电话：0512-87821834，投诉电话：18020272107。关注“中通快递”官方微信公众号反馈问题，处理更快速！
            <a href="#" class="link" @click.prevent="isLogisticsOpen = !isLogisticsOpen">
              {{ isLogisticsOpen ? '收起' : '查看物流详情' }}
            </a>
            <div v-if="isLogisticsOpen" class="expanded-logistics">
              <p><strong>快递公司：</strong>中通快递</p>
              <p><strong>快递单号：</strong>YT123456789</p>
              <p><strong>当前状态：</strong>已签收</p>
              <p><strong>预计送达：</strong>2025-11-21</p>
            </div>
          </p>
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
  </div>
</template>


<style scoped>
.order-details-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgba(255, 246, 239, 0.84);
}

.order-details-layout {
  display: flex;
  gap: 20px;
  margin-top: 40px;
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
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 80%; /* 缩小宽度，更紧凑 */
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step-icon {
  width: 28px; /* 增大 */
  height: 28px;
  border-radius: 50%;
  border: 1px solid #fff0da;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px; /* 增大字体 */
  color: #C8B196;
}

.step-icon.completed {
  background-color: #B5DCC7;
  color: white;
}

.step-text {
  font-size: 15px;
  color: #0e0e0e;
}

/* 连接线 */
.step-item::before {
  content: '';
  position: absolute;
  top: 14px;
  right: -160px;
  width: 160px;
  height: 4px;
  background-color: #B5DCC7;
  z-index: 2;
}

.step-item:last-child::before {
  display: none;
}

.transaction-success {
  margin: 20px 0;
  padding: 15px;
  background-color: #fff0DA;
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
  border-left: 3px solid #C8B196;
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
  background-color: #fff0DA;
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
