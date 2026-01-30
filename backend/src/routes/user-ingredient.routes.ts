import { Router } from 'express';
import { UserIngredientController } from '../controllers/user-ingredient.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userIngredientController = new UserIngredientController();

// 所有路由都需要认证
router.use(authMiddleware);

// GET /api/user-ingredients - 获取用户冰箱食材列表
router.get('/', userIngredientController.getUserIngredients);

// POST /api/user-ingredients - 添加用户食材
router.post('/', userIngredientController.addUserIngredient);

// POST /api/user-ingredients/batch - 批量添加用户食材（必须在 /:id 之前）
router.post('/batch', userIngredientController.batchAddUserIngredients);

// DELETE /api/user-ingredients/batch - 批量删除用户食材（必须在 /:id 之前）
router.delete('/batch', userIngredientController.batchDeleteUserIngredients);

// PUT /api/user-ingredients/:id - 更新用户食材
router.put('/:id', userIngredientController.updateUserIngredient);

// DELETE /api/user-ingredients/:id - 删除用户食材
router.delete('/:id', userIngredientController.deleteUserIngredient);

export default router;
