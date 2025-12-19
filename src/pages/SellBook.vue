<template>
  <div class="sell-page">
    <HeaderBar />

    <!-- 面包屑 -->
    <BreadcrumbBar :items="[{ label: '我要卖书' }]" />

    <main class="sell-main">
      <!-- 顶部：流程提示 + 进度条 -->
      <section class="flow-section">
        <h2 class="section-title">图书回收流程</h2>
        <div class="flow-steps">
          <div class="step">
            <span class="num">1</span>
            <div class="text">上传书籍信息</div>
          </div>
          <div class="step">
            <span class="num">2</span>
            <div class="text">系统估价 / 选择地址</div>
          </div>
          <div class="step">
            <span class="num">3</span>
            <div class="text">上门取件 / 自寄</div>
          </div>
          <div class="step">
            <span class="num">4</span>
            <div class="text">质检入库，发放小绿叶</div>
          </div>
        </div>

        <div class="progress-wrapper">
          <div class="progress-label">
            当前进度：{{ progressPercent }}%
          </div>
          <div class="progress-bar">
            <div class="progress-inner" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </section>

      <!-- 中部：左表单 + 右估价 -->
      <section class="content-section">
        <div class="content-left">
          <h3 class="section-subtitle">1. 上传书籍信息</h3>

          <div class="upload-block">
            <div class="upload-preview" v-if="form.cover">
              <img :src="form.cover" alt="书籍封面" />
            </div>
            <div class="upload-actions">
              <button class="primary-btn" @click="onChooseCover">上传书籍照片</button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="onCoverChange"
              />
              <p class="hint">建议上传正面封面照片，支持 JPG / PNG。</p>
            </div>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>书名</span>
              <input v-model="form.title" placeholder="请输入书名" />
            </label>

            <label class="field">
              <span>作者</span>
              <input v-model="form.writer" placeholder="作者名称" />
            </label>

            <label class="field">
              <span>定价（原价）</span>
              <input v-model.number="form.listPrice" type="number" min="0" step="0.1" placeholder="例如 59.00" />
            </label>

            <label class="field">
              <span>期望出售价格</span>
              <input v-model.number="form.price" type="number" min="0" step="0.1" placeholder="例如 29.90" />
            </label>

            <label class="field">
              <span>ISBN</span>
              <input v-model="form.isbn" placeholder="请输入 ISBN 编号" />
              <small class="tip">
                提示：ISBN 一般印在书籍背面的条形码附近，通常为 10 或 13 位数字。
              </small>
            </label>

            <label class="field">
              <span>新旧程度</span>
              <select v-model.number="form.usedDegree">
                <option :value="10">全新（100%）</option>
                <option :value="9">九成新（90%）</option>
                <option :value="8">八成新（80%）</option>
                <option :value="7">七成新（70%）</option>
                <option :value="6">六成新（60%）</option>
                <option :value="5">五成新（50%）</option>
                <option :value="4">四成新（40%）</option>
                <option :value="3">三成新（30%）</option>
                <option :value="2">二成新（20%）</option>
                <option :value="1">一成新（10%）</option>
              </select>
            </label>
          </div>

          <h3 class="section-subtitle mt24">2. 寄件人地址（我的地址）</h3>
          <div class="address-row">
            <div class="address-display" v-if="selectedAddress">
              <div class="address-header">
                <span class="address-name">{{ selectedAddress.name }}</span>
                <span class="address-phone">{{ selectedAddress.phone }}</span>
              </div>
              <div class="address-location">
                {{ selectedAddress.province }}{{ selectedAddress.city || '' }}{{ selectedAddress.district || '' }}
              </div>
              <div class="address-detail" v-if="selectedAddress.detail">
                {{ selectedAddress.detail }}
              </div>
            </div>
            <div class="address-text muted" v-else>
              暂未选择地址
            </div>
            <button class="outline-btn" @click="openAddressModal">
              地址簿
            </button>
          </div>
        </div>

        <div class="content-right">
          <h3 class="section-subtitle">估价预览</h3>
          <div class="summary-card">
            <div class="row">
              <span>书籍定价</span>
              <span>¥{{ form.listPrice || 0 }}</span>
            </div>
            <div class="row">
              <span>新旧程度系数</span>
              <span>{{ usedDegreePercent }}%</span>
            </div>
            <div class="row">
              <span>平台折扣系数</span>
              <span>x {{ platformFactor }}</span>
            </div>
            <div class="divider"></div>
            <div class="row highlight">
              <span>预计可得金额</span>
              <span class="price">¥{{ estimatedPrice }}</span>
            </div>
            <div class="row">
              <span>预计获得小绿叶</span>
              <span class="leaf">+{{ estimatedLeaf }}</span>
            </div>
          </div>

          <button class="primary-btn large" @click="onSubmit" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认卖出' }}
          </button>
          <p class="small-hint">
            提交后工作人员会尽快审核并与您联系，请保持电话畅通。
          </p>
        </div>
      </section>

      <!-- 已卖书籍列表 -->
      <section class="sold-list-section">
        <h3 class="section-subtitle">我的卖书记录</h3>
        <div class="book-card-list">
          <div
            v-for="item in soldList"
            :key="item.adId"
            class="book-card"
          >
            <div class="card-img-wrapper">
              <img :src="item.cover" class="book-card-img" />
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title || '订单商品' }}</div>
              <div class="card-price">¥{{ item.price }}</div>
            </div>
          </div>
          <div v-if="!soldList.length" class="empty-state">还没有卖出记录，快来卖出你的第一本书吧。</div>
        </div>
      </section>
    </main>

    <!-- 地址管理组件 -->
    <AddressDialog ref="addressDialogRef" :select-mode="true" @select="handleAddressSelect" />

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import BreadcrumbBar from '@/components/BreadcrumbBar.vue'
import Footer from '@/components/Footer.vue'
import AddressDialog from '@/components/AddressDialog.vue'
import { createUsedBook, getSoldBookList, uploadImage, getAddressList } from '@/api'
import type { SoldBookItem, AddressItem } from '@/api/types'
import { showToast } from 'vant'

