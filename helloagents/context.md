# 项目上下文

## 项目基本信息

### 项目标识
- **项目名称**: 莫小帅的程程编（momoAPP）
- **英文名称**: AI Recipe Generator - "Cook with What You Have"
- **项目类型**: Web 应用（前后端分离）
- **开发模式**: MVP 迭代开发
- **竞赛背景**: Vibe Coding Competition

### 业务背景
**核心问题**: 打开冰箱只有几样食材，不知道做什么菜？

**解决方案**: 根据用户现有食材，使用 AI 生成创意菜谱，解决"吃什么"的世纪难题。

**目标用户**:
- 家庭主妇/主夫
- 独居青年
- 选择困难症患者
- 想要减少食��浪费的用户

## 技术架构

### 前端技术栈（已实现）

**核心框架**:
- Vue 3.5.13 (Composition API)
- TypeScript 5.9
- Vite 7.1.11

**状态管理与路由**:
- Pinia 3.0.0 (状态管理)
- Vue Router 4.5.0 (路由管理)

**UI 与样式**:
- Tailwind CSS 4.1.18 (原子化 CSS)
- @tailwindcss/vite 4.1.18 (Vite 插件)
- 支持深色模式（dark: 类）

**开发工具**:
- ESLint 9.37.0 + Prettier 3.6.2 (代码规范)
- Vue DevTools 8.0.3 (调试工具)
- TypeScript 严格模式

**HTTP 客户端**:
- Axios 1.13.4

**构建配置**:
- Node.js 要求: ^18.18.0 || >=20.0.0
- 路径别名: `@` → `./src`
- 开发服务器: localhost:5173 (允许局域网访问)

### 后端技术栈（规划中）

**核心框架**:
- Java 17+
- Spring Boot 3.x
- Spring Data JPA

**数据库**:
- MySQL 8.0+

**AI 服务**:
- 阿里云百炼（通义千问 qwen-turbo）
- DashScope Java SDK

**图片服务**:
- Unsplash API / Pexels API（免费）

### 架构设计

**前后端分离架构**:
```
┌─────────────────────────────────────┐
│   前端（Vue 3 + TypeScript）        │
│   - 食材输入界面                    │
│   - 菜谱展示组件                    │
│   - 深色模式切换                    │
├─────────────────────────────────────┤
│   RESTful API（HTTP/JSON）          │
├─────────────────────────────────────┤
│   后端（Java + Spring Boot）        │
│   - 食谱生成服务                    │
│   - 图片搜索服务                    │
│   - 用户数据管理                    │
├─────────────────────────────────────┤
│   数据库（MySQL）                   │
│   - 用户表                          │
│   - 食材表                          │
│   - 菜谱表（缓存）                  │
├─────────────────────────────────────┤
│   外部服务                          │
│   - 通义千问 API                    │
│   - 图片搜索 API（可选）            │
└─────────────────────────────────────┘
```

## 项目结构

### 前端目录结构（当前状态）

```
frontend/
├── src/
│   ├── App.vue              # 根组件（RouterView）
│   ├── main.ts              # 应用入口（Pinia + Router）
│   ├── router/
│   │   └── index.ts         # 路由配置（仅 HomeView）
│   ├── views/
│   │   └── HomeView.vue     # 主页（示例计数器）
│   └── styles/
│       └── index.css        # 基础样式（Tailwind）
├── public/
│   ├── favicon.ico
│   ├── 冰箱.png             # UI 设计资源
│   ├── 菜单.png
│   ├── 餐桌.png
│   ├── 厨房-日.jpg
│   └── 厨房-夜.jpg
├── pencil/
│   └── 食材列表页面.pen     # 设计稿
├── package.json             # 依赖配置
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── eslint.config.ts         # ESLint 配置
└── .prettierrc.json         # Prettier 配置
```

**待创建目录**（按开发指南规划）:

```
frontend/src/
├── components/              # 可复用组件
│   ├── IngredientInput.vue  # 食材输入
│   ├── RecipeCard.vue       # 菜谱卡片
│   ├── RecipeList.vue       # 菜谱列表
│   ├── ThemeToggle.vue      # 深色模式切换
│   ├── LoadingSpinner.vue   # 加载动画
│   └── Toast.vue            # 通知组件
├── stores/                  # Pinia 状态管理
│   ├── ingredients.ts       # 食材状态
│   ├── recipes.ts           # 菜谱状态
│   └── theme.ts             # 主题状态
├── services/                # API 服务
│   ├── api.ts               # API 封装
│   └── storage.ts           # LocalStorage 封装
└── types/                   # TypeScript 类型定义
    ├── ingredient.ts
    └── recipe.ts
```

### 后端目录结构（规划中）

```
backend/
├── src/main/java/com/momo/
│   ├── MomoApplication.java         # 应用入口
│   ├── config/
│   │   └── CorsConfig.java          # 跨域配置
│   ├── controller/
│   │   ├── RecipeController.java    # 菜谱控制器
│   │   └── IngredientController.java
│   ├── service/
│   │   ├── RecipeService.java
│   │   └── ai/
│   │       ├── AIService.java       # AI 服务接口
│   │       └── impl/
│   │           └── QwenServiceImpl.java
│   ├── entity/
│   │   ├── Ingredient.java
│   │   └── Recipe.java
│   ├── repository/
│   │   ├── IngredientRepository.java
│   │   └── RecipeRepository.java
│   └── dto/
│       ├── RecipeRequest.java
│       └── RecipeResponse.java
└── src/main/resources/
    ├── application.yml              # 应用配置
    └── db/migration/
        └── V1__init_schema.sql      # 数据库初始化
```

