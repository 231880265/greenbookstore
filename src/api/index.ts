import { request } from './request';
import type { ApiResponse, Product, UsedBookOrderStatus, UsedBookOrderVO } from './types';
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

export const getMyOrders = (status?: OrderStatus) => {
    return request.get<ApiResponse<OrderVO[]>>('/orders/my', {
        params: { status }
    })
}

export const getUsedBookOrders = (status?: UsedBookOrderStatus) => {
    return request.get<ApiResponse<UsedBookOrderVO[]>>('/used_books/orders', {
        params: { status }
    })
}


