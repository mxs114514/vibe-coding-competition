import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { JwtPayload } from '../types/auth.types';

// 扩展Express Request类型，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT认证中间件
 * 验证请求头中的Authorization Token
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        code: 401,
        message: '未提��认证Token',
        data: null,
      });
      return;
    }

    // 解析Bearer Token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        code: 401,
        message: 'Token格式错误',
        data: null,
      });
      return;
    }

    const token = parts[1];

    // 验证Token
    const payload = authService.verifyToken(token);

    // 将用户信息附加到请求对象
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: error instanceof Error ? error.message : 'Token验证失败',
      data: null,
    });
  }
};
