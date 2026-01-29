// import { PrismaClient } from '@prisma/client';
import { AIService } from './ai.service';
import { RecipeFilters, GeneratedRecipe } from '../types/recipe.types';

// TODO: Prisma 7.x 配置需要进一步研究，暂时不使用数据库
// const prisma = new PrismaClient();

export class RecipeService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generateRecipes(
    ingredients: string[],
    filters?: RecipeFilters
  ): Promise<GeneratedRecipe[]> {
    // 调用 AI 服务生成菜谱
    const aiRecipes = await this.aiService.generateRecipes(ingredients, filters);

    // TODO: 暂时不保存到数据库，直接返回 AI 生成的菜谱
    const recipes = aiRecipes.map((recipe, index) => ({
      id: `temp-${Date.now()}-${index}`,
      name: recipe.name,
      cuisine: recipe.cuisine,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      imageUrl: recipe.imageUrl,
    }));

    return recipes;
  }
}
