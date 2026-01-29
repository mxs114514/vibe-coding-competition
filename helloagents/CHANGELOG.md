# 变更日志

本文档记录项目的所有重要变更，遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范。

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [未发布]

### 计划中

- 后端项目初始化（Spring Boot + MySQL）
- 通义千问 API 集成
- 食材输入组件开发
- 菜谱展示组件开发
- 深色模式实现

---

## [0.1.0] - 2026-01-29

### 新增

- **[项目初始化]**: 创建前端项目（Vue 3 + TypeScript + Vite）
  - 配置 Pinia 状态管理
  - 配置 Vue Router 路由
  - 集成 Tailwind CSS 4
  - 配置 ESLint + Prettier 代码规范
  - 添加 Axios HTTP 客户端
- **[开发环境]**: 配置 Vite 开发服务器
  - 路径别名 `@` → `./src`
  - 允许局域网访问（0.0.0.0:5173）
  - 自动打开浏览器
- **[UI 资源]**: 添加设计资源
  - 冰箱、菜单、餐桌图片
  - 厨房场景图片（日间/夜间）
- **[文档]**: 创建项目文档
  - 开发指南（MVP 三阶段规划）
  - 题目说明（竞赛要求）
  - 项目说明书模板
- **[知识库]**: 初始化 HelloAGENTS 知识库
  - 创建知识库目录结构
  - 生成项目上下文文档
  - 生成变更日志

### 技术栈

- **前端**: Vue 3.5.13, TypeScript 5.9, Vite 7.1.11
- **状态管理**: Pinia 3.0.0
- **路由**: Vue Router 4.5.0
- **样式**: Tailwind CSS 4.1.18
- **HTTP**: Axios 1.13.4
- **代码规范**: ESLint 9.37.0, Prettier 3.6.2

### Git 提交

- `7f901c6` 添加说明书和题目
- `c4ef9f0` 初始化项目结构
- `b1675a1` chore: reorganize directory structure and fix spellings
- `7ae0bfe` initial commit

---

## 版本说明

### 版本号规则

- **主版本号（Major）**: 不兼容的 API 变更
- **次版本号（Minor）**: 向下兼容的功能新增
- **修订号（Patch）**: 向下兼容的问题修复

### 变更类型

- **新增（Added）**: 新功能
- **变更（Changed）**: 现有功能的变更
- **弃用（Deprecated）**: 即将移除的功能
- **移除（Removed）**: 已移除的功能
- **修复（Fixed）**: Bug 修复
- **安全（Security）**: 安全相关的修复

### 里程碑规划

- **v0.1.0**: 项目初始化（当前版本）
- **v0.2.0**: 核心 MVP 完成（食材输入 + 菜谱生成）
- **v0.3.0**: 功能增强（筛选、收藏、历史）
- **v1.0.0**: 正式版本（进阶功能完成）
