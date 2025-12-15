<!-- MyCollections.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Search, Close } from '@element-plus/icons-vue'
import HeaderBar from '../components/HeaderBar.vue'
import pic1 from '../assets/PL1.jpg'
import pic2 from '../assets/PL2.jpg'
import pic3 from '../assets/PL3.jpg'

/* ---------- 类型 ---------- */
interface FavoriteItem {
  favoriteId: number
  ubId: number
  title: string
  cover: string
  price: number
  status?: string
  collectedAt?: string
  shopName?: string
  sales?: number
}

/* ---------- 数据 ---------- */
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)

/* ---------- 搜索 ---------- */
const keyword = ref('')

/* ---------- 下拉栏状态 ---------- */
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

/* ---------- 选项 ---------- */
const categoryOptions = ['全部', '文学', '小说', '艺术', '历史', '社科', '生活', '经济', '政治', '哲学心理学']
const statusOptions   = ['全部', '正常', '失效']
const timeOptions     = ['全部', '最近一周', '最近一月', '最近三月', '最近半年', '最近一年']
const sortOptions     = ['时间↓', '时间↑', '价格↓', '价格↑']   // 缩短文字

const currentCategory = ref('全部')
const currentStatus   = ref('全部')
const currentTime     = ref('全部')
const currentSort     = ref('时间↓')

// const fetchFavorites = async () => {
//   loading.value = true
//   try {
//     const { data } = await axios.get('/api/favorites', {
//       headers: { token: localStorage.getItem('token') || '' },
//     })
//     // 接口只返回少量字段，这里补全演示字段
//     favorites.value = data.data.map((f: any) => ({
//       ...f,
//       status: Math.random() > 0.1 ? '正常' : '失效',
//       collectedAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
//       shopName: '兴文书店',
//       sales: Math.floor(Math.random() * 10000),
//     }))
//   } catch (e) {
//     console.error(e)
//   } finally {
//     loading.value = false
//   }

/* ---------- 死数据 ---------- */
const fetchFavorites = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 300))
  favorites.value = [
    {
      favoriteId: 1,
      ubId: 101,
      title: 'Java编程思想',
      cover: pic1,
      price: 39.9,
      status: '正常',
      collectedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      shopName: '兴文书店',
      sales: 1234,
    },
    {
      favoriteId: 2,
      ubId: 102,
      title: '深入理解计算机系统',
      cover: pic2,
      price: 89,
      status: '正常',
      collectedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      shopName: '图灵书店',
      sales: 5678,
    },
    {
      favoriteId: 3,
      ubId: 103,
      title: '算法导论',
      cover: pic3,
      price: 128,
      status: '失效',
      collectedAt: new Date(Date.now() - 200 * 24 * 3600 * 1000).toISOString(),
      shopName: '机械工业出版社',
      sales: 91011,
    },
  ]
  loading.value = false
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
    list = list.filter(i => i.status === currentStatus.value)
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
    list = list.filter(i => new Date(i.collectedAt!).getTime() > min)
  }

  switch (currentSort.value) {
    case '时间↓': list.sort((a, b) => +new Date(b.collectedAt!) - +new Date(a.collectedAt!)); break
    case '时间↑': list.sort((a, b) => +new Date(a.collectedAt!) - +new Date(b.collectedAt!)); break
    case '价格↓': list.sort((a, b) => b.price - a.price); break
    case '价格↑': list.sort((a, b) => a.price - b.price); break
  }

  return list
})

/* ---------- 取消收藏 ---------- */
const removeFavorite = async (item: FavoriteItem) => {
  favorites.value = favorites.value.filter(f => f.favoriteId !== item.favoriteId)
}

onMounted(fetchFavorites)
</script>

<template>
  <div class="page">
    <HeaderBar />

    <!-- 搜索栏 -->
    <div class="top-search">
      <el-input v-model="keyword" placeholder="搜索我的收藏" class="search-input" clearable>
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary">搜索</el-button>
    </div>

    <!-- 标题 + 批量管理 -->
    <div class="header-bar">
      <h2>我的收藏</h2>
      <el-button text>批量管理</el-button>
    </div>

    <!-- 二级筛选 -->
    <div class="sub-filter">
      <div
          class="filter-item"
          :class="{ open: open.category }"
          @mouseenter="$event.currentTarget.classList.add('hover')"
          @mouseleave="$event.currentTarget.classList.remove('hover')"
          @click="toggle('category')"
      >
        宝贝分类
        <el-icon class="arrow" :class="{ up: open.category }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="open.category" class="dropdown" @mouseleave="closeAll">
            <li
                v-for="c in categoryOptions"
                :key="c"
                :class="{ active: currentCategory === c }"
                @click.stop="currentCategory = c; closeAll()"
            >
              {{ c }}
            </li>
          </ul>
        </transition>
      </div>

      <div
          class="filter-item"
          :class="{ open: open.status }"
          @mouseenter="$event.currentTarget.classList.add('hover')"
          @mouseleave="$event.currentTarget.classList.remove('hover')"
          @click="toggle('status')"
      >
        宝贝状态
        <el-icon class="arrow" :class="{ up: open.status }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="open.status" class="dropdown" @mouseleave="closeAll">
            <li
                v-for="s in statusOptions"
                :key="s"
                :class="{ active: currentStatus === s }"
                @click.stop="currentStatus = s; closeAll()"
            >
              {{ s }}
            </li>
          </ul>
        </transition>
      </div>

      <div
          class="filter-item"
          :class="{ open: open.time }"
          @mouseenter="$event.currentTarget.classList.add('hover')"
          @mouseleave="$event.currentTarget.classList.remove('hover')"
          @click="toggle('time')"
      >
        收藏时间
        <el-icon class="arrow" :class="{ up: open.time }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="open.time" class="dropdown" @mouseleave="closeAll">
            <li
                v-for="t in timeOptions"
                :key="t"
                :class="{ active: currentTime === t }"
                @click.stop="currentTime = t; closeAll()"
            >
              {{ t }}
            </li>
          </ul>
        </transition>
      </div>

      <div
          class="filter-item"
          :class="{ open: open.sort }"
          @mouseenter="$event.currentTarget.classList.add('hover')"
          @mouseleave="$event.currentTarget.classList.remove('hover')"
          @click="toggle('sort')"
      >
        宝贝排序
        <el-icon class="arrow" :class="{ up: open.sort }"><ArrowDown /></el-icon>
        <transition name="fade">
          <ul v-if="open.sort" class="dropdown" @mouseleave="closeAll">
            <li
                v-for="s in sortOptions"
                :key="s"
                :class="{ active: currentSort === s }"
                @click.stop="currentSort = s; closeAll()"
            >
              {{ s }}
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <!-- 列表 -->
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
/* 与商品列表风格统一 */
.page {
  width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #222;
  background: #fafafa;
}
.top-search {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.search-input {
  width: 300px;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.sub-filter {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}
.filter-item {
  position: relative;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}
.filter-item.hover {
  color: #b8860b;
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
  z-index: 20;
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
.list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
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
  padding: 12px;
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
  color: #b12704;
  font-size: 16px;
}
.close {
  position: absolute;
  top: 8px;
  right: 8px;
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
