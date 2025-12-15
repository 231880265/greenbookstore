<!-- BookList.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { Close, Search, ArrowDown } from '@element-plus/icons-vue'
import HeaderBar from "../components/HeaderBar.vue";

/* -------------------- 类型 -------------------- */
interface BookItem {
  ubId: number
  title: string
  writer: string
  publisher: string
  publishTime: string
  bookBinding: string
  price: number
  listPrice: number
  cover: string
  category: string
  usedDegree: string
  description: string
  shop?: string
  location?: string
  shipIn24h?: boolean
  shipRate?: string
  isNew?: boolean
  freeShip?: boolean
}

/* -------------------- 数据 -------------------- */
const allBooks = ref<BookItem[]>([])
const filteredBooks = ref<BookItem[]>([])

/* -------------------- 分类下拉 -------------------- */
const categoryMap = {
  经济: 'JINGJI',
  历史: 'LISHI',
  社科: 'SHEKE',
  生活: 'SHNEGHUO',
  文学: 'WENXUE',
  小说: 'XIAOSHUO',
  艺术: 'YISHU',
  政治: 'ZHNEGZHI',
  哲学心理学: 'ZHEXUEXINLIXUE',
}
const currentCategory = ref<string | null>(null) // null 表示“所有分类”
const showCategoryDropdown = ref(false)

/* -------------------- 筛选项 -------------------- */
const open = ref({ quality: false, price: false, binding: false })
const toggle = (key: keyof typeof open.value) => {
  open.value[key] = !open.value[key]
}

const qualityOptions = [
  { label: '所有', value: null },
  { label: '九五成新及以上', value: '95' },
  { label: '九成新及以上', value: '90' },
  { label: '八五成新及以上', value: '85' },
  { label: '八成新及以上', value: '80' },
  { label: '五成新及以上', value: '50' },
  { label: '三成新及以上', value: '30' },
]
const bindingOptions = [
  { label: '所有', value: null },
  { label: '线装', value: '线装' },
]

/* 真正生效的筛选值 */
const filter = ref({
  quality: null as string | null,
  priceMin: null as number | null,
  priceMax: null as number | null,
  binding: null as string | null,
})

/* 价格输入框临时值 */
const tempPrice = ref({ min: null as number | null, max: null as number | null })
const confirmPrice = () => {
  filter.value.priceMin = tempPrice.value.min
  filter.value.priceMax = tempPrice.value.max
  open.value.price = false
}

/* -------------------- 动态标签 -------------------- */
const activeTags = computed(() => {
  const tags: { key: keyof typeof filter.value; label: string }[] = []
  if (filter.value.quality) {
    const q = qualityOptions.find(o => o.value === filter.value.quality)?.label
    tags.push({ key: 'quality', label: `品相：${q}` })
  }
  if (filter.value.priceMin !== null || filter.value.priceMax !== null) {
    const min = filter.value.priceMin ?? ''
    const max = filter.value.priceMax ?? ''
    tags.push({ key: 'price', label: `价格：¥${min}-${max}` })
  }
  if (filter.value.binding) {
    tags.push({ key: 'binding', label: `装帧：${filter.value.binding}` })
  }
  return tags
})

const removeTag = (key: keyof typeof filter.value) => {
  if (key === 'price') {
    filter.value.priceMin = null
    filter.value.priceMax = null
    tempPrice.value.min = null
    tempPrice.value.max = null
  } else {
    ;(filter.value as any)[key] = null
  }
}

/* -------------------- 拉取数据 -------------------- */
const fetchBooks = async () => {
  try {
    const params = currentCategory.value ? { category: currentCategory.value } : {}
    const { data } = await axios.get('/api/used_books/category', { params })
    allBooks.value = data.data.map((b: any) => ({
      ...b,
      shop: '兴文书店',
      location: '北京市东城区',
      shipIn24h: Math.random() > 0.5,
      shipRate: (Math.random() * 20 + 80).toFixed(2),
      isNew: true,
      freeShip: Math.random() > 0.8,
    }))
  } catch (e) {
    console.error(e)
  }
}

/* -------------------- 筛选逻辑 -------------------- */
const applyFilter = () => {
  let list = [...allBooks.value]

  if (filter.value.quality) {
    const min = Number(filter.value.quality)
    list = list.filter(b => Number(b.usedDegree) >= min)
  }

  if (filter.value.priceMin !== null) {
    list = list.filter(b => b.price >= filter.value.priceMin!)
  }
  if (filter.value.priceMax !== null) {
    list = list.filter(b => b.price <= filter.value.priceMax!)
  }

  if (filter.value.binding) {
    list = list.filter(b => b.bookBinding === filter.value.binding)
  }

  filteredBooks.value = list
}

watch([filter, currentCategory], applyFilter, { deep: true })

onMounted(async () => {
  await fetchBooks()
  applyFilter()
})
</script>

