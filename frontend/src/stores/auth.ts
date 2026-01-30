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
        const { token: accessToken, user: userInfo } = response.data

        // 更新状态
        token.value = accessToken
        user.value = userInfo

        // 持久化存储
        storage.setToken(accessToken)
        storage.setUser(userInfo)

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
