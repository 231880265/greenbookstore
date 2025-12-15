// 通用响应接口
export interface ApiResponse<T = any> {
    code: number;
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