const platformFactor = 0.6

const form = reactive({
  adId: 1,
  title: '',
  isbn: '',
  price: 0,
  listPrice: 0,
  writer: '',
  usedDegree: 9,
  cover: '',
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const submitting = ref(false)

// 地址选择
const addressDialogRef = ref<InstanceType<typeof AddressDialog> | null>(null)
const selectedAddressId = ref<number | null>(null)
const addressList = ref<AddressItem[]>([])

/**
 * 选中的地址对象
 */
const selectedAddress = computed(() => {
  return addressList.value.find(a => a.id === selectedAddressId.value) || null
})

/**
 * 处理地址选择
 */
const handleAddressSelect = (address: AddressItem) => {
  selectedAddressId.value = address.id
  // 刷新地址列表
  loadAddressList()
}

/**
 * 加载地址列表
 */
const loadAddressList = async () => {
  try {
    const res = await getAddressList()
    addressList.value = res.data || []
  } catch (err) {
    console.error('获取地址列表失败', err)
  }
}

// 进度条：根据已填写字段简单模拟
const progressPercent = computed(() => {
  let filled = 0
  if (form.title) filled++
  if (form.writer) filled++
  if (form.listPrice) filled++
  if (form.isbn) filled++
  if (form.cover) filled++
  if (selectedAddressId.value) filled++
  return Math.min(100, Math.round((filled / 6) * 100))
})

/**
 * 新旧程度百分比显示
 */
const usedDegreePercent = computed(() => {
  return form.usedDegree * 10
})

/**
 * 新旧程度系数（用于计算，将整数1-10转换为0.1-1.0）
 */
const usedDegreeFactor = computed(() => {
  return form.usedDegree * 0.1
})

/**
 * 预计可得金额
 */
const estimatedPrice = computed(() => {
  if (!form.listPrice) return 0
  return Number((form.listPrice * usedDegreeFactor.value * platformFactor).toFixed(2))
})

const estimatedLeaf = computed(() => {
  return Math.max(1, Math.round(estimatedPrice.value))
})

const soldList = ref<SoldBookItem[]>([])

const onChooseCover = () => {
  fileInputRef.value?.click()
}

const onCoverChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const res = await uploadImage(file)
    form.cover =  String(res.data).trim() || ''
  } catch (err) {
    console.error('上传封面失败', err)
    showToast({ message: '上传封面失败，请稍后重试', duration: 2000 })
  } finally {
    target.value = ''
  }
}

const openAddressModal = async () => {
  await addressDialogRef.value?.open(selectedAddressId.value)
  // 关闭后刷新地址列表
  await loadAddressList()
}

