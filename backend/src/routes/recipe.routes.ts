import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRecipeGeneration } from '../middleware/validators';

const router = Router();
const recipeController = new RecipeController();

// POST /api/recipes/generate - 生成菜谱（可选认证）
router.post('/generate', validateRecipeGeneration, recipeController.generateRecipes);

// GET /api/recipes/favorites - 获取收藏列表（需要认证）
router.get('/favorites', authMiddleware, recipeController.getFavorites);

// GET /api/recipes/history - 获取历史记录（需要认证）
router.get('/history', authMiddleware, recipeController.getHistory);

// POST /api/recipes/regenerate/:historyId - 根据历史记录重新生成（需要认证）
router.post('/regenerate/:historyId', authMiddleware, recipeController.regenerateFromHistory);

// GET /api/recipes/:id - 获取菜谱详情
router.get('/:id', recipeController.getRecipeById);

// POST /api/recipes/:id/favorite - 收藏菜谱（需要认证）
router.post('/:id/favorite', authMiddleware, recipeController.addFavorite);

// DELETE /api/recipes/:id/favorite - 取消收藏（需要认证）
router.delete('/:id/favorite', authMiddleware, recipeController.removeFavorite);

export default router;
