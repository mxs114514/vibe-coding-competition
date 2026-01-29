import { logger } from '../utils/logger';
import { config } from '../config/config';

/**
 * 短信服务
 * 开发环境：直接返回验证码
 * 生产环境：集成短信服务商API（阿里云/腾讯云）
 */
export class SmsService {
  /**
   * 发送验证码短信
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否发送成功
   */
  async sendCaptcha(phone: string, code: string): Promise<boolean> {
    try {
      if (config.env === 'development') {
        // 开发环境：仅记录日志
        logger.info(`[SMS] 发送验证码到 ${phone}: ${code}`);
        return true;
      } else {
        // 生产环境：调用短信服务商API
        // TODO: 集成阿里云短信服务或腾讯云短信服务
        logger.info(`[SMS] 生产环境发送验证码到 ${phone}`);

        // 示例：阿里云短信服务集成
        // const result = await this.sendAliyunSms(phone, code);
        // return result.success;

        return true;
      }
    } catch (error) {
      logger.error(`[SMS] 发送验证码失败: ${error}`);
      return false;
    }
  }

  /**
   * 生成6位数字验证码
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 验证手机号格式
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
}

export const smsService = new SmsService();
