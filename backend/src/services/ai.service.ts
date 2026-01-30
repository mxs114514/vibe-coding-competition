import { logger } from '../utils/logger';
import { RecipeFilters } from '../types/recipe.types';
import OpenAI from 'openai';

// 名称映射常量
const CUISINE_NAMES: Record<number, string> = {
  1: '中餐',
  2: '西餐',
  3: '日韩',
  4: '东南亚',
};

const DIFFICULTY_NAMES: Record<number, string> = {
  1: '简单',
  2: '中等',
  3: '复杂',
};

const TASTE_BASE_NAMES: Record<number, string> = {
  1: '咸',
  2: '甜',
  3: '酸',
  4: '鲜',
  5: '苦',
  6: '辣',
};

const SPICE_LEVEL_NAMES: Record<number, string> = {
  0: '不辣',
  1: '微辣',
  2: '中辣',
  3: '重辣',
  4: '特辣',
};

// 系统提示词
const SYSTEM_PROMPT = `你是一个专业的厨师助手，擅长根据现有食材推荐菜谱。
你需要根据用户提供的食材和筛选条件，生成3-5道菜谱。

输出格式要求：
- 必须返回有效的JSON数组
- 每道菜谱必须包含以下字段：
  * name: 菜名（字符串）
  * cuisine: 菜系编码（数字：1=中餐, 2=西餐, 3=日韩, 4=东南亚）
  * tasteBase: 基础味型（数字：1=咸, 2=甜, 3=酸, 4=鲜, 5=苦, 6=辣）
  * spiceLevel: 辣度等级（数字：0=不辣, 1=微辣, 2=中辣, 3=重辣, 4=特辣）
  * cookingTimeMinutes: 烹饪时间（数字，单位：分钟）
  * difficulty: 难度（数字：1=简单, 2=中等, 3=复杂）
  * ingredients: 食材对象
    - available: 用户已有的食材数组，每项格式 {name: "食材名", quantity: 数量, unit: "单位"}
    - needed: 需要购买的食材数组，每项格式 {name: "食材名", quantity: 数量, unit: "单位"}
  * steps: 烹饪步骤数组（字符串数组，每个步骤一个字符串）
  * nutritionAnalysis: 营养分析对象 {calories: 卡路里数, protein: 蛋白质克数, carbs: 碳水化合物克数, fat: 脂肪克数}

注意事项：
1. 优先使用用户已有的食材
2. 推荐的菜谱应该多样化，避免重复
3. 考虑食材的搭配合理性
4. 步骤要清晰具体，易于操作
5. 营养分析要合理估算

输出示例：
[
  {
    "name": "番茄炒蛋",
    "cuisine": 1,
    "tasteBase": 2,
    "spiceLevel": 0,
    "cookingTimeMinutes": 15,
    "difficulty": 1,
    "ingredients": {
      "available": [
        {"name": "番茄", "quantity": 2, "unit": "个"},
        {"name": "鸡蛋", "quantity": 3, "unit": "个"}
      ],
      "needed": [
        {"name": "盐", "quantity": 5, "unit": "克"},
        {"name": "油", "quantity": 20, "unit": "毫升"}
      ]
    },
    "steps": [
      "番茄切块，鸡蛋打散",
      "热锅倒油，炒鸡蛋至凝固盛出",
      "加入番茄翻炒出汁",
      "倒入鸡蛋，加盐调味，翻炒均匀"
    ],
    "nutritionAnalysis": {
      "calories": 280,
      "protein": 18,
      "carbs": 12,
      "fat": 16
    }
  }
]

请严格按照上述格式返回JSON数组，不要包含任何其他文字或markdown标记。`;