const onSubmit = async () => {
  if (!form.title || !form.isbn || !form.cover || !selectedAddressId.value) {
    showToast({ message: '请先完善书名、ISBN、封面和地址信息', duration: 2000 })
    return
  }
  try {
    submitting.value = true
    /**
     * 打印前端卖书传参的所有参数
     */
     console.log(
  '卖书填写的表单form',
  JSON.stringify(form, null, 2)
)


    const createUsedBookRes = await createUsedBook({
      adId: form.adId,
      title: form.title,
      isbn: form.isbn,
      price: form.price || estimatedPrice.value,
      listPrice: form.listPrice,
      writer: form.writer,
      usedDegree: form.usedDegree,
      cover: form.cover,
    })
    console.log("创建卖书记录返回信息createUsedBookRes", createUsedBookRes)
    showToast({ message: '提交成功，我们会尽快与您联系', duration: 2000 })
    // 重置表单
    Object.assign(form, {
      adId: 1,
      title: '',
      isbn: '',
      price: 0,
      listPrice: 0,
      writer: '',
      usedDegree: 9,
      cover: '',
    })
    fileInputRef.value && (fileInputRef.value.value = '')
    // 刷新卖书记录
    const res = await getSoldBookList()
    soldList.value = res.data || []
  } catch (err) {
    console.error('创建卖书记录失败', err)
    showToast({ message: '创建卖书记录失败，请稍后重试', duration: 2000 })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const res = await getSoldBookList()
  soldList.value = res.data || []
  // 加载地址列表
  await loadAddressList()
})
</script>

<style scoped>
.sell-page {
  min-height: 100vh;
  background: #fcfbf8;
}

.sell-main {
  max-width: 1400px;
  margin: 24px auto;
  padding: 0 40px 40px;
}


.section-title {
  font-size: 20px;
  margin-bottom: 12px;
  color: #2d583f;
}

.section-subtitle {
  font-size: 16px;
  margin: 0 0 12px;
  font-weight: 600;
}

.flow-steps {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #555;
}

.step .num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2d583f;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.progress-wrapper {
  margin-bottom: 24px;
}

.progress-label {
  font-size: 16px;
  margin-bottom: 6px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #e5ded2;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2d583f, #8bc34a);
  transition: width 0.3s ease;
}

.content-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-left {
  flex: 3;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.content-right {
  flex: 2;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.upload-block {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.upload-preview img {
  width: 96px;
  height: 128px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f5f5;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.hidden-input {
  display: none;
}

.hint {
  font-size: 14px;
  color: #888;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
  margin-top: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  font-size: 16px;
}

.field span {
  margin-bottom: 4px;
  font-weight: 500;
}

.field input,
.field select {
  border-radius: 999px;
  border: 1px solid #ddd;
  padding: 8px 12px;
  font-size: 16px;
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: #2d583f;
}

.tip {
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}

.mt24 {
  margin-top: 24px;
}

.address-row {
  margin-top: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.address-display {
  flex: 1;
  padding: 12px 16px;
  background: #fcfbf8;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.address-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d583f;
}

.address-phone {
  font-size: 14px;
  color: #666;
}

.address-location {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
}

.address-detail {
  font-size: 14px;
  color: #555;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #e9ecef;
  word-break: break-all;
  line-height: 1.5;
}

.address-text {
  font-size: 16px;
  flex: 1;
}

.address-text.muted {
  color: #999;
}

.summary-card {
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 14px 16px;
  font-size: 16px;
  margin-bottom: 16px;
}

.summary-card .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.summary-card .divider {
  border-top: 1px dashed #e0e0e0;
  margin: 8px 0;
}

.summary-card .highlight .price {
  color: #d40000;
  font-weight: 600;
}

.summary-card .leaf {
  color: #2d583f;
  font-weight: 600;
}

.primary-btn {
  border: none;
  background: #2d583f;
  color: #fff;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
}

.primary-btn.large {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  margin-top: 8px;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.outline-btn {
  border-radius: 999px;
  border: 1px solid #c8b196;
  background: #fff;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
}

.small-hint {
  margin-top: 4px;
  font-size: 14px;
  color: #888;
}

.sold-list-section {
  margin-top: 32px;
  /* background: #fff; */
  border-radius: 16px;
  padding: 18px 20px;
  /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04); */
}

/* 书籍卡片列表 (横向滚动) */
.book-card-list {
  display: flex;
  overflow-x: auto;
  padding: 10px 0;
  padding-bottom: 20px;
  gap: 16px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.book-card-list::-webkit-scrollbar {
  display: none;
}

.book-card {
  min-width: 190px;
  max-width: 240px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
  border: 1px solid #f0f0f0;
}

.book-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.card-img-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 6px 6px 0 0;
  background: #f8f8f8;
}

.book-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.book-card:hover .book-card-img {
  transform: scale(1.05);
}

.card-info {
  padding: 12px;
  text-align: left;
}

.card-title {
  font-size: 17px;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-price {
  font-size: 18px;
  color: #c0392b;
  font-weight: 700;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  font-size: 16px;
  color: #999;
  width: 100%;
}

</style>


