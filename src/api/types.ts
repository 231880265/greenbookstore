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
