import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/recipe.service';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class RecipeController {
  private recipeService: RecipeService;

  constructor() {
    this.recipeService = new RecipeService();
  }

  generateRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ingredients, filters } = req.body;

      logger.info(`Generating recipes for ingredients: ${ingredients.join(', ')}`);

      const recipes = await this.recipeService.generateRecipes(ingredients, filters);

      ApiResponse.success(res, { recipes }, 'Recipes generated successfully');
    } catch (error) {
      next(error);
    }
  };
}
