// Axios 实例配置和拦截器

import type { ApiError } from '@/types/api'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import axios, { AxiosError } from 'axios'

import router from '@/router'
import { storage } from '@/utils/storage'

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => {
    // 直接返回 data 部分
    return response.data
  },
  (error: AxiosError<ApiError>) => {
    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Token 失效，清除认证信息并跳转登录
          storage.clearAuth()
          router.push('/login')
          break
        case 403:
          console.error('无权限访问')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error(data?.errorMsg || '请求失败')
      }

      return Promise.reject(data || error)
    }

    // 网络错误
    if (error.message.includes('timeout')) {
      console.error('请求超时，请检查网络连接')
    } else if (error.message.includes('Network Error')) {
      console.error('网络连接失败，请检查网络')
    }

    return Promise.reject(error)
  }
)

export default api
