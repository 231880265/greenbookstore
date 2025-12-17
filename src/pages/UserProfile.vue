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
  
      <!-- 地址管理弹窗 -->
      <teleport to="body">
        <div v-if="addressModalOpen" class="modal-mask">
          <div class="modal-panel">
            <div class="modal-header">
              <h3>地址管理</h3>
              <button class="primary-btn" @click="openAddForm">+ 新增地址</button>
            </div>
  
            <div class="address-list">
              <div
                v-for="item in addressList"
                :key="item.id"
                class="address-item"
                :class="{ active: selectedAddressId === item.id }"
              >
                <div class="selector" @click="selectedAddressId = item.id">
                  <span class="selector-dot" :class="{ active: selectedAddressId === item.id }"></span>
                  <span v-if="selectedAddressId === item.id" class="selector-text">当前收货地址</span>
                </div>

                <div class="address-main">
                  <div class="name">{{ item.name }} · {{ item.phone }}</div>
                  <div class="detail">
                    {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
                  </div>
                </div>

                <div class="ops">
                  <button class="pill-btn" @click="openEditForm(item)">编辑</button>
                  <button class="pill-btn danger" @click="onDeleteAddress(item.id)">删除</button>
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
          <div class="modal-panel form-panel">
            <h3 class="modal-title">
              {{ editingAddress ? '编辑地址' : '新增地址' }}
            </h3>
  
            <div class="form">
              <input v-model="addressForm.name" placeholder="收件人姓名" />
              <input v-model="addressForm.phone" placeholder="手机号" />

              <el-cascader
  class="cascader-input"
  v-model="selectedAddressOptions"
  :options="regions"
  :props="cascaderProps"
  placeholder="请选择省/市/区"
  teleported
  popper-class="address-cascader-popper"
  :popper-options="{
    strategy: 'fixed'
  }"
  @change="onAddressCascaderChange as any"
/>


              <input v-model="addressForm.detail" placeholder="详细地址（街道、门牌号等）" />
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

      <!-- 修改用户信息弹窗 -->
      <teleport to="body">
        <div v-if="editUserFormOpen" class="modal-mask">
          <div class="modal-panel form-panel">
            <h3 class="modal-title">修改个人信息</h3>

            <div class="form">
              <input
                v-model="userForm.username"
                placeholder="用户名（不可修改，用于标识）"
                disabled
                class="disabled-input"
              />
              <input
                v-model="userForm.password"
                type="password"
                placeholder="新密码（留空则不修改）"
              />
              <input v-model="userForm.name" placeholder="姓名" />
              <input v-model="userForm.telephone" placeholder="手机号" />
              <input v-model="userForm.email" placeholder="邮箱" />
              <input v-model="userForm.location" placeholder="所在地" />
              <input v-model="userForm.avatar" placeholder="头像URL" />
              <input v-model="userForm.role" placeholder="角色" />
            </div>

            <div class="modal-footer">
              <button class="outline-btn" @click="editUserFormOpen = false">取消</button>
              <button class="primary-btn" @click="submitUserInfo">保存</button>
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
  import { ElCascader } from 'element-plus'
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
    updateUserInfo,
  } from '@/api'
  import type {
    UserDetail,
    SoldBookItem,
    OrderVO,
    FavoriteItem,
    AddressItem,
  } from '@/api/types'
  import { regionData } from 'element-china-area-data'

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
  const selectedAddressId = ref<number | null>(null)
  const editingAddress = ref<AddressItem | null>(null)

  // 省市区级联（全国数据，来自 element-china-area-data）
  // regionData 结构：[{ label, value, children: [{ label, value, children: [...] }] }]
  const regions = regionData as any[]

  // Cascader 组件配置
  const cascaderProps = {
    value: 'value',
    label: 'label',
    children: 'children',
    expandTrigger: 'hover' as const,
  }

  // 级联选择器的选中值（数组格式：[省value, 市value, 区value]）
  const selectedAddressOptions = ref<string[]>([])

  const addressForm = reactive({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  })

  // 级联选择器变化时的处理
  const onAddressCascaderChange = (values: string[] | null | undefined) => {
    if (values && Array.isArray(values) && values.length >= 3) {
      // 通过 value 找到对应的 label
      const provinceItem = regions.find((r: any) => r.value === values[0])
      if (provinceItem) {
        addressForm.province = provinceItem.label
        const cityItem = provinceItem.children?.find((c: any) => c.value === values[1])
        if (cityItem) {
          addressForm.city = cityItem.label
          const districtItem = cityItem.children?.find((d: any) => d.value === values[2])
          if (districtItem) {
            addressForm.district = districtItem.label
          }
        }
      }
    } else {
      addressForm.province = ''
      addressForm.city = ''
      addressForm.district = ''
    }
  }

  // 根据 addressForm 的省市区值，初始化级联选择器的选中值
  const initCascaderFromForm = () => {
    if (!addressForm.province) {
      selectedAddressOptions.value = []
      return
    }
    const provinceItem = regions.find((r: any) => r.label === addressForm.province)
    if (!provinceItem) {
      selectedAddressOptions.value = []
      return
    }
    const provinceValue = provinceItem.value
    if (!addressForm.city) {
      selectedAddressOptions.value = [provinceValue]
      return
    }
    const cityItem = provinceItem.children?.find((c: any) => c.label === addressForm.city)
    if (!cityItem) {
      selectedAddressOptions.value = [provinceValue]
      return
    }
    const cityValue = cityItem.value
    if (!addressForm.district) {
      selectedAddressOptions.value = [provinceValue, cityValue]
      return
    }
    const districtItem = cityItem.children?.find((d: any) => d.label === addressForm.district)
    if (districtItem) {
      selectedAddressOptions.value = [provinceValue, cityValue, districtItem.value]
    } else {
      selectedAddressOptions.value = [provinceValue, cityValue]
    }
  }

  const openAddressModal = async () => {
    addressModalOpen.value = true
    const res = await getAddressList()
    addressList.value = res.data || []
    if (addressList.value.length && selectedAddressId.value === null) {
      selectedAddressId.value = addressList.value[0]!.id
    }
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
    selectedAddressOptions.value = []
    addressFormOpen.value = true
  }

  const openEditForm = (item: AddressItem) => {
    editingAddress.value = item
    Object.assign(addressForm, item)
    initCascaderFromForm()
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
    console.log("id", id)
    const res = await deleteAddress(id)
    console.log("res", res)
    
    addressList.value = (await getAddressList()).data || []
  }

  /* 修改用户信息逻辑 */
  const editUserFormOpen = ref(false)
  const userForm = reactive({
    username: '',
    password: '',
    name: '',
    telephone: '',
    email: '',
    location: '',
    avatar: '',
    role: '',
  })

  const openEditUserForm = () => {
    // 初始化表单，使用当前用户信息
    userForm.username = user.username
    userForm.name = user.username // 如果没有 name 字段，使用 username
    userForm.telephone = user.telephone
    userForm.avatar = user.avatar || ''
    userForm.password = ''
    userForm.email = ''
    userForm.location = ''
    userForm.role = ''
    editUserFormOpen.value = true
  }

  const submitUserInfo = async () => {
    try {
      // 构建请求体，只包含有值的字段（除了 username 必需）
      const payload: any = {
        username: userForm.username, // 必需
      }
      if (userForm.password) payload.password = userForm.password
      if (userForm.name) payload.name = userForm.name
      if (userForm.telephone) payload.telephone = userForm.telephone
      if (userForm.email) payload.email = userForm.email
      if (userForm.location) payload.location = userForm.location
      if (userForm.avatar) payload.avatar = userForm.avatar
      if (userForm.role) payload.role = userForm.role

      const res = await updateUserInfo(payload)
      if (res.code === '200') {
        alert('更新成功！')
        editUserFormOpen.value = false
        // 重新获取用户信息
        Object.assign(user, (await getCurrentUser()).data)
      } else {
        alert(res.msg || '更新失败')
      }
    } catch (error: any) {
      console.error('更新用户信息失败：', error)
      alert(error?.response?.data?.msg || '更新失败，请稍后重试')
    }
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
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
}

