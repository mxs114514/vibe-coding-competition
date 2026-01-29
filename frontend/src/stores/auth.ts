// Pinia 认证状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest } from '@/types/auth'
import { login as loginApi, getCurrentUser } from '@/api/auth'
import { storage } from '@/utils/storage'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(storage.getToken())
  const user = ref<UserInfo | null>(storage.getUser())
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 登录
   */
  async function login(loginData: LoginRequest): Promise<void> {
    isLoading.value = true
    try {
      const response = await loginApi(loginData)

      // 根据新的接口结构判断成功
      if (response.success) {
        // FIXME: 后端目前只返回了字符串 "登录成功"，没有返回 Token 和 User 对象
        // 临时模拟一个 token，或者等待后端完善
        // 假设 data 为 '登录成功'，这里我们需要做一个假的 token 才能让 isLoggedIn 为 true
        const fakeToken = 'temp-token-' + Date.now()

        token.value = fakeToken
        // user.value = { ... } // 这里还没有用户信息

        storage.setToken(fakeToken)
        // storage.setUser(...)

        // 跳转到首页
        router.push('/')
      } else {
        throw new Error(response.errorMsg || '登录失败')
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  function logout(): void {
    token.value = null
    user.value = null
    storage.clearAuth()
    router.push('/login')
  }

  /**
   * 刷新用户信息
   */
  async function refreshUser(): Promise<void> {
    if (!token.value) return

    try {
      const response = await getCurrentUser()
      if (response.code === 200 && response.data) {
        user.value = response.data
        storage.setUser(response.data)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  /**
   * 初始化认证状态 (从 localStorage 恢复)
   */
  function initAuth(): void {
    token.value = storage.getToken()
    user.value = storage.getUser()
  }

  return {
    // 状态
    token,
    user,
    isLoading,
    // 计算属性
    isLoggedIn,
    // 方法
    login,
    logout,
    refreshUser,
    initAuth,
  }
})
