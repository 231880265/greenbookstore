<template>
  <div class="profile-page">
    <HeaderBar />

    <main class="profile-main">
      <div class="profile-layout">
        <!-- 左侧：用户信息卡片 -->
        <section class="profile-left">
          <div class="user-card">
            <div class="avatar-wrapper">
              <img :src="user.avatar || defaultAvatar" alt="avatar" class="avatar" />
            </div>
            <div class="user-info">
              <h2 class="nickname">{{ user.username || '叶子' }}</h2>
              <p class="telephone">{{ user.telephone }}</p>
              <p class="leaf">小绿叶：<span class="leaf-num">{{ user.leaf }}</span></p>
            </div>
            <div class="user-actions">
              <button class="link-btn" @click="onEditAddress">编辑地址</button>
              <button class="link-btn" @click="onEditProfile">修改信息</button>
              <button class="link-btn" @click="onLogout">退出登录</button>
            </div>
          </div>

          <!-- 地址区域（简化为提示与按钮，表单可在后续弹窗中实现） -->
          <div class="address-card">
            <h3>收货地址</h3>
            <p class="address-hint">
              可以从已有地址中选择，或添加新的收货地址。后续可在弹窗中完成编辑表单。
            </p>
            <div class="address-actions">
              <button class="outline-btn">选择已有地址</button>
              <button class="outline-btn">新增地址</button>
            </div>
          </div>
        </section>

        <!-- 右侧：三类列表预览 -->
        <section class="profile-right">
          <div class="list-section">
            <div class="list-header">
              <h3>回收订单</h3>
              <button class="more-link">查看全部</button>
            </div>
            <ul class="book-list">
              <li v-for="item in soldBookList" :key="item.rcld" class="book-item">
                <img :src="item.cover" class="book-cover" />
                <div class="book-meta">
                  <div class="title">{{ item.title }}</div>
                  <div class="price">¥{{ item.price }}</div>
                </div>
              </li>
              <li v-if="!soldBookList.length" class="empty-row">暂无回收订单</li>
            </ul>
          </div>

          <div class="list-section">
            <div class="list-header">
              <h3>购书订单</h3>
              <button class="more-link">查看全部</button>
            </div>
            <ul class="book-list">
              <li v-for="item in orderList" :key="item.orderId" class="book-item">
                <img :src="item.cover" class="book-cover" />
                <div class="book-meta">
                  <div class="title">
                    {{ item.orderItems[0]?.title || '订单 ' + item.orderId }}
                  </div>
                  <div class="price">¥{{ item.totalAmount }}</div>
                </div>
              </li>
              <li v-if="!orderList.length" class="empty-row">暂无购书订单</li>
            </ul>
          </div>

          <div class="list-section">
            <div class="list-header">
              <h3>我的收藏</h3>
              <button class="more-link">查看全部</button>
            </div>
            <ul class="book-list">
              <li v-for="item in favoriteList" :key="item.favoriteId" class="book-item">
                <img :src="item.cover" class="book-cover" />
                <div class="book-meta">
                  <div class="title">{{ item.title }}</div>
                  <div class="price">¥{{ item.price }}</div>
                </div>
              </li>
              <li v-if="!favoriteList.length" class="empty-row">暂无收藏</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import {
  getCurrentUser,
  getSoldBookList,
  getMyOrders,
  getFavoriteList,
} from '@/api'
import type { SoldBookItem, OrderVO, FavoriteItem, UserDetail } from '@/api/types'

const router = useRouter()

const defaultAvatar = new URL('../pages/image/favor.svg', import.meta.url).href

const user = reactive<UserDetail>({
  id: 0,
  username: '',
  avatar: null,
  telephone: '',
  leaf: 0,
})

// 回收订单（卖出图书）
const soldBookList = ref<SoldBookItem[]>([])
// 购书订单
const orderList = ref<OrderVO[]>([])
// 我的收藏
const favoriteList = ref<FavoriteItem[]>([])

const loadData = async () => {
  try {
    const profileRes = await getCurrentUser()
    Object.assign(user, profileRes.data)
  } catch {
    // 如果未登录或接口异常，退回首页
    router.replace('/')
    return
  }

  // 预览列表：接口未就绪时允许静默失败
  try {
    const soldRes = await getSoldBookList()
    soldBookList.value = soldRes.data || []
  } catch {
    console.error('获取回收订单失败')
  }

  try {
    const orderRes = await getMyOrders()
    orderList.value = orderRes.data || []
  } catch {
    console.error('获取购书订单失败')
  }

  try {
    const favRes = await getFavoriteList()
    favoriteList.value = favRes.data || []
  } catch {
    console.error('获取收藏列表失败')
  }
}

onMounted(() => {
  loadData()
})

const onEditAddress = () => {
  // 这里可以后续改成打开「编辑地址」弹窗
  console.log('edit address clicked')
}

const onEditProfile = () => {
  console.log('edit profile clicked')
}

const onLogout = () => {
  localStorage.removeItem('GB_TOKEN')
  router.replace('/')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #fff0da;
}

.profile-main {
  max-width: 1200px;
  margin: 24px auto 40px;
  padding: 0 20px;
}

.profile-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.profile-left {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 18px 16px;
  box-shadow: 0 4px 14px rgba(45, 88, 63, 0.08);
  border: 1px solid rgba(200, 177, 150, 0.4);
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2d583f;
  background: #fff;
}

.user-info {
  text-align: center;
}

.nickname {
  margin: 0;
  font-size: 20px;
  color: #2d583f;
}

.telephone {
  margin-top: 6px;
  font-size: 14px;
  color: #555;
}

.leaf {
  margin-top: 8px;
  font-size: 14px;
  color: #7a6b5c;
}

.leaf-num {
  font-weight: 600;
  color: #2d583f;
}

.user-actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.link-btn {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  color: #2d583f;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.address-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 4px 14px rgba(45, 88, 63, 0.06);
  border: 1px solid rgba(200, 177, 150, 0.3);
}

.address-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #2d583f;
}

.address-hint {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.address-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.outline-btn {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #c8b196;
  background: #fff7eb;
  font-size: 13px;
  color: #7a6b5c;
  cursor: pointer;
}

.outline-btn:hover {
  background: #ffe9c8;
}

.profile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px 12px;
  box-shadow: 0 4px 14px rgba(45, 88, 63, 0.06);
  border: 1px solid rgba(200, 177, 150, 0.3);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2d583f;
}

.more-link {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #7a6b5c;
  cursor: pointer;
}

.more-link:hover {
  text-decoration: underline;
}

.book-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid rgba(200, 177, 150, 0.25);
}

.book-item:first-child {
  border-top: none;
}

.book-cover {
  width: 52px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
  background: #fff0da;
}

.book-meta {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-meta .title {
  font-size: 14px;
  color: #333;
}

.book-meta .price {
  font-size: 14px;
  color: #d40000;
  font-weight: 600;
}

.empty-row {
  padding: 10px 0 4px;
  font-size: 13px;
  color: #999;
}
</style>


