import { request } from './request';
import type { ApiResponse, Product, Cart } from './types';
import type { OrderVO, OrderStatus } from './types';


/*--商品相关api--*/
// 获取商品详情
export const getProductDetail = (id: number) => {
    return request.get<ApiResponse<Product>>(`/used_books/${id}`);
};

// 获取商品相关推荐
export const getRecommendedProducts = (id: number) => {
    return request.get<ApiResponse<Product[]>>(`/used_books/recommend/${id}`);
}

/*--购物相关api--*/
//将商品加入购物车
export const addToCart = (productId: string, quantity: number) => {
    return request.post<ApiResponse>('/cart', {
        "productId": productId,
        "quantity": quantity
    });
}

// 获取购物车列表
export const getCart = () => {
    return request.get<ApiResponse<Cart>>('/cart');
}

export const getMyOrders = (status?: OrderStatus) => {
    return request.get<OrderVO[]>('/orders/my', {
        params: { status }
    })
}
