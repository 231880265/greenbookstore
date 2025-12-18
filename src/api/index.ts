import { request } from './request'
import type {
  ApiResponse,
  Product,
  LoginRequest,
  RegisterRequest,
  UploadImageData,
  UserDetail,
  SoldBookItem,
  OrderVO,
  OrderStatus,
  UsedBookOrderVO,
  UsedBookOrderStatus,
  FavoriteItem,
  AddressItem,
  UpdateUserInfoRequest,
  CreateUsedBookRequest,
  Cart,
  TopItem,
  SubmitOrderResponse,
  SubmitPaymentResponse
} from './types'

/* ----------------- 商品相关 api ----------------- */


/*--商品相关api--*/
// 获取商品详情
export const getProductDetail = (id: number) => {
  return request.get<ApiResponse<Product>>(`/used_books/${id}`)
}

// 获取商品相关推荐
export const getRecommendedProducts = (id: number) => {
  return request.get<ApiResponse<Product[]>>(`/used_books/recommend/${id}`)
}

// 获取商品列表
export const getProductList = (category?: string) => {
    const params = category ? { category: category } : {}
    return request.get<ApiResponse<Product[]>>('/used_books/category', params)
}


// 获取某分类下的前5本热门二手书
export const getTop5ByCategory = (category: string) => {
  return request.get<ApiResponse<Product[]>>('/used_books/category/top', {
    params: {category},
  })
}

// 搜索二手书
export const searchBooks = (keyword: string) => {
    console.log('API调用：搜索图书，关键词=', keyword);
  return request.get<ApiResponse<Product[]>>(`/usedbook/search/${keyword}`)
}

// 搜索建议
export const searchSuggest = (keyword: string) => {
  return request.get<ApiResponse<string[]>>(`/usedbook/search/suggest/${keyword}`)
}
// 获取分类Top6
export const getTopProductsByCategory = (category: string) => {
  return request.get<ApiResponse<Product[]>>('/used_books/category/top', {category})
}

/*-------------------购物相关api--------------------*/
//将商品加入购物车
export const addToCart = (ubId: number, quantity: number) => {
  return request.post<ApiResponse>('/cart', {
    "ubId": ubId,
    "quantity": quantity
  });
}

// 获取购物车列表
export const getCart = () => {
  return request.get<ApiResponse<Cart>>('/cart/');
}

// 修改购物车商品数量
export const updateCartItem = (cartItemId: string, quantity: number) => {
  return request.patch<ApiResponse>(`/cart/${cartItemId}`, {
    "quantity": quantity
  });
}

// 删除购物车项
export const removeCartItem = (cartItemId: string) => {
  return request.delete<ApiResponse>(`/cart/${cartItemId}`);
}


/* ----------------- 认证 / 用户相关 api ----------------- */

// 登录
// POST /api/accounts/login
// params: { telephone, password }
export const login = (payload: LoginRequest) => {
  return request.post<ApiResponse<boolean>>('/accounts/login', payload)
}

// 注册
// POST /api/accounts
// body: JSON { username?, password, name?, avatar?, telephone }
export const register = (data: RegisterRequest) => {
  return request.post<ApiResponse<boolean>>('/accounts', data)
}

// 图片上传（用于头像等）
// POST /api/img
// headers: token（已由 request 拦截器统一注入）
// form-data: file: MultiPartFile
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<ApiResponse<UploadImageData>>('/img', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}


export const getCurrentUser = () => {
  return request.get<ApiResponse<UserDetail>>("/accounts");
};

export type SoldBookStatus = "CHECKING" | "SHIPPED" | "COMPLETED";



export const getSoldBookList = (status?: SoldBookStatus) => {
  return request.get<ApiResponse<SoldBookItem[]>>(
    "/used_books/orders",
    {
      params: status ? { status } : undefined
    }
  );
};


/* =========================
 * 2. 获取本人订单列表（买家订单）
 * GET /api/orders/my
 * @param status 可选，不传获取所有
 * Headers: token（由 request 自动注入）
 * ========================= */



