import { Router } from 'express';
import { getImageStatus, getBatchImageStatus } from '../controllers/image.controller';

const router = Router();

/**
 * GET /api/images/status/:recipeId
 * 查询单个菜谱的图片生成状态
 */
router.get('/status/:recipeId', getImageStatus);

/**
 * POST /api/images/status/batch
 * 批量查询菜谱的图片生成状态
 */
router.post('/status/batch', getBatchImageStatus);

export default router;
