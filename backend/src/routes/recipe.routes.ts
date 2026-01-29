import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { validateRecipeGeneration } from '../middleware/validators';

const router = Router();
const recipeController = new RecipeController();

// POST /api/recipes/generate - 生成菜谱
router.post('/generate', validateRecipeGeneration, recipeController.generateRecipes);

export default router;
