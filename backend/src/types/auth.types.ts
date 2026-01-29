// 认证相关类型定义

export interface CaptchaRequest {
  phone: string;
}

export interface CaptchaResponse {
  verifyCode?: string; // 开发环境返回，生产环境不返回
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    phone: string;
  };
}

export interface UserInfo {
  id: number;
  username: string;
  phone: string;
  createdAt: string;
}

export interface JwtPayload {
  userId: number;
  phone: string;
}

// 验证码存储结构
export interface CaptchaStore {
  code: string;
  expiresAt: number;
}
