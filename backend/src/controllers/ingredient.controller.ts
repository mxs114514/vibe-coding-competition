import { Request, Response, NextFunction } from 'express';
import { IngredientService } from '../services/ingredient.service';
import { ApiResponse } from '../utils/response';

export class IngredientController {
  private ingredientService: IngredientService;

  constructor() {
    this.ingredientService = new IngredientService();
  }

  getCommonIngredients = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categories = await this.ingredientService.getCommonIngredients();

      ApiResponse.success(res, { categories }, 'Common ingredients retrieved');
    } catch (error) {
      next(error);
    }
  };
}
