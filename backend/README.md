# AI 智能菜谱推荐系统 - 后端服务

## 技术栈

- **运行时：** Node.js v18+
- **语言：** TypeScript 5.x
- **框架：** Express
- **ORM：** Prisma
- **数据库：** MySQL 8.0+（暂未连接）
- **AI 服务：** 阿里云百炼（通义千问）- 待集成
- **开发工具：** ts-node-dev（热重载）
- **代码规范：** ESLint + Prettier

## 项目结构

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma 数据模型（9张表）
│   └── prisma.config.ts       # Prisma 配置
├── src/
│   ├── app.ts                 # Express 应用入口
│   ├── config/
│   │   └── config.ts          # 环境变量配置
│   ├── controllers/           # 控制器层
│   │   ├── ingredient.controller.ts
│   │   └── recipe.controller.ts
│   ├── services/              # 业务逻辑层
│   │   ├── ai.service.ts      # AI 服务（模拟数据）
│   │   ├── ingredient.service.ts
│   │   └── recipe.service.ts
│   ├── routes/                # 路由定义
│   │   ├── index.ts
│   │   ├── ingredient.routes.ts
│   │   └── recipe.routes.ts
│   ├── middleware/            # 中间件
│   │   ├── errorHandler.ts
│   │   └── validators.ts
│   ├── utils/                 # 工具函数
│   │   ├── logger.ts
│   │   └── response.ts
│   └── types/                 # 类型定义
│       └── recipe.types.ts
├── logs/                      # 日志文件
├── package.json
├── tsconfig.json
├── .env                       # 环境变量
├── .env.example               # 环境变量示例
├── .eslintrc.json             # ESLint 配置
├── .prettierrc                # Prettier 配置
└── .gitignore
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```env
NODE_ENV=development
PORT=8081
DATABASE_URL="mysql://username:password@localhost:3306/momo_app"
JWT_SECRET=your-super-secret-jwt-key
DASHSCOPE_API_KEY=your-dashscope-api-key
CORS_ORIGIN=http://localhost:5173
```

### 3. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:8081 启动

## API 端点

### 健康检查

```
GET /health
```

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2026-01-29T19:40:07.418Z"
}
```

### 获取常用食材列表

```
GET /api/ingredients/common
```

**响应：**
```json
{
  "code": 200,
  "message": "Common ingredients retrieved",
  "data": {
    "categories": {
      "蔬菜": ["番茄", "黄瓜", "土豆", ...],
      "肉类": ["猪肉", "鸡肉", "牛肉", ...],
      "海鲜": ["虾", "鱼", "蟹", ...],
      "主食": ["米饭", "面条", "馒头", ...],
      "调味料": ["盐", "油", "酱油", ...]
    }
  }
}
```

### 生成菜谱

```
POST /api/recipes/generate
Content-Type: application/json
```

**请求体：**
```json
{
  "ingredients": ["番茄", "鸡蛋", "葱"],
  "filters": {
    "cuisine": "中餐",
    "cookingTime": 30,
    "difficulty": "简单"
  }
}
```

**响应：**
```json
{
  "code": 200,
  "message": "Recipes generated successfully",
  "data": {
    "recipes": [
      {
        "id": "temp-1769715853575-0",
        "name": "番茄炒蛋",
        "cuisine": "中餐",
        "ingredients": {
          "available": ["番茄", "鸡蛋"],
          "needed": ["盐", "油", "葱"]
        },
        "steps": [
          "1. 番茄切块，鸡蛋打散",
          "2. 热锅倒油，炒鸡蛋至凝固",
          "3. 加入番茄翻炒",
          "4. 加盐调味，撒葱花出锅"
        ],
        "cookingTime": 15,
        "difficulty": "简单",
        "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
      }
    ]
  }
}
```

## 可用脚本

```bash
# 开发模式（热重载）
npm run dev

# 编译 TypeScript
npm run build

# 生产模式
npm start

# 生成 Prisma Client
npm run prisma:generate

# 数据库迁移
npm run prisma:migrate

# 打开 Prisma Studio
npm run prisma:studio

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm test
```

## 当前状态

### ✅ 已完成

- [x] 项目初始化和依赖安装
- [x] TypeScript 配置
- [x] Prisma Schema 定义（9张表）
- [x] Express 应用结构搭建
- [x] 路由、控制器、服务层实现
- [x] 错误处理和日志系统
- [x] 请求验证中间件
- [x] CORS 配置
- [x] ESLint 和 Prettier 配置
- [x] 环境变量管理
- [x] API 端点测试通过

### 🚧 待完成

- [ ] **Prisma 数据库集成**
  - Prisma 7.x 配置需要进一步研究
  - 当前暂时不保存到数据库，直接返回模拟数据

- [ ] **阿里云百炼 AI 服务集成**
  - 需要找到正确的 Dashscope SDK 包名
  - 当前使用模拟数据返回菜谱

- [ ] **用户认证**
  - JWT Token 生成和验证
  - 手机号/密码登录

- [ ] **更多 API 端点**
  - 用户食材管理（冰箱管理）
  - 菜谱收藏
  - 购物清单
  - 用户评分和评论

- [ ] **图片服务**
  - 集成 Unsplash/Pexels API
  - 菜谱图片搜索和缓存

- [ ] **单元测试和集成测试**

## 注意事项

1. **数据库配置**
   - 确保 MySQL 8.0+ 已安装并运行
   - 创建数据库：`CREATE DATABASE momo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - 配置正确的 DATABASE_URL

2. **Prisma 7.x 配置问题**
   - 当前版本的 Prisma (7.3.0) 配置方式与之前版本不同
   - 需要进一步研究正确的配置方式
   - 暂时注释了数据库保存功能

3. **端口配置**
   - 默认端口：8081
   - 前端 Vite 已配置 API 代理到此端口

4. **CORS 配置**
   - 默认允许 http://localhost:5173（前端开发服务器）
   - 生产环境需要修改 CORS_ORIGIN

## 测试

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:8081/health

# 获取常用食材
curl http://localhost:8081/api/ingredients/common

# 生成菜谱
curl -X POST http://localhost:8081/api/recipes/generate \
  -H "Content-Type: application/json" \
  -d '{"ingredients":["番茄","鸡蛋","葱"]}'
```

### 使用 Postman 或其他 API 工具

导入以下端点进行测试：
- GET http://localhost:8081/health
- GET http://localhost:8081/api/ingredients/common
- POST http://localhost:8081/api/recipes/generate

## 开发建议

1. **代码规范**
   - 运行 `npm run lint` 检查代码
   - 运行 `npm run format` 格式化代码
   - 提交前确保无 ESLint 错误

2. **日志查看**
   - 开发环境：控制台输出
   - 生产环境：查看 `logs/` 目录

3. **热重载**
   - 使用 `npm run dev` 启动开发服务器
   - 文件修改后自动重启

## 许可证

MIT
