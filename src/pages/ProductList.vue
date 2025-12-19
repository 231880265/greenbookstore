<!-- ProductList.vue  –  Final Edition -->
<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Close, Search } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'
import BreadcrumbBar from '../components/BreadcrumbBar.vue'
import {
  getProductList,
  getFavoriteList,
  addFavorite,
  removeFavorite,
  searchBooks
} from '@/api'
import type { FavoriteItem } from '@/api/types'
import router from "@/router";
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const routerr = useRouter()


interface BookItem {
  ubId: number
  title: string
  price: number
  listPrice: number
  writer: string
  publisher: string
  publishTime: string
  bookBinding: string
  cover: string
  usedDegree: string
  description: string
  category: string
}

const allBooks = ref<BookItem[]>([])

/* ---------- 分类下拉 ---------- */
const categoryMap = {
  法律: 'FALV',
  经济: 'JINGJI',
  历史: 'LISHI',
  社科: 'SHEKE',
  生活: 'SHENGHUO',
  文学: 'WENXUE',
  小说: 'XIAOSHUO',
  艺术: 'YISHU',
  政治: 'ZHENGZHI',
  哲学心理学: 'ZHEXUEXINLIXUE',
}

const bindingMap = {
  线装: 'THREAD',
  平装: 'PAPERBACK',
  精装: 'HARDCOVER',
  其他: 'OTHER',
}

const currentCategory = computed<string | null>(() => {
  const c = route.params.category
  return typeof c === 'string' ? c : null
})
const showCategoryDropdown = ref(false)
const isCategoryHover = ref(false)
let dropdownEl: HTMLElement | null = null
const openDropdown = () => {
  showCategoryDropdown.value = true
  nextTick(() => {
    dropdownEl = document.querySelector('.category-dropdown')
    document.addEventListener('click', closeDropdown)
  })
}
const closeDropdown = (e?: Event) => {
  // 如果是点击事件并且点击在下拉内，则不要关闭（用于 document 点击监听）
  if (e && e.type === 'click' && dropdownEl?.contains((e as MouseEvent).target as Node)) return
  showCategoryDropdown.value = false
  isCategoryHover.value = false
  document.removeEventListener('click', closeDropdown)
  dropdownEl = null
}

// 鼠标进入/离开“所有分类”文字的处理
const crumbEnter = () => {
  isCategoryHover.value = true
}
const crumbLeave = () => {
  // 只有当下拉未打开时，才清除 hover 状态；下拉打开时用户可能正在移动到下拉菜单，不能立即清除
  if (!showCategoryDropdown.value) {
    isCategoryHover.value = false
  }
}

/* ---------- 筛选项 ---------- */
const qualityOptions = [
  { label: '所有', value: null },
  { label: '九成新及以上', value: '90' },
  { label: '八成新及以上', value: '80' },
  { label: '七成新及以上', value: '70' },
  { label: '六成新及以上', value: '60' },
  { label: '五成新及以上', value: '50' },
  { label: '三成新及以上', value: '30' },
]
const bindingOptions = [
  { label: '所有', value: null },
  { label: '线装', value: bindingMap['线装'] },
  { label: '平装', value: bindingMap['平装'] },
  { label: '精装', value: bindingMap['精装'] },
  { label: '其他', value: bindingMap['其他'] },
]

const filter = ref({
  quality: null as string | null,
  priceMin: 0,
  priceMax: 999,
  binding: null as string | null,
})

/* ---------- 滑块同步 ---------- */
const sliderMin = ref(0)
const sliderMax = ref(999)
const syncSlider = () => {
  sliderMin.value = filter.value.priceMin
  sliderMax.value = filter.value.priceMax
}
const syncInput = () => {
  filter.value.priceMin = sliderMin.value
  filter.value.priceMax = sliderMax.value
}
watch(() => [filter.value.priceMin, filter.value.priceMax], syncSlider, { immediate: true })
watch([sliderMin, sliderMax], syncInput)

/* ---------- 分页 ---------- */
const currentPage = ref(1)
const pageSize = 20

