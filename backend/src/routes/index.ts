import { Router } from 'express';
import recipeRoutes from './recipe.routes';
import ingredientRoutes from './ingredient.routes';
import authRoutes from './auth.routes';
import userIngredientRoutes from './user-ingredient.routes';
import imageRoutes from './image.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/user-ingredients', userIngredientRoutes);
router.use('/images', imageRoutes);

export default router;
