import mysql from 'mysql2/promise';
import { RecipeService } from './recipe.service';
import { AIService } from './ai.service';
import { GeneratedRecipe, RecipeFilters, HistoryRecordWithRecipes } from '../types/recipe.types';
import { logger } from '../utils/logger';

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

export class HistoryService {
  private recipeService: RecipeService;
  private aiService: AIService;

  constructor() {
    this.recipeService = new RecipeService();
    this.aiService = new AIService();
  }

  /**
   * 保存生成历史
   * @param userId 用户ID
   * @param ingredients 食材列表
   * @param recipeIds 生成的菜谱ID列表
   * @returns 历史记录ID
   */
  async saveHistory(userId: number, ingredients: string[], recipeIds: number[]): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 插入历史记录
      const [result] = await connection.execute(
        `INSERT INTO recipe_generation_history (user_id, ingredients_json, recipes_count, generated_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, JSON.stringify(ingredients), recipeIds.length]
      );

      const historyId = (result as any).insertId;

      // 插入历史记录与菜谱的关联
      if (recipeIds.length > 0) {
        const values = recipeIds.map(recipeId => `(${historyId}, ${recipeId})`).join(',');
        await connection.execute(
          `INSERT INTO recipe_generation_history_recipes (history_id, recipe_id) VALUES ${values}`
        );
      }

      await connection.commit();
      logger.info(`History record ${historyId} saved for user ${userId}`);
      return historyId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取历史记录列表
   * @param userId 用户ID
   * @param page 页码
   * @param size 每页数量
   * @returns 历史记录列表
   */
  async getHistory(
    userId: number,
    page: number = 1,
    size: number = 10
  ): Promise<{ total: number; list: HistoryRecordWithRecipes[] }> {
    const connection = await pool.getConnection();
    try {
      // 查询总数
      const [countRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM recipe_generation_history WHERE user_id = ?`,
        [userId]
      );
      const total = (countRows as any[])[0].total;

      // 查询历史记录
      const offset = (page - 1) * size;
      const [rows] = await connection.execute(
        `SELECT * FROM recipe_generation_history
         WHERE user_id = ?
         ORDER BY generated_at DESC
         LIMIT ? OFFSET ?`,
        [userId, size, offset]
      );

      const historyRecords = rows as any[];

      // 获取每条历史记录关联的菜谱
      const list: HistoryRecordWithRecipes[] = [];
      for (const record of historyRecords) {
        // 查询关联的菜谱
        const [recipeRows] = await connection.execute(
          `SELECT r.id, r.name
           FROM recipe_generation_history_recipes hr
           INNER JOIN recipe r ON hr.recipe_id = r.id
           WHERE hr.history_id = ?`,
          [record.id]
        );

        const recipes = (recipeRows as any[]).map(r => ({
          id: r.id,
          name: r.name
        }));

        list.push({
          id: record.id,
          ingredients: JSON.parse(record.ingredients_json),
          recipesCount: record.recipes_count,
          recipes,
          generatedAt: record.generated_at.toISOString()
        });
      }

      return { total, list };
    } finally {
      connection.release();
    }
  }

  /**
   * 根据历史记录重新生成菜谱
   * @param historyId 历史记录ID
   * @param userId 用户ID
   * @param filters 筛选条件（可选）
   * @returns 生成的菜谱列表
   */
  async regenerateFromHistory(
    historyId: number,
    userId: number,
    filters?: RecipeFilters
  ): Promise<GeneratedRecipe[]> {
    const connection = await pool.getConnection();
    try {
      // 查询历史记录
      const [rows] = await connection.execute(
        `SELECT * FROM recipe_generation_history WHERE id = ? AND user_id = ?`,
        [historyId, userId]
      );

      const records = rows as any[];
      if (records.length === 0) {
        throw new Error('历史记录不存在');
      }

      const record = records[0];
      const ingredients: string[] = JSON.parse(record.ingredients_json);

      // 使用相同的食材重新生成菜谱
      const recipes = await this.recipeService.generateRecipes(ingredients, filters);

      logger.info(`Regenerated ${recipes.length} recipes from history ${historyId}`);
      return recipes;
    } finally {
      connection.release();
    }
  }
}
