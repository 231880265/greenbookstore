# API 使用文档

## 目录结构

```
src/api/
├── index.ts         # 统一导出
├── request.ts       # axios 封装和拦截器
├── types.ts         # TypeScript 类型定义
├── product.ts       # 商品相关接口
├── category.ts      # 分类相关接口
├── order.ts         # 订单相关接口
├── user.ts          # 用户相关接口
└── cart.ts          # 购物车相关接口
```

## 快速开始

### 1. 在组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProductList, getProductDetail } from '@/api';
import type { Product } from '@/api';

const products = ref<Product[]>([]);
const loading = ref(false);

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true;
  try {
    const res = await getProductList({ page: 1, pageSize: 10 });
    products.value = res.data.list;
  } catch (error) {
    console.error('获取商品列表失败', error);
  } finally {
    loading.value = false;
  }
};

// 获取商品详情
const fetchProductDetail = async (id: number) => {
  try {
    const res = await getProductDetail(id);
    console.log('商品详情：', res.data);
  } catch (error) {
    console.error('获取商品详情失败', error);
  }
};

onMounted(() => {
  fetchProducts();
});
</script>
```

### 2. 环境配置

项目已配置开发和生产环境：

- **开发环境** (`.env.development`)：`http://localhost:3000/api`
- **生产环境** (`.env.production`)：需要替换为真实的 API 地址

### 3. 代理配置

在 `vite.config.ts` 中已配置代理，开发环境下：

- 前端请求 `/api/*` 会被代理到 `http://localhost:3000/*`
- 解决跨域问题

## API 模块说明

### 商品接口 (product.ts)

```typescript
// 获取商品列表（支持分页和筛选）
getProductList({ page: 1, pageSize: 10, categoryId: 1, keyword: '搜索词' })

// 获取商品详情
getProductDetail(productId)

// 获取热门商品
getHotProducts(10)

// 获取新品推荐
getNewProducts(10)

// 搜索商品
searchProducts('关键词', { page: 1, pageSize: 10 })

// 根据分类获取商品
getProductsByCategory(categoryId, { page: 1, pageSize: 10 })
```

### 分类接口 (category.ts)

```typescript
// 获取所有分类
getCategoryList()

// 获取分类详情
getCategoryDetail(categoryId)

// 获取热门分类
getHotCategories(10)
```

### 购物车接口 (cart.ts)

```typescript
// 获取购物车列表
getCartList()

// 添加到购物车
addToCart({ productId: 1, quantity: 2 })

// 更新购物车商品数量
updateCartItem(cartItemId, quantity)

// 删除购物车商品
deleteCartItem(cartItemId)

// 批量删除
batchDeleteCartItems([1, 2, 3])

// 选中/取消选中
toggleCartItemSelect(cartItemId, true)

// 全选/取消全选
toggleAllCartItems(true)

// 清空购物车
clearCart()
```

### 订单接口 (order.ts)

```typescript
// 创建订单
createOrder({
  items: [{ productId: 1, quantity: 2 }],
  totalAmount: 99.99,
  address: '收货地址',
  remark: '备注'
})

// 获取订单列表
getOrderList({ page: 1, pageSize: 10, status: 1 })

// 获取订单详情
getOrderDetail(orderId)

// 取消订单
cancelOrder(orderId)

// 确认收货
confirmOrder(orderId)

// 删除订单
deleteOrder(orderId)

// 支付订单
payOrder(orderId, 'alipay')
```

### 用户接口 (user.ts)

```typescript
// 登录
login({ username: 'user', password: 'pass' })

// 注册
register({ username: 'user', password: 'pass', email: 'email@example.com' })

// 登出
logout()

// 获取用户信息
getUserInfo()

// 更新用户信息
updateUserInfo({ nickname: '昵称', avatar: 'url' })

// 修改密码
changePassword({ oldPassword: 'old', newPassword: 'new' })
```

## 请求拦截器功能

- ✅ 自动添加 Token 到请求头
- ✅ 统一错误处理
- ✅ 401 自动跳转登录
- ✅ 请求超时设置（15秒）
- ✅ 响应数据格式统一处理

## 修改后端地址

1. **开发环境**：修改 `.env.development` 中的 `VITE_API_BASE_URL`
2. **生产环境**：修改 `.env.production` 中的 `VITE_API_BASE_URL`
3. **代理配置**：修改 `vite.config.ts` 中的 `server.proxy` 配置

## 注意事项

1. 所有接口返回格式假定为：`{ code: number, data: any, message: string }`
2. 根据实际后端返回格式，可能需要调整 `request.ts` 中的响应拦截器
3. Token 存储在 localStorage 中，key 为 `token`
4. 所有类型定义在 `types.ts` 中，可根据实际需求修改
