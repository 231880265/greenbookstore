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
  FavoriteItem,
  AddressItem,
  UpdateUserInfoRequest,
  CreateUsedBookRequest,
  Cart
} from './types'



/*-------------------商品相关api--------------------*/
// 获取商品详情
export const getProductDetail = (id: number) => {
  return request.get<ApiResponse<Product>>(`/used_books/${id}`)
}

// 获取商品相关推荐
export const getRecommendedProducts = (id: number) => {
  return request.get<ApiResponse<Product[]>>(`/used_books/recommend/${id}`)
}

// 获取分类Top6
export const getTopProductsByCategory = (category: string) => {
  return request.get<ApiResponse<Product[]>>('/used_books/category/top', {
    params: { category }
  })
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

export type OrderStatus =
  | "CREATED"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";





export const getMyOrders = (status?: OrderStatus) => {
  return request.get<ApiResponse<OrderVO[]>>(
    "/orders/my",
    {
      params: status ? { status } : undefined
    }
  );
};



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

/* ------------------- 收藏相关 api ----------------- */
/* =========================
 * 获取收藏列表
 * GET /api/favorites
 * Headers: token（由 request 自动注入）
 * ========================= */



export const getFavoriteList = () => {
  return request.get<ApiResponse<FavoriteItem[]>>(
    "/favorites"
  );
};

// 添加收藏
export const addFavorite = (ubId: number) => {
  return request.post<ApiResponse>('/favorites', {}, {
    params: { ubId }
  });
}