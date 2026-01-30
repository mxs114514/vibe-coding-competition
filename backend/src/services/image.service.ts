import { logger } from '../utils/logger';
import axios from 'axios';

// 图片生成任务状态
interface ImageTask {
  recipeId: string;
  recipeName: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

class ImageService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private tasks: Map<string, ImageTask> = new Map();

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || '';
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1';
  }

  /**
   * 提交图片生成任务（异步）
   * @param recipeName 菜谱名称
   * @param ingredients 主要食材
   * @returns 任务ID
   */
  private async submitImageTask(recipeName: string, ingredients: string[]): Promise<string | null> {
    try {
      const prompt = this.buildImagePrompt(recipeName, ingredients);
      logger.info(`Submitting image generation task for recipe: ${recipeName}`);
      logger.info(`Image prompt: ${prompt}`);

      // 调用图像生成 API（异步模式）
      const response = await axios.post(
        `${this.baseUrl}/services/aigc/text2image/image-synthesis`,
        {
          model: 'wan2.2-t2i-flash',
          // model: 'wanx2.1-t2i-turbo',
          input: {
            prompt: prompt,
            negative_prompt: '低质量，模糊，变形，不真实',
          },
          parameters: {
            size: '1024*1024',
            n: 1,
          },
        },
        {
          headers: {
            'X-DashScope-Async': 'enable',
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`Image task submission response: ${JSON.stringify(response.data)}`);

      // 检查响应
      if (response.data.output && response.data.output.task_id) {
        const taskId = response.data.output.task_id;
        logger.info(`Image generation task submitted: ${taskId}`);
        return taskId;
      }

      logger.warn('No task ID in response');
      return null;
    } catch (error: any) {
      logger.error(
        'Failed to submit image generation task:',
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * 查询图片生成任务状态
   * @param taskId 任务ID
   * @returns 图片URL（如果已完成）
   */
  private async queryImageTask(taskId: string): Promise<string | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      logger.info(`Image task query response: ${JSON.stringify(response.data)}`);

      const taskStatus = response.data.output?.task_status;

      if (taskStatus === 'SUCCEEDED') {
        // 任务成功，获取图片URL
        if (response.data.output.results && response.data.output.results.length > 0) {
          const imageUrl = response.data.output.results[0].url;
          logger.info(`Image generation succeeded: ${imageUrl}`);
          return imageUrl;
        }
      } else if (taskStatus === 'FAILED') {
        logger.error(
          `Image generation failed: ${response.data.output?.message || 'Unknown error'}`
        );
        return null;
      } else if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        // 任务还在进行中
        logger.info(`Image generation task still ${taskStatus}`);
        return null;
      }

      return null;
    } catch (error: any) {
      logger.error('Failed to query image generation task:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * 生成菜谱图片（轮询直到完成）
   * @param recipeName 菜谱名称
   * @param ingredients 主要食材
   * @returns 图片URL
   */
  async generateRecipeImage(recipeName: string, ingredients: string[]): Promise<string | null> {
    try {
      // 提交任务
      const taskId = await this.submitImageTask(recipeName, ingredients);
      if (!taskId) {
        return null;
      }

      // 轮询查询任务状态（最多等待60秒）
      const maxAttempts = 20;
      const pollInterval = 3000; // 3秒

      for (let i = 0; i < maxAttempts; i++) {
        // 等待一段时间再查询
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        const imageUrl = await this.queryImageTask(taskId);
        if (imageUrl) {
          return imageUrl;
        }
      }

      logger.warn(`Image generation timeout for recipe: ${recipeName}`);
      return null;
    } catch (error: any) {
      logger.error('Failed to generate recipe image:', error.message);
      return null;
    }
  }

  /**
   * 构建图像生成提示词
   */
  private buildImagePrompt(recipeName: string, ingredients: string[]): string {
    const ingredientList = ingredients.slice(0, 3).join('、');

    return `一道精美的${recipeName}美食摄影，主要食材包括${ingredientList}，菜品摆盘精致，色彩鲜艳，光线柔和，背景简洁，专业美食摄影风格，高清画质，食欲感强`;
  }

  /**
   * 批量生成菜谱图片
   */
  async generateRecipeImages(
    recipes: Array<{ name: string; ingredients: { available: Array<{ name: string }> } }>
  ): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>();

    // 并发生成图片（限制并发数为 3）
    const batchSize = 3;
    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      const promises = batch.map(async (recipe) => {
        const ingredients = recipe.ingredients.available.map((item) => item.name);
        const imageUrl = await this.generateRecipeImage(recipe.name, ingredients);
        if (imageUrl) {
          imageMap.set(recipe.name, imageUrl);
        }
      });

      await Promise.all(promises);
    }

    return imageMap;
  }

  /**
   * 异步启动图片生成任务
   * @param recipeId 菜谱ID
   * @param recipeName 菜谱名称
   * @param ingredients 主要食材
   */
  startImageGeneration(recipeId: string, recipeName: string, ingredients: string[]): void {
    // 创建任务
    const task: ImageTask = {
      recipeId,
      recipeName,
      status: 'pending',
    };
    this.tasks.set(recipeId, task);

    // 异步执行图片生成
    this.executeImageGeneration(recipeId, recipeName, ingredients).catch((error) => {
      logger.error(`Failed to generate image for recipe ${recipeId}:`, error);
    });
  }

  /**
   * 执行图片生成
   */
  private async executeImageGeneration(
    recipeId: string,
    recipeName: string,
    ingredients: string[]
  ): Promise<void> {
    const task = this.tasks.get(recipeId);
    if (!task) {
      return;
    }

    try {
      // 更新状态为生成中
      task.status = 'generating';
      this.tasks.set(recipeId, task);

      // 生成图片
      const imageUrl = await this.generateRecipeImage(recipeName, ingredients);

      if (imageUrl) {
        // 生成成功
        task.status = 'completed';
        task.imageUrl = imageUrl;
        logger.info(`Image generation completed for recipe ${recipeId}: ${imageUrl}`);
      } else {
        // 生成失败
        task.status = 'failed';
        task.error = 'No image URL returned';
        logger.warn(`Image generation failed for recipe ${recipeId}: No image URL`);
      }
    } catch (error: any) {
      // 生成失败
      task.status = 'failed';
      task.error = error.message || 'Unknown error';
      logger.error(`Image generation failed for recipe ${recipeId}:`, error);
    } finally {
      this.tasks.set(recipeId, task);
    }
  }

  /**
   * 查询任务状态
   * @param recipeId 菜谱ID
   * @returns 任务状态
   */
  getTaskStatus(recipeId: string): ImageTask | undefined {
    return this.tasks.get(recipeId);
  }

  /**
   * 批量查询任务状态
   * @param recipeIds 菜谱ID列表
   * @returns 任务状态映射
   */
  getTaskStatuses(recipeIds: string[]): Map<string, ImageTask> {
    const statuses = new Map<string, ImageTask>();
    recipeIds.forEach((id) => {
      const task = this.tasks.get(id);
      if (task) {
        statuses.set(id, task);
      }
    });
    return statuses;
  }

  /**
   * 批量异步生成菜谱图片
   * @param recipes 菜谱列表
   */
  startBatchImageGeneration(
    recipes: Array<{
      id: string | number;
      name: string;
      ingredients: { available: Array<{ name: string }> };
    }>
  ): void {
    recipes.forEach((recipe) => {
      const recipeId = String(recipe.id);
      const ingredients = recipe.ingredients.available.map((item) => item.name);
      this.startImageGeneration(recipeId, recipe.name, ingredients);
    });
  }

  /**
   * 清理已完成的任务（可选，防止内存泄漏）
   * 注意：当前实现会清理所有已完成/失败的任务，未来可以添加时间戳来实现基于时间的清理
   */
  cleanupCompletedTasks(): void {
    const toDelete: string[] = [];

    this.tasks.forEach((task, recipeId) => {
      if (task.status === 'completed' || task.status === 'failed') {
        toDelete.push(recipeId);
      }
    });

    toDelete.forEach((id) => this.tasks.delete(id));
    if (toDelete.length > 0) {
      logger.info(`Cleaned up ${toDelete.length} completed image generation tasks`);
    }
  }
}

// 导出单例实例
export const imageService = new ImageService();
