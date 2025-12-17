import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const TOKEN_KEY = 'GB_TOKEN'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // API 基础路径
    timeout: 15000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前添加 token（后端要求使用 token 头）
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            (config.headers as any).token = token;
        }
        return config;
    },
    (error) => {
        console.error('请求错误：', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data;
        const code = Number(res.code);
        // 后端返回格式为 { code: number, data: any, msg: string }
        if (code !== 200 && code !== 0) {
            console.error('接口错误：', res.msg || '请求失败');
            return Promise.reject(new Error(res.msg || '请求失败'));
        }

        return res;
    },
    (error) => {
        console.error('响应错误：', error);

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 未授权，跳转到登录页
                    console.error('未授权，请重新登录');
                    // 可以在这里清除 token 并跳转到登录页
                    localStorage.removeItem(TOKEN_KEY);
                    // TODO: 添加跳转到登录页的逻辑
                    break;
                case 403:
                    console.error('拒绝访问');
                    break;
                case 404:
                    console.error('请求的资源不存在');
                    break;
                case 500:
                    console.error('服务器内部错误');
                    break;
                default:
                    console.error(`连接错误：${error.response.status}`);
            }
        } else {
            console.error('网络错误，请检查网络连接');
        }

        return Promise.reject(error);
    }
);

// 封装请求方法
export const request = {
    get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, { params, ...config });
    },

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config);
    },

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config);
    },

    delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, { params, ...config });
    }
};

export default service;
