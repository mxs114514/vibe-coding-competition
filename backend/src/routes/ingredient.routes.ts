import { Router } from 'express';
import { IngredientController } from '../controllers/ingredient.controller';

const router = Router();
const ingredientController = new IngredientController();

// GET /api/ingredients/common - 获取常用食材列表
router.get('/common', ingredientController.getCommonIngredients);

export default router;
