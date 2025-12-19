<!-- MyCollections.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'
import BreadcrumbBar from '../components/BreadcrumbBar.vue'
import Footer from '../components/Footer.vue'
import { getFavoriteList, removeFavorite as apiRemoveFavorite, getProductDetail } from '@/api'
import type { FavoriteItem } from '@/api/types'
import { useRouter } from 'vue-router'

 /* ---------- 数据 / 状态 ---------- */
const router = useRouter()
const keyword = ref('')
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)
// 下拉筛选 UI 状态：只保留 category/time/sort 三项
const open = ref<{ [k: string]: boolean }>({ category: false, time: false, sort: false })
const toggle = (k: keyof typeof open.value) => {
  open.value[k] = !open.value[k]
}
const closeAll = () => {
  Object.keys(open.value).forEach(k => (open.value[k as keyof typeof open.value] = false))
}

// 复用 ProductList 的分类映射
const categoryMap: Record<string, string> = {
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
const categoryOptions = ['全部', ...Object.keys(categoryMap)]

const timeOptions = ['全部', '最近一周', '最近一个月']
const sortOptions = ['默认', '价格从低到高', '价格从高到低']

// 筛选状态：category 使用 code（如 'FALV'）或 null
const currentCategory = ref<string | null>(null)
const currentTime = ref<string | null>(null)
const currentSort = ref<string | null>(null)

const fetchFavorites = async () => {
  loading.value = true
  try {
    const res: any = await getFavoriteList()
    const list: FavoriteItem[] = res?.data || []

    // 为了支持按分类和按收藏时间排序，尝试向后端获取商品详情以补充 category / createdAt
    const enriched = await Promise.all(
      list.map(async f => {
        try {
          const r: any = await getProductDetail(f.ubId)
          const prod = r?.data?.data || r?.data || r || {}
          return {
            ...f,
            // 后端 product.category 可能是分类 code 或名称，这里优先取 code，如果是中文名称则转换为 code
            category: prod.category || null,
            createdAt: (f as any).createdAt || prod.createTime || prod.publishTime || null,
            price: f.price ?? prod.price ?? 0,
          }
        } catch (e) {
          return f
        }
      })
    )

    favorites.value = enriched
 } catch (e) {
    console.error('fetchFavorites', e)
  } finally {
    loading.value = false
  }
}

// 取消收藏（调用后端 API），带确认提示并与 ProductList 行为一致
const removeFavorite = async (item: FavoriteItem) => {
  const ok = window.confirm('确认取消收藏该商品吗？')
  if (!ok) return
  try {
    await apiRemoveFavorite(item.favoriteId)
    // 与 ProductList 行为一致：取消收藏后重新从后端拉取收藏列表
    await fetchFavorites()
  } catch (e) {
    console.error('取消收藏失败', e)
  }
}

// 点击卡片进入商品详情
const goToProduct = (ubId: number) => {
  router.push({ path: `/product-detail/${ubId}` })
}

onMounted(fetchFavorites)

// 搜索 / 过滤结果（实现分类、时间、排序）
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = [...favorites.value]

  if (kw) {
    list = list.filter(i => (i.title || '').toLowerCase().includes(kw))
  }

  // 分类过滤：currentCategory 存储分类 code（如 'FALV'）或 null
  if (currentCategory.value) {
    const want = currentCategory.value
    list = list.filter(i => {
      // item.category 可能是 code 或中文名；尝试 normalize：如果是中文名，转换为 code
      const cat = (i as any).category
      if (!cat) return false
      // 如果已经是 code 直接比较
      if (Object.values(categoryMap).includes(cat)) return cat === want
      // 否则尝试根据中文名映射到 code
      const mapped = categoryMap[cat as keyof typeof categoryMap]
      if (mapped) return mapped === want
      return false
    })
  }

  // 时间过滤：基于 item.createdAt（必须是可解析的日期字符串）
  if (currentTime.value === '最近一周' || currentTime.value === '最近一个月') {
    const now = Date.now()
    const cutoff = currentTime.value === '最近一周' ? now - 7 * 24 * 3600 * 1000 : now - 30 * 24 * 3600 * 1000
    list = list.filter(i => {
      const t = (i as any).createdAt
      if (!t) return false
      const d = Date.parse(t)
      if (isNaN(d)) return false
      return d >= cutoff
    })
  }

  // 排序
  if (currentSort.value === '价格从低到高') {
    list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
  } else if (currentSort.value === '价格从高到低') {
    list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  }

  return list
})
 </script>

