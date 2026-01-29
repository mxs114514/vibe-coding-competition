import { Router } from 'express';
import recipeRoutes from './recipe.routes';
import ingredientRoutes from './ingredient.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/ingredients', ingredientRoutes);

export default router;