<template>
  <div class="page">
    <HeaderBar />
    <!-- 面包屑 + 分类下拉 -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>
          <span
              class="category-trigger"
              @mouseenter="$event.currentTarget.classList.add('hover')"
              @mouseleave="$event.currentTarget.classList.remove('hover')"
              @click="showCategoryDropdown = !showCategoryDropdown"
          >
            所有分类
            <el-icon class="arrow" :class="{ up: showCategoryDropdown }"><ArrowDown /></el-icon>
          </span>
          <transition name="fade">
            <ul v-if="showCategoryDropdown" class="category-dropdown">
              <li
                  v-for="(code, name) in categoryMap"
                  :key="code"
                  :class="{ active: currentCategory === code }"
                  @click="currentCategory = code; showCategoryDropdown = false"
              >
                {{ name }}
              </li>
              <li
                  :class="{ active: currentCategory === null }"
                  @click="currentCategory = null; showCategoryDropdown = false"
              >
                全部分类
              </li>
            </ul>
          </transition>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          {{ currentCategory ? Object.keys(categoryMap).find(k => categoryMap[k as keyof typeof categoryMap] === currentCategory) : '文学' }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 已选条件 -->
    <div class="selected-filters">
      <span
          v-for="tag in activeTags"
          :key="tag.key"
          class="item"
      >
        {{ tag.label }}
        <el-icon class="close" @click="removeTag(tag.key)"><Close /></el-icon>
      </span>
      <span class="result">{{ filteredBooks.length }} 条结果</span>
      <el-input
          placeholder="在结果中查找"
          size="small"
          class="search-in-result"
      >
        <template #suffix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="main">
      <!-- 左侧筛选 -->
      <aside class="filter-side">
        <!-- 品相 -->
        <section class="filter-item" :class="{ open: open.quality }">
          <div
              class="filter-title"
              @mouseenter="$event.currentTarget.classList.add('hover')"
              @mouseleave="$event.currentTarget.classList.remove('hover')"
              @click="toggle('quality')"
          >
            品相
            <el-icon class="arrow" :class="{ up: open.quality }"><ArrowDown /></el-icon>
          </div>
          <transition name="slide">
            <ul v-if="open.quality" class="options">
              <li
                  v-for="opt in qualityOptions"
                  :key="opt.value ?? 'all'"
                  :class="{ active: filter.quality === opt.value }"
                  @click="filter.quality = opt.value"
              >
                {{ opt.label }}
              </li>
            </ul>
          </transition>
        </section>

        <!-- 价格 -->
        <section class="filter-item" :class="{ open: open.price }">
          <div
              class="filter-title"
              @mouseenter="$event.currentTarget.classList.add('hover')"
              @mouseleave="$event.currentTarget.classList.remove('hover')"
              @click="toggle('price')"
          >
            价格
            <el-icon class="arrow" :class="{ up: open.price }"><ArrowDown /></el-icon>
          </div>
          <transition name="slide">
            <div v-if="open.price" class="price-box">
              <input
                  v-model.number="tempPrice.min"
                  type="number"
                  placeholder="最低价"
              />
              <span>-</span>
              <input
                  v-model.number="tempPrice.max"
                  type="number"
                  placeholder="最高价"
              />
              <button @click="confirmPrice">确定</button>
            </div>
          </transition>
        </section>

        <!-- 装帧 -->
        <section class="filter-item" :class="{ open: open.binding }">
          <div
              class="filter-title"
              @mouseenter="$event.currentTarget.classList.add('hover')"
              @mouseleave="$event.currentTarget.classList.remove('hover')"
              @click="toggle('binding')"
          >
            装帧
            <el-icon class="arrow" :class="{ up: open.binding }"><ArrowDown /></el-icon>
          </div>
          <transition name="slide">
            <ul v-if="open.binding" class="options">
              <li
                  v-for="opt in bindingOptions"
                  :key="opt.value ?? 'all'"
                  :class="{ active: filter.binding === opt.value }"
                  @click="filter.binding = opt.value"
              >
                {{ opt.label }}
              </li>
            </ul>
          </transition>
        </section>

        <div class="more-filter">展开更多筛选 ▼</div>
      </aside>

      <!-- 右侧列表 -->
      <div class="list-area">
        <div class="book-list">
          <div v-for="book in filteredBooks" :key="book.ubId" class="book-item">
            <div class="cover-wrap">
              <img :src="book.cover" alt="cover" />
              <div v-if="book.isNew" class="new-badge">全新</div>
            </div>
            <div class="info">
              <h3 class="title">{{ book.title }}</h3>
              <p class="sub">闪电发货·正版保障·假一赔十·电子发票·七天退换无忧</p>
              <p class="meta">
                {{ book.writer }} / {{ book.publisher }} / {{ book.publishTime }} / {{ book.bookBinding }}
              </p>
              <div class="shop-line">
                <span class="shop">{{ book.shop }}</span>
                <span class="location">{{ book.location }}</span>
                <span v-if="book.shipIn24h" class="ship-tag">24小时内发货</span>
                <span class="rate">{{ book.shipRate }}%成功完成</span>
              </div>
            </div>
            <div class="price-col">
              <div class="price">
                <span class="symbol">¥</span>
                <span class="num">{{ book.price.toFixed(2) }}</span>
              </div>
              <div class="origin">定价: ¥{{ book.listPrice?.toFixed(2) }}</div>
              <div class="promo">满49.90减1</div>
              <div class="fee">
                快递 ¥4.50
                <span v-if="book.freeShip" class="free">包邮</span>
              </div>
              <div class="date">2025-11-22 上书</div>
              <div class="actions">
                <el-button size="small">立即购买</el-button>
                <el-button size="small">加入购物车</el-button>
              </div>
            </div>
            <div class="extra">
              <i class="icon-heart" />
              <i class="icon-share" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 分类下拉 ========== */
.breadcrumb-wrapper {
  position: relative;
  margin: 8px 0;
}
.category-trigger {
  cursor: pointer;
  transition: color 0.2s;
}
.category-trigger.hover {
  color: #c30;
}
.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background: #fff;
  border: 1px solid #e5e5e5;
  list-style: none;
  padding: 4px 0;
  margin: 0;
  min-width: 100px;
}
.category-dropdown li {
  padding: 4px 12px;
  cursor: pointer;
  transition: color 0.2s;
}
.category-dropdown li:hover {
  color: #c30;
}
.category-dropdown li.active {
  color: #c30;
  font-weight: bold;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 页面框架 ========== */
.page {
  width: 1200px;
  margin: 0 auto;
  font-size: 12px;
  color: #333;
}
.el-breadcrumb {
  margin: 8px 0;
}
.top-tags {
  display: flex;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 8px;
}
.tag {
  padding: 8px 24px;
  cursor: pointer;
}
.tag.active {
  border-bottom: 2px solid #c30;
  color: #c30;
}
.selected-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.selected-filters .item {
  border: 1px solid #ddd;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.result {
  color: #999;
  margin-left: 12px;
}
.search-in-result {
  width: 180px;
  margin-left: auto;
}
.main {
  display: flex;
  gap: 12px;
}

/* ========== 左侧交互筛选栏 ========== */
.filter-side {
  width: 200px;
  border: 1px solid #e5e5e5;
  padding: 8px;
  user-select: none;
}
.filter-item {
  border-bottom: 1px dashed #e5e5e5;
}
.filter-title {
  position: relative;
  padding: 8px 4px;
  cursor: pointer;
  transition: color 0.2s;
}
.filter-title.hover {
  color: #c30;
}
.arrow {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%) rotate(0deg);
  transition: transform 0.2s;
}
.arrow.up {
  transform: translateY(-50%) rotate(180deg);
}
.options {
  margin: 0;
  padding: 0 0 4px 12px;
  list-style: none;
}
.options li {
  padding: 4px 0;
  cursor: pointer;
  transition: color 0.2s;
}
.options li:hover {
  color: #c30;
}
.options li.active {
  color: #c30;
  font-weight: bold;
}
.price-box {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.price-box input {
  width: 60px;
  padding: 2px 4px;
  border: 1px solid #ccc;
}
.price-box button {
  margin-left: 4px;
  padding: 2px 6px;
  cursor: pointer;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.more-filter {
  color: #36c;
  cursor: pointer;
  margin-top: 8px;
}

/* ========== 右侧列表 ========== */
.list-area {
  flex: 1;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e5e5;
  padding: 6px 8px;
  margin-bottom: 8px;
}
.sort-item {
  margin-right: 12px;
  cursor: pointer;
}
.sort-item.active {
  color: #c30;
}
.filter-tag {
  border: 1px solid #ddd;
  padding: 2px 6px;
  margin-right: 6px;
  cursor: pointer;
}
.pager {
  margin: 0 8px;
}
.sub-search {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  border: 1px solid #e5e5e5;
  padding: 6px 8px;
  margin-bottom: 8px;
}
.book-list {
  border: 1px solid #e5e5e5;
}
.book-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #e5e5e5;
}
.cover-wrap {
  position: relative;
  width: 120px;
  height: 160px;
  margin-right: 12px;
}
.cover-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.new-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #c30;
  color: #fff;
  font-size: 11px;
  padding: 1px 4px;
}
.info {
  flex: 1;
}
.title {
  font-size: 14px;
  color: #36c;
  margin: 0 0 4px;
}
.sub {
  color: #666;
  margin: 2px 0;
}
.meta {
  color: #999;
  margin: 2px 0;
}
.shop-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.shop {
  color: #36c;
}
.location {
  color: #999;
}
.ship-tag {
  background: #ffe4d0;
  color: #f60;
  padding: 0 4px;
  font-size: 11px;
}
.rate {
  color: #999;
}
.price-col {
  width: 160px;
  text-align: right;
}
.price {
  color: #c30;
  font-size: 16px;
}
.symbol {
  font-size: 12px;
}
.origin {
  color: #999;
  text-decoration: line-through;
  margin: 2px 0;
}
.promo {
  color: #f60;
  font-size: 11px;
}
.fee {
  color: #666;
}
.free {
  color: #090;
  margin-left: 4px;
}
.date {
  color: #999;
  margin: 2px 0;
}
.actions {
  margin-top: 6px;
}
.actions .el-button {
  margin-left: 6px;
}
.extra {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 12px;
  color: #999;
  font-size: 16px;
}
</style>