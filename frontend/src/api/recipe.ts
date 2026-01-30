import api from './index'
import type {
  GenerateRecipesRequest,
  GenerateRecipesResponse,
  Recipe,
  FavoriteListParams,
  FavoriteListResponse,
  HistoryListParams,
  HistoryListResponse,
  RecipeFilters
} from '@/types/recipe'
import type { ApiResponse } from '@/types/api'

// 生成菜谱
export function generateRecipes(data: GenerateRecipesRequest) {
  return api.post<ApiResponse<GenerateRecipesResponse>>('/recipes/generate', data)
}

// 获取菜谱详情
export function getRecipeById(id: number) {
  return api.get<ApiResponse<Recipe>>(`/recipes/${id}`)
}

// 收藏菜谱
export function addFavorite(id: number) {
  return api.post<ApiResponse<null>>(`/recipes/${id}/favorite`)
}

// 取消收藏
export function removeFavorite(id: number) {
  return api.delete<ApiResponse<null>>(`/recipes/${id}/favorite`)
}

// 获取收藏列表
export function getFavorites(params?: FavoriteListParams) {
  return api.get<ApiResponse<FavoriteListResponse>>('/recipes/favorites', { params })
}

// 获取历史记录
export function getHistory(params?: HistoryListParams) {
  return api.get<ApiResponse<HistoryListResponse>>('/recipes/history', { params })
}

// 根据历史记录重新生成
export function regenerateFromHistory(historyId: number, filters?: RecipeFilters) {
  return api.post<ApiResponse<GenerateRecipesResponse>>(`/recipes/regenerate/${historyId}`, { filters })
}

// 查询图片生成状态
export function getImageStatus(recipeId: string) {
  return api.get<ApiResponse<{
    recipeId: string
    recipeName: string
    status: 'pending' | 'generating' | 'completed' | 'failed'
    imageUrl?: string
    error?: string
  }>>(`/images/status/${recipeId}`)
}

// 批量查询图片生成状态
export function getBatchImageStatus(recipeIds: string[]) {
  return api.post<ApiResponse<Record<string, {
    recipeId: string
    recipeName: string
    status: 'pending' | 'generating' | 'completed' | 'failed'
    imageUrl?: string
    error?: string
  }>>>('/images/status/batch', { recipeIds })
}