export class AIService {
  private cache: Map<string, { data: any[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  private readonly apiKey: string;
  private readonly openai: OpenAI;

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || '';
    this.openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(ingredients: string[], filters?: RecipeFilters): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `${ingredients.sort().join(',')}|${filterStr}`;
  }

  /**
   * 检查缓存
   */
  private getFromCache(key: string): any[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info('Using cached recipe data');
      return cached.data;
    }
    return null;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: any[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 构建用户提示词（包含系统角色和用户需求）
   */
  private buildUserPrompt(ingredients: string[], filters?: RecipeFilters): string {
    // 合并系统提示词和用户需求
    let prompt = `${SYSTEM_PROMPT}\n\n`;

    prompt += `现有食材：${ingredients.join('、')}\n\n`;

    if (filters && Object.keys(filters).length > 0) {
      prompt += '筛选条件：\n';
      if (filters.cuisine) {
        prompt += `- 菜系：${CUISINE_NAMES[filters.cuisine]}\n`;
      }
      if (filters.tasteBase && filters.tasteBase.length > 0) {
        const tasteNames = filters.tasteBase.map(t => TASTE_BASE_NAMES[t]).join('、');
        prompt += `- 口味：${tasteNames}\n`;
      }
      if (filters.spiceLevel !== undefined) {
        prompt += `- 辣度：${SPICE_LEVEL_NAMES[filters.spiceLevel]}\n`;
      }
      if (filters.maxCookingTime) {
        prompt += `- 最大烹饪时间：${filters.maxCookingTime}分钟\n`;
      }
      if (filters.difficulty) {
        prompt += `- 难度：${DIFFICULTY_NAMES[filters.difficulty]}\n`;
      }
      prompt += '\n';
    }

    prompt += '请生成3-5道符合条件的菜谱，直接返回JSON数组，不要包含任何其他文字。';
    return prompt;
  }

  /**
   * 验证菜谱数据
   */
  private validateRecipe(recipe: any): boolean {
    return (
      recipe.name &&
      typeof recipe.cuisine === 'number' &&
      typeof recipe.cookingTimeMinutes === 'number' &&
      typeof recipe.difficulty === 'number' &&
      recipe.ingredients &&
      Array.isArray(recipe.ingredients.available) &&
      Array.isArray(recipe.ingredients.needed) &&
      Array.isArray(recipe.steps) &&
      recipe.steps.length > 0
    );
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(content: string): any[] {
    try {
      // 清理可能的markdown代码块标记
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      // 解析JSON
      const recipes = JSON.parse(cleanContent);

      if (!Array.isArray(recipes)) {
        throw new Error('AI response is not an array');
      }

      // 验证并过滤有效的菜谱
      const validRecipes = recipes.filter((recipe) => {
        const isValid = this.validateRecipe(recipe);
        if (!isValid) {
          logger.warn('Invalid recipe data:', recipe);
        }
        return isValid;
      });

      return validRecipes;
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      throw error;
    }
  }

  /**
   * 生成菜谱（主方法）
   */
  async generateRecipes(ingredients: string[], filters?: RecipeFilters): Promise<any[]> {
    logger.info(`Generating recipes for ingredients: ${ingredients.join(', ')}`);
    logger.info(`Filters: ${JSON.stringify(filters)}`);
    logger.info(`API Key configured: ${this.apiKey ? 'Yes' : 'No'}`);

    // 检查缓存
    const cacheKey = this.getCacheKey(ingredients, filters);
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // 构建提示词
      const userPrompt = this.buildUserPrompt(ingredients, filters);
      logger.info(`User prompt: ${userPrompt.substring(0, 200)}...`);

      // 调用AI API
      logger.info('Calling Dashscope API...');
      logger.info(`Model: ${process.env.DASHSCOPE_MODEL || 'qwen-turbo'}`);
      logger.info(`API Key: ${this.apiKey.substring(0, 10)}...`);

      const completion = await this.openai.chat.completions.create({
        model: process.env.DASHSCOPE_MODEL || 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      logger.info('Dashscope API call successful');
      logger.info(`Response: ${JSON.stringify(completion, null, 2).substring(0, 500)}`);

      // 解析响应
      if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        logger.error(`Invalid response structure: ${JSON.stringify(completion)}`);
        throw new Error('Invalid AI response structure');
      }

      const content = completion.choices[0].message.content || '';
      logger.info(`AI response content length: ${content.length}`);
      logger.info(`AI response preview: ${content.substring(0, 200)}...`);

      const recipes = this.parseAIResponse(content);

      if (recipes.length === 0) {
        throw new Error('No valid recipes generated');
      }

      // 缓存结果
      this.setCache(cacheKey, recipes);

      logger.info(`Successfully generated ${recipes.length} recipes`);
      return recipes;
    } catch (error) {
      logger.error('Failed to generate recipes with AI:', error);
      // 直接抛出错误，不使用降级策略
      throw error;
    }
  }
}