/* ---------- 过滤结果（只读） ---------- */
const filteredBooks = computed(() => {
  let list = [...allBooks.value]

  if (filter.value.quality) {
    const min = Number(filter.value.quality)
    list = list.filter(b => {
      const degRaw = b.usedDegree
      const degNum = Number(degRaw)
      if (isNaN(degNum)) return false
      // 统一转换为百分比表示：
      // - 若后端返回 90/80/... 已是百分比，保留
      // - 若后端返回 9/8/... 表示 9 成、8 成（需 *10）
      // - 若后端返回 0.9 之类（小数），按 *100 处理
      let percent = degNum
      if (degNum < 1) {
        percent = degNum * 100
      } else if (degNum < 10) {
        percent = degNum * 10
      }
      return percent >= min
    })
  }

  list = list.filter(
      b => b.price >= filter.value.priceMin && b.price <= filter.value.priceMax
  )

  if (filter.value.binding) {
    list = list.filter(b => b.bookBinding === filter.value.binding)
  }

  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
        b =>
            b.title.toLowerCase().includes(kw) ||
            b.writer.toLowerCase().includes(kw)
    )
  }

  return list
})

/* ---------- 当前页数据 ---------- */
const pagedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredBooks.value.slice(start, start + pageSize)
})

/* ---------- 动态标签 ---------- */
const activeTags = computed(() => {
  const tags: { key: string; label: string }[] = []

  if (filter.value.quality) {
    const q = qualityOptions.find(o => o.value === filter.value.quality)?.label
    tags.push({ key: 'quality', label: `品相：${q}` })
  }

  if (filter.value.priceMin !== 0 || filter.value.priceMax !== 999) {
    tags.push({ key: 'price', label: `价格：¥${filter.value.priceMin}-¥${filter.value.priceMax}` })
  }

  if (filter.value.binding) {
    const label =
        Object.entries(bindingMap).find(([, v]) => v === filter.value.binding)?.[0] ||
        filter.value.binding
    tags.push({ key: 'binding', label: `装帧：${label}` })
  }

  return tags
})

const removeTag = (k: string) => {
  if (k === 'price') {
    filter.value.priceMin = 0
    filter.value.priceMax = 999
  } else if (k === 'quality') {
    filter.value.quality = null
  } else if (k === 'binding') {
    filter.value.binding = null
  }
}

const resetAll = () => {
  filter.value = { quality: null, priceMin: 0, priceMax: 999, binding: null }
  // 保留当前子分类选择，不应在重置筛选时清空 currentCategory
  // currentCategory.value = null
}

/* ----------获取书籍列表 ---------- */
const fetchBooks = async () => {
  try {
    const { data } = await getProductList(currentCategory.value || undefined)
    // 保持原来的字段转换逻辑
    allBooks.value = data.map(item => ({
      ...item,
      usedDegree: item.usedDegree?.toString() || '',
      bookBinding: item.bookBinding || '',
    })) as BookItem[]
  } catch (e) {
    console.error(e)
  }
}


/* ---------- 收藏 ---------- */
const favoritedSet = ref<Set<number>>(new Set())
const favoriteIdMap = ref<Record<number, number>>({})

const loadFavorites = async () => {
  try {
    const response = await getFavoriteList()
    response.data.forEach((f: FavoriteItem) => {
      favoritedSet.value.add(f.ubId)
      favoriteIdMap.value[f.ubId] = f.favoriteId
    })
  } catch (e) {
    console.error('loadFavorites', e)
  }
}

const toggleFavorite = async (book: BookItem) => {
  if (favoritedSet.value.has(book.ubId)) {
    const fid = favoriteIdMap.value[book.ubId]
    if (!fid) return
    console.log('取消收藏', fid)
    try {
      await removeFavorite(fid)
      favoritedSet.value.delete(book.ubId)
      delete favoriteIdMap.value[book.ubId]
    } catch (e) {
      console.error('取消收藏失败', e)
    }
  } else {
    try {
      console.log('收藏', book.ubId)
      const response = await addFavorite(book.ubId)
      console.log('收藏成功', response.data)
      favoritedSet.value.add(book.ubId)
      favoriteIdMap.value[book.ubId] = response.data
    } catch (e) {
      console.error('收藏失败', e)
    }
  }
}

/* ---------- 搜索 ---------- */
//TODO:这里目前是前端自己的筛选，而不是调用了后端搜索接口的版本
const searchKeyword = ref('')
const performSearch = async () => {
  if (!searchKeyword.value.trim()) {
    await fetchBooks()
    return
  }
  try {
    console.log('搜索信息', searchKeyword.value)
    const response = await searchBooks(searchKeyword.value)
    console.log('搜索结果', response.data)
    allBooks.value = response.data.map(item => ({
      ...item,
      usedDegree: item.usedDegree?.toString() || '',
      bookBinding: item.bookBinding || ''
    })) as BookItem[]
  } catch (e) {
    console.error('搜索失败', e)
  }
}