<template>
  <div class="page">
    <HeaderBar />

    <!-- 面包屑 -->
    <BreadcrumbBar :items="[{ label: '我的收藏' }]" />

    <!-- 主容器 -->
    <main class="container">
      <!-- 搜索栏 -->
      <section class="search-bar">
        <el-input
            v-model="keyword"
            placeholder="搜索我的收藏"
            class="search-input"
            clearable
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" class="search-btn">搜索</el-button>
      </section>

      <!-- 二级筛选 -->
      <nav class="sub-filter">
        <div
            v-for="(label, key) in { category: '宝贝分类', time: '收藏时间', sort: '宝贝排序' }"
            :key="key"
            class="filter-item"
            :class="{ open: open[key as keyof typeof open] }"
            @click="toggle(key as keyof typeof open)"
        >
          {{ label }}
          <el-icon class="arrow" :class="{ up: open[key as keyof typeof open] }"><ArrowDown /></el-icon>

          <transition name="fade">
            <ul
                v-if="open[key as keyof typeof open]"
                class="dropdown"
                @mouseleave="closeAll"
            >
              <li
                  v-for="opt in key === 'category' ? categoryOptions : key === 'time' ? timeOptions : sortOptions"
                  :key="opt"
                  :class="{ active: (key === 'category' && ((currentCategory === null && opt === '全部') || currentCategory === (categoryMap[opt as keyof typeof categoryMap] ?? null))) || (key === 'time' && currentTime === opt) || (key === 'sort' && currentSort === opt) }"
                  @click.stop="( () => { if (key === 'category') { currentCategory = opt === '全部' ? null : (categoryMap[opt as keyof typeof categoryMap] ?? null); } else if (key === 'time') { currentTime = opt; } else { currentSort = opt; } closeAll(); } )()"
              >
                {{ opt }}
              </li>
            </ul>
          </transition>
        </div>
      </nav>

      <!-- 列表 -->
       <div v-loading="loading" class="list">
        <div
            v-for="item in filteredList"
            :key="item.favoriteId"
            class="card"
            @click="goToProduct(item.ubId)"
        >
          <div class="img-wrap">
            <img :src="item.cover" :alt="item.title" />
            <!-- 与 ProductList 保持一致的收藏浮层按钮（红心填充，点击取消收藏） -->
            <span class="favorite-btn active" @click.stop="removeFavorite(item)">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#e53935"
                  stroke="#e53935"
                  stroke-width="2"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </span>
          </div>
          <div class="info">
            <p class="book-title" :title="item.title">{{ item.title }}</p>
            <p class="price">
              <span class="symbol">¥</span>
              <span class="num">{{ item.price.toFixed(2) }}</span>
            </p>
          </div>
        </div>

        <div v-if="!loading && filteredList.length === 0" class="empty">
           暂无收藏
         </div>
       </div>
     </main>

    <Footer />
  </div>
</template>

<style scoped>
/* ========== 全局 ========== */
.page {
  background-color: #f8f5ef;
  color: #222;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 60px 80px;
}

/* ---------- 搜索栏 ---------- */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 48px;
}
.search-input {
  width: 320px;
  height: 36px;
}
.search-btn {
  height: 36px;
  padding: 0 24px;
  font-size: 13px;
  letter-spacing: 1px;
  border-radius: 2px;
}

/* ---------- 页面标题 ---------- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 32px;
}
.title {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 2px;
  color: #111;
}

/* ---------- 面包屑 ---------- */
.breadcrumb {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 60px 0;
  font-size: 14px;
  color: #000;
  margin-bottom: 20px;
}
.crumb { cursor: pointer; transition: color 0.2s; }
.crumb:hover { color: #2d583f; }
.crumb.current { color: #222; font-weight: 600 }
.sep { color: #bbb }

/* ---------- 二级筛选 ---------- */
.sub-filter {
  display: flex;
  gap: 48px;
  margin-bottom: 48px;
  font-size: 13px;
  color: #666;
}
.filter-item {
  position: relative;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.25s;
}
.filter-item.hover {
  color: #b8860b;
}
.arrow {
  margin-left: 4px;
  transition: transform 0.25s;
}
.arrow.up {
  transform: rotate(180deg);
}

/* ---------- 下拉菜单 ---------- */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  list-style: none;
  padding: 6px 0;
  margin: 0;
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

/* ---------- 列表 ---------- */
.list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 32px;
}
.card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s;
}
.card:hover {
  transform: translateY(-4px);
}
.img-wrap {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  padding: 16px;
}
.book-title {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.price {
  color: #b12704;
  font-size: 15px;
  letter-spacing: 1px;
}
.symbol {
  font-size: 12px;
  margin-right: 2px;
}

/* ---------- 收藏按钮 ---------- */
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

/* ---------- 删除按钮 ---------- */
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.25s;
}
.card:hover .close {
  opacity: 1;
}

/* ---------- 空状态 ---------- */
.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 0;
  font-size: 14px;
  color: #999;
  letter-spacing: 1px;
}

/* ---------- 动效 ---------- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
