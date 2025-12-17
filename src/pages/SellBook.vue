<template>
  <div class="sell-page">
    <HeaderBar />

    <!-- 面包屑 -->
    <section class="breadcrumb-bar">
      <div class="breadcrumb-inner">
        <span class="crumb link" @click="$router.push('/')">首页</span>
        <span class="sep">/</span>
        <span class="crumb current">我要卖书</span>
      </div>
    </section>

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
              <input v-model="form.ISBN" placeholder="请输入 ISBN 编号" />
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
            <div class="address-text" v-if="selectedAddressText">
              当前地址：{{ selectedAddressText }}
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
        <ul v-if="soldList.length" class="sold-list">
          <li v-for="item in soldList" :key="item.adId" class="sold-item">
            <img :src="item.cover" class="sold-cover" />
            <div class="sold-meta">
              <div class="title">{{ item.title }}</div>
              <div class="price-row">
                <span>成交价：¥{{ item.price }}</span>
              </div>
            </div>
          </li>
        </ul>
        <div v-else class="empty-row">还没有卖出记录，快来卖出你的第一本书吧。</div>
      </section>
    </main>

    <!-- 地址选择弹窗：复用个人中心的逻辑（已有地址 + 新增地址） -->
    <teleport to="body">
      <div v-if="addressModalOpen" class="modal-mask" @click.self="addressModalOpen = false">
        <div class="modal-panel form-panel">
          <div class="modal-header">
            <h3>选择地址</h3>
            <button class="primary-btn" @click="openAddForm">+ 新增地址</button>
          </div>

          <div class="address-list">
            <div
              v-for="item in addressList"
              :key="item.id"
              class="address-item"
              :class="{ active: selectedAddressId === item.id }"
              @click="onSelectAddress(item)"
            >
              <div class="address-main">
                <div class="name">{{ item.name }} · {{ item.phone }}</div>
                <div class="detail">
                  {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
                </div>
              </div>
            </div>

            <div v-if="!addressList.length" class="empty">暂无地址</div>
          </div>

          <div class="modal-footer">
            <button class="outline-btn" @click="addressModalOpen = false">确定</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 新增地址弹窗（精简版） -->
    <teleport to="body">
      <div v-if="addressFormOpen" class="modal-mask" @click.self="addressFormOpen = false">
        <div class="modal-panel form-panel">
          <h3 class="modal-title">{{ editingAddress ? '编辑地址' : '新增地址' }}</h3>

          <div class="form">
            <input v-model="addressForm.name" placeholder="收件人姓名" />
            <input v-model="addressForm.phone" placeholder="手机号" />
            <input v-model="addressForm.province" placeholder="省" />
            <input v-model="addressForm.city" placeholder="市" />
            <input v-model="addressForm.district" placeholder="区" />
            <input v-model="addressForm.detail" placeholder="详细地址（街道、门牌号等）" />
          </div>

          <div class="modal-footer">
            <button class="outline-btn" @click="addressFormOpen = false">取消</button>
            <button class="primary-btn" @click="submitAddress">保存</button>
          </div>
        </div>
      </div>
    </teleport>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import Footer from '@/components/Footer.vue'
import { createUsedBook, getSoldBookList, uploadImage, getAddressList, createAddress } from '@/api'
import type { SoldBookItem, AddressItem } from '@/api/types'

const platformFactor = 0.6

const form = reactive({
  adId: 1,
  title: '',
  ISBN: '',
  price: 0,
  listPrice: 0,
  writer: '',
  usedDegree: 9,
  cover: '',
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const submitting = ref(false)

// 地址选择
const addressModalOpen = ref(false)
const addressFormOpen = ref(false)
const addressList = ref<AddressItem[]>([])
const selectedAddressId = ref<number | null>(null)
const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
})
const editingAddress = ref<AddressItem | null>(null)

const selectedAddressText = computed(() => {
  const item = addressList.value.find(a => a.id === selectedAddressId.value)
  if (!item) return ''
  return `${item.name} ${item.phone} ${item.province}${item.city || ''}${item.district || ''}${item.detail || ''}`
})

// 进度条：根据已填写字段简单模拟
const progressPercent = computed(() => {
  let filled = 0
  if (form.title) filled++
  if (form.writer) filled++
  if (form.listPrice) filled++
  if (form.ISBN) filled++
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
    alert('上传封面失败，请稍后重试')
  } finally {
    target.value = ''
  }
}

const openAddressModal = async () => {
  addressModalOpen.value = true
  const res = await getAddressList()
  addressList.value = res.data || []
}

const onSelectAddress = (item: AddressItem) => {
  selectedAddressId.value = item.id
}

const openAddForm = () => {
  editingAddress.value = null
  Object.assign(addressForm, {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  })
  addressFormOpen.value = true
}

const submitAddress = async () => {
  await createAddress(addressForm as any)
  addressFormOpen.value = false
  const res = await getAddressList()
  addressList.value = res.data || []
}

const onSubmit = async () => {
  if (!form.title || !form.ISBN || !form.cover || !selectedAddressId.value) {
    alert('请先完善书名、ISBN、封面和地址信息')
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
      ISBN: form.ISBN,
      price: form.price || estimatedPrice.value,
      listPrice: form.listPrice,
      writer: form.writer,
      usedDegree: form.usedDegree,
      cover: form.cover,
    })
    console.log("创建卖书记录返回信息createUsedBookRes", createUsedBookRes)
    alert('提交成功，我们会尽快与您联系')
    // 重置表单
    Object.assign(form, {
      adId: 1,
      title: '',
      ISBN: '',
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
    alert('创建卖书记录失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const res = await getSoldBookList()
  soldList.value = res.data || []
})
</script>

<style scoped>
.sell-page {
  min-height: 100vh;
  background: #f8f5ef;
}

.sell-main {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px 40px;
}

/* 面包屑 */
.breadcrumb-bar {
  border-bottom: 1px solid #eee;
  background: #fff;
}

.breadcrumb-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.crumb {
  color: #666;
}

.crumb.link {
  cursor: pointer;
  color: #2d583f;
}

.crumb.current {
  color: #999;
}

.sep {
  color: #ccc;
}

.section-title {
  font-size: 20px;
  margin-bottom: 12px;
  color: #2d583f;
}

.section-subtitle {
  font-size: 16px;
  margin: 0 0 12px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 12px;
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
  font-size: 13px;
}

.field span {
  margin-bottom: 4px;
}

.field input,
.field select {
  border-radius: 999px;
  border: 1px solid #ddd;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: #2d583f;
}

.tip {
  margin-top: 2px;
  font-size: 12px;
  color: #999;
}

.mt24 {
  margin-top: 24px;
}

.address-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.address-text {
  font-size: 13px;
}

.address-text.muted {
  color: #999;
}

.summary-card {
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 14px 16px;
  font-size: 13px;
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
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
}

.primary-btn.large {
  width: 100%;
  padding: 10px 0;
  font-size: 15px;
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
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}

.small-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}

.sold-list-section {
  margin-top: 32px;
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.sold-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sold-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}

.sold-item:first-child {
  border-top: none;
}

.sold-cover {
  width: 48px;
  height: 64px;
  border-radius: 6px;
  object-fit: cover;
  background: #f5f5f5;
}

.sold-meta .title {
  font-size: 14px;
  margin-bottom: 4px;
}

.sold-meta .price-row {
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 12px;
}

.sold-meta .status {
  color: #2d583f;
}

.empty-row {
  font-size: 13px;
  color: #999;
  padding: 12px 0;
}

/* 地址弹窗样式简化版，复用 profile 页面变量 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
}

.modal-panel {
  width: 560px;
  max-height: 80vh;
  background: #fff;
  border-radius: 16px;
  padding: 20px 22px 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 5001;
  overflow: visible;
}

.form-panel {
  width: 640px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.address-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.address-item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
}

.address-item.active {
  border-color: #2d583f;
  background: #f6fbf8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 12px;
  margin: 12px 0 8px;
}

.form input {
  border-radius: 999px;
  border: 1px solid #ddd;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
}

.form input:focus {
  border-color: #2d583f;
}
</style>


