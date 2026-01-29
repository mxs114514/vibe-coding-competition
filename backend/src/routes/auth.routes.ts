import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 认证路由
 */

// 发送验证码（无需认证）
router.post('/captcha', (req, res) => authController.sendCaptcha(req, res));

// 用户登录（无需认证）
router.post('/login', (req, res) => authController.login(req, res));

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware, (req, res) =>
  authController.getCurrentUser(req, res)
);

export default router;
