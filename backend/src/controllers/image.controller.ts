import { Request, Response } from 'express';
import { imageService } from '../services/image.service';
import { logger } from '../utils/logger';

/**
 * 查询图片生成状态
 */
export async function getImageStatus(req: Request, res: Response) {
  try {
    const { recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: '缺少菜谱ID'
      });
    }

    const task = imageService.getTaskStatus(recipeId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '未找到图片生成任务'
      });
    }

    res.json({
      success: true,
      data: {
        recipeId: task.recipeId,
        recipeName: task.recipeName,
        status: task.status,
        imageUrl: task.imageUrl,
        error: task.error
      }
    });
  } catch (error) {
    logger.error('Error getting image status:', error);
    res.status(500).json({
      success: false,
      message: '查询图片状态失败'
    });
  }
}

/**
 * 批量查询图片生成状态
 */
export async function getBatchImageStatus(req: Request, res: Response) {
  try {
    const { recipeIds } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '缺少菜谱ID列表'
      });
    }

    const statuses = imageService.getTaskStatuses(recipeIds);
    const result: any[] = [];

    recipeIds.forEach((id) => {
      const task = statuses.get(id);
      if (task) {
        result.push({
          recipeId: task.recipeId,
          recipeName: task.recipeName,
          status: task.status,
          imageUrl: task.imageUrl,
          error: task.error
        });
      } else {
        result.push({
          recipeId: id,
          status: 'not_found'
        });
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error getting batch image status:', error);
    res.status(500).json({
      success: false,
      message: '批量查询图片状态失败'
    });
  }
}

