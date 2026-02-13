import axios from 'axios'
import { getToken, clearAuth } from '@/utils/auth.js'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : ''),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截：从 localStorage 或 sessionStorage 读取 token（记住我 / 未记住）
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：401 时清除登录态（localStorage + sessionStorage）
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
    }
    return Promise.reject(error)
  }
)

export default request
