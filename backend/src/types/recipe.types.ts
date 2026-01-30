// 食材项
export interface IngredientItem {
  name: string;
  quantity: number;
  unit: string;
}

// 营养分析
export interface NutritionAnalysis {
  calories: number;    // 卡路里
  protein: number;     // 蛋白质(g)
  carbs: number;       // 碳水化合物(g)
  fat: number;         // 脂肪(g)
}

export interface RecipeFilters {
  cuisine?: number;           // 菜系编码（1-4）
  maxCookingTime?: number;    // 最大烹饪时间（分钟）
  difficulty?: number;        // 难度编码（1-3）
  tasteBase?: number[];       // 基础味型数组（1-6）
  spiceLevel?: number;        // 辣度等级（0-4）
}

export interface GeneratedRecipe {
  id: string | number;
  name: string;
  cuisine: number;
  cuisineName: string;
  tasteBase?: number;
  tasteBaseName?: string;
  spiceLevel?: number;
  spiceLevelName?: string;
  cookingTimeMinutes: number;
  difficulty: number;
  difficultyName: string;
  imageUrl?: string;
  ingredients: {
    available: IngredientItem[];
    needed: IngredientItem[];
  };
  steps: string[];
  nutritionAnalysis?: NutritionAnalysis;
  aiGenerated: boolean;
  createdAt: string;
}

// 数据库菜谱记录
export interface RecipeRecord {
  id: number;
  name: string;
  cuisine: number;
  taste_base: number;
  spice_level: number;
  cooking_time_minutes: number;
  difficulty: number;
  ingredients_json: string;
  steps_text: string;
  nutrition_analysis: string | null;
  estimated_cost_cny: number | null;
  cover_image_url: string | null;
  source_type: number;
  author_user_id: number | null;
  ai_generated: number;
  created_at: Date;
}

// 收藏记录
export interface FavoriteRecord {
  id: number;
  user_id: number;
  recipe_id: number;
  created_at: Date;
}

// 历史记录
export interface GenerationHistory {
  id: number;
  user_id: number;
  ingredients_json: string;
  recipes_count: number;
  generated_at: Date;
}

// 历史记录与菜谱关联
export interface HistoryRecipeRelation {
  id: number;
  history_id: number;
  recipe_id: number;
}

// 历史记录响应（包含菜谱信息）
export interface HistoryRecordWithRecipes {
  id: number;
  ingredients: string[];
  recipesCount: number;
  recipes: Array<{ id: number; name: string }>;
  generatedAt: string;
}
