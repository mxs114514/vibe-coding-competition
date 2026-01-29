import { logger } from '../utils/logger';
import { RecipeFilters } from '../types/recipe.types';

export class AIService {
  async generateRecipes(ingredients: string[], _filters?: RecipeFilters): Promise<any[]> {
    logger.info(`Generating recipes for ingredients: ${ingredients.join(', ')}`);

    // TODO: 集成阿里云百炼 Dashscope SDK
    // 暂时返回模拟数据
    const mockRecipes = [
      {
        name: '番茄炒蛋',
        cuisine: '中餐',
        tasteBase: 2,
        spiceLevel: 0,
        ingredients: {
          available: ingredients.slice(0, 2),
          needed: ['盐', '油', '葱'],
        },
        steps: [
          '1. 番茄切块，鸡蛋打散',
          '2. 热锅倒油，炒鸡蛋至凝固',
          '3. 加入番茄翻炒',
          '4. 加盐调味，撒葱花出锅',
        ],
        cookingTime: 15,
        difficulty: '简单',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      },
      {
        name: '清炒时蔬',
        cuisine: '中餐',
        tasteBase: 5,
        spiceLevel: 0,
        ingredients: {
          available: ingredients,
          needed: ['盐', '油', '蒜'],
        },
        steps: [
          '1. 蔬菜洗净切段',
          '2. 热锅倒油，爆香蒜末',
          '3. 加入蔬菜快速翻炒',
          '4. 加盐调味出锅',
        ],
        cookingTime: 10,
        difficulty: '简单',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      },
      {
        name: '家常小炒',
        cuisine: '中餐',
        tasteBase: 2,
        spiceLevel: 1,
        ingredients: {
          available: ingredients,
          needed: ['盐', '油', '酱油', '生姜'],
        },
        steps: [
          '1. 食材洗净切好',
          '2. 热锅倒油，爆香姜片',
          '3. 加入食材翻炒',
          '4. 加酱油和盐调味',
        ],
        cookingTime: 20,
        difficulty: '中等',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      },
    ];

    return mockRecipes;
  }
}