// 监听搜索关键词变化
watch(searchKeyword, debounce(performSearch, 300))
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 监听筛选条件变化，重置页码
watch([filter, searchKeyword], () => {
  currentPage.value = 1
})
watch(currentCategory, async (_newVal, oldVal) => {
  if (oldVal !== undefined) {
    await fetchBooks()
    currentPage.value = 1
  }
}, { immediate: true })

onMounted(async () => {
  await fetchBooks()
  await loadFavorites()
})
</script>

<template>
  <div class="detail-page">
    <HeaderBar />

    <!-- 面包屑 -->
    <BreadcrumbBar 
      :items="[
        { label: '商城' },
        { slot: 'category' },
        ...(currentCategory ? [{ label: Object.keys(categoryMap).find(k => categoryMap[k as keyof typeof categoryMap] === currentCategory) || '' }] : [])
      ]"
    >
      <template #category>
        <span class="category-container" @mouseenter="isCategoryHover = true" @mouseleave="closeDropdown">
          <span
            class="crumb link"
            :class="{ hover: isCategoryHover || showCategoryDropdown }"
            @mouseenter="crumbEnter"
            @mouseleave="crumbLeave"
            @click.stop="openDropdown"
          >
            所有分类
          </span>

          <transition name="fade">
            <ul
              v-if="showCategoryDropdown"
              class="dropdown category-dropdown"
              @mouseenter="isCategoryHover = true"
              @mouseleave="closeDropdown"
            >
              <li
                  v-for="(code, name) in categoryMap"
                  :key="code"
                  :class="{ active: currentCategory === code }"
                  @click.stop="currentCategory = code; closeDropdown()"
              >
                {{ name }}
              </li>
              <li :class="{ active: currentCategory === null }" @click.stop="currentCategory = null; closeDropdown()">
                全部分类
              </li>
            </ul>
          </transition>
        </span>
      </template>
    </BreadcrumbBar>

    <div class="divider" />

    <div class="layout-grid">
      <!-- 顶部栏 -->
      <div class="top-bar">
        <div class="left">
          <span class="label">筛选</span>
          <span class="count">{{ filteredBooks.length }} 个结果</span>
          <button class="reset" @click="resetAll">重置所有标签</button>
          <span v-for="tag in activeTags" :key="tag.key" class="tag">
            {{ tag.label }}
            <Close class="close" @click="removeTag(tag.key)" />
          </span>
        </div>

        <div class="right">
          <el-input
              v-model="searchKeyword"
              placeholder="从筛选结果中搜索"
              size="small"
              class="search"
              clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 左侧筛选 -->
      <aside class="filter-card">
        <section class="group">
          <h3>品相</h3>
          <ul class="list">
            <li
                v-for="opt in qualityOptions"
                :key="opt.value ?? 'all'"
                :class="{ active: filter.quality === opt.value }"
                @click="filter.quality = opt.value"
            >
              <span class="checkbox" :class="{ checked: filter.quality === opt.value }" />
              {{ opt.label }}
            </li>
          </ul>
        </section>

        <section class="group">
          <h3>价格</h3>
          <div class="price-input">
            <input v-model.number="filter.priceMin" type="number" />
            <span>to</span>
            <input v-model.number="filter.priceMax" type="number" />
          </div>
          <div class="slider">
            <input type="range" min="0" max="999" v-model.number="sliderMin" class="range-min" />
            <input type="range" min="0" max="999" v-model.number="sliderMax" class="range-max" />
          </div>
          <button class="reset-price" @click="filter.priceMin = 0; filter.priceMax = 999">RESET</button>
        </section>

        <section class="group">
          <h3>装帧</h3>
          <ul class="list">
            <li
                v-for="opt in bindingOptions"
                :key="opt.value ?? 'all'"
                :class="{ active: filter.binding === opt.value }"
                @click="filter.binding = opt.value"
            >
              <span class="checkbox" :class="{ checked: filter.binding === opt.value }" />
              {{ opt.label }}
            </li>
          </ul>
        </section>
      </aside>

      <!-- 右侧网格 -->
      <div class="right-area">
        <main class="grid">
          <div v-for="book in pagedBooks" :key="book.ubId" class="card">
            <div class="img-wrap">
              <img :src="book.cover" :alt="book.title" />
              <span
                  class="favorite-btn"
                  :class="{ active: favoritedSet.has(book.ubId) }"
                  @click.stop="toggleFavorite(book)"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                      :fill="favoritedSet.has(book.ubId) ? '#e53935' : 'none'"
                      stroke="#e53935"
                      stroke-width="2"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </span>
            </div>
            <div class="meta">
              <p class="author">{{ book.writer }}</p>
              <h3 class="title">{{ book.title }}</h3>
              <div class="price-row">
                <span class="price">¥{{ book.price.toFixed(2) }}</span>
                <span class="origin">¥{{ book.listPrice.toFixed(2) }}</span>
              </div>
              <div class="tags">
                <span>
                  {{ Object.entries(bindingMap).find(([, v]) => v === book.bookBinding)?.[0] || book.bookBinding }}
                </span>
                <span>{{ book.usedDegree }} 成新</span>
              </div>
            </div>
          </div>
        </main>
        <!-- 分页 -->
        <div class="pagination-bar">
          <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredBooks.length"
              layout="prev, pager, next"
              background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 全局 ========== */
