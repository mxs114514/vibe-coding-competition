// 食材分类枚举
export enum IngredientCategory {
  VEGETABLE = 1, // 蔬菜
  MEAT = 2, // 肉类
  SEAFOOD = 3, // 海鲜
  STAPLE = 4, // 主食
  SEASONING = 5, // 调味料
  OTHER = 6, // 其他
}

// 食材状态枚举
export enum IngredientStatus {
  AVAILABLE = 1, // 已有
  NEEDED = 2, // 缺少
}

// 分类名称映射
export const CATEGORY_NAMES: Record<IngredientCategory, string> = {
  [IngredientCategory.VEGETABLE]: '蔬菜',
  [IngredientCategory.MEAT]: '肉类',
  [IngredientCategory.SEAFOOD]: '海鲜',
  [IngredientCategory.STAPLE]: '主食',
  [IngredientCategory.SEASONING]: '调味料',
  [IngredientCategory.OTHER]: '其他',
}

// 状态名称映射
export const STATUS_NAMES: Record<IngredientStatus, string> = {
  [IngredientStatus.AVAILABLE]: '已有',
  [IngredientStatus.NEEDED]: '缺少',
}

// 用户食材信息
export interface UserIngredient {
  id: number
  ingredientId: number
  name: string
  category: IngredientCategory
  categoryName: string
  amount: number
  unit: string
  status: IngredientStatus
  statusName: string
}

// 用户食材列表查询参数
export interface UserIngredientListParams {
  status?: IngredientStatus
  category?: IngredientCategory
  keyword?: string
}

// 用户食材列表响应
export interface UserIngredientListResponse {
  total: number
  list: UserIngredient[]
}

// 添加食材请求
export interface AddIngredientRequest {
  ingredientId?: number
  name?: string
  amount: number
  unit?: string
  status?: IngredientStatus
  category?: IngredientCategory
}

// 批量添加食材请求
export interface BatchAddIngredientRequest {
  ingredients: Array<{
    ingredientId: number
    amount: number
    unit?: string
  }>
}

// 更新食材请求
export interface UpdateIngredientRequest {
  amount?: number
  unit?: string
  status?: IngredientStatus
  category?: IngredientCategory
}

// 批量删除请求
export interface BatchDeleteRequest {
  ids: number[]
}
