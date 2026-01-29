<script setup lang="ts">
import { onMounted } from 'vue'

import CartModal from '@/components/CartModal.vue'
import FridgeModal from '@/components/FridgeModal.vue'
import RecipeModal from '@/components/RecipeModal.vue'
import TableModal from '@/components/TableModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useNavigationStore } from '@/stores/navigation'
import { useThemeStore } from '@/stores/theme'

const navigationStore = useNavigationStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// 图片预加载
onMounted(() => {
  const images = [
    '/厨房-日.jpg',
    '/厨房-夜.jpg',
    '/冰箱.png',
    '/餐桌.png',
    '/菜单.png',
    '/购物车.png'
  ]

  images.forEach(src => {
    const img = new Image()
    img.src = src
  })
})
</script>

<template>
  <div class="home-container">
    <!-- 顶部栏 -->
    <header class="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-end items-center gap-4">
      <!-- 退出登录按钮 -->
      <button @click="authStore.logout()"
        class="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title="退出登录">
        <svg class="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-red-500 transition-colors" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

      <!-- 深色模式切换按钮 -->
      <button @click="themeStore.toggleTheme()"
        class="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        :title="themeStore.isDark ? '切换到浅色模式' : '切换到深色模式'">
        <!-- 太阳图标（浅色模式） -->
        <svg v-if="!themeStore.isDark" class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clip-rule="evenodd" />
        </svg>
        <!-- 月亮图标（深色模式） -->
        <svg v-else class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </button>
    </header>

    <!-- 主场景：厨房背景 -->
    <main class="kitchen-scene min-h-screen relative overflow-hidden transition-all duration-500"
      :class="themeStore.isDark ? 'dark-kitchen' : 'light-kitchen'">

      <!-- 桌面端：绝对定位的导航元素 -->
      <div class="navigation-elements hidden md:block">
        <!-- 冰箱 -->
        <img src="/冰箱.png" alt="冰箱" @click="navigationStore.openModal('fridge')" class="nav-image fridge-position"
          title="冰箱 - 管理食材" />

        <!-- 餐桌 -->
        <img src="/餐桌.png" alt="餐桌" @click="navigationStore.openModal('table')" class="nav-image table-position"
          title="餐桌 - 今天做什么" />

        <!-- 菜谱 -->
        <img src="/菜单.png" alt="菜谱" @click="navigationStore.openModal('recipe')" class="nav-image recipe-position"
          title="菜谱 - 生成与收藏" />

        <!-- 购物车 -->
        <img src="/购物车.png" alt="购物车" @click="navigationStore.openModal('cart')" class="nav-image cart-position"
          title="购物车 - 购物清单" />
      </div>

      <!-- 移动端：网格布局的导航元素 -->
      <div class="navigation-elements-mobile md:hidden flex items-center justify-center min-h-screen p-6">
        <div class="grid grid-cols-2 gap-6 w-full max-w-md">
          <div @click="navigationStore.openModal('fridge')" class="nav-item-mobile">
            <img src="/冰箱.png" alt="冰箱" class="w-full h-auto" />
            <p class="text-center mt-2 text-gray-800 dark:text-gray-100 font-semibold">冰箱</p>
          </div>

          <div @click="navigationStore.openModal('table')" class="nav-item-mobile">
            <img src="/餐桌.png" alt="餐桌" class="w-full h-auto" />
            <p class="text-center mt-2 text-gray-800 dark:text-gray-100 font-semibold">餐桌</p>
          </div>

          <div @click="navigationStore.openModal('recipe')" class="nav-item-mobile">
            <img src="/菜单.png" alt="菜谱" class="w-full h-auto" />
            <p class="text-center mt-2 text-gray-800 dark:text-gray-100 font-semibold">菜谱</p>
          </div>

          <div @click="navigationStore.openModal('cart')" class="nav-item-mobile">
            <img src="/购物车.png" alt="购物车" class="w-full h-auto" />
            <p class="text-center mt-2 text-gray-800 dark:text-gray-100 font-semibold">购物车</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 遮罩层 -->
    <Teleport to="body">
      <Transition name="modal">
        <FridgeModal v-if="navigationStore.currentModal === 'fridge'" />
      </Transition>

      <Transition name="modal">
        <TableModal v-if="navigationStore.currentModal === 'table'" />
      </Transition>

      <Transition name="modal">
        <RecipeModal v-if="navigationStore.currentModal === 'recipe'" />
      </Transition>

      <Transition name="modal">
        <CartModal v-if="navigationStore.currentModal === 'cart'" />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
}

/* 厨房场景背景 */
.kitchen-scene {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 浅色模式背景 */
.light-kitchen {
  background-image: url('/厨房-日.jpg');
}

/* 深色模式背景 */
.dark-kitchen {
  background-image: url('/厨房-夜.jpg');
}

/* 导航元素容器 */
.navigation-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 导航图片通用样式 */
.nav-image {
  position: absolute;
  width: 150px;
  height: auto;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.nav-image:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

.nav-image:active {
  transform: scale(1.05);
}

/* 冰箱位置 */
.fridge-position {
  left: 10%;
  top: 30%;
}

/* 餐桌位置 */
.table-position {
  left: 40%;
  top: 50%;
}

/* 菜谱位置 */
.recipe-position {
  right: 15%;
  top: 20%;
}

/* 购物车位置 */
.cart-position {
  right: 10%;
  bottom: 15%;
}

/* 移动端导航项 */
.nav-item-mobile {
  cursor: pointer;
  transition: transform 0.2s ease;
  background: white/90;
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-item-mobile:active {
  transform: scale(0.95);
}

/* 遮罩层过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (min-width: 768px) and (max-width: 1023px) {
  .nav-image {
    width: 120px;
  }
}

@media (min-width: 1024px) {
  .nav-image {
    width: 150px;
  }
}
</style>
