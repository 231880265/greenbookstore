<template>
    <div class="profile-page">
      <HeaderBar />
  
      <!-- 面包屑 -->
      <section class="breadcrumb-bar">
        <div class="breadcrumb-inner">
          <span class="crumb link" @click="router.push('/')">首页</span>
          <span class="sep">/</span>
          <span class="crumb current">个人中心</span>
  
          <button class="back-btn" @click="router.push('/')">
            ← 返回首页
          </button>
        </div>
      </section>
  
      <main class="profile-main">
        <div class="profile-layout">
          <!-- 左侧 -->
          <section class="profile-left">
            <div class="user-card">
              <div class="avatar-wrapper">
                <img :src="user.avatar || defaultAvatar" class="avatar" />
              </div>
  
              <div class="user-info">
                <h2 class="nickname">{{ user.username || '叶子' }}</h2>
                <p class="telephone">{{ user.telephone }}</p>
                <p class="leaf">
                  小绿叶：<span class="leaf-num">{{ user.leaf }}</span>
                </p>
              </div>
  
              <div class="user-actions">
                <button class="link-btn" @click="openAddressDialog">
                  地址簿
                </button>
                <button class="link-btn" @click="openEditUserForm">资料修改</button>
                <button class="link-btn danger" @click="onLogout">
                  退出登录
                </button>
              </div>
            </div>
          </section>
  
          <!-- 右侧（订单 & 收藏） -->
          <section class="profile-right">
            <div class="stat-grid">
              <div class="stat-card" :class="{ active: activeTab === 'sold' }" @click="activeTab = 'sold'">
                <div class="icon">♻️</div>
                <div class="count">{{ soldBookList.length }}</div>
                <div class="label">回收订单</div>
              </div>
  
              <div class="stat-card" :class="{ active: activeTab === 'order' }" @click="activeTab = 'order'">
                <div class="icon">📦</div>
                <div class="count">{{ orderList.length }}</div>
                <div class="label">购书订单</div>
              </div>
  
              <div class="stat-card" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'">
                <div class="icon">❤️</div>
                <div class="count">{{ favoriteList.length }}</div>
                <div class="label">我的收藏</div>
              </div>
            </div>
  
            <div class="list-section">
              <h3 class="list-title">
                {{
                  activeTab === 'sold'
                    ? '回收订单'
                    : activeTab === 'order'
                    ? '购书订单'
                    : '我的收藏'
                }}
              </h3>
  
              <ul v-if="activeTab === 'sold'" class="book-list">
                <li v-for="item in soldBookList" :key="item.rcld" class="book-item">
                  <img :src="item.cover" class="book-cover" />
                  <div class="book-meta">
                    <span class="title">{{ item.title }}</span>
                    <span class="price">¥{{ item.price }}</span>
                  </div>
                </li>
                <li v-if="!soldBookList.length" class="empty-row">暂无回收订单</li>
              </ul>
  
              <ul v-if="activeTab === 'order'" class="book-list">
                <li v-for="item in orderList" :key="item.orderId" class="book-item">
                  <img :src="item.cover" class="book-cover" />
                  <div class="book-meta">
                    <span class="title">{{ item.orderItems[0]?.title }}</span>
                    <span class="price">¥{{ item.totalAmount }}</span>
                  </div>
                </li>
                <li v-if="!orderList.length" class="empty-row">暂无购书订单</li>
              </ul>
  
              <ul v-if="activeTab === 'favorite'" class="book-list">
                <li v-for="item in favoriteList" :key="item.favoriteId" class="book-item">
                  <img :src="item.cover" class="book-cover" />
                  <div class="book-meta">
                    <span class="title">{{ item.title }}</span>
                    <span class="price">¥{{ item.price }}</span>
                  </div>
                </li>
                <li v-if="!favoriteList.length" class="empty-row">暂无收藏</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <!-- 地址管理组件 -->
      <AddressDialog ref="addressDialogRef" />

      <!-- 个人资料修改组件 -->
      <ProfileEditDialog ref="profileEditDialogRef" @saved="refreshUserInfo" />

      <Footer />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import HeaderBar from '@/components/HeaderBar.vue'
  import Footer from '@/components/Footer.vue'
  import AddressDialog from '@/components/AddressDialog.vue'
  import ProfileEditDialog from '@/components/ProfileEditDialog.vue'
  import {
    getCurrentUser,
    getSoldBookList,
    getMyOrders,
    getFavoriteList,
  } from '@/api'
  import type {
    UserDetail,
    SoldBookItem,
    OrderVO,
    FavoriteItem,
  } from '@/api/types'

  const addressDialogRef = ref<InstanceType<typeof AddressDialog> | null>(null)
  const profileEditDialogRef = ref<InstanceType<typeof ProfileEditDialog> | null>(null)

  /**
   * 打开地址簿
   */
  const openAddressDialog = () => {
    addressDialogRef.value?.open()
  }

  /**
   * 打开个人资料修改弹窗
   */
  const openEditUserForm = () => {
    profileEditDialogRef.value?.open()
  }

  const router = useRouter()
  const defaultAvatar = "https://wonderful1.oss-cn-hangzhou.aliyuncs.com/leaf.jpg"
  
  const user = reactive<UserDetail>({
    id: 0,
    username: '',
    avatar: defaultAvatar,
    telephone: '',
    leaf: 0,
  })
  
  const soldBookList = ref<SoldBookItem[]>([])
  const orderList = ref<OrderVO[]>([])
  const favoriteList = ref<FavoriteItem[]>([])
  const activeTab = ref<'sold' | 'order' | 'favorite'>('sold')
  
  /**
   * 初始化数据
   */
  onMounted(async () => {
    Object.assign(user, (await getCurrentUser()).data)
    soldBookList.value = (await getSoldBookList()).data || []
    orderList.value = (await getMyOrders()).data || []
    favoriteList.value = (await getFavoriteList()).data || []
  })
  
  /**
   * 刷新用户信息
   */
  const refreshUserInfo = async () => {
    try {
      Object.assign(user, (await getCurrentUser()).data)
    } catch (err) {
      console.error('刷新用户信息失败', err)
    }
  }

  /**
   * 退出登录
   */
  const onLogout = () => {
    localStorage.removeItem('GB_TOKEN')
    router.replace('/')
  }
  </script>

