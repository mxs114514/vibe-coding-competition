import type {
  Recipe,
  RecipeFilters,
  HistoryRecord,
  FavoriteListParams,
  HistoryListParams
} from '@/types/recipe'

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import * as recipeApi from '@/api/recipe'

import { useIngredientStore } from './ingredient'

export const useRecipeStore = defineStore('recipe', () => {
  // 状态
  const generatedRecipes = ref<Recipe[]>([])
  const favoriteRecipes = ref<Recipe[]>([])
  const historyRecords = ref<HistoryRecord[]>([])
  const currentRecipeDetail = ref<Recipe | null>(null)
  const loading = ref(false)
  const filters = ref<RecipeFilters>({})
  const selectedIngredients = ref<string[]>([])

  // 收藏相关状态
  const favoriteIds = ref<Set<number>>(new Set())
  const favoritesTotal = ref(0)
  const historyTotal = ref(0)

  // 图片轮询相关
  const pollingIntervals = new Map<string, number>()

  // 方法
  async function generateRecipes() {
    try {
      loading.value = true

      // 获取食材列表
      const ingredientStore = useIngredientStore()
      const ingredients =
        selectedIngredients.value.length > 0
          ? selectedIngredients.value
          : ingredientStore.filteredIngredients.map((item) => item.name)

      const response = await recipeApi.generateRecipes({
        ingredients,
        filters: filters.value,
      })

      if (response.success) {
        generatedRecipes.value = response.data.recipes

        // 为每个菜谱启动图片轮询
        response.data.recipes.forEach((recipe) => {
          if (!recipe.imageUrl) {
            startImagePolling(recipe.id)
          }
        })
      }
    } catch (error) {
      console.error('生成菜谱失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 启动图片轮询
  function startImagePolling(recipeId: string) {
    // 如果已经在轮询，先清除
    if (pollingIntervals.has(recipeId)) {
      clearInterval(pollingIntervals.get(recipeId))
    }

    // 每3秒查询一次
    const intervalId = window.setInterval(async () => {
      try {
        const response = await recipeApi.getImageStatus(recipeId)

        if (response.success && response.data) {
          const { status, imageUrl } = response.data

          if (status === 'completed' && imageUrl) {
            // 更新菜谱的图片URL
            updateRecipeImage(recipeId, imageUrl)
            // 停止轮询
            stopImagePolling(recipeId)
          } else if (status === 'failed') {
            // 生成失败，停止轮询
            console.error(`图片生成失败: ${recipeId}`)
            stopImagePolling(recipeId)
          }
        }
      } catch (error) {
        console.error(`查询图片状态失败: ${recipeId}`, error)
      }
    }, 3000)

    pollingIntervals.set(recipeId, intervalId)

    // 60秒后自动停止轮询（超时保护）
    setTimeout(() => {
      stopImagePolling(recipeId)
    }, 60000)
  }

  // 停止图片轮询
  function stopImagePolling(recipeId: string) {
    const intervalId = pollingIntervals.get(recipeId)
    if (intervalId) {
      clearInterval(intervalId)
      pollingIntervals.delete(recipeId)
    }
  }

  // 更新菜谱图片
  function updateRecipeImage(recipeId: string, imageUrl: string) {
    const recipe = generatedRecipes.value.find((r) => String(r.id) === String(recipeId))
    if (recipe) {
      recipe.imageUrl = imageUrl
    }
  }

  // 停止所有轮询
  function stopAllPolling() {
    pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId)
    })
    pollingIntervals.clear()
  }

  function setFilters(newFilters: RecipeFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {}
  }

  function setSelectedIngredients(ingredients: string[]) {
    selectedIngredients.value = ingredients
  }

  function clearRecipes() {
    stopAllPolling()
    generatedRecipes.value = []
  }

  // 获取菜谱详情
  async function fetchRecipeDetail(id: number) {
    try {
      loading.value = true
      const response = await recipeApi.getRecipeById(id)
      if (response.success && response.data) {
        currentRecipeDetail.value = response.data
        return response.data
      }
    } catch (error) {
      console.error('获取菜谱详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 切换收藏状态
  async function toggleFavorite(recipe: Recipe) {
    try {
      const recipeId = Number(recipe.id)
      if (isNaN(recipeId)) {
        console.error('无效的菜谱ID:', recipe.id)
        return
      }

      const isFavorited = favoriteIds.value.has(recipeId)

      if (isFavorited) {
        await recipeApi.removeFavorite(recipeId)
        favoriteIds.value.delete(recipeId)
        // 从收藏列表中移除
        const index = favoriteRecipes.value.findIndex((r) => Number(r.id) === recipeId)
        if (index > -1) {
          favoriteRecipes.value.splice(index, 1)
        }
      } else {
        await recipeApi.addFavorite(recipeId)
        favoriteIds.value.add(recipeId)
      }
    } catch (error: any) {
      console.error('切换收藏状态失败:', error)
      throw error
    }
  }

  // 获取收藏列表
  async function fetchFavorites(params?: FavoriteListParams) {
    try {
      loading.value = true
      const response = await recipeApi.getFavorites(params)
      if (response.success && response.data) {
        favoriteRecipes.value = response.data.list
        favoritesTotal.value = response.data.total

        // 更新收藏ID集合
        response.data.list.forEach((recipe: Recipe) => {
          const recipeId = Number(recipe.id)
          if (!isNaN(recipeId)) {
            favoriteIds.value.add(recipeId)
          }
        })

        return response.data
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取历史记录
  async function fetchHistory(params?: HistoryListParams) {
    try {
      loading.value = true
      const response = await recipeApi.getHistory(params)
      if (response.success && response.data) {
        historyRecords.value = response.data.list
        historyTotal.value = response.data.total
        return response.data
      }
    } catch (error) {
      console.error('获取历史记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 根据历史记录重新生成
  async function regenerateFromHistory(historyId: number, filters?: RecipeFilters) {
    try {
      loading.value = true
      const response = await recipeApi.regenerateFromHistory(historyId, filters)
      if (response.success && response.data) {
        generatedRecipes.value = response.data.recipes

        // 为每个菜谱启动图片轮询
        response.data.recipes.forEach((recipe: Recipe) => {
          if (!recipe.imageUrl) {
            startImagePolling(String(recipe.id))
          }
        })

        return response.data.recipes
      }
    } catch (error) {
      console.error('重新生成菜谱失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 检查是否已收藏
  function isFavorited(recipeId: number | string): boolean {
    const id = Number(recipeId)
    return !isNaN(id) && favoriteIds.value.has(id)
  }

  return {
    generatedRecipes,
    favoriteRecipes,
    historyRecords,
    currentRecipeDetail,
    loading,
    filters,
    selectedIngredients,
    favoriteIds,
    favoritesTotal,
    historyTotal,
    generateRecipes,
    fetchRecipeDetail,
    toggleFavorite,
    fetchFavorites,
    fetchHistory,
    regenerateFromHistory,
    isFavorited,
    setFilters,
    clearFilters,
    setSelectedIngredients,
    clearRecipes,
    stopAllPolling,
  }
})
