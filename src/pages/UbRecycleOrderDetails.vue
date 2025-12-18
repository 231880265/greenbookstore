<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import Footer from '../components/Footer.vue'
import { getUsedBookOrders } from '../api/index'
import type { UsedBookOrderVO } from '../api/types'

const route = useRoute()
const id = Number(route.params.id || route.query.id || 0)
const order = ref<UsedBookOrderVO | null>(null)
const status = ref<string>('')
const logistics = ref<Array<{ time: string; status: string; location?: string }>>([])

const fetchOrder = async () => {
  try {
    // 后端没有单独的 getById 接口，这里先请求回收订单列表然后匹配 id
    const res: any = await getUsedBookOrders()
    const list: UsedBookOrderVO[] = res?.data?.data || res?.data || []
    order.value = list.find((o) => o.id === id) || null

    // 如果没有找到，可设置占位数据以便展示 UI
    if (!order.value) {
      order.value = {
        id: id || 0,
        sellerId: 0,
        adId: '未知地址',
        status: 'CHECKING',
        price: 42,
        listPrice: 60,
        cover: '/src/assets/book1.jpg',
        title: '示例回收书：计算机网络（第7版）',
        writer: '谢希仁',
        usedDegree: 3,
        isbn: '9787115281234'
      }
    }

    status.value = order.value.status

    // 根据状态构建物流/进度详情（示例数据，可替换为真实接口）
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
    console.error(e)
  }
}

onMounted(() => {
  fetchOrder()
})

const currentStep = computed(() => {
  if (status.value === 'CHECKING') return 0
  if (status.value === 'SHIPPED') return 1
  if (status.value === 'COMPLETED') return 2
  return 0
})
</script>

<template>
  <div class="recycle-order-page">
    <HeaderBar />

    <div class="page-container">
      <div class="main-content">
        <h1>回收订单详情</h1>

        <!-- 进度条（腾讯招聘风格：三个点 + 右侧具体进展描述） -->
        <div class="recruit-steps">
          <div class="steps-left">
            <div class="step" :class="{ active: currentStep >= 0 }">
              <div class="dot">1</div>
              <div class="label">审核中</div>
            </div>

            <div class="connector"></div>

            <div class="step" :class="{ active: currentStep >= 1 }">
              <div class="dot">2</div>
              <div class="label">运输中</div>
            </div>

            <div class="connector"></div>

            <div class="step" :class="{ active: currentStep >= 2 }">
              <div class="dot">3</div>
              <div class="label">已完成</div>
            </div>
          </div>

          <div class="steps-right">
            <div v-if="status === 'CHECKING' || currentStep === 0" class="detail-card">
              <h3>审核中 — 详细进展</h3>
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

            <div v-if="status === 'SHIPPED' || currentStep === 1" class="detail-card">
              <h3>运输中 — 物流轨迹</h3>
              <table class="logistics-table">
                <thead>
                  <tr><th>时间</th><th>进展</th><th>地点</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(l, idx) in logistics" :key="idx">
                    <td>{{ l.time }}</td>
                    <td>{{ l.status }}</td>
                    <td>{{ l.location || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="status === 'COMPLETED' || currentStep === 2" class="detail-card">
              <h3>已完成 — 回收结果</h3>
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

        <div class="actions">
          <button class="btn-primary">联系回收方</button>
          <button class="btn-secondary">查看更多订单</button>
        </div>
      </div>

      <aside class="sidebar">
        <div class="order-card">
          <img :src="order?.cover" alt="cover" class="cover" />
          <div class="meta">
            <h3 class="title">{{ order?.title }}</h3>
            <p class="writer">作者：{{ order?.writer }}</p>
            <p class="isbn">ISBN：{{ order?.isbn }}</p>
            <p class="price">回收价：¥{{ order?.price }} <span class="list">原价 ¥{{ order?.listPrice }}</span></p>
            <p>成色等级：{{ order?.usedDegree }}</p>
            <p>订单 ID：{{ order?.id }}</p>
            <p>寄回地址：{{ order?.adId }}</p>
          </div>
        </div>

        <div class="info-box">
          <h4>订单状态</h4>
          <p>{{ order?.status }}</p>
        </div>

        <div class="info-box">
          <h4>卖家 / 回收方</h4>
          <p>ID：{{ order?.sellerId }}</p>
        </div>
      </aside>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.recycle-order-page { background: #fffaf0; min-height: 100vh; }
.page-container { display:flex; max-width:1200px; margin: 32px auto; gap:20px; }
.main-content { flex:1; padding: 20px; }
.sidebar { width:340px; padding:20px; }
.recruit-steps { display:flex; gap:20px; }
.steps-left { display:flex; flex-direction:column; align-items:center; width:140px; }
.step { display:flex; flex-direction:column; align-items:center; margin:12px 0; }
.dot { width:40px; height:40px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:bold; }
.step.active .dot { background:#b5dcc7; color:#fff }
.label { margin-top:8px; }
.connector { width:4px; height:40px; background:#e6e6e6; }
.steps-right { flex:1; }
.detail-card { background:#fff; padding:16px; border-radius:6px; margin-bottom:12px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
.timeline { margin-top:8px; }
.timeline-item { padding:8px 0; border-bottom:1px dashed #eee; }
.timeline-item .time { font-size:12px; color:#888 }
.logistics-table { width:100%; border-collapse:collapse; }
.logistics-table th, .logistics-table td { padding:8px; border-bottom:1px solid #f0f0f0; text-align:left; }
.actions { margin-top:12px; display:flex; gap:8px }
.btn-primary { background:#5fa262; color:#fff; padding:8px 14px; border-radius:4px; border:none }
.btn-secondary { background:#f5f5f5; padding:8px 14px; border-radius:4px; border:1px solid #ddd }
.order-card { display:flex; gap:12px; align-items:flex-start; background:#fff; padding:12px; border-radius:6px; }
.cover { width:80px; height:100px; object-fit:cover; border-radius:4px }
.meta { flex:1 }
.title { margin:0 0 6px 0 }
.price { color:#d32; font-weight:bold }
.price .list { color:#999; font-size:12px; margin-left:8px }
.info-box { background:#fff; padding:12px; border-radius:6px; margin-top:12px }
</style>