# Vibe Coding Competition 项目库

本仓库用于存放 **Vibe Coding 比赛** 的全套相关资源，包含前后端源代码、演示视频及项目说明文档。

## 📂 项目结构

```text
.
├── frontend/      # 前端项目 (Vue.js + Vite)
├── backend/       # 后端项目 (Node.js / Go / Python)
├── docs/          # 项目相关文档
└── videos/        # 解说视频与演示动画
```

## 🛠️ 快速开始

### 前端 (Frontend)

1. 进入目录：`cd frontend`
2. 安装依赖：`npm install`
3. 启动项目：`npm run dev`

### 后端 (Backend)

1. 进入目录：`cd backend`
2. 安装依赖：`npm install`
3. 初始化数据库：`npx prisma migrate dev`
4. 生成 Prisma Client：`npx prisma generate`
5. 启动项目：`npm run dev`

> 💡 可选：使用 `npx prisma studio` 打开可视化数据库管理界面
---
