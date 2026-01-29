import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { CaptchaRequest, LoginRequest } from '../types/auth.types';

/**
 * 认证控制器
 */
export class AuthController {
  /**
   * 发送验证码
   * POST /api/auth/captcha
   */
  async sendCaptcha(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body as CaptchaRequest;

      if (!phone) {
        res.status(400).json({
          code: 400,
          message: '手机号不能为空',
          data: null,
        });
        return;
      }

      const result = await authService.sendCaptcha(phone);

      // 开发环境返回验证码，生产环境不返回
      const responseData =
        config.env === 'development'
          ? { verifyCode: result.code }
          : undefined;

      res.json({
        code: 200,
        message: '验证码已发送',
        data: responseData,
      });
    } catch (error) {
      logger.error(`[Auth] 发送验证码失败: ${error}`);
      res.status(400).json({
        code: 400,
        message: error instanceof Error ? error.message : '发送验证码失败',
        data: null,
      });
    }
  }

  /**
   * 用户登录
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { phone, code } = req.body as LoginRequest;

      if (!phone || !code) {
        res.status(400).json({
          code: 400,
          message: '手机号和验证码不能为空',
          data: null,
        });
        return;
      }

      const result = await authService.login(phone, code);

      res.json({
        code: 200,
        message: '登录成功',
        data: result,
      });
    } catch (error) {
      logger.error(`[Auth] 登录失败: ${error}`);
      res.status(400).json({
        code: 400,
        message: error instanceof Error ? error.message : '登录失败',
        data: null,
      });
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          code: 401,
          message: '未登录',
          data: null,
        });
        return;
      }

      const userInfo = await authService.getUserInfo(req.user.userId);

      res.json({
        code: 200,
        message: 'success',
        data: userInfo,
      });
    } catch (error) {
      logger.error(`[Auth] 获取用户信息失败: ${error}`);
      res.status(400).json({
        code: 400,
        message: error instanceof Error ? error.message : '获取用户信息失败',
        data: null,
      });
    }
  }
}

export const authController = new AuthController();
