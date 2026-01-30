import mysql from 'mysql2/promise';
import { RecipeService } from './recipe.service';
import { GeneratedRecipe } from '../types/recipe.types';
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

export class FavoriteService {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  /**
   * 收藏菜谱
   * @param userId 用户ID
   * @param recipeId 菜谱ID
   */
  async addFavorite(userId: number, recipeId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      // 检查是否已收藏
      const [existing] = await connection.execute(
        `SELECT id FROM user_favorite_recipe WHERE user_id = ? AND recipe_id = ?`,
        [userId, recipeId]
      );

      const existingRecords = existing as any[];
      if (existingRecords.length > 0) {
        throw new Error('该菜谱已收藏');
      }

      // 检查菜谱是否存在
      const recipe = await this.recipeService.getRecipeById(recipeId);
      if (!recipe) {
        throw new Error('菜谱不存在');
      }

      // 添加收藏记录
      await connection.execute(
        `INSERT INTO user_favorite_recipe (user_id, recipe_id, created_at) VALUES (?, ?, NOW())`,
        [userId, recipeId]
      );

      logger.info(`User ${userId} favorited recipe ${recipeId}`);
    } finally {
      connection.release();
    }
  }

  /**
   * 取消收藏
   * @param userId 用户ID
   * @param recipeId 菜谱ID
   */
  async removeFavorite(userId: number, recipeId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `DELETE FROM user_favorite_recipe WHERE user_id = ? AND recipe_id = ?`,
        [userId, recipeId]
      );

      const deleteResult = result as any;
      if (deleteResult.affectedRows === 0) {
        throw new Error('收藏记录不存在');
      }

      logger.info(`User ${userId} unfavorited recipe ${recipeId}`);
    } finally {
      connection.release();
    }
  }

  /**
   * 获取收藏列表
   * @param userId 用户ID
   * @param cuisine 菜系筛选（可选）
   * @param page 页码
   * @param size 每页数量
   * @returns 收藏列表
   */
  async getFavorites(
    userId: number,
    cuisine?: number,
    page: number = 1,
    size: number = 10
  ): Promise<{ total: number; list: GeneratedRecipe[] }> {
    const connection = await pool.getConnection();
    try {
      // 构建查询条件
      let whereClause = 'ufr.user_id = ?';
      const params: any[] = [userId];

      if (cuisine) {
        whereClause += ' AND r.cuisine = ?';
        params.push(cuisine);
      }

      // 查询总数
      const [countRows] = await connection.execute(
        `SELECT COUNT(*) as total
         FROM user_favorite_recipe ufr
         INNER JOIN recipe r ON ufr.recipe_id = r.id
         WHERE ${whereClause}`,
        params
      );
      const total = (countRows as any[])[0].total;

      // 查询列表
      const offset = (page - 1) * size;
      const [rows] = await connection.execute(
        `SELECT r.*, ufr.created_at as favorited_at
         FROM user_favorite_recipe ufr
         INNER JOIN recipe r ON ufr.recipe_id = r.id
         WHERE ${whereClause}
         ORDER BY ufr.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, size, offset]
      );

      const records = rows as any[];
      const recipeIds = records.map(r => r.id);
      const recipes = await this.recipeService.getRecipesByIds(recipeIds);

      return { total, list: recipes };
    } finally {
      connection.release();
    }
  }

  /**
   * 检查是否已收藏
   * @param userId 用户ID
   * @param recipeId 菜谱ID
   * @returns 是否已收藏
   */
  async isFavorited(userId: number, recipeId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT id FROM user_favorite_recipe WHERE user_id = ? AND recipe_id = ?`,
        [userId, recipeId]
      );

      const records = rows as any[];
      return records.length > 0;
    } finally {
      connection.release();
    }
  }
}