.detail-page {
  background: #ffffff;
  color: #000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 顶部栏 */
.top-bar {
  grid-column: 2 / 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;   /* 推到最右 */
}
.search {
  width: 200px;
}

.label {
  font-size: 12px;
  letter-spacing: 1px;
  color: #666;
}
.count {
  font-size: 12px;
  color: #999;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 11px;
}
.close {
  width: 12px;
  height: 12px;
  cursor: pointer;
}
.reset {
  background: none;
  border: none;
  font-size: 11px;
  color: #666;
  cursor: pointer;
}
.reset:hover {
  color: #000;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #214d17;
}

/* 三栏布局 */
.layout-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1fr;
  gap: 24px 48px;
  background-color: #f8f5ef;
}
/* 左侧筛选卡片 */
.filter-card {
  grid-row: 1 / -1;          /* 跨两行 */
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 24px;
  align-self: start;         /* 高度随内容 */
  margin-top: 20px;
  margin-left: 40px;
}

.group {
  margin-bottom: 40px;
}
.group h3 {
  font-size: 12px;
  letter-spacing: 1px;
  margin-bottom: 16px;
  color: #000;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}
.checkbox {
  width: 14px;
  height: 14px;
  border: 1px solid #bbb;
  border-radius: 2px;
  position: relative;
}
.checkbox.checked::after {
  content: "✓";
  position: absolute;
  top: -2px;
  left: 2px;
  font-size: 12px;
  color: #000;
}
.price-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.price-input input {
  width: 40px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
.price-input span {
  font-size: 12px;
  color: #666;
}
.slider {
  position: relative;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin-bottom: 16px;
  width: 160px;
}
.slider input[type="range"] {
  position: absolute;
  width: 100%;
  height: 4px;
  background: transparent;
  -webkit-appearance: none;
  pointer-events: none;
}
.slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #000;
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
}
.reset-price {
  background: none;
  border: none;
  font-size: 11px;
  color: #666;
  cursor: pointer;
}
.reset-price:hover {
  color: #000;
}

/* 右侧网格 */
/* 右侧区域容器 */
.right-area {
  grid-column: 2 / 3;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.grid {
  grid-column: 2 / 3;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 从220px减小到180px */
  gap: 24px; /* 从32px减小到24px */
}
/* 修改卡片样式 */
.card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.img-wrap {
  aspect-ratio: 4/5;
  overflow: hidden;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.meta {
  padding:16px;
}
.author {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.title {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
  font-weight: 600;
  color: #333;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #e53935;
}

.origin {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.tags {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #666;
}

.tags span {
  padding: 3px 6px;
  border: 1px solid #eee;
  border-radius: 12px;
  background-color: #f8f8f8;
}

/* 分类下拉相关样式 */
.crumb.link.hover {
  color: #1a3d2a;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  list-style: none;
  padding: 6px 0;
  margin: 4px 0 0;
  min-width: 120px;
}
.dropdown li {
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown li:hover {
  background: #f5f5f5;
}
.dropdown li.active {
  color: #b8860b;
  font-weight: 600;
}
/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.25s;
}
.card:hover .favorite-btn {
  opacity: 1;
}
.favorite-btn.active {
  opacity: 1;
}
.pagination-bar {
  grid-column: 2 / 3;
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 20px;
}

/* 下拉容器使菜单位于“所有分类”下方 */
.category-container {
  position: relative;
  display: inline-block;
}
.dropdown {
  left: 0; /* 相对于 category-container */
  top: calc(100% - 2px); /* 稍微重叠，避免鼠标经过中缝导致 mouseleave */
  margin: 0; /* 去掉 margin 导致的空隙 */
}
</style>