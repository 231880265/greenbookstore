<!-- MyFavorites.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import HeaderBar from "../components/HeaderBar.vue";

/* -------------------- 类型 -------------------- */
interface FavoriteItem {
  favoriteId: number
  ubId: number
  title: string
  cover: string
  price: number
  status?: string          // 宝贝状态：正常 / 失效
  collectedAt?: string     // 收藏时间
  shopName?: string
  sales?: number
}

/* -------------------- 数据 -------------------- */
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)

/* -------------------- 顶部搜索 -------------------- */
const keyword = ref('')

/* -------------------- 标签栏 -------------------- */
const tabs = [
  { key: 'all', label: '全部宝贝' },
  { key: 'list', label: '宝贝清单' },
  { key: 'shop', label: '同店宝贝' },
]
const activeTab = ref('all')

/* -------------------- 二级筛选 -------------------- */
const showCategory = ref(false)
const showStatus = ref(false)
const showTime = ref(false)
const showSort = ref(false)

const categoryOptions = ['全部', '图书', '文学', '小说', '艺术', '历史', '社科', '生活', '经济', '政治', '哲学心理学']
const statusOptions = ['全部', '正常', '失效']
const timeOptions = ['全部', '最近一周', '最近一月', '最近三月', '最近半年', '最近一年']
const sortOptions = ['收藏时间降序', '收藏时间升序', '价格降序', '价格升序']

const currentCategory = ref('全部')
const currentStatus = ref('全部')
const currentTime = ref('全部')
const currentSort = ref('收藏时间降序')

/* -------------------- 拉取收藏列表 -------------------- */
const fetchFavorites = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/favorites', {
      headers: { token: localStorage.getItem('token') || '' },
    })
    // 接口只返回少量字段，这里补全演示字段
    favorites.value = data.data.map((f: any) => ({
      ...f,
      status: Math.random() > 0.1 ? '正常' : '失效',
      collectedAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
      shopName: '兴文书店',
      sales: Math.floor(Math.random() * 10000),
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

/* -------------------- 计算属性：过滤 + 排序 -------------------- */
const filteredList = computed(() => {
  let list = [...favorites.value]

  // 关键词
  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(kw))
  }

  // 分类（简单示例：按标题关键词过滤）
  if (currentCategory.value !== '全部') {
    const cate = currentCategory.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(cate))
  }

  // 状态
  if (currentStatus.value !== '全部') {
    list = list.filter(i => i.status === currentStatus.value)
  }

  // 时间
  if (currentTime.value !== '全部') {
    const map: Record<string, number> = {
      '最近一周': 7 * 24 * 3600 * 1000,
      '最近一月': 30 * 24 * 3600 * 1000,
      '最近三月': 90 * 24 * 3600 * 1000,
      '最近半年': 180 * 24 * 3600 * 1000,
      '最近一年': 365 * 24 * 3600 * 1000,
    }
    const delta = map[currentTime.value]
    const min = Date.now() - delta
    list = list.filter(i => new Date(i.collectedAt!).getTime() > min)
  }

  // 排序
  switch (currentSort.value) {
    case '收藏时间降序':
      list.sort((a, b) => +new Date(b.collectedAt!) - +new Date(a.collectedAt!))
      break
    case '收藏时间升序':
      list.sort((a, b) => +new Date(a.collectedAt!) - +new Date(b.collectedAt!))
      break
    case '价格降序':
      list.sort((a, b) => b.price - a.price)
      break
    case '价格升序':
      list.sort((a, b) => a.price - b.price)
      break
  }

  return list
})

