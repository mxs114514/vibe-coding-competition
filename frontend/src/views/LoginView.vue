<script setup lang="ts">
import { ref, computed } from 'vue'

import { getCaptcha } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import {
  validatePhone,
  validateCode,
  getPhoneErrorMessage,
  getCodeErrorMessage
} from '@/utils/validation'

// Store
const authStore = useAuthStore()

// 表单数据
const phone = ref('')
const code = ref('')

// 错误信息
const phoneError = ref('')
const codeError = ref('')
const loginError = ref('')

// 验证码倒计时
const countdown = ref(0)
const isSendingCode = ref(false)

// 计算属性
const isPhoneValid = computed(() => validatePhone(phone.value))
const canGetCode = computed(
  () => isPhoneValid.value && countdown.value === 0 && !isSendingCode.value
)
const canLogin = computed(
  () => isPhoneValid.value && validateCode(code.value) && !authStore.isLoading
)
const codeButtonText = computed(() => {
  if (countdown.value > 0) return `${countdown.value}秒后重试`
  return '获取验证码'
})

/**
 * 获取验证码
 */
async function handleGetCode() {
  // 清除之前的错误
  phoneError.value = ''
  loginError.value = ''

  // 验证手机号
  if (!isPhoneValid.value) {
    phoneError.value = getPhoneErrorMessage(phone.value)
    return
  }

  isSendingCode.value = true

  try {
    const response = await getCaptcha({ phone: phone.value })

    if (response.success) {
      // 弹出可爱风格的验证码弹窗
      const { verifyCode } = response.data

      // 创建一个自定义弹窗 DOM 并挂载
      const dialog = document.createElement('div')
      dialog.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm'
      dialog.innerHTML = `
        <div class="bg-white rounded-[24px] p-6 shadow-xl transform transition-all animate-bounce-in" style="min-width: 300px; border: 4px solid #FFD086;">
          <div class="text-center">
            <div class="text-4xl mb-2">📩</div>
            <h3 class="text-xl font-bold text-[#8B5E3C] mb-2">验证码来啦!</h3>
            <div class="text-3xl font-mono font-bold text-[#FF9F1C] tracking-widest my-4 py-2 bg-[#FFF8E7] rounded-lg border-dashed border-2 border-[#FFD086]">
              ${verifyCode}
            </div>
            <p class="text-sm text-[#999] mb-6">请记住这个数字哦~</p>
            <button id="close-dialog-btn" class="w-full py-3 rounded-xl bg-[#FFD086] hover:bg-[#FFC058] text-[#8B5E3C] font-bold transition-transform active:scale-95 shadow-md">
              我知道啦 (关闭)
            </button>
          </div>
        </div>
      `
      document.body.appendChild(dialog)

      // 绑定关闭事件
      const btn = dialog.querySelector('#close-dialog-btn')
      btn?.addEventListener('click', () => {
        document.body.removeChild(dialog)
      })

      // 开发环境自动填充验证码
      if (import.meta.env.DEV) {
        code.value = String(verifyCode)
      }

      // 启动倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      loginError.value = response.errorMsg || '获取验证码失败'
    }
  } catch (error: any) {
    loginError.value = error.message || '获取验证码失败，请稍后重试'
  } finally {
    isSendingCode.value = false
  }
}

/**
 * 登录
 */
async function handleLogin() {
  // 清除之前的错误
  phoneError.value = ''
  codeError.value = ''
  loginError.value = ''

  // 验证手机号
  if (!isPhoneValid.value) {
    phoneError.value = getPhoneErrorMessage(phone.value)
    return
  }

  // 验证验证码
  if (!validateCode(code.value)) {
    codeError.value = getCodeErrorMessage(code.value)
    return
  }

  try {
    await authStore.login({
      phone: phone.value,
      code: code.value
    })
  } catch (error: any) {
    loginError.value = error.message || '登录失败，请检查验证码是否正确'
  }
}

/**
 * 输入框聚焦时清除错误
 */
function clearPhoneError() {
  phoneError.value = ''
  loginError.value = ''
}

function clearCodeError() {
  codeError.value = ''
  loginError.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center" style="background-color: #fff8e7">
    <!-- 登录框 -->
    <div class="bg-white rounded-[20px] shadow-lg p-12" style="width: 400px; border: 2px solid #d4a574">
      <!-- 标题 -->
      <h1 class="text-4xl font-bold text-center mb-12" style="color: #d4a574">登录</h1>

      <!-- 表单 -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- 手机号输入 -->
        <div>
          <label class="block text-sm mb-2" style="color: #666666">手机号</label>
          <input v-model="phone" type="tel" maxlength="11" placeholder="请输入手机号"
            class="w-full h-[45px] px-4 rounded-lg border focus:outline-none focus:ring-2 transition-all" :class="phoneError
              ? 'border-red-500 focus:ring-red-200'
              : 'focus:ring-[#D4A574]/30'
              " style="border-color: #d4a574" @focus="clearPhoneError" />
          <p v-if="phoneError" class="text-red-500 text-xs mt-1">
            {{ phoneError }}
          </p>
        </div>

        <!-- 验证码输入 -->
        <div>
          <label class="block text-sm mb-2" style="color: #666666">验证码</label>
          <div class="flex gap-3">
            <input v-model="code" type="text" maxlength="6" placeholder="请输入验证码"
              class="flex-1 h-[45px] px-4 rounded-lg border focus:outline-none focus:ring-2 transition-all" :class="codeError
                ? 'border-red-500 focus:ring-red-200'
                : 'focus:ring-[#D4A574]/30'
                " style="border-color: #d4a574; width: 180px" @focus="clearCodeError" />
            <button type="button" :disabled="!canGetCode" @click="handleGetCode"
              class="h-[45px] px-4 rounded-lg text-white text-sm font-medium transition-all" :class="canGetCode
                ? 'hover:opacity-90 active:scale-95'
                : 'opacity-50 cursor-not-allowed'
                " style="background-color: #d4a574; width: 105px">
              {{ codeButtonText }}
            </button>
          </div>
          <p v-if="codeError" class="text-red-500 text-xs mt-1">
            {{ codeError }}
          </p>
        </div>

        <!-- 通用错误提示 -->
        <p v-if="loginError" class="text-red-500 text-sm text-center">
          {{ loginError }}
        </p>

        <!-- 登录按钮 -->
        <button type="submit" :disabled="!canLogin"
          class="w-full h-[45px] rounded-lg text-white text-base font-medium transition-all" :class="canLogin
            ? 'hover:opacity-90 active:scale-[0.98]'
            : 'opacity-50 cursor-not-allowed'
            " style="background-color: #d4a574">
          <span v-if="!authStore.isLoading">登录</span>
          <span v-else>登录中...</span>
        </button>
      </form>

      <!-- 页脚文字 -->
      <p class="text-center text-xs mt-8" style="color: #999999">
        用心烹饪，温暖相伴
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 移除 input 的 number spinner */
input[type='tel']::-webkit-outer-spin-button,
input[type='tel']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='tel'] {
  -moz-appearance: textfield;
}
</style>