export const getMyOrders = (status?: OrderStatus) => {
    return request.get<ApiResponse<OrderVO[]>>('/orders/my', {status})
}

export const getUsedBookOrders = (status?: UsedBookOrderStatus) => {
    console.log('API调用：获取回收订单，状态=', status);
    return request.get<ApiResponse<UsedBookOrderVO[]>>('/used_books/orders', {status})
}







/* =========================
 * 3. 获取收藏列表
 * GET /api/favorites
 * Headers: token（由 request 自动注入）
 * ========================= */

/*--收藏相关api--*/
//获取收藏列表
export const getFavoriteList = () => {
  return request.get<ApiResponse<FavoriteItem[]>>(
    "/favorites"
  );
};

// 添加收藏
export const addFavorite = (ubId: number) =>{
    return request.post<ApiResponse<number>>('/favorites', null, {
      params: { ubId }   // ← 参数放在 URL 查询串
    });
}

// 取消收藏
export const removeFavorite = (favoriteId: number) => {
  return request.delete<ApiResponse<boolean>>(`/favorites/${favoriteId}`)
}


/*--------------------地址相关api--------------------*/
// 获取地址列表
export const getAddressList = () => {
  return request.get<ApiResponse<AddressItem[]>>('/address')
}

export const createAddress = (data: Omit<AddressItem, 'id' | 'userId'>) => {
  return request.post<ApiResponse<number>>('/address', data)
}

export const deleteAddress = (id: number) => {
  return request.delete(`/address/${id}`)
}

export const updateAddress = (
  id: number,
  data: Omit<AddressItem, 'id' | 'userId'>
) => {
  return request.put(`/address/${id}`, data)
}

// 更新用户信息
// PUT /api/accounts
// body: JSON { username (必需), password?, name?, avatar?, role?, telephone?, email?, location? }
export const updateUserInfo = (data: UpdateUserInfoRequest) => {
  return request.put<ApiResponse<string>>('/accounts', data)
}

// 创建二手书（我要卖书）
// POST /api/used_books/create
export const createUsedBook = (data: CreateUsedBookRequest) => {
  return request.post<ApiResponse<number>>('/used_books/create', data)
}
// 获取购书订单前 5
// GET /api/orders/top5
export const getTop5Orders = () => {
  return request.get<ApiResponse<TopItem[]>>('/orders/top5')
}
// 获取回收订单前 5
// GET /api/used_books/orders/top5
export const getTop5UsedBookOrders = () => {
  console.log('获取回收订单前5调用接口中接口文档ing······')
  return request.get<ApiResponse<TopItem[]>>('/used_books/orders/top5')
}
// 获取收藏前 5
// GET /api/favorites/top5
export const getTop5Favorites = () => {
  return request.get<ApiResponse<TopItem[]>>('/favorites/top5')
}


/*-------------------- 订单相关api --------------------*/
// 提交订单(购物车发起)
export const submitOrderFromCart = (useLeaf:number, cartItemIds:number[], addressId: number, paymentMethod: string) => {
  return request.post<ApiResponse<SubmitOrderResponse>>('/cart/checkout', {
    "leaf": useLeaf,
    "cart_item_ids": cartItemIds,
    "ad_id": addressId,
    "payment_method": paymentMethod
  });
}

// 提交订单(商品详情页发起)
export const submitOrderFromProduct = (useLeaf:number, ubId:number, quantity:number, addressId: number, paymentMethod: string) => {
  return request.post<ApiResponse<SubmitOrderResponse>>('/immediate/checkout', {
    "leaf": useLeaf,
    "ubId": ubId,
    "count": quantity,
    "ad_id": addressId,
    "payment_method": paymentMethod
  });
}

//发起支付
export const initiatePayment = (orderId: number) => {
  return request.post<ApiResponse<SubmitPaymentResponse>>(`/orders/${orderId}/pay`);
}