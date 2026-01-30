// 菜系枚举
export enum Cuisine {
  CHINESE = 1,    // 中餐
  WESTERN = 2,    // 西餐
  JAPANESE = 3,   // 日韩
  SOUTHEAST = 4   // 东南亚
}

// 难度枚举
export enum Difficulty {
  EASY = 1,       // 简单
  MEDIUM = 2,     // 中等
  HARD = 3        // 复杂
}

// 基础味型枚举
export enum TasteBase {
  SALTY = 1,      // 咸
  SWEET = 2,      // 甜
  SOUR = 3,       // 酸
  FRESH = 4,      // 鲜
  BITTER = 5,     // 苦
  SPICY = 6       // 辣
}

// 辣度等级枚举
export enum SpiceLevel {
  NONE = 0,       // 不辣
  MILD = 1,       // 微辣
  MEDIUM = 2,     // 中辣
  HOT = 3,        // 重辣
  EXTRA_HOT = 4   // 特辣
}

// 名称映射
export const CUISINE_NAMES: Record<Cuisine, string> = {
  [Cuisine.CHINESE]: '中餐',
  [Cuisine.WESTERN]: '西餐',
  [Cuisine.JAPANESE]: '日韩',
  [Cuisine.SOUTHEAST]: '东南亚'
}

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  [Difficulty.EASY]: '简单',
  [Difficulty.MEDIUM]: '中等',
  [Difficulty.HARD]: '复杂'
}

export const TASTE_BASE_NAMES: Record<TasteBase, string> = {
  [TasteBase.SALTY]: '咸',
  [TasteBase.SWEET]: '甜',
  [TasteBase.SOUR]: '酸',
  [TasteBase.FRESH]: '鲜',
  [TasteBase.BITTER]: '苦',
  [TasteBase.SPICY]: '辣'
}

export const SPICE_LEVEL_NAMES: Record<SpiceLevel, string> = {
  [SpiceLevel.NONE]: '不辣',
  [SpiceLevel.MILD]: '微辣',
  [SpiceLevel.MEDIUM]: '中辣',
  [SpiceLevel.HOT]: '重辣',
  [SpiceLevel.EXTRA_HOT]: '特辣'
}

// 食材项
export interface IngredientItem {
  name: string
  quantity: number
  unit: string
}

// 营养分析
export interface NutritionAnalysis {
  calories: number    // 卡路里
  protein: number     // 蛋白质(g)
  carbs: number       // 碳水化合物(g)
  fat: number         // 脂肪(g)
}

// 菜谱信息
export interface Recipe {
  id: number | string
  name: string
  cuisine: Cuisine
  cuisineName: string
  tasteBase?: TasteBase
  tasteBaseName?: string
  spiceLevel?: SpiceLevel
  spiceLevelName?: string
  cookingTimeMinutes: number
  difficulty: Difficulty
  difficultyName: string
  imageUrl?: string
  ingredients: {
    available: IngredientItem[]
    needed: IngredientItem[]
  }
  steps: string[]
  nutritionAnalysis?: NutritionAnalysis
  aiGenerated: boolean
  createdAt: string
}

// 筛选条件
export interface RecipeFilters {
  cuisine?: Cuisine
  maxCookingTime?: number
  difficulty?: Difficulty
  tasteBase?: TasteBase[]
  spiceLevel?: SpiceLevel
}

// 生成菜谱请求
export interface GenerateRecipesRequest {
  ingredients?: string[]
  filters?: RecipeFilters
}

// 生成菜谱响应
export interface GenerateRecipesResponse {
  recipes: Recipe[]
  generatedAt: string
}

// 历史记录
export interface HistoryRecord {
  id: number
  ingredients: string[]
  recipesCount: number
  recipes: Array<{ id: number; name: string }>
  generatedAt: string
}

// 收藏列表响应
export interface FavoriteListResponse {
  total: number
  page: number
  size: number
  list: Recipe[]
}

// 历史记录响应
export interface HistoryListResponse {
  total: number
  page: number
  size: number
  list: HistoryRecord[]
}

// 收藏列表查询参数
export interface FavoriteListParams {
  cuisine?: Cuisine
  page?: number
  size?: number
}

// 历史记录查询参数
export interface HistoryListParams {
  page?: number
  size?: number
}
