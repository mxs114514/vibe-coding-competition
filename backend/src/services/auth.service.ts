import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { smsService } from './sms.service';
import {
  CaptchaStore,
  JwtPayload,
  LoginResponse,
  UserInfo,
} from '../types/auth.types';

// TODO: 数据库配置完成后启用 Prisma
// const prisma = new PrismaClient();

// 临时用户存储（内存存储，重启后数据会丢失）
interface User {
  id: number;
  username: string;
  phone: string;
  createdAt: Date;
}

/**
 * 认证服务
 */
export class AuthService {
  // 验证码存储（内存存储，生产环境建议使用Redis）
  private captchaStore: Map<string, CaptchaStore> = new Map();

  // 用户存储（内存存储，数据库配置完成后替换为 Prisma）
  private userStore: Map<string, User> = new Map();
  private userIdCounter = 1;

  // 验证码有效期（5分钟）
  private readonly CAPTCHA_EXPIRES_IN = 5 * 60 * 1000;

  /**
   * 发送验证码
   */
  async sendCaptcha(phone: string): Promise<{ code: string; success: boolean }> {
    // 验证手机号格式
    if (!smsService.validatePhone(phone)) {
      throw new Error('手机号格式不正确');
    }

    // 生成验证码
    const code = smsService.generateCode();

    // 存储验证码
    this.captchaStore.set(phone, {
      code,
      expiresAt: Date.now() + this.CAPTCHA_EXPIRES_IN,
    });

    // 发送短信
    const success = await smsService.sendCaptcha(phone, code);

    if (!success) {
      throw new Error('验证码发送失败');
    }

    logger.info(`[Auth] 验证码已发送到 ${phone}`);

    return { code, success };
  }

  /**
   * 验证验证码
   */
  private verifyCaptcha(phone: string, code: string): boolean {
    const stored = this.captchaStore.get(phone);

    if (!stored) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > stored.expiresAt) {
      this.captchaStore.delete(phone);
      return false;
    }

    // 验证码匹配
    if (stored.code !== code) {
      return false;
    }

    // 验证成功后删除验证码
    this.captchaStore.delete(phone);
    return true;
  }

  /**
   * 用户登录（验证码登录 + 自动注册）
   */
  async login(phone: string, code: string): Promise<LoginResponse> {
    // 验证验证码
    if (!this.verifyCaptcha(phone, code)) {
      throw new Error('验证码错误或已过期');
    }

    // 查找或创建用户（使用内存存储）
    let user = this.userStore.get(phone);

    if (!user) {
      // 自动注册新用户
      const username = `用户_${Math.floor(Math.random() * 10000)}`;
      user = {
        id: this.userIdCounter++,
        username,
        phone,
        createdAt: new Date(),
      };
      this.userStore.set(phone, user);
      logger.info(`[Auth] 新用户注册: ${phone}`);
    }

    // 生成JWT Token
    const token = this.generateToken({
      userId: user.id,
      phone: user.phone,
    });

    // 计算过期时间（7天）
    const expiresIn = 7 * 24 * 60 * 60; // 秒

    return {
      token,
      expiresIn,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
      },
    };
  }

  /**
   * 生成JWT Token
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * 验证JWT Token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Token无效或已过期');
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: number): Promise<UserInfo> {
    // 从内存存储中查找用户
    let user: User | undefined;
    for (const u of this.userStore.values()) {
      if (u.id === userId) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