## 开发阶段规划

### 阶段 1: 核心 MVP（2-3周）

**目标**: 实现最基本的"输入食材 → 生成菜谱"流程 + 深色模式 + 菜谱图片

**前端任务**:
- [ ] 食材输入界面（搜索、标签、分类选择）
- [ ] 菜谱展示组件（名称、食材、步骤、时间、难度、图片）
- [ ] 深色模式实现（Tailwind dark: 类 + LocalStorage）
- [ ] API 集成（Axios 调用后端）
- [ ] 加载状态与错误处理

**后端任务**:
- [ ] Spring Boot 项目初始化
- [ ] 数据库设计（食材表、菜谱表、收藏表）
- [ ] 通义千问 API 集成
- [ ] 菜谱生成 API（POST /api/recipes/generate）
- [ ] 常用食材 API（GET /api/ingredients/common）
- [ ] 图片搜索服务（Unsplash/Pexels）

### 阶段 2: 功能增强（1-2周）

- [ ] 筛选与排序（菜系、时间、难度）
- [ ] 收藏功能（LocalStorage → 后端持久化）
- [ ] 历史记录（最近 10 次生成）

### 阶段 3: 进阶功能（2-3周）

- [ ] 智能食材替代
- [ ] 购物清单生成
- [ ] 营养分析
- [ ] 用户认证（可选）

## 核心业务逻辑

### 食材输入系统

- 分类选择：蔬菜、肉类、海鲜、主食、调味料
- 搜索添加：支持搜索常见食材
- 自由输入：用户可输入未列出的食材
- 数量/状态：如"鸡肉200g"、"西红柿2个"

### AI 菜谱生成

**输入**:
- 用户提供的食材列表
- 可选筛选条件（菜系、时间、难度）

**输出**:
- 3-5 道可行菜谱
- 每道菜谱包含：
  - 菜品名称（有创意）
  - 所需食材清单（区分已有和缺少）
  - 详细步骤（分步说明）
  - 预估烹饪时间
  - 难度等级（简单/中等/复杂）
  - 菜谱图片 URL

## 开发规范

### 代码风格

- **组件命名**: PascalCase（如 `IngredientInput.vue`）
- **函数命名**: camelCase（如 `generateRecipes`）
- **常量命名**: UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **自动格式化**: ESLint + Prettier

### Git 提交规范

遵循 Conventional Commits:
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具配置

### 分支策略

- `main`: 主分支（稳定版本）
- `feature/*`: 功能分支
- `bugfix/*`: Bug 修复分支

## 当前状态

### 已完成

- ✅ 前端项目初始化（Vue 3 + TypeScript + Vite）
- ✅ 基础配置（ESLint、Prettier、Tailwind CSS）
- ✅ 路由配置（Vue Router）
- ✅ 状态管理配置（Pinia）
- ✅ 示例页面（HomeView 计数器）
- ✅ UI 设计资源（冰箱、菜单、餐桌、厨房图片）

### 进行中

- 🔄 知识库初始化（当前任务）

### 待开始

- ⏳ 后端项目初始化
- ⏳ 数据库设计与实现
- ⏳ AI 服务集成
- ⏳ 前端核心组件开发

## 技术决策记录

### 决策 1: 采用前后端分离架构

**原因**:
- 安全性高（API Key 不暴露在前端）
- 数据持久化（用户收藏、历史记录）
- 可扩展性强（后续可添加用户认证）

### 决策 2: 使用通义千问（阿里云百炼）

**原因**:
- 国内访问稳定
- 成本可控（免费额度充足）
- 支持结构化 JSON 输出
- 中文菜谱生成效果好

### 决策 3: 支持深色模式

**原因**:
- 提升用户体验
- 符合现代 Web 应用趋势
- Tailwind CSS 原生支持

### 决策 4: 集成菜谱图片

**原因**:
- 视觉吸引力
- 提升用户信任度
- 使用免费图片 API（Unsplash/Pexels）

## 外部依赖

### 前端依赖（已安装）

- 生产依赖: axios, pinia, vue, vue-router
- 开发依赖: @tailwindcss/vite, @vitejs/plugin-vue, eslint, prettier, typescript, vite, vue-tsc

### 后端依赖（待安装）

- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- MySQL Connector
- Lombok
- DashScope SDK（通义千问）

### 外部服务

- 阿里云百炼（通义千问 API）
- Unsplash API / Pexels API（图片搜索）

## 性能目标

- 首次加载时间 < 3 秒
- AI 生成响应时间 < 10 秒
- 页面交互流畅（60 FPS）

## 兼容性目标

- Chrome/Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- 移动端浏览器（iOS Safari、Android Chrome）

## 参考文档

- [开发指南](../docs/开发指南.md) - 详细的 MVP 开发流程
- [题目说明](../题目.md) - 竞赛题目要求
- [项目说明书](../项目说明书.md) - 提交物模板
