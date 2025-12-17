<!-- MyCollections.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Search, Close, ArrowDown } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'

/* ---------- 类型 ---------- */
interface FavoriteItem {
  favoriteId: number
  ubId: number
  title: string
  cover: string
  price: number
}

/* ---------- 数据 ---------- */
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)

/* ---------- 搜索 ---------- */
const keyword = ref('')

/* ---------- 下拉状态 ---------- */
const open = ref({
  category: false,
  status: false,
  time: false,
  sort: false,
})
const toggle = (k: keyof typeof open.value) => {
  open.value[k] = !open.value[k]
}
const closeAll = () => {
  open.value = { category: false, status: false, time: false, sort: false }
}

/* ---------- 筛选项 ---------- */
const categoryOptions = ['全部', '文学', '小说', '艺术', '历史', '社科', '生活', '经济', '政治', '哲学心理学']
const statusOptions   = ['全部', '正常', '失效']
const timeOptions     = ['全部', '最近一周', '最近一月', '最近三月', '最近半年', '最近一年']
const sortOptions     = ['时间↓', '时间↑', '价格↓', '价格↑']

const currentCategory = ref('全部')
const currentStatus   = ref('全部')
const currentTime     = ref('全部')
const currentSort     = ref('时间↓')

/* ---------- 拉取收藏 ---------- */
const fetchFavorites = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('http://127.0.0.1:8080/api/favorites', {
      headers: { token: localStorage.getItem('GB_TOKEN') || '' },
    })
    favorites.value = data.data   // 仅使用接口返回字段
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

/* ---------- 过滤 + 排序 ---------- */
const filteredList = computed(() => {
  let list = [...favorites.value]

  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(kw))
  }

  if (currentCategory.value !== '全部') {
    list = list.filter(i => i.title.includes(currentCategory.value))
  }

  if (currentStatus.value !== '全部') {
    // 接口无 status 字段，按“失效”关键词简单过滤
    const invalid = currentStatus.value === '失效'
    list = list.filter(i => i.title.includes('失效') === invalid)
  }

  if (currentTime.value !== '全部') {
    const map: Record<string, number> = {
      '最近一周': 7 * 24 * 3600 * 1000,
      '最近一月': 30 * 24 * 3600 * 1000,
      '最近三月': 90 * 24 * 3600 * 1000,
      '最近半年': 180 * 24 * 3600 * 1000,
      '最近一年': 365 * 24 * 3600 * 1000,
    }
    const min = Date.now() - map[currentTime.value]
    // 接口无 collectedAt，用 favoriteId 降序模拟时间
    list = list.filter(i => i.favoriteId > 0) // 占位，实际可扩展
  }

  switch (currentSort.value) {
    case '时间↓': list.sort((a, b) => b.favoriteId - a.favoriteId); break
    case '时间↑': list.sort((a, b) => a.favoriteId - b.favoriteId); break
    case '价格↓': list.sort((a, b) => b.price - a.price); break
    case '价格↑': list.sort((a, b) => a.price - b.price); break
  }

  return list
})

/* ---------- 取消收藏 ---------- */
const removeFavorite = async (item: FavoriteItem) => {
  try {
    await axios.delete('http://127.0.0.1:8080/api/favorites/${item.favoriteId}', {
      headers: { token: localStorage.getItem('GB_TOKEN') || '' },
    })
    favorites.value = favorites.value.filter(f => f.favoriteId !== item.favoriteId)
  } catch (e) {
    console.error('取消收藏失败', e)
  }
}

onMounted(fetchFavorites)
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
        <el-button text class="batch-btn">批量管理</el-button>
      </header>

      <!-- 二级筛选 -->
      <nav class="sub-filter">
        <div
            v-for="(label, key) in { category: '宝贝分类', status: '宝贝状态', time: '收藏时间', sort: '宝贝排序' }"
            :key="key"
            class="filter-item"
            :class="{ open: open[key as keyof typeof open] }"
            @mouseenter="$event.currentTarget.classList.add('hover')"
            @mouseleave="$event.currentTarget.classList.remove('hover')"
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
                  @click.stop="
                  key === 'category' ? (currentCategory = opt) :
                  key === 'status' ? (currentStatus = opt) :
                  key === 'time' ? (currentTime = opt) :
                  (currentSort = opt);
                  closeAll()
                "
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
        >
          <div class="img-wrap">
            <img :src="item.cover" :alt="item.title" />
          </div>
          <div class="info">
            <p class="book-title" :title="item.title">{{ item.title }}</p>
            <p class="price">
              <span class="symbol">¥</span>
              <span class="num">{{ item.price.toFixed(2) }}</span>
            </p>
          </div>
          <el-icon class="close" @click="removeFavorite(item)"><Close /></el-icon>
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
.batch-btn {
  font-size: 13px;
  color: #666;
  letter-spacing: 1px;
  transition: color 0.25s;
}
.batch-btn:hover {
  color: #000;
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