/* -------------------- 取消收藏 -------------------- */
const removeFavorite = async (item: FavoriteItem) => {
  try {
    await axios.delete(`/api/favorites/${item.favoriteId}`, {
      headers: { token: localStorage.getItem('token') || '' },
    })
    favorites.value = favorites.value.filter(f => f.favoriteId !== item.favoriteId)
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchFavorites)
</script>

<template>
  <div class="page">
    <HeaderBar />
    <!-- 顶部搜索条 -->
    <div class="top-search">
      <el-input
          v-model="keyword"
          placeholder="搜索我的收藏"
          class="search-input"
          clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary">搜索</el-button>
    </div>

    <!-- 标题栏 -->
    <div class="header-bar">
      <h2>我的收藏</h2>
      <div class="actions">
        <el-button text>批量管理</el-button>
        <el-input
            placeholder="搜索"
            size="small"
            class="inner-search"
            clearable
        >
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </span>
    </div>

    <!-- 二级筛选 -->
    <div class="sub-filter">
      <span class="filter-item" @click="showCategory = !showCategory">
        宝贝分类
        <el-icon class="arrow" :class="{ up: showCategory }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="showCategory" class="dropdown">
            <li
                v-for="c in categoryOptions"
                :key="c"
                :class="{ active: currentCategory === c }"
                @click.stop="currentCategory = c; showCategory = false"
            >
              {{ c }}
            </li>
          </ul>
        </transition>
      </span>

      <span class="filter-item" @click="showStatus = !showStatus">
        宝贝状态
        <el-icon class="arrow" :class="{ up: showStatus }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="showStatus" class="dropdown">
            <li
                v-for="s in statusOptions"
                :key="s"
                :class="{ active: currentStatus === s }"
                @click.stop="currentStatus = s; showStatus = false"
            >
              {{ s }}
            </li>
          </ul>
        </transition>
      </span>

      <span class="filter-item" @click="showTime = !showTime">
        收藏时间
        <el-icon class="arrow" :class="{ up: showTime }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="showTime" class="dropdown">
            <li
                v-for="t in timeOptions"
                :key="t"
                :class="{ active: currentTime === t }"
                @click.stop="currentTime = t; showTime = false"
            >
              {{ t }}
            </li>
          </ul>
        </transition>
      </span>

      <span class="filter-item" @click="showSort = !showSort">
        宝贝排序
        <el-icon class="arrow" :class="{ up: showSort }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="showSort" class="dropdown">
            <li
                v-for="s in sortOptions"
                :key="s"
                :class="{ active: currentSort === s }"
                @click.stop="currentSort = s; showSort = false"
            >
              {{ s }}
            </li>
          </ul>
        </transition>
      </span>
    </div>

    <!-- 收藏列表 -->
    <div v-loading="loading" class="list">
      <div
          v-for="item in filteredList"
          :key="item.favoriteId"
          class="card"
          :class="{ disabled: item.status === '失效' }"
      >
        <div class="img-wrap">
          <img :src="item.cover" alt="cover" />
          <div v-if="item.status === '失效'" class="mask">宝贝失效</div>
        </div>
        <div class="info">
          <p class="title" :title="item.title">{{ item.title }}</p>
          <p class="sales">{{ item.sales }}人收藏</p>
          <p class="price">
            <span class="symbol">¥</span>
            <span class="num">{{ item.price.toFixed(2) }}</span>
          </p>
        </div>
        <el-icon class="close" @click="removeFavorite(item)"><Close /></el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
  font-size: 14px;
  color: #333;
}
.top-search {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.search-input {
  width: 300px;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.inner-search {
  width: 200px;
}
.tabs {
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 12px;
}
.tabs span {
  display: inline-block;
  padding: 8px 16px;
  cursor: pointer;
  transition: color 0.2s;
}
.tabs span.active {
  color: #ff5000;
  border-bottom: 2px solid #ff5000;
}
.sub-filter {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}
.filter-item {
  position: relative;
  cursor: pointer;
  user-select: none;
}
.filter-item:hover {
  color: #ff5000;
}
.arrow {
  margin-left: 4px;
  transition: transform 0.2s;
}
.arrow.up {
  transform: rotate(180deg);
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  background: #fff;
  border: 1px solid #e5e5e5;
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0;
  min-width: 100px;
}
.dropdown li {
  padding: 4px 12px;
  cursor: pointer;
}
.dropdown li:hover {
  background: #f5f5f5;
}
.dropdown li.active {
  color: #ff5000;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.card {
  position: relative;
  border: 1px solid #f2f2f2;
  border-radius: 4px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.card.disabled {
  opacity: 0.6;
}
.img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.info {
  padding: 8px;
}
.title {
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sales {
  margin: 0 0 4px;
  font-size: 12px;
  color: #999;
}
.price {
  color: #ff5000;
  font-size: 16px;
}
.symbol {
  font-size: 12px;
}
.close {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 16px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  padding: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.card:hover .close {
  opacity: 1;
}
</style>