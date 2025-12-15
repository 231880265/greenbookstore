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
                <button class="link-btn" @click="openAddressModal">
                  地址簿
                </button>
                <button class="link-btn">资料修改</button>
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
  
      <!-- 地址管理弹窗 -->
      <teleport to="body">
        <div v-if="addressModalOpen" class="modal-mask">
          <div class="modal-panel">
            <div class="modal-header">
              <h3>地址管理</h3>
              <button class="primary-btn" @click="openAddForm">+ 新增地址</button>
            </div>
  
            <div class="address-list">
              <div v-for="item in addressList" :key="item.id" class="address-item">
                <div class="address-main">
                  <div class="name">{{ item.name }} · {{ item.phone }}</div>
                  <div class="detail">
                    {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
                  </div>
                </div>
                <div class="ops">
                  <button class="link" @click="openEditForm(item)">编辑</button>
                  <button class="danger" @click="onDeleteAddress(item.id)">删除</button>
                </div>
              </div>
  
              <div v-if="!addressList.length" class="empty">暂无地址</div>
            </div>
  
            <div class="modal-footer">
              <button class="outline-btn" @click="addressModalOpen = false">关闭</button>
            </div>
          </div>
        </div>
      </teleport>
  
      <!-- 新增 / 编辑地址弹窗 -->
      <teleport to="body">
        <div v-if="addressFormOpen" class="modal-mask">
          <div class="modal-panel">
            <h3 class="modal-title">
              {{ editingAddress ? '编辑地址' : '新增地址' }}
            </h3>
  
            <div class="form">
              <input v-model="addressForm.name" placeholder="收件人姓名" />
              <input v-model="addressForm.phone" placeholder="手机号" />
              <input v-model="addressForm.province" placeholder="省" />
              <input v-model="addressForm.city" placeholder="市" />
              <input v-model="addressForm.district" placeholder="区" />
              <input v-model="addressForm.detail" placeholder="详细地址" />
            </div>
  
            <div class="modal-footer">
              <button class="outline-btn" @click="addressFormOpen = false">取消</button>
              <button class="primary-btn" @click="submitAddress">
                保存
              </button>
            </div>
          </div>
        </div>
      </teleport>
  
      <Footer />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import HeaderBar from '@/components/HeaderBar.vue'
  import Footer from '@/components/Footer.vue'
  import {
    getCurrentUser,
    getSoldBookList,
    getMyOrders,
    getFavoriteList,
    getAddressList,
    createAddress,
    updateAddress,
    deleteAddress,
  } from '@/api'
  import type {
    UserDetail,
    SoldBookItem,
    OrderVO,
    FavoriteItem,
    AddressItem,
  } from '@/api/types'
  
  const router = useRouter()
  const defaultAvatar ="https://wonderful1.oss-cn-hangzhou.aliyuncs.com/leaf.jpg"
  
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
  
  /* 地址逻辑 */
  const addressModalOpen = ref(false)
  const addressFormOpen = ref(false)
  const addressList = ref<AddressItem[]>([])
  const editingAddress = ref<AddressItem | null>(null)
  
  const addressForm = reactive({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  })
  
  const openAddressModal = async () => {
    addressModalOpen.value = true
    addressList.value = (await getAddressList()).data || []
  }
  
  const openAddForm = () => {
    editingAddress.value = null
    Object.assign(addressForm, {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
    })
    addressFormOpen.value = true
  }
  
  const openEditForm = (item: AddressItem) => {
    editingAddress.value = item
    Object.assign(addressForm, item)
    addressFormOpen.value = true
  }
  
  const submitAddress = async () => {
    if (editingAddress.value) {
      await updateAddress(editingAddress.value.id, addressForm)
    } else {
      await createAddress(addressForm)
    }
    addressFormOpen.value = false
    addressList.value = (await getAddressList()).data || []
  }
  
  const onDeleteAddress = async (id: number) => {
    if (!confirm('确认删除该地址吗？')) return
    await deleteAddress(id)
    addressList.value = (await getAddressList()).data || []
  }
  
  onMounted(async () => {
    Object.assign(user, (await getCurrentUser()).data)
    soldBookList.value = (await getSoldBookList()).data || []
    orderList.value = (await getMyOrders()).data || []
    favoriteList.value = (await getFavoriteList()).data || []
  })
  
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
    .modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
}

.modal-panel {
  width: 560px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-main .name {
  font-size: 14px;
  font-weight: 600;
}

.address-main .detail {
  margin-top: 4px;
  font-size: 13px;
  color: #666;
}

.delete-btn {
  border: none;
  background: none;
  color: #d40000;
  cursor: pointer;
}

.primary-btn {
  border: none;
  background: #2d583f;
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
}

.empty {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 20px 0;
}

    </style>
    
  