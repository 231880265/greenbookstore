// 通用响应接口
export interface ApiResponse<T = any> {
    code: string;
    data: T;
    msg: string;
}

// 商品信息
export type Product = {
    ubId: number;
    title: string;
    price: number; 
    listPrice?: number;
    writer?: string;
    pageNum?: string;
    isbn?: string;
    wordCount?: string;
    publisher?: string;
    bookBinding?: string;
    publishTime?: string;
    cover: string;
    category?: string;
    usedDegree?: number;
    description?: string;
    stock?: number;
    sales?: number;
}

// 购物车列表
export type Cart = {
    total: number;
    items: (Product & { cartItemId: number, quantity: number })[];
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemVO {
    id: number
    ubId: number
    title: string
    writer: string
    publisher: string
    quantity: number
    price: number
    totalPrice: number
    cover: string
}

export interface OrderVO {
    orderId: number
    userId: number
    adId: number
    leaf: number
    status: OrderStatus
    totalAmount: number
    cover: string
    createTime: string
    paymentTime: string
    paymentMethod: string
    tradeNo: string
    orderItems: OrderItemVO[]
}

export type UsedBookOrderStatus = 'CHECKING' | 'SHIPPED' | 'COMPLETED';

export interface UsedBookOrderVO {
    id: number
    sellerId: number
    adId: number
    status: UsedBookOrderStatus
    price: number
    listPrice: number
    cover: string
    title: string
    writer: string
    usedDegree: number
    isbn: string
}

// ----------------- 认证相关类型 -----------------

// 登录请求
export interface LoginRequest {
    telephone: string
    password: string
}

// 登录成功返回的数据
export interface LoginData {
    token: string
}

// 注册请求
export interface RegisterRequest {
    username?: string
    password: string
    name?: string
    avatar?: string
    telephone: string
}

// 图片上传返回的数据（oss 后的 url）
export type UploadImageData = string

// ----------------- 用户信息 / 个人中心 -----------------

export interface UserDetail {
  id?: number            // 有的接口可能没有
  leaf?: number          // 有的接口可能没有
  username: string
  avatar: string | null
  telephone: string
  password: string
}


// 简单书籍记录，用于「回收订单 / 购书订单 / 我的收藏」预览列表
export interface SimpleBookRecord {
    id: number | string
    cover: string
    title: string
    price: number
}

export interface SoldBookItem {
    adId: number;
    title: string;
    listPrice: number;
    price: number;
    cover: string;
    writer: string;
    ISBN: string;
    usedDegree: string;
  }

  export interface FavoriteItem {
    favoriteId: number;
    ubId: number;
    title: string;
    cover: string;
    price: number;
}

// AddressVO
export interface AddressItem {
    id: number
    userId: number
    name: string
    phone: string
    province: string
    city?: string
    district?: string
    detail?: string
  }

// 更新用户信息请求
export interface UpdateUserInfoRequest {
  username: string // 必需，用来标识是哪个用户
  password?: string
  name?: string
  avatar?: string
  role?: string
  telephone?: string
  email?: string
  location?: string
}

// 创建二手书请求（我要卖书）
export interface CreateUsedBookRequest {
  adId: number
  title: string
  ISBN: string
  price: number
  listPrice: number
  writer: string
  usedDegree: number
  cover: string
}
