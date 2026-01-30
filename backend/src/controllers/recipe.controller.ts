import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/recipe.service';
import { FavoriteService } from '../services/favorite.service';
import { HistoryService } from '../services/history.service';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class RecipeController {
  private recipeService: RecipeService;
  private favoriteService: FavoriteService;
  private historyService: HistoryService;

  constructor() {
    this.recipeService = new RecipeService();
    this.favoriteService = new FavoriteService();
    this.historyService = new HistoryService();
  }

  generateRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ingredients, filters } = req.body;
      const userId = req.user?.userId;

      logger.info(`Generating recipes for ingredients: ${ingredients.join(', ')}`);

      const recipes = await this.recipeService.generateRecipes(ingredients, filters);

      // 如果用户已登录，保存菜谱到数据库并创建历史记录
      if (userId) {
        try {
          const recipeIds: number[] = [];
          for (const recipe of recipes) {
            const recipeId = await this.recipeService.saveRecipe(recipe, userId);
            recipeIds.push(recipeId);
            // 更新菜谱ID为真实ID
            recipe.id = recipeId;
          }

          // 保存历史记录
          await this.historyService.saveHistory(userId, ingredients, recipeIds);
          logger.info(`Saved ${recipeIds.length} recipes and history for user ${userId}`);
        } catch (error) {
          logger.error('Failed to save recipes or history:', error);
          // 不影响返回结果，继续返回生成的菜谱
        }
      }

      ApiResponse.success(res, { recipes }, 'Recipes generated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取菜谱详情
   */
  getRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const recipeId = parseInt(idParam);

      if (isNaN(recipeId)) {
        ApiResponse.error(res, 'Invalid recipe ID', 400);
        return;
      }

      const recipe = await this.recipeService.getRecipeById(recipeId);

      if (!recipe) {
        ApiResponse.error(res, 'Recipe not found', 404);
        return;
      }

      ApiResponse.success(res, recipe, 'Recipe retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 收藏菜谱
   */
  addFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const recipeId = parseInt(idParam);
      const userId = req.user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      if (isNaN(recipeId)) {
        ApiResponse.error(res, 'Invalid recipe ID', 400);
        return;
      }

      await this.favoriteService.addFavorite(userId, recipeId);

      ApiResponse.success(res, null, '收藏成功');
    } catch (error: any) {
      if (error.message === '该菜谱已收藏' || error.message === '菜谱不存在') {
        ApiResponse.error(res, error.message, 400);
      } else {
        next(error);
      }
    }
  };

  /**
   * 取消收藏
   */
  removeFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const recipeId = parseInt(idParam);
      const userId = req.user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      if (isNaN(recipeId)) {
        ApiResponse.error(res, 'Invalid recipe ID', 400);
        return;
      }

      await this.favoriteService.removeFavorite(userId, recipeId);

      ApiResponse.success(res, null, '已取消收藏');
    } catch (error: any) {
      if (error.message === '收藏记录不存在') {
        ApiResponse.error(res, error.message, 404);
      } else {
        next(error);
      }
    }
  };

  /**
   * 获取收藏列表
   */
  getFavorites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const cuisine = req.query.cuisine ? parseInt(req.query.cuisine as string) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const size = req.query.size ? parseInt(req.query.size as string) : 10;

      const result = await this.favoriteService.getFavorites(userId, cuisine, page, size);

      ApiResponse.success(res, result, 'Favorites retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取历史记录
   */
  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const size = req.query.size ? parseInt(req.query.size as string) : 10;

      const result = await this.historyService.getHistory(userId, page, size);

      ApiResponse.success(res, result, 'History retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 根据历史记录重新生成
   */
  regenerateFromHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const historyIdParam = Array.isArray(req.params.historyId) ? req.params.historyId[0] : req.params.historyId;
      const historyId = parseInt(historyIdParam);
      const userId = req.user?.userId;

      if (!userId) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      if (isNaN(historyId)) {
        ApiResponse.error(res, 'Invalid history ID', 400);
        return;
      }

      const filters = req.body.filters;
      const recipes = await this.historyService.regenerateFromHistory(historyId, userId, filters);

      // 保存新生成的菜谱
      const recipeIds: number[] = [];
      for (const recipe of recipes) {
        const recipeId = await this.recipeService.saveRecipe(recipe, userId);
        recipeIds.push(recipeId);
        recipe.id = recipeId;
      }

      ApiResponse.success(res, { recipes }, 'Recipes regenerated successfully');
    } catch (error: any) {
      if (error.message === '历史记录不存在') {
        ApiResponse.error(res, error.message, 404);
      } else {
        next(error);
      }
    }
  };
}
