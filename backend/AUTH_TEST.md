# 认证接口测试指南

## 前置条件

1. **确保数据库已配置**
   - 检查 `backend/.env` 文件中的 `DATABASE_URL` 配置
   - 确保 MySQL 数据库已启动

2. **生成 Prisma 客户端**
   ```bash
   cd backend
   npm run prisma:generate
   ```

3. **运行数据库迁移**
   ```bash
   npm run prisma:migrate
   ```

## 启动后端服务

```bash
cd backend
npm run dev
```

服务将在 `http://localhost:8081` 启动。

## 测试接口

### 1. 测试验证码接口

```bash
curl -X POST http://localhost:8081/api/auth/captcha \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800138000\"}"
```

**预期响应**（开发环境）:
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "verifyCode": "123456"
  }
}
```

### 2. 测试登录接口

使用上一步获取的验证码登录：

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800138000\",\"code\":\"123456\"}"
```

**预期响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": 1,
      "username": "用户_1234",
      "phone": "13800138000"
    }
  }
}
```

### 3. 测试获取用户信息接口

使用上一步获取的 token：

```bash
curl -X GET http://localhost:8081/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**预期响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "用户_1234",
    "phone": "13800138000",
    "createdAt": "2026-01-30T12:00:00.000Z"
  }
}
```

## 前端测试

1. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```

2. **访问登录页面**
   - 打开浏览器访问 `http://localhost:5173`
   - 输入手机号：13800138000
   - 点击"获取验证码"
   - 查看浏览器控制台或后端日志获取验证码
   - 输入验证码并登录

## 常见问题

### 1. 404 错误

**问题**: 访问 `/api/auth/captcha` 返回 404

**解决方案**:
- 确保后端服务已启动
- 检查 `backend/src/routes/index.ts` 是否已注册 auth 路由
- 检查前端代理配置 `frontend/vite.config.ts` 是否正确

### 2. 数据库连接错误

**问题**: `PrismaClientInitializationError`

**解决方案**:
- 检查 `.env` 文件中的 `DATABASE_URL` 配置
- 确保 MySQL 服务已启动
- 运行 `npm run prisma:migrate` 创建数据库表

### 3. Token 验证失败

**问题**: 401 Unauthorized

**解决方案**:
- 检查 `.env` 文件中的 `JWT_SECRET` 配置
- 确保请求头中包含正确的 `Authorization: Bearer <token>` 格式
- 检查 token 是否已过期（默认7天）

## 实现的功能

✅ 验证码发送（开发环境直接返回验证码）
✅ 手机号+验证码登录
✅ 用户自动注册
✅ JWT Token 生成和验证
✅ 获取当前用户信息
✅ 认证中间件保护路由

## 下一步

- [ ] 集成真实的短信服务商（阿里云/腾讯云）
- [ ] 添加验证码发送频率限制
- [ ] 添加登录失败次数限制
- [ ] 使用 Redis 存储验证码（替代内存存储）
- [ ] 添加刷新 Token 机制
