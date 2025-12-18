<!-- MyCollections.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'
import { getFavoriteList, removeFavorite as apiRemoveFavorite } from '@/api'
import type { FavoriteItem } from '@/api/types'
import { useRouter } from 'vue-router'

 /* ---------- 数据 / 状态 ---------- */
const router = useRouter()
const keyword = ref('')
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)
// 下拉筛选 UI 占位（模板用到），保持可交互但简单实现
const open = ref<{ [k: string]: boolean }>({ category: false, status: false, time: false, sort: false })
const toggle = (k: keyof typeof open.value) => {
  open.value[k] = !open.value[k]
}
const closeAll = () => {
  Object.keys(open.value).forEach(k => (open.value[k as keyof typeof open.value] = false))
}
const categoryOptions = ['全部', '法律', '经济', '文学']
const statusOptions = ['全部', '在售', '已售']
const timeOptions = ['全部', '最近一周', '最近一个月']
const sortOptions = ['默认', '价格从低到高', '价格从高到低']
const currentCategory = ref<string | null>(null)
const currentStatus = ref<string | null>(null)
const currentTime = ref<string | null>(null)
const currentSort = ref<string | null>(null)

const fetchFavorites = async () => {
  loading.value = true
  try {
    const res = await getFavoriteList()
    // API 返回 ApiResponse<FavoriteItem[]>{ code, data, msg }
    favorites.value = res.data || []
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

// 搜索 / 过滤结果（简单前端实现）
const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = [...favorites.value]
  if (kw) {
    list = list.filter(i => (i.title || '').toLowerCase().includes(kw))
  }
  // 其他过滤器（category/status/time/sort）可在此扩展
  return list
})
 </script>

<template>
  <div class="page">
    <HeaderBar />

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

      <!-- 标题 + 批量管理 -->
      <header class="page-header">
        <h1 class="title">我的收藏</h1>
      </header>

      <!-- 二级筛选 -->
      <nav class="sub-filter">
        <div
            v-for="(label, key) in { category: '宝贝分类', status: '宝贝状态', time: '收藏时间', sort: '宝贝排序' }"
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
                  v-for="opt in key === 'category' ? categoryOptions : key === 'status' ? statusOptions : key === 'time' ? timeOptions : sortOptions"
                  :key="opt"
                  :class="{ active: (key === 'category' && currentCategory === opt) || (key === 'status' && currentStatus === opt) || (key === 'time' && currentTime === opt) || (key === 'sort' && currentSort === opt) }"
                  @click.stop="( () => { if (key === 'category') currentCategory = opt; else if (key === 'status') currentStatus = opt; else if (key === 'time') currentTime = opt; else currentSort = opt; closeAll(); } )()"
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
  </div>
</template>

<style scoped>
/* ========== 全局 ========== */
.page {
  background: #fafafa;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
