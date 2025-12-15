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

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type UsedBookOrderStatus = 'CHECKING' | 'SHIPPED' | 'COMPLETED';

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

<<<<<<< HEAD
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
    id: number;
    leaf: number;
    username: string;
    avatar: string | null;
    telephone: string;
  }

// 简单书籍记录，用于「回收订单 / 购书订单 / 我的收藏」预览列表
export interface SimpleBookRecord {
    id: number | string
    cover: string
    title: string
    price: number
}

export interface SoldBookItem {
    rcld: number;
    title: string;
    listPrice: number;
    price: number;
    cover: string;
    writer: string;
    ISBN: string;
    status: string;
    usedDegree: string;
  }
  export interface OrderItem {
    ubId: number;
    title: string;
    writer: string;
    publisher: string;
    cover: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }
  
  export interface OrderVO {
    orderId: number;
    totalAmount: number;
    paymentMethod: string;
    status: OrderStatus;
    createTime: string;
    paymentTime: string;
    tradeNo: string;
    addId: number;
    leaf: number;
    orderItems: OrderItemVO[];
  }
  export interface FavoriteItem {
    favoriteId: number;
    ubId: number;
    title: string;
    cover: string;
    price: number;
  }
=======
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
    ISBN: string
}

>>>>>>> 30b1b99fc45efc63d1ff9714889cb7385d2ef19c
