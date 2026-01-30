<!-- 菜谱中心遮罩层 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useNavigationStore } from '@/stores/navigation'
import { useRecipeStore } from '@/stores/recipe'
import { useIngredientStore } from '@/stores/ingredient'
import FilterBar from './FilterBar.vue'
import RecipeCard from './RecipeCard.vue'
import RecipeSkeleton from './RecipeSkeleton.vue'
import type { Recipe } from '@/types/recipe'

const navigationStore = useNavigationStore()
const recipeStore = useRecipeStore()
const ingredientStore = useIngredientStore()

const activeTab = ref<'generate' | 'favorites' | 'history' | 'current'>('generate')

// 收藏列表相关
const favoriteCuisineFilter = ref<number | undefined>()

// 生成菜谱
async function handleGenerate() {
  try {
    await recipeStore.generateRecipes()
  } catch (error) {
    console.error('生成菜谱失败:', error)
    alert('生成菜谱失败，请稍后重试')
  }
}

// 查看菜谱详情
function handleViewDetail(recipe: Recipe) {
  console.log('查看详情:', recipe)
  alert(`查看详情功能开发中\n菜谱：${recipe.name}`)
}

// 添加到餐桌
function handleAddToTable(recipe: Recipe) {
  console.log('添加到餐桌:', recipe)
  alert(`添加到餐桌功能开发中\n菜谱：${recipe.name}`)
}

// 收藏菜谱
async function handleFavorite(recipe: Recipe) {
  try {
    await recipeStore.toggleFavorite(recipe)
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    if (error.response?.status === 401) {
      alert('请先登录')
    } else {
      alert(error.response?.data?.message || '操作失败，请稍后重试')
    }
  }
}

// 加载收藏列表
async function loadFavorites() {
  try {
    await recipeStore.fetchFavorites({
      cuisine: favoriteCuisineFilter.value,
      page: 1,
      size: 20
    })
  } catch (error: any) {
    console.error('加载收藏列表失败:', error)
    if (error.response?.status === 401) {
      alert('请先登录')
    }
  }
}

// 加载历史记录
async function loadHistory() {
  try {
    await recipeStore.fetchHistory({
      page: 1,
      size: 20
    })
  } catch (error: any) {
    console.error('加载历史记录失败:', error)
    if (error.response?.status === 401) {
      alert('请先登录')
    }
  }
}

// 重新生成
async function handleRegenerate(historyId: number) {
  try {
    await recipeStore.regenerateFromHistory(historyId)
    activeTab.value = 'generate' // 切换到生成Tab查看结果
  } catch (error) {
    console.error('重新生成失败:', error)
    alert('重新生成失败，请稍后重试')
  }
}

// 监听Tab切换
watch(activeTab, (newTab) => {
  if (newTab === 'favorites') {
    loadFavorites()
  } else if (newTab === 'history') {
    loadHistory()
  }
})

// 组件挂载时获取食材列表
onMounted(async () => {
  if (ingredientStore.ingredients.length === 0) {
    try {
      await ingredientStore.fetchIngredients()
    } catch (error) {
      console.error('获取食材列表失败:', error)
    }
  }
})

