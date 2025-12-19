<template>
    <div class="profile-page">
      <HeaderBar />
  
      <!-- 面包屑 -->
      <BreadcrumbBar :items="[{ label: '个人中心' }]" />
  
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
                  小绿叶数量：<span class="leaf-num">{{ user.leaf }}</span>
                </p>
              </div>

              <div class="user-actions">
                <button class="link-btn" @click="openAddressDialog">
                  地址簿
                </button>
                <button class="link-btn" @click="openEditUserForm">
                  资料修改
                </button>
                <button class="link-btn danger" @click="onLogout">
                  退出登录
                </button>
              </div>
            </div>
          </section>
  
          <!-- 右侧（订单 & 收藏） -->
          <section class="profile-right">
            <!-- 回收订单区块 -->
            <div class="order-block">
              <div class="block-header">
                <h2 class="block-title">回收订单</h2>
                <button class="block-more-btn" @click="goToAllSoldOrders">
                  全部回收订单
                  <span class="arrow">→</span>
                </button>
              </div>
              <div class="book-card-list">
                <div
                  v-for="item in soldBookList"
                  :key="item.id"
                  class="book-card"
                  @click="goToSoldOrderDetail(item.id)"
                >
                  <div class="card-img-wrapper">
                    <img :src="item.cover" class="book-card-img" />
                  </div>
                  <div class="card-info">
                    <div class="card-title">{{ item.title || '订单商品' }}</div>
                    <div class="card-price">¥{{ item.price }}</div>
                  </div>
                </div>
                <div v-if="!soldBookList.length" class="empty-state">暂无回收订单</div>
              </div>
            </div>

            <!-- 购书订单区块 -->
            <div class="order-block">
              <div class="block-header">
                <h2 class="block-title">购书订单</h2>
                <button class="block-more-btn" @click="goToAllOrders">
                  全部购书订单
                  <span class="arrow">→</span>
                </button>
              </div>
              <div class="book-card-list">
                <div
                  v-for="item in orderList"
                  :key="item.id"
                  class="book-card"
                  @click="goToOrderDetail(item.id)"
                >
                  <div class="card-img-wrapper">
                    <img :src="item.cover" class="book-card-img" />
                  </div>
                  <div class="card-info">
                    <div class="card-title">{{ item.title || '订单商品' }}</div>
                    <div class="card-price">¥{{ item.price }}</div>
                  </div>
                </div>
                <div v-if="!orderList.length" class="empty-state">暂无购书订单</div>
              </div>
            </div>

            <!-- 收藏区块 -->
            <div class="order-block">
              <div class="block-header">
                <h2 class="block-title">我的收藏</h2>
                <button class="block-more-btn" @click="goToAllFavorites">
                  全部收藏
                  <span class="arrow">→</span>
                </button>
              </div>
              <div class="book-card-list">
                <div
                  v-for="item in favoriteList"
                  :key="item.id"
                  class="book-card"
                  @click="goToProductDetail(item.id)"
                >
                  <div class="card-img-wrapper">
                    <img :src="item.cover" class="book-card-img" />
                  </div>
                  <div class="card-info">
                    <div class="card-title">{{ item.title }}</div>
                    <div class="card-price">¥{{ item.price }}</div>
                  </div>
                </div>
                <div v-if="!favoriteList.length" class="empty-state">暂无收藏</div>
              </div>
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
  import BreadcrumbBar from '@/components/BreadcrumbBar.vue'
  import AddressDialog from '@/components/AddressDialog.vue'
  import ProfileEditDialog from '@/components/ProfileEditDialog.vue'
  import {
    getCurrentUser,
    getTop5UsedBookOrders,
    getTop5Orders,
    getTop5Favorites,
  } from '@/api'
  import type {
    UserDetail,
    TopItem,
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
    password: '',
    leaf: 0,
  })
  
  const soldBookList = ref<TopItem[]>([])
  const orderList = ref<TopItem[]>([])
  const favoriteList = ref<TopItem[]>([])

  /**
   * 跳转到回收订单详情页
   */
  const goToSoldOrderDetail = (_id: number) => {
    router.push('/usedBook/orders')
  }

  /**
   * 跳转到购书订单详情页
   */
  const goToOrderDetail = (id: number) => {
    router.push({
      path: '/orderDetails',
      query: { orderId: id }
    })
  }

  /**
   * 跳转到商品详情页
   */
  const goToProductDetail = (id: number) => {
    router.push(`/product-detail/${id}`)
  }

  /**
   * 跳转到全部回收订单页面
   */
  const goToAllSoldOrders = () => {
    router.push('/usedBook/orders')
  }

  /**
   * 跳转到全部购书订单页面
   */
  const goToAllOrders = () => {
    router.push('/orders')
  }

  /**
   * 跳转到全部收藏页面
   */
  const goToAllFavorites = () => {
    // 如果收藏页面路由存在，使用该路由；否则可以跳转到其他页面
    router.push('/my-collections')
  }
  
  /**
   * 初始化数据
   */
  onMounted(async () => {
    Object.assign(user, (await getCurrentUser()).data)
    
    // 获取回收订单前5
    console.log('获取回收订单前5调用接口中······')
    const soldBookRes = await getTop5UsedBookOrders()
    console.log('回收订单前5接口返回数据:', soldBookRes)
    console.log('回收订单前5数据列表:', soldBookRes.data)
    soldBookList.value = soldBookRes.data || []
    
    // 获取购书订单前5
    const orderRes = await getTop5Orders()
    console.log('购书订单前5接口返回数据:', orderRes)
    console.log('购书订单前5数据列表:', orderRes.data)
    orderList.value = orderRes.data || []
    
    // 获取收藏前5
    const favoriteRes = await getTop5Favorites()
    console.log('收藏前5接口返回数据:', favoriteRes)
    console.log('收藏前5数据列表:', favoriteRes.data)
    favoriteList.value = favoriteRes.data || []
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
      background: #fcfbf8;
    }
    
    /* 主体 */
    .profile-main {
      margin: 24px auto;
      padding: 0 20px;
      max-width: 1400px;
    }
    
    .profile-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }
    
    /* 左侧 */
    .profile-left {
      width: 380px;
      min-width: 380px;
      max-width: 380px;
      flex-shrink: 0;
      position: sticky;
      top: 80px;
      align-self: flex-start;
    }
    
    .user-card {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #2d583f;
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
      font-size: 24px;
      color: #000;
    }
    
    .telephone {
      font-size: 15px;
      color: #888;
    }
    
    .leaf {
      margin-top: 6px;
      font-size: 15px;
      color: #000;
    }
    
    .leaf-num {
      color: #2d583f;
      font-weight: 600;
    }
    
    .user-actions {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .link-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 15px;
      color: #2d583f;
      padding: 8px 12px;
      text-align: left;
      border-radius: 6px;
      transition: background-color 0.2s ease;
    }

    .link-btn:hover {
      background-color: #f6fbf8;
    }
    
    .link-btn.danger {
      color: #d40000;
    }
    
    /* 右侧 */
    .profile-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    /* 订单区块 */
    .order-block {
      margin-bottom: 0;
    }

    /* 顶部标题和更多按钮 */
    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 25px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 10px;
    }

    .block-title {
      font-size: 30px;
      font-weight: 700;
      color: #2d583f;
      letter-spacing: 0.5px;
      margin: 0;
      padding-bottom: 0;
      line-height: 1.2;
    }

    .block-more-btn {
      border: none;
      background: transparent;
      font-size: 16px;
      cursor: pointer;
      color: #2d583f;
      transition: color 0.3s;
      font-weight: 500;
      display: flex;
      align-items: flex-end;
      padding: 0;
      line-height: 1;
    }

    .block-more-btn:hover {
      color: #2d583f;
    }

    .block-more-btn .arrow {
      margin-left: 5px;
      transition: transform 0.3s;
    }

    .block-more-btn:hover .arrow {
      transform: translateX(3px);
    }

    /* 书籍卡片列表 (横向滚动) */
    .book-card-list {
      display: flex;
      overflow-x: auto;
      padding: 10px 0;
      padding-bottom: 20px;
      gap: 12px;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .book-card-list::-webkit-scrollbar {
      display: none;
    }

    .book-card {
      min-width: 190px;
      max-width: 240px;
      flex-shrink: 0;
      background: #ffffff;
      border-radius: 6px;
      cursor: pointer;
      transition: box-shadow 0.3s, transform 0.3s;
      border: 1px solid #f0f0f0;
    }

    .book-card:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      transform: translateY(-5px);
    }

    .card-img-wrapper {
      width: 100%;
      height: 200px;
      overflow: hidden;
      border-radius: 6px 6px 0 0;
      background: #f8f8f8;
    }

    .book-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s;
    }

    .book-card:hover .book-card-img {
      transform: scale(1.05);
    }

    .card-info {
      padding: 12px;
      text-align: left;
    }

    .card-title {
      font-size: 17px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-price {
      font-size: 18px;
      color: #c0392b;
      font-weight: 700;
    }

    .empty-state {
      padding: 40px 0;
      text-align: center;
      font-size: 16px;
      color: #999;
      width: 100%;
    }
</style>