.modal-panel {
  width: 560px;
  max-height: 80vh;
  background: #fff;
  border-radius: 16px;
  padding: 20px 22px 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 5001;
  overflow: visible;
}

.form-panel {
  width: 640px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d583f;
}

.address-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.address-item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
}

.address-item.active {
  border-color: #2d583f;
  background: #f6fbf8;
}

.selector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 10px;
  cursor: pointer;
}

.selector-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #c8b196;
  background: #fff;
}

.selector-dot.active {
  border-color: #2d583f;
  background: #2d583f;
}

.selector-text {
  font-size: 12px;
  color: #7a6b5c;
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
  font-size: 13px;
}

.ops {
  display: flex;
  gap: 8px;
}

.pill-btn {
  border-radius: 999px;
  border: 1px solid #c8b196;
  background: #fff;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}

.pill-btn.danger {
  border-color: #d40000;
  color: #d40000;
}

.primary-btn {
  border: none;
  background: #2d583f;
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
}

.empty {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 20px 0;
}

/* 地址表单样式 */
.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 12px;
  margin: 12px 0 8px;
}

.form input,
.form select {
  border-radius: 999px;
  border: 1px solid #ddd;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.form input:focus,
.form select:focus {
  border-color: #2d583f;
}

/* 级联选择器样式，占据两列 */
.cascader-input {
  grid-column: 1 / -1;
}

.cascader-input :deep(.el-input__wrapper) {
  border-radius: 999px;
  border: 1px solid #ddd;
  padding: 0 10px;
  font-size: 13px;
}

.cascader-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2d583f inset;
}

/* 级联选择器下拉菜单层级，必须高于 modal-mask (5000) */
:deep(.address-cascader-popper),
:deep(.el-cascader__dropdown) {
  z-index: 10001 !important;
}

.form input.disabled-input {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.outline-btn {
  border-radius: 999px;
  border: 1px solid #c8b196;
  background: #fff;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
}

.outline-btn:hover {
  background: #fff7eb;
}
</style>
