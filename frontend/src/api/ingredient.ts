import request from './index'
import type { ApiResponse } from '@/types/api'
import type {
  UserIngredient,
  UserIngredientListParams,
  UserIngredientListResponse,
  AddIngredientRequest,
  BatchAddIngredientRequest,
  UpdateIngredientRequest,
  BatchDeleteRequest
} from '@/types/ingredient'

/**
 * 获取用户冰箱食材列表
 */
export function getUserIngredients(params?: UserIngredientListParams): Promise<ApiResponse<UserIngredientListResponse>> {
  return request.get('/user-ingredients', { params })
}

/**
 * 添加用户食材
 */
export function addUserIngredient(data: AddIngredientRequest): Promise<ApiResponse<UserIngredient>> {
  return request.post('/user-ingredients', data)
}

/**
 * 批量添加用户食材
 */
export function batchAddUserIngredients(data: BatchAddIngredientRequest): Promise<ApiResponse<{ addedCount: number }>> {
  return request.post('/user-ingredients/batch', data)
}

/**
 * 更新用户食材
 */
export function updateUserIngredient(id: number, data: UpdateIngredientRequest): Promise<ApiResponse<UserIngredient>> {
  return request.put(`/user-ingredients/${id}`, data)
}

/**
 * 删除用户食材
 */
export function deleteUserIngredient(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/user-ingredients/${id}`)
}

/**
 * 批量删除用户食材
 */
export function batchDeleteUserIngredients(data: BatchDeleteRequest): Promise<ApiResponse<{ deletedCount: number }>> {
  return request.delete('/user-ingredients/batch', { data })
}