// 组件卸载时停止所有轮询
onUnmounted(() => {
  recipeStore.stopAllPolling()
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/70 transition-opacity" @click="navigationStore.closeModal()"></div>

    <!-- 遮罩层内容 -->
    <div
      class="relative bg-white dark:bg-gray-800 w-full md:w-4/5 lg:w-3/5 max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-fade-in overflow-hidden">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">📖 菜谱中心</h2>
        <button @click="navigationStore.closeModal()"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tab导航 -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 px-6">
        <button @click="activeTab = 'generate'" :class="[
          'px-4 py-3 font-medium transition-colors',
          activeTab === 'generate'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        ]">
          生成菜谱
        </button>
        <button @click="activeTab = 'favorites'" :class="[
          'px-4 py-3 font-medium transition-colors',
          activeTab === 'favorites'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        ]">
          我的收藏
        </button>
        <button @click="activeTab = 'history'" :class="[
          'px-4 py-3 font-medium transition-colors',
          activeTab === 'history'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        ]">
          历史记录
        </button>
        <button @click="activeTab = 'current'" :class="[
          'px-4 py-3 font-medium transition-colors',
          activeTab === 'current'
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        ]">
          当前菜品
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
        <!-- 生成菜谱Tab -->
        <div v-if="activeTab === 'generate'" class="space-y-6">
          <!-- 筛选条件 -->
          <FilterBar v-model="recipeStore.filters" />

          <!-- 生成按钮 -->
          <button @click="handleGenerate" :disabled="recipeStore.loading || ingredientStore.filteredIngredients.length === 0"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg v-if="!recipeStore.loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ recipeStore.loading ? '生成中...' : '🎲 生成菜谱' }}
          </button>

          <!-- 菜谱列表 -->
          <div v-if="recipeStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecipeSkeleton v-for="i in 3" :key="i" />
          </div>

          <div v-else-if="recipeStore.generatedRecipes.length > 0" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              生成结果 ({{ recipeStore.generatedRecipes.length }}道菜谱)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecipeCard v-for="recipe in recipeStore.generatedRecipes" :key="recipe.id" :recipe="recipe"
                @view-detail="handleViewDetail(recipe)" @add-to-table="handleAddToTable(recipe)"
                @favorite="handleFavorite(recipe)" />
            </div>
          </div>

          <div v-else class="text-center text-gray-500 dark:text-gray-400 py-12">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-lg">还没有生成菜谱</p>
            <p class="text-sm mt-2">点击上方按钮开始生成</p>
          </div>
        </div>

        <!-- 收藏列表Tab -->
        <div v-else-if="activeTab === 'favorites'" class="space-y-4">
          <!-- 筛选按钮 -->
          <div class="flex gap-2 flex-wrap">
            <button
              @click="favoriteCuisineFilter = undefined; loadFavorites()"
              :class="[
                'px-4 py-2 rounded-lg transition-colors',
                !favoriteCuisineFilter
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              全部
            </button>
            <button
              v-for="cuisine in [1, 2, 3, 4]"
              :key="cuisine"
              @click="favoriteCuisineFilter = cuisine; loadFavorites()"
              :class="[
                'px-4 py-2 rounded-lg transition-colors',
                favoriteCuisineFilter === cuisine
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ ['中餐', '西餐', '日韩', '东南亚'][cuisine - 1] }}
            </button>
          </div>

          <!-- 收藏列表 -->
          <div v-if="recipeStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecipeSkeleton v-for="i in 4" :key="i" />
          </div>

          <div v-else-if="recipeStore.favoriteRecipes.length > 0" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              收藏的菜谱 ({{ recipeStore.favoritesTotal }}道)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecipeCard
                v-for="recipe in recipeStore.favoriteRecipes"
                :key="recipe.id"
                :recipe="recipe"
                @view-detail="handleViewDetail(recipe)"
                @add-to-table="handleAddToTable(recipe)"
                @favorite="handleFavorite(recipe)"
              />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center text-gray-500 dark:text-gray-400 py-12">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p class="text-lg">还没有收藏的菜谱</p>
            <p class="text-sm mt-2">快去生成一些喜欢的菜谱吧</p>
          </div>
        </div>

        <!-- 历史记录Tab -->
        <div v-else-if="activeTab === 'history'" class="space-y-4">
          <div v-if="recipeStore.loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>

          <div v-else-if="recipeStore.historyRecords.length > 0" class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              生成历史 ({{ recipeStore.historyTotal }}条)
            </h3>
            <div
              v-for="record in recipeStore.historyRecords"
              :key="record.id"
              class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ new Date(record.generatedAt).toLocaleString('zh-CN') }}
                  </p>
                  <p class="text-gray-800 dark:text-gray-200 mt-1">
                    <span class="font-medium">食材：</span>{{ record.ingredients.join('、') }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    生成了 {{ record.recipesCount }} 道菜谱
                  </p>
                </div>
                <button
                  @click="handleRegenerate(record.id)"
                  class="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  重新生成
                </button>
              </div>

              <!-- 菜谱列表 -->
              <div v-if="record.recipes.length > 0" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="recipe in record.recipes"
                  :key="recipe.id"
                  class="px-2 py-1 bg-white dark:bg-gray-600 text-sm rounded text-gray-700 dark:text-gray-200"
                >
                  {{ recipe.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center text-gray-500 dark:text-gray-400 py-12">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-lg">还没有生成历史</p>
            <p class="text-sm mt-2">生成菜谱后会自动记录</p>
          </div>
        </div>

        <!-- 当前菜品Tab（开发中） -->
        <div v-else-if="activeTab === 'current'" class="text-center text-gray-600 dark:text-gray-400 py-12">
          <p class="text-lg">当前菜品功能开发中...</p>
          <p class="text-sm mt-2">敬请期待</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
