import { Request, Response, NextFunction } from 'express';
import { UserIngredientService } from '../services/user-ingredient.service';
import { ApiResponse } from '../utils/response';

export class UserIngredientController {
  private userIngredientService: UserIngredientService;

  constructor() {
    this.userIngredientService = new UserIngredientService();
  }

  /**
   * 获取用户冰箱食材列表
   * GET /api/user-ingredients
   */
  getUserIngredients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, '未授权', 401);
        return;
      }

      // 获取查询参数
      const { status, category, keyword } = req.query;

      const filters = {
        status: status ? parseInt(status as string) : undefined,
        category: category ? parseInt(category as string) : undefined,
        keyword: keyword as string,
      };

      const result = await this.userIngredientService.getUserIngredients(userId, filters);

      ApiResponse.success(res, result, 'success');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 添加用户食材
   * POST /api/user-ingredients
   */
  addUserIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, '未授权', 401);
        return;
      }

      const { ingredientId, name, amount, unit, category } = req.body;

      // 验证必填字段
      if ((!ingredientId && !name) || amount === undefined) {
        ApiResponse.error(res, '缺少必填字段', 400);
        return;
      }

      const result = await this.userIngredientService.addUserIngredient(userId, {
        ingredientId,
        name,
        amount,
        unit,
        category,
        // status - 此处不再接收前端传递的status
      });

      ApiResponse.success(res, result, '添加成功');
    } catch (error: any) {
      if (error.message === '标准食材不存在' || error.message === '必须提供有效的食材ID或名称') {
        ApiResponse.error(res, error.message, 400);
        return;
      }
      next(error);
    }
  };

  /**
   * 批量添加用户食材
   * POST /api/user-ingredients/batch
   */
  batchAddUserIngredients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, '未授权', 401);
        return;
      }

      const { ingredients } = req.body;

      // 验证必填字段
      if (!ingredients || !Array.isArray(ingredients)) {
        ApiResponse.error(res, '参数格式错误', 400);
        return;
      }

      const result = await this.userIngredientService.batchAddUserIngredients(userId, ingredients);

      ApiResponse.success(res, result, `成功添加 ${result.addedCount} 种食材`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新用户食材
   * PUT /api/user-ingredients/:id
   */
  updateUserIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, '未授权', 401);
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的ID', 400);
        return;
      }

      const { amount, unit, status, category } = req.body;

      const result = await this.userIngredientService.updateUserIngredient(id, userId, {
        amount,
        unit,
        status,
        category,
      });

      ApiResponse.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  };

  /**
   * 删除用户食材
   * DELETE /api/user-ingredients/:id
   */
  deleteUserIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, '未授权', 401);
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        ApiResponse.error(res, '无效的ID', 400);
        return;
      }

      await this.userIngredientService.deleteUserIngredient(id, userId);

      ApiResponse.success(res, null, '删除成功');
    } catch (error: any) {
      if (error.message === '食材记录不存在') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      if (error.message === '无权限操作此食材') {
        ApiResponse.error(res, error.message, 403);
        return;
      }
      next(error);
    }
  };

  /**
   * 批量删除用户食材
   * DELETE /api/user-ingredients/batch
   */
  batchDeleteUserIngredients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponse.error(res, '未授权', 401);
        return;
      }

      const { ids } = req.body;

      // 验证必填字段
      if (!ids || !Array.isArray(ids)) {
        ApiResponse.error(res, '参数格式错误', 400);
        return;
      }

      const result = await this.userIngredientService.batchDeleteUserIngredients(ids, userId);

      ApiResponse.success(res, result, `成功删除 ${result.deletedCount} 种食材`);
    } catch (error) {
      next(error);
    }
  };
}