<style scoped>
    /* 页面整体 */
    .profile-page {
      min-height: 100vh;
      background: #ffffff;
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
    
    .back-btn {
      margin-left: auto;
      border: 1px solid #ddd;
      background: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .back-btn:hover {
      background: #f6f6f6;
    }
    
    /* 主体 */
    .profile-main {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 20px;
    }
    
    .profile-layout {
      display: flex;
      gap: 24px;
    }
    
    /* 左侧 */
    .profile-left {
      width: 280px;
    }
    
    .user-card {
      border: 1px solid #eee;
      border-radius: 14px;
      padding: 20px;
      background: #fff;
    }
    
    .avatar-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .avatar {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #2d583f;
    }
    
    .user-info {
      text-align: center;
    }
    
    .nickname {
      margin: 8px 0 4px;
      font-size: 18px;
    }
    
    .telephone {
      font-size: 13px;
      color: #888;
    }
    
    .leaf {
      margin-top: 6px;
      font-size: 13px;
    }
    
    .leaf-num {
      color: #2d583f;
      font-weight: 600;
    }
    
    .user-actions {
      margin-top: 14px;
      display: flex;
      justify-content: space-around;
    }
    
    .link-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      color: #2d583f;
    }
    
    .link-btn.danger {
      color: #d40000;
    }
    
    /* 右侧 */
    .profile-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    
    /* Dashboard 卡片 */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .stat-card {
      border: 1px solid #eee;
      border-radius: 14px;
      padding: 18px;
      cursor: pointer;
      background: #fff;
      transition: all 0.2s ease;
      text-align: center;
    }
    
    .stat-card:hover {
      border-color: #2d583f;
    }
    
    .stat-card.active {
      border-color: #2d583f;
      background: #f6fbf8;
    }
    
    .stat-card .icon {
      font-size: 28px;
    }
    
    .stat-card .count {
      margin-top: 8px;
      font-size: 22px;
      font-weight: 700;
    }
    
    .stat-card .label {
      margin-top: 4px;
      font-size: 13px;
      color: #666;
    }
    
    /* 列表区 */
    .list-section {
      border: 1px solid #eee;
      border-radius: 14px;
      padding: 16px 18px;
      background: #fff;
    }
    
    .list-title {
      margin: 0 0 12px;
      font-size: 16px;
    }
    
    /* 图书列表 */
    .book-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .book-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-top: 1px solid #f0f0f0;
    }
    
    .book-item:first-child {
      border-top: none;
    }
    
    .book-cover {
      width: 48px;
      height: 64px;
      border-radius: 6px;
      object-fit: cover;
      background: #f5f5f5;
    }
    
    .book-meta {
      flex: 1;
      display: flex;
      justify-content: space-between;
    }
    
    .title {
      font-size: 14px;
    }
    
    .price {
      font-size: 14px;
      color: #d40000;
      font-weight: 600;
    }
    
    .empty-row {
      padding: 12px 0;
      font-size: 13px;
      color: #999;
    }
</style>
