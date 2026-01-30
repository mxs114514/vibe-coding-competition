// import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import { AIService } from './ai.service';
import { imageService } from './image.service';
import { RecipeFilters, GeneratedRecipe, RecipeRecord } from '../types/recipe.types';
import { logger } from '../utils/logger';

// TODO: Prisma 7.x 配置需要进一步研究，暂时不使用数据库
// const prisma = new PrismaClient();

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Sjmbahczdszjj666!',
  database: 'momo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 名称映射
const CUISINE_NAMES: Record<number, string> = {
  1: '中餐',
  2: '西餐',
  3: '日韩',
  4: '东南亚'
};

const DIFFICULTY_NAMES: Record<number, string> = {
  1: '简单',
  2: '中等',
  3: '复杂'
};

const TASTE_BASE_NAMES: Record<number, string> = {
  1: '咸',
  2: '甜',
  3: '酸',
  4: '鲜',
  5: '苦',
  6: '辣'
};

const SPICE_LEVEL_NAMES: Record<number, string> = {
  0: '不辣',
  1: '微辣',
  2: '中辣',
  3: '重辣',
  4: '特辣'
};

export class RecipeService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generateRecipes(
    ingredients: string[],
    filters?: RecipeFilters
  ): Promise<GeneratedRecipe[]> {
    // 调用 AI 服务生成菜谱
    const aiRecipes = await this.aiService.generateRecipes(ingredients, filters);

    // TODO: 暂时不保存到数据库，直接返回 AI 生成的菜谱
    const recipes: GeneratedRecipe[] = aiRecipes.map((recipe, index) => ({
      id: `temp-${Date.now()}-${index}`,
      name: recipe.name,
      cuisine: recipe.cuisine,
      cuisineName: CUISINE_NAMES[recipe.cuisine] || '未知',
      tasteBase: recipe.tasteBase,
      tasteBaseName: recipe.tasteBase ? TASTE_BASE_NAMES[recipe.tasteBase] : undefined,
      spiceLevel: recipe.spiceLevel,
      spiceLevelName: recipe.spiceLevel !== undefined ? SPICE_LEVEL_NAMES[recipe.spiceLevel] : undefined,
      cookingTimeMinutes: recipe.cookingTimeMinutes,
      difficulty: recipe.difficulty,
      difficultyName: DIFFICULTY_NAMES[recipe.difficulty] || '未知',
      imageUrl: undefined, // 图片将异步生成
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      nutritionAnalysis: recipe.nutritionAnalysis,
      aiGenerated: true,
      createdAt: new Date().toISOString()
    }));

    // 异步启动图片生成任务（不阻塞返回）
    logger.info(`Starting async image generation for ${recipes.length} recipes`);
    imageService.startBatchImageGeneration(recipes);

    return recipes;
  }

  /**
   * 保存菜谱到数据库
   * @param recipe 生成的菜谱数据
   * @param userId 用户ID
   * @returns 保存后的菜谱ID
   */
  async saveRecipe(recipe: GeneratedRecipe, userId: number): Promise<number> {
    const connection = await pool.getConnection();
    try {
      // 准备食材JSON
      const ingredientsJson = JSON.stringify({
        available: recipe.ingredients.available,
        needed: recipe.ingredients.needed
      });

      // 准备步骤文本
      const stepsText = recipe.steps.join('\n');

      // 准备营养分析JSON
      const nutritionAnalysis = recipe.nutritionAnalysis
        ? JSON.stringify(recipe.nutritionAnalysis)
        : null;

      // 插入菜谱记录
      const [result] = await connection.execute(
        `INSERT INTO recipe (
          name, cuisine, taste_base, spice_level, cooking_time_minutes,
          difficulty, ingredients_json, steps_text, nutrition_analysis,
          cover_image_url, source_type, author_user_id, ai_generated, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          recipe.name,
          recipe.cuisine,
          recipe.tasteBase || null,
          recipe.spiceLevel !== undefined ? recipe.spiceLevel : null,
          recipe.cookingTimeMinutes,
          recipe.difficulty,
          ingredientsJson,
          stepsText,
          nutritionAnalysis,
          recipe.imageUrl || null,
          1, // source_type: 1=AI生成
          userId,
          1 // ai_generated: 1=是
        ]
      );

      const insertId = (result as any).insertId;
      logger.info(`Recipe saved to database with ID: ${insertId}`);
      return insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * 根据ID获取菜谱详情
   * @param id 菜谱ID
   * @returns 菜谱详情
   */
  async getRecipeById(id: number): Promise<GeneratedRecipe | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM recipe WHERE id = ?`,
        [id]
      );

      const records = rows as RecipeRecord[];
      if (records.length === 0) {
        return null;
      }

      return this.convertRecordToGeneratedRecipe(records[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * 批量获取菜谱
   * @param ids 菜谱ID数组
   * @returns 菜谱列表
   */
  async getRecipesByIds(ids: number[]): Promise<GeneratedRecipe[]> {
    if (ids.length === 0) {
      return [];
    }

    const connection = await pool.getConnection();
    try {
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await connection.execute(
        `SELECT * FROM recipe WHERE id IN (${placeholders})`,
        ids
      );

      const records = rows as RecipeRecord[];
      return records.map(row => this.convertRecordToGeneratedRecipe(row));
    } finally {
      connection.release();
    }
  }

  /**
   * 将数据库记录转换为GeneratedRecipe格式
   */
  private convertRecordToGeneratedRecipe(record: RecipeRecord): GeneratedRecipe {
    const ingredientsData = JSON.parse(record.ingredients_json);
    const nutritionData = record.nutrition_analysis
      ? JSON.parse(record.nutrition_analysis)
      : undefined;

    return {
      id: record.id,
      name: record.name,
      cuisine: record.cuisine,
      cuisineName: CUISINE_NAMES[record.cuisine] || '未知',
      tasteBase: record.taste_base,
      tasteBaseName: record.taste_base ? TASTE_BASE_NAMES[record.taste_base] : undefined,
      spiceLevel: record.spice_level,
      spiceLevelName: record.spice_level !== null ? SPICE_LEVEL_NAMES[record.spice_level] : undefined,
      cookingTimeMinutes: record.cooking_time_minutes,
      difficulty: record.difficulty,
      difficultyName: DIFFICULTY_NAMES[record.difficulty] || '未知',
      imageUrl: record.cover_image_url || undefined,
      ingredients: ingredientsData,
      steps: record.steps_text.split('\n'),
      nutritionAnalysis: nutritionData,
      aiGenerated: record.ai_generated === 1,
      createdAt: record.created_at.toISOString()
    };
  }
}
